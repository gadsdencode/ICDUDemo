import { MAX_TURN_CONTINUATIONS } from "./limits.ts";

const continuations = new Map<string, number>();

export function resetTurnContinuations(): void {
  continuations.clear();
}

/**
 * Counts model invocations after the visitor's message.
 * The first user-message run is not a continuation. Later tool-result runs are.
 * In-memory only, same limitation as the agent runner.
 */
export function admitModelInvocation(threadId: string, userTurn: boolean): boolean {
  if (userTurn) {
    continuations.set(threadId, 0);
    return true;
  }
  const next = (continuations.get(threadId) ?? 0) + 1;
  if (next > MAX_TURN_CONTINUATIONS) return false;
  continuations.set(threadId, next);
  return true;
}
