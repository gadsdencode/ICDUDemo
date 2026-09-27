import { useLocation } from "wouter";
import { z } from "zod";
import { CopilotKit, CopilotPopup, useAgentContext, useFrontendTool } from "@copilotkit/react-core/v2";
import "@copilotkit/react-core/v2/styles.css";
import {
  SEPARATE_CHAT_NOTE,
  USAGE_LIMIT_LABEL,
  USER_MESSAGES_PER_HOUR,
} from "@shared/aiPublic";

const noteSchema = z
  .object({
    note: z.string().trim().min(1).max(160),
  })
  .strict();

function AssistantSession({
  remaining,
  limit,
  unavailableMessage,
}: {
  remaining: number;
  limit: number;
  unavailableMessage: string | null;
}) {
  const [location] = useLocation();
  useAgentContext({
    description: "Public website assistant",
    value: `The visitor is on ${location || "/"}. They can send ${USER_MESSAGES_PER_HOUR} messages an hour. ${SEPARATE_CHAT_NOTE}`,
  });
  useFrontendTool({
    name: "show_safe_note",
    description: "Show a short note in the conversation. It cannot change the site, accounts, or data.",
    parameters: noteSchema,
    handler: async (args) => {
      const parsed = noteSchema.safeParse(args);
      if (!parsed.success) return { error: "That note was not accepted." };
      return { shown: parsed.data.note };
    },
  });

  return (
    <CopilotPopup
      agentId="default"
      defaultOpen={false}
      clickOutsideToClose
      labels={{
        modalHeaderTitle: "Ask ICDU",
        chatToggleOpenLabel: "Ask ICDU",
        chatToggleCloseLabel: "Close chat",
        welcomeMessageText: unavailableMessage
          ? `${unavailableMessage} ${USAGE_LIMIT_LABEL}`
          : `Ask a question about ICDU. ${USAGE_LIMIT_LABEL}`,
        chatDisclaimerText: `${USAGE_LIMIT_LABEL} ${remaining} of ${limit} left this hour. ${SEPARATE_CHAT_NOTE}`,
        chatInputPlaceholder: "Ask about ICDU",
      }}
    />
  );
}

export default function AssistantChat({
  remaining,
  limit,
  unavailableMessage,
}: {
  remaining: number;
  limit: number;
  unavailableMessage: string | null;
}) {
  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit"
      agentId="default"
      useSingleEndpoint={false}
      credentials="include"
      enableInspector={false}
    >
      <AssistantSession
        remaining={remaining}
        limit={limit}
        unavailableMessage={unavailableMessage}
      />
    </CopilotKit>
  );
}
