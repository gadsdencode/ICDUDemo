import assert from "node:assert/strict";
import test from "node:test";
import express from "express";
import type { Server } from "http";
import { clientIp } from "./clientIp.ts";

async function withApp(
  run: (base: string) => Promise<void>,
): Promise<void> {
  const app = express();
  app.set("trust proxy", 1);
  app.get("/", (req, res) => {
    res.json({ ip: clientIp(req) });
  });
  const server: Server = await new Promise((resolve) => {
    const listening = app.listen(0, "127.0.0.1", () => resolve(listening));
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("no port");
  try {
    await run(`http://127.0.0.1:${address.port}/`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test("client IP uses the proxy-appended address, not a spoofed leftmost value", async () => {
  await withApp(async (base) => {
    const response = await fetch(base, {
      headers: { "x-forwarded-for": "1.1.1.1, 203.0.113.9" },
    });
    const body = (await response.json()) as { ip: string | null };
    assert.equal(body.ip, "203.0.113.9");
  });
});

test("direct connections without a forwarded header use the socket peer", async () => {
  await withApp(async (base) => {
    const response = await fetch(base);
    const body = (await response.json()) as { ip: string | null };
    assert.equal(body.ip, "127.0.0.1");
  });
});
