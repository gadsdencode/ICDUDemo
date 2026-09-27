import "../bootstrapEnv.ts";
import type { Express, Request as ExpressRequest, Response as ExpressResponse } from "express";
import {
  CopilotRuntime,
  InMemoryAgentRunner,
  createCopilotExpressHandler,
  type CopilotRuntimeHooks,
  type RouteInfo,
} from "@copilotkit/runtime/v2";
import {
  ASSISTANT_BUSY,
  ASSISTANT_GENERIC,
  ASSISTANT_MISCONFIGURED,
  ASSISTANT_OFFLINE,
  ASSISTANT_UNAVAILABLE,
  USER_MESSAGES_PER_HOUR,
  reasonMessage,
  type PublicAiReason,
} from "../../shared/aiPublic.ts";
import { createIcduAgent, createModel } from "./agent.ts";
import { clientIp, replitProxyHops } from "./clientIp.ts";
import { probeModel, type ModelConfig } from "./config.ts";
import { jsonResponse, quotaMessage } from "./errors.ts";
import { defaultLimits, isThreadId, type AiLimits } from "./limits.ts";
import { lastMessageIsUser } from "./messages.ts";
import {
  VISITOR_COOKIE,
  hashIp,
  readCookie,
  resolveVisitorSession,
  sessionSecret,
  verifySession,
} from "./session.ts";
import type { AiStore, ThreadAccess } from "./store.ts";

const runner = new InMemoryAgentRunner({
  maxThreads: 200,
  maxRunsPerThread: 20,
  maxBytes: 64 * 1024 * 1024,
});

const CLOSED_ROUTES = new Set<RouteInfo["method"]>([
  "threads/list",
  "threads/clear",
  "threads/subscribe",
  "agent/suggest",
  "transcribe",
  "inspector/metadata",
  "inspector/learning",
  "cpk-debug-events",
  "memories/list",
  "memories/recall",
  "memories/subscribe",
  "memories/mutate",
  "annotate",
]);

export type MountPublicAiOptions = {
  store: AiStore | null;
  model: ModelConfig | null;
  secret?: string | null;
  limits?: AiLimits;
  fetchImpl?: typeof fetch;
  assumeReady?: boolean;
  now?: () => Date;
};

type Health = "ready" | "misconfigured" | "offline" | "busy";

function cookieHeader(req: ExpressRequest): string | undefined {
  return typeof req.headers.cookie === "string" ? req.headers.cookie : undefined;
}

function replaceVisitorCookie(req: ExpressRequest, token: string): void {
  const kept = (cookieHeader(req) ?? "")
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part && !part.startsWith(`${VISITOR_COOKIE}=`));
  kept.push(`${VISITOR_COOKIE}=${encodeURIComponent(token)}`);
  req.headers.cookie = kept.join("; ");
}

function pathname(req: ExpressRequest): string {
  return (req.originalUrl || req.url || "").split("?")[0] ?? "";
}

function notFound(): Response {
  return jsonResponse(404, "Not found");
}

