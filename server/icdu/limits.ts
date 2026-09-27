import { USER_MESSAGES_PER_HOUR } from "../../shared/aiPublic.ts";

export type AiLimits = {
  sessionMessages: number;
  ipMessages: number;
  sessionRuns: number;
  ipRuns: number;
  sessionActive: number;
  ipActive: number;
};

/** Scale IP and run backstops with the published visitor message limit. */
export const defaultLimits: AiLimits = {
  sessionMessages: USER_MESSAGES_PER_HOUR,
  ipMessages: USER_MESSAGES_PER_HOUR * 4,
  sessionRuns: USER_MESSAGES_PER_HOUR * 3,
  ipRuns: USER_MESSAGES_PER_HOUR * 8,
  sessionActive: 1,
  ipActive: 4,
};

export const MAX_MODEL_STEPS = 3;
export const MAX_OUTPUT_TOKENS = 1024;
export const MAX_MESSAGES = 40;
export const MAX_FRONTEND_TOOLS = 7;
export const MAX_BODY_BYTES = 80 * 1024;
export const MAX_MESSAGE_CHARS = 4_000;
export const MAX_TOOL_RESULT_CHARS = 1_500;
export const MAX_CONTEXT_CHARS = 1_500;
export const MAX_INSTRUCTION_CHARS = 8_000;
/** Follow-up model calls after the visitor's message, across HTTP continuations. */
export const MAX_TURN_CONTINUATIONS = 2;
export const TURN_TTL_MS = 3 * 60 * 1000;
export const THREAD_ID_RE = /^[A-Za-z0-9_-]{8,128}$/;

const HOUR_MS = 60 * 60 * 1000;

export function hourWindow(now: Date): { start: Date; end: Date; id: string } {
  const startMs = Math.floor(now.getTime() / HOUR_MS) * HOUR_MS;
  const start = new Date(startMs);
  const end = new Date(startMs + HOUR_MS);
  return { start, end, id: start.toISOString() };
}

export function secondsUntil(later: Date, now: Date): number {
  return Math.max(1, Math.ceil((later.getTime() - now.getTime()) / 1000));
}

export function isThreadId(value: unknown): value is string {
  return typeof value === "string" && THREAD_ID_RE.test(value);
}
