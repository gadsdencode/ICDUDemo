import assert from "node:assert/strict";
import { randomUUID } from "crypto";
import type { Server } from "http";
import test from "node:test";
import express from "express";
import { USER_MESSAGES_PER_HOUR } from "../../shared/aiPublic.ts";
import { frontendParameterSchemas } from "../../shared/assistantContract.ts";
import { mountPublicAi } from "./router.ts";
import { MemoryAiStore, type AiStore } from "./store.ts";
import type { ModelConfig } from "./config.ts";
import type { AiLimits } from "./limits.ts";

const KEY = "test-key-not-real-icdu";
const MODEL: ModelConfig = {
  baseURL: "https://icdu.test/v1",
  apiKey: KEY,
  model: "icdu",
  label: "configured",
};

const openLimits: AiLimits = {
  sessionMessages: USER_MESSAGES_PER_HOUR,
  ipMessages: 40,
  sessionRuns: 30,
  ipRuns: 80,
  sessionActive: 1,
  ipActive: 4,
};

type Call = { url: string; authorization: string; body: string };

function chunk(delta: object, finish: string | null): string {
  return `data: ${JSON.stringify({
    id: "chatcmpl-test",
    object: "chat.completion.chunk",
    created: 0,
    model: "icdu",
    choices: [{ index: 0, delta, finish_reason: finish }],
  })}\n\n`;
}

function textStream(content: string): Response {
  const encoder = new TextEncoder();
  const parts = [
    chunk({ role: "assistant", content: "" }, null),
    chunk({ content }, null),
    chunk({}, "stop"),
    "data: [DONE]\n\n",
  ];
  return new Response(
    new ReadableStream({
      start(controller) {
        for (const part of parts) controller.enqueue(encoder.encode(part));
        controller.close();
      },
    }),
    { headers: { "content-type": "text/event-stream" } },
  );
}

function toolStream(): Response {
  const encoder = new TextEncoder();
  const parts = [
    chunk({ role: "assistant", content: null }, null),
    chunk(
      {
        tool_calls: [
          {
            index: 0,
            id: "call_lookup",
            type: "function",
            function: { name: "lookup_icdu_term", arguments: "" },
          },
        ],
      },
      null,
    ),
    chunk(
      {
        tool_calls: [
          {
            index: 0,
            function: { arguments: "{\"term\":\"ICDU\"}" },
          },
        ],
      },
      null,
    ),
    chunk({}, "tool_calls"),
    "data: [DONE]\n\n",
  ];
  return new Response(
    new ReadableStream({
      start(controller) {
        for (const part of parts) controller.enqueue(encoder.encode(part));
        controller.close();
      },
    }),
    { headers: { "content-type": "text/event-stream" } },
  );
}

async function listen(app: express.Express): Promise<{ base: string; close: () => Promise<void> }> {
  const server: Server = await new Promise((resolve) => {
    const listening = app.listen(0, "127.0.0.1", () => resolve(listening));
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("no port");
  return {
    base: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolve) => server.close(() => resolve())),
  };
}

function cookieFrom(response: Response, previous = ""): string {
  const set = response.headers.getSetCookie?.() ?? [];
  const next = new Map<string, string>();
  for (const part of previous.split(";").map((item) => item.trim()).filter(Boolean)) {
    const eq = part.indexOf("=");
    if (eq > 0) next.set(part.slice(0, eq), part.slice(eq + 1));
  }
  for (const raw of set) {
    const pair = raw.split(";")[0] ?? "";
    const eq = pair.indexOf("=");
    if (eq > 0) next.set(pair.slice(0, eq), pair.slice(eq + 1));
  }
  return [...next.entries()].map(([key, value]) => `${key}=${value}`).join("; ");
}

function runBody(threadId: string, text: string, tools: object[] = []) {
  return {
    threadId,
    runId: randomUUID(),
    state: {},
    messages: [{ id: randomUUID(), role: "user", content: text }],
    tools,
    context: [{ description: "Page", value: "Ask ICDU" }],
    forwardedProps: {},
  };
}

