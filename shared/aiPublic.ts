/** Visitor-facing copy. No hosts, keys, or infrastructure. */
export const USER_MESSAGES_PER_HOUR = 10;

export const USAGE_LIMIT_LABEL =
  "10 messages per hour. No account required.";

export const SEPARATE_CHAT_NOTE =
  "This chat is separate from the local fine-tune workspace.";

export const ASSISTANT_UNAVAILABLE =
  "The assistant is unavailable right now.";

export const ASSISTANT_MISCONFIGURED =
  "The assistant isn't configured correctly yet. Please try again later.";

export const ASSISTANT_OFFLINE =
  "ICDU is offline or took too long to answer. Please try again shortly.";

export const ASSISTANT_BUSY =
  "ICDU is busy right now. Please wait and try again.";

export const ASSISTANT_QUOTA =
  "You've used your 10 messages for this hour. Please wait for the limit to reset.";

export const ASSISTANT_TURN_BUSY =
  "A reply is already in progress. Wait for it to finish or stop it, then try again.";

export const ASSISTANT_TOO_LARGE =
  "That message is too large. Shorten it and try again.";

export const ASSISTANT_GENERIC =
  "The assistant couldn't answer just now. Please try again shortly.";

export type PublicAiReason = "unavailable" | "misconfigured" | "offline";

export function reasonMessage(reason: PublicAiReason): string {
  switch (reason) {
    case "misconfigured":
      return ASSISTANT_MISCONFIGURED;
    case "offline":
      return ASSISTANT_OFFLINE;
    default:
      return ASSISTANT_UNAVAILABLE;
  }
}
