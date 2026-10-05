import assert from "node:assert/strict";
import test from "node:test";
import { activityPhase, type ActivityMessage } from "./activityPhase.ts";

const earlier: ActivityMessage = { id: "a1", role: "assistant", content: "Earlier answer that should not count." };

test("a new request ignores assistant text from the previous turn", () => {
  const messages: ActivityMessage[] = [earlier, { id: "u2", role: "user", content: "What is ICDU?" }];
  assert.equal(activityPhase({ messages, running: true, approvalPending: false, signal: "active" }).kind, "preparing");
});

test("assistant text in the current turn is streaming, not waiting", () => {
  const messages: ActivityMessage[] = [
    earlier,
    { id: "u2", role: "user", content: "What is ICDU?" },
    { id: "a2", role: "assistant", content: "ICDU " },
  ];
  const phase = activityPhase({ messages, running: true, approvalPending: false, signal: "active" });
  assert.deepEqual(phase, { kind: "responding", label: "Responding" });
});

test("an unfinished tool call uses its real name", () => {
  const messages: ActivityMessage[] = [
    { id: "u", role: "user", content: "Show the demo" },
    {
      id: "a",
      role: "assistant",
      content: "",
      toolCalls: [{ id: "call-1", function: { name: "navigate_site", arguments: "{\"pageId\":\"demos\"}" } }],
    },
  ];
  assert.deepEqual(activityPhase({ messages, running: true, approvalPending: false, signal: "active" }), {
    kind: "tool",
    label: "Opening the demo",
  });
});

test("a finished tool without new text returns to preparing", () => {
  const messages: ActivityMessage[] = [
    { id: "u", role: "user", content: "Show the demo" },
    {
      id: "a",
      role: "assistant",
      content: "",
      toolCalls: [{ id: "call-1", function: { name: "navigate_site", arguments: "{}" } }],
    },
    { id: "t", role: "tool", toolCallId: "call-1", content: "{\"ok\":true}" },
  ];
  assert.equal(activityPhase({ messages, running: true, approvalPending: false, signal: "active" }).kind, "preparing");
});

test("confirmation stays steady and outranks streaming text", () => {
  const messages: ActivityMessage[] = [
    { id: "u", role: "user", content: "Reset" },
    { id: "a", role: "assistant", content: "I need to check first." },
  ];
  assert.equal(
    activityPhase({ messages, running: true, approvalPending: true, signal: "active" }).label,
    "Your confirmation is needed",
  );
});

test("a confirmation tool and an unknown tool stay honest", () => {
  const confirm: ActivityMessage[] = [
    { id: "u", role: "user", content: "Reset the estimate" },
    {
      id: "a",
      role: "assistant",
      content: "Checking.",
      toolCalls: [{ id: "call-2", function: { name: "confirm_reset_roi", arguments: "{}" } }],
    },
  ];
  assert.equal(activityPhase({ messages: confirm, running: true, approvalPending: false, signal: "active" }).kind, "confirm");
  const unknown: ActivityMessage[] = [
    { id: "u2", role: "user", content: "Do something" },
    {
      id: "a2",
      role: "assistant",
      content: "",
      toolCalls: [{ id: "call-3", function: { name: "not_a_real_tool", arguments: "{}" } }],
    },
  ];
  assert.equal(activityPhase({ messages: unknown, running: true, approvalPending: false, signal: "active" }).label, "Working with the site");
});

test("stop and failure end the indicator immediately", () => {
  const messages: ActivityMessage[] = [{ id: "u", role: "user", content: "Hello" }, { id: "a", role: "assistant", content: "Partial" }];
  assert.equal(activityPhase({ messages, running: true, approvalPending: false, signal: "stopped" }).kind, "stopped");
  assert.equal(activityPhase({ messages, running: false, approvalPending: false, signal: "failed" }).kind, "failed");
  assert.equal(activityPhase({ messages, running: false, approvalPending: false, signal: "active" }).kind, "idle");
});