async function start(options: {
  store: AiStore | null;
  limits?: AiLimits;
  fetchImpl?: typeof fetch;
  model?: ModelConfig | null;
}) {
  const calls: Call[] = [];
  const fetchImpl: typeof fetch =
    options.fetchImpl ??
    (async (input, init) => {
      const headers = new Headers(init?.headers);
      const body = typeof init?.body === "string" ? init.body : "";
      calls.push({
        url: String(input),
        authorization: headers.get("authorization") ?? "",
        body,
      });
      const followUp = body.includes('"role":"tool"') || body.includes("tool_call_id") || body.includes("tool-call");
      if (!followUp && body.includes("lookup_icdu_term")) return toolStream();
      return textStream("Intent-Conscious Data Unit is a structured record.");
    });
  const app = express();
  app.use(express.json({ limit: "80kb" }));
  mountPublicAi(app, {
    store: options.store,
    model: options.model === undefined ? MODEL : options.model,
    secret: "test-session-secret-value",
    limits: options.limits ?? openLimits,
    fetchImpl,
    assumeReady: true,
  });
  const server = await listen(app);
  return { ...server, calls, fetchImpl };
}

test("public chat stays disabled without a shared store and does not call the model", async () => {
  let called = false;
  const harness = await start({
    store: null,
    fetchImpl: async () => {
      called = true;
      return new Response("no");
    },
  });
  try {
    const status = await fetch(`${harness.base}/api/chat/status`);
    const body = (await status.json()) as { enabled: boolean; reason: string; message: string };
    assert.equal(status.status, 503);
    assert.equal(body.enabled, false);
    assert.equal(body.reason, "unavailable");
    assert.equal(body.message.includes("icdu.test"), false);
    assert.equal(body.message.includes(KEY), false);
    const info = await fetch(`${harness.base}/api/copilotkit/info`);
    const infoBody = (await info.json()) as { agents?: { default?: { name?: string } } };
    assert.equal(info.status, 200);
    assert.equal(infoBody.agents?.default?.name, "default");
    assert.equal(JSON.stringify(infoBody).includes(KEY), false);
    const run = await fetch(`${harness.base}/api/copilotkit/agent/default/run`, { method: "POST" });
    assert.equal(run.status, 503);
    assert.equal(called, false);
  } finally {
    await harness.close();
  }
});

test("streams a tool call continuation without leaking the API key", async () => {
  const harness = await start({ store: new MemoryAiStore() });
  try {
    const threadId = randomUUID();
    const first = await fetch(`${harness.base}/api/chat/status`);
    const cookie = cookieFrom(first);
    const response = await fetch(`${harness.base}/api/copilotkit/agent/default/run`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify(
        runBody(threadId, "Define ICDU with the glossary tool.", [
          {
            name: "navigate_site",
            description: "Open a published page",
            parameters: frontendParameterSchemas.navigate_site,
          },
          {
            name: "delete_database",
            description: "Destroy data",
            parameters: { type: "object", properties: {} },
          },
        ]),
      ),
    });
    const streamed = await response.text();
    assert.equal(response.status, 200, streamed.slice(0, 500));
    assert.match(streamed, /Intent-Conscious/);
    assert.equal(streamed.includes(KEY), false);
    assert.equal(streamed.includes("icdu.test"), false);
    assert.ok(harness.calls.length >= 2, `expected a tool continuation, saw ${harness.calls.length}`);
    assert.equal(harness.calls[0]?.authorization, `Bearer ${KEY}`);
    assert.match(harness.calls[0]?.url ?? "", /\/chat\/completions$/);
    assert.match(harness.calls[0]?.body ?? "", /lookup_icdu_term/);
    assert.match(harness.calls[0]?.body ?? "", /navigate_site/);
    assert.equal((harness.calls[0]?.body ?? "").includes("delete_database"), false);
  } finally {
    await harness.close();
  }
});

