export type ActivitySignal = "idle" | "active" | "stopped" | "failed";

export type ActivityPhase = {
  kind: "idle" | "preparing" | "responding" | "tool" | "confirm" | "stopped" | "failed";
  label: string;
};

export type ActivityMessage = {
  id?: string;
  role?: string;
  content?: unknown;
  name?: string;
  toolCallId?: string;
  toolCalls?: unknown;
};

const TOOL_LABELS: Record<string, string> = {
  navigate_site: "Opening the page",
  set_visitor_audience: "Choosing a path",
  set_demo_mode: "Opening the demo",
  select_guided_scenario: "Opening the demo",
  set_guided_stage: "Moving through the demo",
  select_lab_tab: "Opening the lab",
  open_faq: "Opening the FAQ",
  set_roi_inputs: "Updating the estimate",
  lookup_icdu_term: "Checking the glossary",
  search_site_content: "Searching the site",
  get_site_section: "Reading the page",
  recommend_site_resources: "Finding resources",
};

const idle: ActivityPhase = { kind: "idle", label: "" };

function textOf(message: ActivityMessage): string {
  const content = message.content;
  if (typeof content === "string") return content.trim();
  if (!Array.isArray(content)) return "";
  return content
    .map((part) => {
      if (typeof part === "string") return part;
      if (part && typeof part === "object" && "text" in part && typeof part.text === "string") return part.text;
      return "";
    })
    .join("")
    .trim();
}

function callsOf(message: ActivityMessage): Array<{ id: string; name: string; args: string }> {
  if (!Array.isArray(message.toolCalls)) return [];
  return message.toolCalls.flatMap((call) => {
    if (!call || typeof call !== "object") return [];
    const record = call as { id?: unknown; name?: unknown; function?: { name?: unknown; arguments?: unknown } };
    const name = typeof record.function?.name === "string" ? record.function.name : typeof record.name === "string" ? record.name : "";
    if (!name) return [];
    const id = typeof record.id === "string" ? record.id : name;
    const args = typeof record.function?.arguments === "string" ? record.function.arguments : "";
    return [{ id, name, args }];
  });
}

function currentTurn(messages: ActivityMessage[]): ActivityMessage[] {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index]?.role === "user") return messages.slice(index + 1);
  }
  return messages;
}

function labelFor(name: string, args: string): string {
  if (name === "navigate_site" && /demos/i.test(args)) return "Opening the demo";
  if (name === "navigate_site" && /faq/i.test(args)) return "Opening the FAQ";
  return TOOL_LABELS[name] ?? "Working with the site";
}

function activeWork(turn: ActivityMessage[]): ActivityPhase | null {
  const finished = new Set(
    turn.flatMap((message) => (message.role === "tool" && message.toolCallId ? [message.toolCallId] : [])),
  );
  let pending: { name: string; args: string } | null = null;
  for (const message of turn) {
    if (message.role !== "assistant") continue;
    for (const call of callsOf(message)) {
      if (!finished.has(call.id)) pending = call;
    }
  }
  if (!pending) return null;
  if (pending.name.startsWith("confirm_")) return { kind: "confirm", label: "Your confirmation is needed" };
  return { kind: "tool", label: labelFor(pending.name, pending.args) };
}

export function activityPhase(input: {
  messages: ActivityMessage[];
  running: boolean;
  approvalPending: boolean;
  signal: ActivitySignal;
}): ActivityPhase {
  if (input.signal === "stopped") return { kind: "stopped", label: "Stopped" };
  if (input.signal === "failed") return { kind: "failed", label: "" };
  if (input.approvalPending) return { kind: "confirm", label: "Your confirmation is needed" };

  const turn = input.running ? currentTurn(input.messages) : [];
  const work = activeWork(turn);
  if (work?.kind === "confirm") return work;
  if (!input.running) return idle;
  if (work) return work;
  if (turn.some((message) => message.role === "assistant" && textOf(message).length > 0)) {
    return { kind: "responding", label: "Responding" };
  }
  return { kind: "preparing", label: "Preparing a response" };
}
