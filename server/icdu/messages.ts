import type { ModelMessage } from "ai";
import type { RunAgentInput } from "@ag-ui/core";
import {
  convertMessagesToVercelAISDKMessages,
  convertToolsToVercelAITools,
} from "@copilotkit/runtime/v2";
import {
  MAX_CONTEXT_CHARS,
  MAX_FRONTEND_TOOLS,
  MAX_MESSAGE_CHARS,
  MAX_MESSAGES,
} from "./limits.ts";

const TOOL_NAME = /^[a-z][a-z0-9_]{0,48}$/;
const DENIED_TOOL =
  /admin|delete|drop|destroy|exec|shell|sql|deploy|secret|credential|password|token|apikey|api_key|filesystem|shutdown/i;

type AgUiMessage = RunAgentInput["messages"][number];

export function filterFrontendTools(
  tools: RunAgentInput["tools"] | undefined,
): RunAgentInput["tools"] {
  const kept: RunAgentInput["tools"] = [];
  for (const candidate of tools ?? []) {
    if (!candidate || typeof candidate.name !== "string") continue;
    if (candidate.name === "lookup_icdu_term") continue;
    if (!TOOL_NAME.test(candidate.name) || DENIED_TOOL.test(candidate.name)) continue;
    const encoded = JSON.stringify(candidate);
    if (encoded.length > 4_000) continue;
    kept.push(candidate);
    if (kept.length >= MAX_FRONTEND_TOOLS) break;
  }
  return kept;
}

function clipText(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max)}…`;
}

function clipMessage(message: AgUiMessage): AgUiMessage {
  if (!("content" in message) || typeof message.content !== "string") return message;
  return { ...message, content: clipText(message.content, MAX_MESSAGE_CHARS) } as AgUiMessage;
}

export function boundMessages(messages: RunAgentInput["messages"]): RunAgentInput["messages"] {
  return messages.slice(-MAX_MESSAGES).map((message) => clipMessage(message));
}

export function lastMessageIsUser(messages: Array<{ role?: string }> | undefined): boolean {
  return messages?.at(-1)?.role === "user";
}

function redact(text: string, secret: string): string {
  if (!secret || secret.length < 8 || !text.includes(secret)) return text;
  return text.split(secret).join("[redacted]");
}

function clipModelMessage(message: ModelMessage, secret: string): ModelMessage {
  if (message.role === "tool" || message.role === "system") return message;
  if (typeof message.content === "string") {
    return { ...message, content: redact(clipText(message.content, MAX_MESSAGE_CHARS), secret) };
  }
  if (!Array.isArray(message.content)) return message;
  return {
    ...message,
    content: message.content.map((part) => {
      if (part && typeof part === "object" && "text" in part && typeof part.text === "string") {
        return { ...part, text: redact(clipText(part.text, MAX_MESSAGE_CHARS), secret) };
      }
      return part;
    }),
  } as ModelMessage;
}

export function modelMessagesFromInput(
  messages: RunAgentInput["messages"],
  secret: string,
): ModelMessage[] {
  const converted = convertMessagesToVercelAISDKMessages(boundMessages(messages));
  return converted
    .filter((message) => message.role === "user" || message.role === "assistant" || message.role === "tool")
    .map((message) => clipModelMessage(message, secret));
}

export function frontendToolSet(tools: RunAgentInput["tools"] | undefined) {
  return convertToolsToVercelAITools(filterFrontendTools(tools));
}

export function instructionContext(
  input: Pick<RunAgentInput, "context" | "state">,
  secret: string,
): string {
  const parts: string[] = [];
  const context = Array.isArray(input.context) ? input.context.slice(0, 6) : [];
  for (const entry of context) {
    const description = clipText(String(entry.description ?? "Context"), 200);
    const value = clipText(String(entry.value ?? ""), MAX_CONTEXT_CHARS);
    const combined = `${description}\n${value}`;
    if (secret && combined.includes(secret)) continue;
    if (/https?:\/\//i.test(combined) && /api[_-]?key|bearer /i.test(combined)) continue;
    parts.push(combined);
  }
  if (input.state && typeof input.state === "object") {
    const json = JSON.stringify(input.state);
    if (json.length <= MAX_CONTEXT_CHARS && (!secret || !json.includes(secret))) {
      parts.push(`Application state:\n${json}`);
    }
  }
  return parts.join("\n\n");
}