test("consecutive replies keep distinct message IDs when the provider reuses text-part IDs", async () => {
  let calls = 0;
  const harness = await start({
    store: new MemoryAiStore(),
    fetchImpl: async () => textStream(++calls === 1 ? "First answer." : "Second answer."),
  });
  try {
    const cookie = cookieFrom(await fetch(`${harness.base}/api/chat/status`));
    const threadId = randomUUID();
    const firstInput = runBody(threadId, "First question");
    const run = async (body: object) => {
      const response = await fetch(`${harness.base}/api/copilotkit/agent/default/run`, {
        method: "POST", headers: { "content-type": "application/json", cookie },
        body: JSON.stringify(body),
      });
      const text = await response.text();
      assert.equal(response.status, 200, text.slice(0, 500));
      return text.split("\n").filter(line => line.startsWith("data: {")).map(line => JSON.parse(line.slice(6)));
    };
    const first = await run(firstInput);
    const firstId = first.find(event => event.type === "TEXT_MESSAGE_START")?.messageId;
    assert.ok(firstId, "first reply has an assistant message");
    const nextInput = runBody(threadId, "Second question");
    const second = await run({ ...nextInput, messages: [
      ...firstInput.messages, {id:firstId,role:"assistant",content:"First answer."}, ...nextInput.messages,
    ]});
    const secondId = second.find(event => event.type === "TEXT_MESSAGE_START")?.messageId;
    assert.ok(secondId, "second reply has an assistant message");
    assert.notEqual(secondId, firstId, "new replies must not append to an earlier answer");
    assert.equal(second.filter(event => event.type === "TEXT_MESSAGE_CONTENT").map(event => event.delta).join(""), "Second answer.");
  } finally { await harness.close(); }
});

test("a second active turn for the same visitor is busy, and cancellation releases it", async () => {
  let releaseHold: (() => void) | undefined;
  const held = new Promise<void>((resolve) => {
    releaseHold = resolve;
  });
  let upstreamAborts = 0;
  const harness = await start({
    store: new MemoryAiStore(),
    fetchImpl: async (_input, init) => {
      return await new Promise((resolve, reject) => {
        const abort = () => {
          upstreamAborts += 1;
          reject(Object.assign(new Error("aborted"), { name: "AbortError" }));
        };
        if (init?.signal?.aborted) {
          abort();
          return;
        }
        init?.signal?.addEventListener("abort", abort, { once: true });
        void held.then(() => resolve(textStream("done")));
      });
    },
  });
  try {
    const status = await fetch(`${harness.base}/api/chat/status`);
    const cookie = cookieFrom(status);
    const controller = new AbortController();
    const pending = fetch(`${harness.base}/api/copilotkit/agent/default/run`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify(runBody(randomUUID(), "Hold this turn")),
      signal: controller.signal,
    });
    await new Promise((resolve) => setTimeout(resolve, 200));
    const busy = await fetch(`${harness.base}/api/copilotkit/agent/default/run`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify(runBody(randomUUID(), "Second turn")),
    });
    assert.equal(busy.status, 429);
    assert.match(busy.headers.get("retry-after") ?? "", /^\d+$/);
    const busyBody = await busy.text();
    assert.match(busyBody, /already in progress|busy/i);
    assert.equal(busyBody.includes(KEY), false);
    controller.abort();
    await pending.catch(() => undefined);
    await new Promise((resolve) => setTimeout(resolve, 100));
    releaseHold?.();
    const again = await fetch(`${harness.base}/api/copilotkit/agent/default/run`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify(runBody(randomUUID(), "After cancel")),
    });
    const againBody = await again.text();
    assert.equal(again.status, 200, againBody.slice(0, 400));
    assert.ok(upstreamAborts >= 1);
  } finally {
    releaseHold?.();
    await harness.close();
  }
});

