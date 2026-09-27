import assert from "node:assert/strict";
import test from "node:test";
import { admitModelInvocation, resetTurnContinuations } from "./continuations.ts";

test("a user turn resets the continuation budget and later tool runs are capped", () => {
  resetTurnContinuations();
  assert.equal(admitModelInvocation("thread-a", true), true);
  assert.equal(admitModelInvocation("thread-a", false), true);
  assert.equal(admitModelInvocation("thread-a", false), true);
  assert.equal(admitModelInvocation("thread-a", false), false);
  assert.equal(admitModelInvocation("thread-a", true), true);
  assert.equal(admitModelInvocation("thread-b", false), true);
});
