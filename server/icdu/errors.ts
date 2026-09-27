import {
  ASSISTANT_BUSY,
  ASSISTANT_GENERIC,
  ASSISTANT_MISCONFIGURED,
  ASSISTANT_OFFLINE,
  ASSISTANT_QUOTA,
  ASSISTANT_TURN_BUSY,
} from "../../shared/aiPublic.ts";

export function parseRetryAfter(value: string | null, now = Date.now()): number | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) return Math.min(Number(trimmed), 3600);
  const date = Date.parse(trimmed);
  if (Number.isNaN(date)) return null;
  return Math.min(3600, Math.max(0, Math.ceil((date - now) / 1000)));
}

export function quotaMessage(scope: string, retryAfterSeconds: number): string {
  if (scope === "session") {
    return `${ASSISTANT_QUOTA} You can try again in about ${Math.ceil(retryAfterSeconds / 60)} minutes.`;
  }
  if (scope === "session_turn") return ASSISTANT_TURN_BUSY;
  const wait = Math.max(1, retryAfterSeconds);
  return `${ASSISTANT_BUSY} Try again in ${wait} seconds.`;
}

export function jsonResponse(
  status: number,
  message: string,
  retryAfterSeconds?: number,
): Response {
  const headers = new Headers({ "content-type": "application/json; charset=utf-8" });
  if (retryAfterSeconds != null) headers.set("retry-after", String(retryAfterSeconds));
  return new Response(JSON.stringify({ message }), { status, headers });
}

function statusOf(error: unknown): number | null {
  if (!error || typeof error !== "object") return null;
  const record = error as { status?: unknown; statusCode?: unknown };
  const value = record.statusCode ?? record.status;
  return typeof value === "number" ? value : null;
}

export function publicModelFailure(error: unknown): {
  status: number;
  message: string;
  retryAfterSeconds?: number;
} {
  const status = statusOf(error);
  const retryHeader =
    error && typeof error === "object" && "responseHeaders" in error
      ? headerValue((error as { responseHeaders?: unknown }).responseHeaders, "retry-after")
      : null;
  const retryAfter = parseRetryAfter(retryHeader);
  if (status === 401 || status === 403) {
    return { status: 401, message: ASSISTANT_MISCONFIGURED };
  }
  if (status === 429) {
    const wait = retryAfter ?? 15;
    return {
      status: 429,
      message: `${ASSISTANT_BUSY} Try again in ${wait} seconds.`,
      retryAfterSeconds: wait,
    };
  }
  if (status === 408 || status === 504 || status === 503 || status === 502) {
    return { status: 503, message: ASSISTANT_OFFLINE };
  }
  const text = error instanceof Error ? error.message : "";
  if (/timeout|timed out|ECONNREFUSED|ECONNRESET|fetch failed|socket/i.test(text)) {
    return { status: 503, message: ASSISTANT_OFFLINE };
  }
  return { status: 502, message: ASSISTANT_GENERIC };
}

function headerValue(headers: unknown, name: string): string | null {
  if (!headers) return null;
  if (headers instanceof Headers) return headers.get(name);
  if (typeof headers === "object") {
    const record = headers as Record<string, unknown>;
    const direct = record[name] ?? record[name.toLowerCase()];
    return typeof direct === "string" ? direct : null;
  }
  return null;
}

export function sanitizeVisitorText(text: string, secret: string): string {
  let next = text;
  if (secret && secret.length >= 8) next = next.split(secret).join("[redacted]");
  if (/https?:\/\//i.test(next) || /bearer\s+/i.test(next)) return ASSISTANT_GENERIC;
  return next;
}