test("hourly quota and IP backstop are enforced from the shared store", async () => {
  const harness = await start({
    store: new MemoryAiStore(),
    limits: { ...openLimits, sessionMessages: 2, ipMessages: 3 },
  });
  try {
    const prime = await fetch(`${harness.base}/api/chat/status`, {
      headers: { "x-forwarded-for": "198.51.100.8, 203.0.113.10" },
    });
    let cookie = cookieFrom(prime);
    const send = async (jar: string) => {
      const response = await fetch(`${harness.base}/api/copilotkit/agent/default/run`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: jar,
          "x-forwarded-for": "198.51.100.8, 203.0.113.10",
        },
        body: JSON.stringify(runBody(randomUUID(), "Hello")),
      });
      return { status: response.status, retry: response.headers.get("retry-after"), text: await response.text(), cookie: cookieFrom(response, jar) };
    };
    const first = await send(cookie);
    cookie = first.cookie;
    assert.equal(first.status, 200, first.text.slice(0, 300));
    const second = await send(cookie);
    cookie = second.cookie;
    assert.equal(second.status, 200, second.text.slice(0, 300));
    const third = await send(cookie);
    assert.equal(third.status, 429);
    assert.ok(third.retry);
    assert.match(third.text, /10 messages|hourly|hour/i);

    const other = await fetch(`${harness.base}/api/chat/status`, {
      headers: { "x-forwarded-for": "203.0.113.10" },
    });
    const otherCookie = cookieFrom(other);
    const sharedIp = await fetch(`${harness.base}/api/copilotkit/agent/default/run`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: otherCookie,
        "x-forwarded-for": "1.2.3.4, 203.0.113.10",
      },
      body: JSON.stringify(runBody(randomUUID(), "Same network")),
    });
    const sharedText = await sharedIp.text();
    assert.equal(sharedIp.status, 200, sharedText.slice(0, 300));
    const blocked = await fetch(`${harness.base}/api/copilotkit/agent/default/run`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: otherCookie,
        "x-forwarded-for": "9.9.9.9, 203.0.113.10",
      },
      body: JSON.stringify(runBody(randomUUID(), "Still the same network")),
    });
    assert.equal(blocked.status, 429);
  } finally {
    await harness.close();
  }
});

test("threads can only be read, connected, or stopped by the owning session", async () => {
  const harness = await start({ store: new MemoryAiStore() });
  try {
    const ownerStatus = await fetch(`${harness.base}/api/chat/status`);
    const owner = cookieFrom(ownerStatus);
    const threadId = randomUUID();
    const run = await fetch(`${harness.base}/api/copilotkit/agent/default/run`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: owner },
      body: JSON.stringify(runBody(threadId, "Hello from the owner")),
    });
    assert.equal(run.status, 200, (await run.text()).slice(0, 300));
    const strangerStatus = await fetch(`${harness.base}/api/chat/status`);
    const stranger = cookieFrom(strangerStatus);
    const messages = await fetch(`${harness.base}/api/copilotkit/threads/${threadId}/messages`, {
      headers: { cookie: stranger },
    });
    assert.equal(messages.status, 404);
    const connect = await fetch(`${harness.base}/api/copilotkit/agent/default/connect`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: stranger },
      body: JSON.stringify({ ...runBody(threadId, "resume"), messages: [] }),
    });
    assert.equal(connect.status, 404);
    const stop = await fetch(`${harness.base}/api/copilotkit/agent/default/stop/${threadId}`, {
      method: "POST",
      headers: { cookie: stranger },
    });
    assert.equal(stop.status, 404);
    const list = await fetch(`${harness.base}/api/copilotkit/threads`, { headers: { cookie: owner } });
    assert.equal(list.status, 404);
    const ownMessages = await fetch(`${harness.base}/api/copilotkit/threads/${threadId}/messages`, {
      headers: { cookie: owner },
    });
    assert.notEqual(ownMessages.status, 404);
    assert.equal((await ownMessages.text()).includes(KEY), false);
  } finally {
    await harness.close();
  }
});

function frontendToolStream(): Response {
  const encoder = new TextEncoder();
  const parts = [
    chunk({ role: "assistant", content: null }, null),
    chunk(
      {
        tool_calls: [
          {
            index: 0,
            id: "call_nav",
            type: "function",
            function: { name: "navigate_site", arguments: "{\"pageId\":\"developers\"}" },
          },
        ],
      },
      null,
    ),
    chunk({}, "tool_calls"),
    "data: [DONE]\n\n",
  ];
  return new Response(
    new ReadableStream({
      start(controller) {
        for (const part of parts) controller.enqueue(encoder.encode(part));
        controller.close();
      },
    }),
    { headers: { "content-type": "text/event-stream" } },
  );
}

