import {
  ASSISTANT_BUSY,
  ASSISTANT_GENERIC,
  ASSISTANT_MISCONFIGURED,
  ASSISTANT_OFFLINE,
  ASSISTANT_QUOTA,
  ASSISTANT_TURN_BUSY,
  ASSISTANT_UNAVAILABLE,
  ASSISTANT_TOO_LARGE,
  MAX_VISITOR_MESSAGE_CHARS,
  reasonMessage,
  type PublicAiReason,
} from "@shared/aiPublic";

export type AssistantAvailability =
  | "loading"
  | "ready"
  | "busy"
  | "quota"
  | "offline"
  | "unavailable"
  | "misconfigured";

export type ComposerDecision =
  | { action: "ignore" }
  | { action: "stop" }
  | { action: "send"; text: string }
  | { action: "block"; message: string };

const BLOCKING: Record<Exclude<AssistantAvailability, "ready" | "busy" | "loading">, string> = {
  quota: ASSISTANT_QUOTA,
  offline: reasonMessage("offline"),
  unavailable: reasonMessage("unavailable"),
  misconfigured: reasonMessage("misconfigured"),
};

export function decideComposer(input: {
  value: string;
  availability: AssistantAvailability;
  running: boolean;
  maxChars?: number;
}): ComposerDecision {
  if (input.running || input.availability === "busy") return { action: "stop" };
  const text = input.value.trim();
  if (!text) return { action: "ignore" };
  if (input.availability === "loading") {
    return { action: "block", message: "Checking whether ICDU can answer." };
  }
  if (input.availability !== "ready") {
    return { action: "block", message: BLOCKING[input.availability] };
  }
  const maxChars = input.maxChars ?? MAX_VISITOR_MESSAGE_CHARS;
  if (text.length > maxChars) return { action: "block", message: ASSISTANT_TOO_LARGE };
  return { action: "send", text };
}

const VISITOR_MESSAGES = [
  ASSISTANT_UNAVAILABLE,
  ASSISTANT_MISCONFIGURED,
  ASSISTANT_OFFLINE,
  ASSISTANT_QUOTA,
  ASSISTANT_BUSY,
  ASSISTANT_TURN_BUSY,
  ASSISTANT_TOO_LARGE,
  ASSISTANT_GENERIC,
];

export function visitorRunError(error: unknown): string {
  const message = error instanceof Error ? error.message.trim() : "";
  const known = VISITOR_MESSAGES.find((item) => message.includes(item));
  if (known) return known;
  if (!message || message.length > 240 || /https?:|api[_-]?key|bearer|sk-|secret|\{|\}|^HTTP\b/i.test(message)) {
    return ASSISTANT_GENERIC;
  }
  return message;
}

export function internalAssistantPath(href: string, origin: string): string | null {
  if (!href || href.startsWith("#")) return null;
  let url: URL;
  try {
    url = new URL(href, origin);
  } catch {
    return null;
  }
  if (url.origin !== origin) return null;
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (/\.(pdf|zip|csv|json|md|docx?|xlsx?|png|jpe?g|webp|gif|svg)$/i.test(url.pathname)) return null;
  return `${url.pathname}${url.search}${url.hash}`;
}

export type AssistantLinkEvent = {
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  defaultPrevented: boolean;
};

export function shouldFollowAssistantLink(event: AssistantLinkEvent): boolean {
  if (event.defaultPrevented || event.button !== 0) return false;
  return !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);
}

export const HOME_STARTERS = [
  {
    id: "explain",
    label: "Explain ICDU",
    message:
      "Explain ICDU. Describe how it captures what the user intends, applies the relevant expertise and rules, checks the result against those requirements, and keeps a record of how the outcome was produced.",
  },
  {
    id: "healthcare",
    label: "Show a healthcare workflow",
    message:
      "Show the healthcare workflow. Open the demos page in guided mode and select the published healthcare-admin scenario.",
  },
  {
    id: "business",
    label: "Explore the business case",
    message: "Open the business case and explain the current modeled value estimate.",
  },
  {
    id: "integrate",
    label: "Help me integrate ICDU",
    message: "Help me integrate ICDU. Open the developer guide.",
  },
] as const;

export function availabilityReason(availability: AssistantAvailability): PublicAiReason | null {
  if (availability === "offline" || availability === "unavailable" || availability === "misconfigured") {
    return availability;
  }
  return null;
}
