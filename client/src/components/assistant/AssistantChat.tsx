import { useLayoutEffect, type ButtonHTMLAttributes, type ComponentProps, type MouseEvent, type ReactElement } from "react";
import { useLocation } from "wouter";
import {
  CopilotChat,
  CopilotChatMessageView,
  useAgent,
  UseAgentUpdate,
  type CopilotChatViewProps,
} from "@copilotkit/react-core/v2";
import { internalAssistantPath, shouldFollowAssistantLink, visitorRunError } from "@/lib/assistantComposer";
import type { ActivityMessage } from "@/lib/activityPhase";
import { ActivityStatus } from "@/components/assistant/ActivityStatus";
import { WorkspaceStage } from "@/components/workspace/WorkspaceStage";
import { IcduComposer } from "@/components/assistant/AssistantComposer";
import { useAssistantSession } from "@/components/assistant/session";

function HomeWelcome({ input }: { input: ReactElement }) {
  return (
    <div className="icdu-welcome">
      <WorkspaceStage />
      {input}
    </div>
  );
}

function QuietCursor() {
  return <span hidden />;
}

function IcduMessageView(props: ComponentProps<typeof CopilotChatMessageView>) {
  return (
    <CopilotChatMessageView {...props} cursor={QuietCursor}>
      {(slot) => (
        <div className="copilotKitMessages icdu-message-list" data-testid="copilot-message-list">
          {slot.messageElements}
          {slot.interruptElement}
          <ActivityStatus running={slot.isRunning} messages={slot.messages as ActivityMessage[]} />
          {(slot.messages?.length ?? 0) > 0 ? <WorkspaceStage /> : null}
        </div>
      )}
    </CopilotChatMessageView>
  );
}

function JumpToLatest({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={className ? `icdu-jump ${className}` : "icdu-jump"} data-testid="icdu-jump-latest" {...props}>
      Jump to latest
    </button>
  );
}

export function AssistantChat() {
  const [location, navigate] = useLocation();
  const session = useAssistantSession();
  const path = location.split("?")[0] || "/";
  const isHome = path === "/";
  const { agent } = useAgent({ updates: [UseAgentUpdate.OnMessagesChanged, UseAgentUpdate.OnRunStatusChanged] });
  const hasMessages = agent.messages.length > 0;

  useLayoutEffect(() => {
    if (hasMessages !== session.hasThread) session.setHasThread(hasMessages);
  }, [hasMessages, session.hasThread, session.setHasThread]);

  const onClickCapture = (event: MouseEvent<HTMLElement>) => {
    if (!shouldFollowAssistantLink(event)) return;
    const anchor = (event.target as HTMLElement | null)?.closest?.("a");
    if (!anchor) return;
    if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
    const href = anchor.getAttribute("href");
    if (!href) return;
    const next = internalAssistantPath(href, window.location.origin);
    if (!next) return;
    event.preventDefault();
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (next !== current) navigate(next);
  };

  return (
    <div
      className="icdu-assistant"
      data-layout={isHome && agent.messages.length === 0 ? "welcome" : "thread"}
      data-testid="icdu-assistant"
      onClickCapture={onClickCapture}
    >
      <CopilotChat
        agentId="default"
        labels={{
          chatInputPlaceholder: "Ask about ICDU or get help choosing a path.",
          chatDisclaimerText: "",
          welcomeMessageText: "",
        }}
        welcomeScreen={
          isHome
            ? (HomeWelcome as unknown as NonNullable<CopilotChatViewProps["welcomeScreen"]>)
            : false
        }
        input={IcduComposer as unknown as NonNullable<CopilotChatViewProps["input"]>}
        messageView={IcduMessageView as unknown as NonNullable<CopilotChatViewProps["messageView"]>}
        scrollView={{ scrollToBottomButton: JumpToLatest } as unknown as NonNullable<CopilotChatViewProps["scrollView"]>}
        onError={(event) => {
          if (session.runSignalRef.current === "stopped") return;
          session.setRunSignal("failed");
          if (event && typeof event === "object" && "error" in event) {
            session.setNotice(visitorRunError(event.error));
          }
        }}
      />
    </div>
  );
}
