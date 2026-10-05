import assert from "node:assert/strict";
import test from "node:test";
import { MAX_VISITOR_MESSAGE_CHARS } from "../../../shared/aiPublic.ts";
import {
  HOME_STARTERS,
  decideComposer,
  internalAssistantPath,
  shouldFollowAssistantLink,
  visitorRunError,
} from "./assistantComposer.ts";

test("composer rejects whitespace, blocks over the shared limit, and stops a running turn", () => {
  assert.deepEqual(decideComposer({ value: "   ", availability: "ready", running: false }), { action: "ignore" });
  assert.equal(
    decideComposer({ value: "x".repeat(MAX_VISITOR_MESSAGE_CHARS + 1), availability: "ready", running: false }).action,
    "block",
  );
  assert.deepEqual(decideComposer({ value: "hello", availability: "ready", running: true }), { action: "stop" });
  const quota = decideComposer({ value: "hello", availability: "quota", running: false });
  assert.equal(quota.action, "block");
  assert.match(quota.action === "block" ? quota.message : "", /messages for this hour/);
  const sent = decideComposer({ value: "  Explain ICDU  ", availability: "ready", running: false });
  assert.deepEqual(sent, { action: "send", text: "Explain ICDU" });
});

test("starter prompts name published destinations and send one message each", () => {
  assert.equal(HOME_STARTERS.length, 4);
  assert.equal(new Set(HOME_STARTERS.map((item) => item.message)).size, 4);
  assert.match(HOME_STARTERS.find((item) => item.id === "healthcare")?.message ?? "", /healthcare-admin/);
  assert.match(HOME_STARTERS.find((item) => item.id === "business")?.message ?? "", /business case/);
  assert.match(HOME_STARTERS.find((item) => item.id === "integrate")?.message ?? "", /developer guide/);
});

test("assistant source links stay on approved in-app paths", () => {
  const origin = "https://icdu.example";
  assert.equal(internalAssistantPath("/demos?mode=guided#lab", origin), "/demos?mode=guided#lab");
  assert.equal(internalAssistantPath("https://icdu.example/faq#commercial-use", origin), "/faq#commercial-use");
  assert.equal(internalAssistantPath("https://example.com/demos", origin), null);
  assert.equal(internalAssistantPath("mailto:brian@osscontact.com", origin), null);
  assert.equal(internalAssistantPath("/files/brief.pdf", origin), null);
  assert.equal(internalAssistantPath("blob:https://icdu.example/123", origin), null);
  assert.equal(shouldFollowAssistantLink({ button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, defaultPrevented: false }), true);
  assert.equal(shouldFollowAssistantLink({ button: 0, metaKey: true, ctrlKey: false, shiftKey: false, altKey: false, defaultPrevented: false }), false);
});

test("run errors shown in the composer stay visitor-safe", () => {
  assert.equal(visitorRunError(new Error("Please try again shortly.")), "Please try again shortly.");
  assert.match(visitorRunError(new Error("failed at https://internal/run with sk-secret")), /couldn't answer/i);
  assert.match(visitorRunError(new Error("x".repeat(300))), /couldn't answer/i);
  assert.match(
    visitorRunError(new Error('HTTP 503: {"message":"The assistant is unavailable right now."}')),
    /unavailable right now/,
  );
});