test("a frontend tool result continues the same turn without a second user-message charge", async () => {
  const harness = await start({
    store: new MemoryAiStore(),
    fetchImpl: async (input, init) => {
      const headers = new Headers(init?.headers);
      const body = typeof init?.body === "string" ? init.body : "";
      harness.calls.push({
        url: String(input),
        authorization: headers.get("authorization") ?? "",
        body,
      });
      const followUp = body.includes('"role":"tool"');
      if (!followUp) return frontendToolStream();
      return textStream("The developer guide is open.");
    },
  });
  try {
    const threadId = randomUUID();
    const first = await fetch(`${harness.base}/api/chat/status`);
    const cookie = cookieFrom(first);
    const opened = (await first.json()) as { remaining: number };
    const run = await fetch(`${harness.base}/api/copilotkit/agent/default/run`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify(
        runBody(threadId, "Take me to the developer guide", [
          {
            name: "navigate_site",
            description: "Open a published page",
            parameters: frontendParameterSchemas.navigate_site,
          },
        ]),
      ),
    });
    const streamed = await run.text();
    assert.equal(run.status, 200, streamed.slice(0, 400));
    assert.match(streamed, /navigate_site/);
    assert.equal(harness.calls.length, 1);
    const continued = await fetch(`${harness.base}/api/copilotkit/agent/default/run`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify({
        threadId,
        runId: randomUUID(),
        state: {},
        messages: [
          { id: randomUUID(), role: "user", content: "Take me to the developer guide" },
          {
            id: randomUUID(),
            role: "assistant",
            content: "",
            toolCalls: [
              {
                id: "call_nav",
                type: "function",
                function: { name: "navigate_site", arguments: "{\"pageId\":\"developers\"}" },
              },
            ],
          },
          { id: randomUUID(), role: "tool", content: "{\"ok\":true,\"path\":\"/developers\"}", toolCallId: "call_nav" },
        ],
        tools: [
          {
            name: "navigate_site",
            description: "Open a published page",
            parameters: frontendParameterSchemas.navigate_site,
          },
        ],
        context: [],
        forwardedProps: {},
      }),
    });
    const answer = await continued.text();
    assert.equal(continued.status, 200, answer.slice(0, 400));
    assert.match(answer, /developer guide is open/);
    assert.equal(harness.calls.length, 2);
    const status = await fetch(`${harness.base}/api/chat/status`, { headers: { cookie } });
    const body = (await status.json()) as { remaining: number };
    assert.equal(body.remaining, opened.remaining - 1);

    const extra = (step: number) =>
      fetch(`${harness.base}/api/copilotkit/agent/default/run`, {
        method: "POST",
        headers: { "content-type": "application/json", cookie },
        body: JSON.stringify({
          threadId,
          runId: randomUUID(),
          messages: [
            { id: `u-${step}`, role: "user", content: "Take me to the developer guide" },
            {
              id: `a-${step}`,
              role: "assistant",
              content: "",
              toolCalls: [
                { id: `c-${step}`, type: "function", function: { name: "navigate_site", arguments: "{}" } },
              ],
            },
            { id: `t-${step}`, role: "tool", content: "{\"ok\":true}", toolCallId: `c-${step}` },
          ],
          tools: [],
          context: [],
          forwardedProps: {},
        }),
      });
    const second = await extra(2);
    assert.equal(second.status, 200);
    await second.text();
    const third = await extra(3);
    const denied = await third.text();
    assert.equal(third.status, 429, denied.slice(0, 300));
    assert.match(denied, /action steps/);
    const after = await fetch(`${harness.base}/api/chat/status`, { headers: { cookie } });
    const afterBody = (await after.json()) as { remaining: number };
    assert.equal(afterBody.remaining, opened.remaining - 1);
  } finally {
    await harness.close();
  }
});