export function mountPublicAi(app: Express, options: MountPublicAiOptions): void {
  const secret = options.secret === undefined ? sessionSecret() : options.secret;
  const store = options.store;
  const model = options.model;
  const limits = options.limits ?? defaultLimits;
  const now = options.now ?? (() => new Date());
  const enabled = Boolean(secret && store && model);
  app.set("trust proxy", replitProxyHops());

  const issueSession = (req: ExpressRequest, res: ExpressResponse): string | null => {
    if (!secret) return null;
    const resolved = resolveVisitorSession(
      cookieHeader(req),
      secret,
      Math.floor(now().getTime() / 1000),
    );
    replaceVisitorCookie(req, resolved.token);
    res.cookie(VISITOR_COOKIE, resolved.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: req.secure,
      path: "/",
      maxAge: 12 * 60 * 60 * 1000,
    });
    if (store && resolved.fresh) {
      void store.rememberSession(resolved.sessionId, resolved.expiresAt).catch(() => undefined);
    }
    return resolved.sessionId;
  };

  let health: { at: number; state: Health } = {
    at: options.assumeReady ? Date.now() : 0,
    state: options.assumeReady ? "ready" : "offline",
  };
  const currentHealth = async (): Promise<Health> => {
    if (!model) return "misconfigured";
    if (options.assumeReady) return "ready";
    if (health.at !== 0 && Date.now() - health.at < 30_000) return health.state;
    const state = await probeModel(model);
    health = { at: Date.now(), state };
    return state;
  };

  const statusPayload = (
    reason: PublicAiReason | null,
    remaining: number,
  ): Record<string, unknown> => ({
    enabled: reason == null,
    reason,
    limit: limits.sessionMessages || USER_MESSAGES_PER_HOUR,
    remaining,
    message: reason ? reasonMessage(reason) : null,
  });

  app.get("/api/chat/status", async (req, res) => {
    const sessionId = issueSession(req, res);
    const limit = limits.sessionMessages || USER_MESSAGES_PER_HOUR;
    if (!secret || !store) {
      res.status(503).json(statusPayload("unavailable", 0));
      return;
    }
    if (!model) {
      res.status(401).json(statusPayload("misconfigured", 0));
      return;
    }
    const state = await currentHealth();
    if (state === "misconfigured") {
      res.status(401).json(statusPayload("misconfigured", 0));
      return;
    }
    if (state === "offline") {
      res.status(503).json(statusPayload("offline", 0));
      return;
    }
    const used = sessionId ? await store.userMessagesUsed(sessionId, now()) : limit;
    res.json(statusPayload(null, Math.max(0, limit - used)));
  });

  if (!enabled || !secret || !store || !model) {
    app.use("/api/copilotkit", (req, res) => {
      const reason: PublicAiReason = secret && store && !model ? "misconfigured" : "unavailable";
      if (req.method === "GET" && pathname(req).endsWith("/info")) {
        res.json({
          agents: { default: { name: "default", description: "Ask ICDU" } },
          mode: "multi-route",
          suggestions: false,
          telemetryDisabled: true,
        });
        return;
      }
      res.status(reason === "misconfigured" ? 401 : 503).json({ message: reasonMessage(reason) });
    });
    return;
  }

  const languageModel = createModel(model, options.fetchImpl ?? fetch);
  const activeSecret = secret;
  const activeStore = store;
  const activeModel = model;

  app.use("/api/copilotkit", async (req, res, next) => {
    issueSession(req, res);
    if (req.method !== "POST" || !pathname(req).endsWith("/agent/default/run")) {
      next();
      return;
    }
    const state = await currentHealth();
    if (state === "misconfigured") {
      res.status(401).json({ message: ASSISTANT_MISCONFIGURED });
      return;
    }
    if (state === "offline") {
      res.status(503).json({ message: ASSISTANT_OFFLINE });
      return;
    }
    if (state === "busy") {
      res.set("retry-after", "15");
      res.status(429).json({ message: `${ASSISTANT_BUSY} Try again in 15 seconds.` });
      return;
    }

    const body = req.body as { threadId?: unknown; messages?: unknown } | undefined;
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    if (!isThreadId(body?.threadId)) {
      res.status(400).json({ message: ASSISTANT_GENERIC });
      return;
    }
    const sessionId = verifySession(
      readCookie(cookieHeader(req), VISITOR_COOKIE) ?? "",
      activeSecret,
      Math.floor(now().getTime() / 1000),
    );
    if (!sessionId) {
      res.status(401).json({ message: "Refresh the page and try again." });
      return;
    }
    const claimed = await activeStore.claimThread(body.threadId, sessionId);
    if (claimed === "foreign") {
      res.status(404).json({ message: "Not found" });
      return;
    }
    const ip = clientIp(req);
    if (!ip) {
      res.status(503).json({ message: ASSISTANT_GENERIC });
      return;
    }
    const turn = await activeStore.beginTurn({
      sessionId,
      ipHash: hashIp(ip, activeSecret),
      now: now(),
      limits,
    });
    if (!turn.ok) {
      const message =
        turn.scope === "session"
          ? quotaMessage("session_turn", turn.retryAfterSeconds)
          : quotaMessage("ip", turn.retryAfterSeconds);
      res.set("retry-after", String(turn.retryAfterSeconds));
      res.status(429).json({ message });
      return;
    }
    const quota = await activeStore.consume({
      sessionId,
      ipHash: hashIp(ip, activeSecret),
      now: now(),
      chargeUserMessage: lastMessageIsUser(
      messages.filter((message): message is { role?: string } => !!message && typeof message === "object"),
    ),
      limits,
    });
    if (!quota.ok) {
      await turn.release();
      res.set("retry-after", String(quota.retryAfterSeconds));
      res.status(429).json({ message: quotaMessage(quota.scope, quota.retryAfterSeconds) });
      return;
    }
    let released = false;
    const release = async () => {
      if (released) return;
      released = true;
      await turn.release();
    };
    res.on("finish", () => {
      void release();
    });
    res.on("close", () => {
      void release();
    });
    next();
  });

  const hooks: CopilotRuntimeHooks = {
    onBeforeHandler: async ({ request, route }) => {
      if (CLOSED_ROUTES.has(route.method)) throw notFound();
      if ("agentId" in route && route.agentId !== "default") throw notFound();
      const sessionId = verifySession(
        readCookie(request.headers.get("cookie") ?? undefined, VISITOR_COOKIE) ?? "",
        activeSecret,
        Math.floor(now().getTime() / 1000),
      );
      if (!sessionId) throw jsonResponse(401, "Refresh the page and try again.");
      if (route.method === "info") return;

      const threadId = await threadIdFor(route, request);
      if (route.method === "agent/run" || route.method === "agent/connect") {
        if (!threadId) throw jsonResponse(400, ASSISTANT_GENERIC);
        const access = await activeStore.claimThread(threadId, sessionId);
        if (access === "foreign") throw notFound();
        return;
      }
      if (threadId) {
        const access: ThreadAccess = await activeStore.threadAccess(threadId, sessionId);
        if (access !== "owned") throw notFound();
      }
    },
    onError: async ({ error }) => {
      if (error instanceof Response) return error;
      return jsonResponse(502, ASSISTANT_GENERIC);
    },
  };

  const runtime = new CopilotRuntime({
    agents: () => ({
      default: createIcduAgent(languageModel, activeModel),
    }),
    runner,
    forwardHeaders: { allow: [] },
    sseKeepAliveIntervalSeconds: 15,
  });

  app.use(
    createCopilotExpressHandler({
      runtime,
      basePath: "/api/copilotkit",
      mode: "multi-route",
      cors: false,
      hooks,
    }),
  );
}

async function threadIdFor(route: RouteInfo, request: globalThis.Request): Promise<string | null> {
  if ("threadId" in route) return isThreadId(route.threadId) ? route.threadId : null;
  if (route.method !== "agent/run" && route.method !== "agent/connect") return null;
  try {
    const body = (await request.clone().json()) as { threadId?: unknown };
    return isThreadId(body.threadId) ? body.threadId : null;
  } catch {
    return null;
  }
}
