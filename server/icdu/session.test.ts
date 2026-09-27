import assert from "node:assert/strict";
import test from "node:test";
import { mintSession, signSession, verifySession } from "./session.ts";

const secret = "test-session-secret-value";

test("signed session rejects tampering and foreign ids", () => {
  const issued = mintSession(secret, 1_000);
  assert.equal(verifySession(issued.token, secret, 1_000), issued.sessionId);
  const [payload, signature] = issued.token.split(".");
  const flipped = `${payload}.${signature.slice(0, -1)}${signature.endsWith("a") ? "b" : "a"}`;
  assert.equal(verifySession(flipped, secret, 1_000), null);
  const forged = signSession("visitor-supplied", 2_000, secret);
  assert.equal(verifySession(forged, secret, 1_000), null);
  assert.equal(verifySession(issued.token, "other-session-secret", 1_000), null);
  assert.equal(verifySession(issued.token, secret, issued.expiresAt.getTime() / 1000), null);
});
