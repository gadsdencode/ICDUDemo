import { log } from "../log.ts";

const DEVELOPMENT_BASE_URL = "https://mac-mini-ai-server.tail07eaf4.ts.net:8443/v1";
const PRODUCTION_HOST = "icdu-api.uterpi.com";
const PRODUCTION_BASE_URL = `https://${PRODUCTION_HOST}/v1`;

export type ModelConfig = {
  baseURL: string;
  apiKey: string;
  model: string;
  label: "production" | "development" | "configured";
};

function normalizeBase(raw: string): URL | null {
  const base = raw.trim().replace(/\/+$/, "");
  if (!base.endsWith("/v1")) return null;
  try {
    const url = new URL(base);
    if (url.protocol !== "https:") return null;
    return url;
  } catch {
    return null;
  }
}

export function resolveModelConfig(
  env: NodeJS.ProcessEnv = process.env,
): ModelConfig | null {
  const isProduction = env.NODE_ENV === "production";
  const fromEnv = env.ICDU_API_BASE_URL?.trim() ?? "";
  const raw = fromEnv || (isProduction ? "" : DEVELOPMENT_BASE_URL);
  if (!raw) return null;
  const url = normalizeBase(raw);
  if (!url) return null;
  if (isProduction && url.hostname === "mac-mini-ai-server.tail07eaf4.ts.net") return null;
  const model = (env.ICDU_MODEL || "icdu").trim();
  if (!/^[A-Za-z0-9._:-]{1,64}$/.test(model)) return null;
  const apiKey = env.ICDU_API_KEY?.trim() ?? "";
  if (!apiKey) return null;
  const label =
    url.hostname === PRODUCTION_HOST ? "production" : fromEnv ? "configured" : "development";
  return { baseURL: url.toString().replace(/\/+$/, ""), apiKey, model, label };
}

export async function probeModel(
  config: ModelConfig,
): Promise<"ready" | "misconfigured" | "offline" | "busy"> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch(`${config.baseURL}/models`, {
      headers: { Authorization: `Bearer ${config.apiKey}` },
      signal: controller.signal,
    });
    await response.arrayBuffer().catch(() => undefined);
    if (response.status === 401 || response.status === 403) return "misconfigured";
    if (response.status === 429) return "busy";
    if (!response.ok) return "offline";
    return "ready";
  } catch {
    return "offline";
  } finally {
    clearTimeout(timer);
  }
}

/** Connectivity only. The API key is not sent to this host. */
export async function reportProductionTunnel(): Promise<"reachable" | "offline"> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch(`${PRODUCTION_BASE_URL}/models`, {
      signal: controller.signal,
    });
    await response.arrayBuffer().catch(() => undefined);
    const state = response.status > 0 ? "reachable" : "offline";
    log(`icdu production tunnel (${PRODUCTION_HOST}): ${state}`);
    return state;
  } catch {
    log(`icdu production tunnel (${PRODUCTION_HOST}): offline`);
    return "offline";
  } finally {
    clearTimeout(timer);
  }
}
