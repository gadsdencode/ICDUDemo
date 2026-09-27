import { createHmac, randomUUID, timingSafeEqual } from "crypto";

export const VISITOR_COOKIE = "icdu_visitor";
const SESSION_TTL_SECONDS = 12 * 60 * 60;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function sessionSecret(): string | null {
  const secret = process.env.ICDU_SESSION_SECRET?.trim() ?? "";
  if (secret.length < 16) return null;
  return secret;
}

export function readCookie(
  header: string | undefined,
  name: string,
): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator === -1) continue;
    const key = part.slice(0, separator).trim();
    if (key !== name) continue;
    const raw = part.slice(separator + 1).trim();
    try {
      return decodeURIComponent(raw);
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export function signSession(
  sessionId: string,
  expiresAtSeconds: number,
  secret: string,
): string {
  const payload = Buffer.from(
    JSON.stringify({ v: 1, sid: sessionId, exp: expiresAtSeconds }),
    "utf8",
  ).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifySession(
  token: string,
  secret: string,
  nowSeconds: number,
): string | null {
  const separator = token.lastIndexOf(".");
  if (separator <= 0) return null;
  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  const actualBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (actualBuf.length !== expectedBuf.length) return null;
  if (!timingSafeEqual(actualBuf, expectedBuf)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      v?: unknown;
      sid?: unknown;
      exp?: unknown;
    };
    if (data.v !== 1 || typeof data.sid !== "string" || typeof data.exp !== "number") {
      return null;
    }
    if (!UUID_RE.test(data.sid) || data.exp <= nowSeconds) return null;
    return data.sid;
  } catch {
    return null;
  }
}

export function mintSession(
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): { sessionId: string; token: string; expiresAt: Date } {
  const sessionId = randomUUID();
  const exp = nowSeconds + SESSION_TTL_SECONDS;
  return {
    sessionId,
    token: signSession(sessionId, exp, secret),
    expiresAt: new Date(exp * 1000),
  };
}

export function resolveVisitorSession(
  cookieHeader: string | undefined,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): { sessionId: string; token: string; expiresAt: Date; fresh: boolean } {
  const existing = readCookie(cookieHeader, VISITOR_COOKIE);
  if (existing) {
    const sessionId = verifySession(existing, secret, nowSeconds);
    if (sessionId) {
      const exp = nowSeconds + SESSION_TTL_SECONDS;
      return {
        sessionId,
        token: signSession(sessionId, exp, secret),
        expiresAt: new Date(exp * 1000),
        fresh: false,
      };
    }
  }
  return { ...mintSession(secret, nowSeconds), fresh: true };
}

export function hashIp(ip: string, secret: string): string {
  return createHmac("sha256", secret).update(`ip:${ip}`).digest("hex");
}