test("show_workspace continues through the gateway with the active workspace snapshot", async () => {
  const harness = await start({
    store: new MemoryAiStore(),
    fetchImpl: async (input, init) => {
      const headers = new Headers(init?.headers);
      const body = typeof init?.body === "string" ? init.body : "";
      harness.calls.push({
        url: String(input),
        authorization: headers.get("authorization") ?? "",
        body,
      });
      const followUp = body.includes('"role":"tool"');
      if (!followUp) {
        return new Response(
          new ReadableStream({
            start(controller) {
              const encoder = new TextEncoder();
              const parts = [
                chunk({ role: "assistant", content: null }, null),
                chunk(
                  {
                    tool_calls: [{
                      index: 0,
                      id: "call_workspace",
                      type: "function",
                      function: { name: "show_workspace", arguments: "{\"view\":\"guided\",\"scenarioId\":\"healthcare-admin\"}" },
                    }],
                  },
                  null,
                ),
                chunk({}, "tool_calls"),
                "data: [DONE]\n\n",
              ];
              for (const part of parts) controller.enqueue(encoder.encode(part));
              controller.close();
            },
          }),
          { headers: { "content-type": "text/event-stream" } },
        );
      }
      return textStream("The healthcare walkthrough is open at Define.");
    },
  });
  try {
    const threadId = randomUUID();
    const first = await fetch(`${harness.base}/api/chat/status`);
    const cookie = cookieFrom(first);
    const opened = (await first.json()) as { remaining: number };
    const snapshot = {
      route: "/",
      title: "Overview",
      summary: "Homepage",
      sectionIds: ["chooser"],
      personaId: "executive",
      industryId: "healthcare-admin",
      actions: ["show_workspace", "set_guided_stage"],
      workspace: { view: "guided", artifactId: "call-health" },
      guided: {
        scenarioId: "healthcare-admin",
        title: "Healthcare administrative workflow",
        step: "define",
        ranAi: false,
        evaluated: false,
        simulated: true,
      },
    };
    const run = await fetch(`${harness.base}/api/copilotkit/agent/default/run`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify({
        ...runBody(threadId, "Show the healthcare administrative walkthrough", [
          {
            name: "show_workspace",
            description: "Open one in-conversation view",
            parameters: frontendParameterSchemas.show_workspace,
          },
        ]),
        context: [{ description: "Current page", value: JSON.stringify(snapshot) }],
      }),
    });
    const streamed = await run.text();
    assert.equal(run.status, 200, streamed.slice(0, 400));
    assert.match(streamed, /show_workspace/);
    assert.equal(streamed.includes(KEY), false);
    assert.match(harness.calls[0]?.body ?? "", /healthcare-admin/);
    assert.match(harness.calls[0]?.body ?? "", /guided/);
    const continued = await fetch(`${harness.base}/api/copilotkit/agent/default/run`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify({
        threadId,
        runId: randomUUID(),
        state: {},
        messages: [
          { id: randomUUID(), role: "user", content: "Show the healthcare administrative walkthrough" },
          {
            id: randomUUID(),
            role: "assistant",
            content: "",
            toolCalls: [{
              id: "call_workspace",
              type: "function",
              function: { name: "show_workspace", arguments: "{\"view\":\"guided\",\"scenarioId\":\"healthcare-admin\"}" },
            }],
          },
          {
            id: randomUUID(),
            role: "tool",
            content: "{\"ok\":true,\"view\":\"guided\",\"scenarioId\":\"healthcare-admin\",\"step\":\"define\",\"simulated\":true}",
            toolCallId: "call_workspace",
          },
        ],
        tools: [{
          name: "show_workspace",
          description: "Open one in-conversation view",
          parameters: frontendParameterSchemas.show_workspace,
        }],
        context: [{ description: "Current page", value: JSON.stringify(snapshot) }],
        forwardedProps: {},
      }),
    });
    const answer = await continued.text();
    assert.equal(continued.status, 200, answer.slice(0, 400));
    assert.match(answer, /healthcare walkthrough is open/);
    const status = await fetch(`${harness.base}/api/chat/status`, { headers: { cookie } });
    const body = (await status.json()) as { remaining: number };
    assert.equal(body.remaining, opened.remaining - 1);
  } finally {
    await harness.close();
  }
});
