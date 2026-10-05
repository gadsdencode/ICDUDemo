import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import { pageFromPath } from "@shared/siteKnowledge";
import { AssistantHost } from "@/components/AssistantHost";
import { AssistantSessionProvider, useAssistantSession } from "@/components/assistant/session";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";

const WIDE_QUERY = "(min-width: 1100px)";

function useWideLayout() {
  const [wide, setWide] = useState(() => typeof window !== "undefined" && window.matchMedia(WIDE_QUERY).matches);
  useEffect(() => {
    const media = window.matchMedia(WIDE_QUERY);
    const update = () => setWide(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return wide;
}

function WorkspaceFrame({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const path = location.split("?")[0] || "/";
  const isHome = path === "/";
  const wide = useWideLayout();
  const session = useAssistantSession();
  const workspace = useWorkspace();
  workspace.onHomeReset.current = () => {
    session.resetRef.current();
    session.setPane("page");
  };
  useEffect(() => {
    return () => {
      workspace.onHomeReset.current = () => {};
    };
  }, [workspace.onHomeReset]);
  const page = pageFromPath(path);
  const showSwitch = !isHome && !wide;
  const showBanner = showSwitch && session.pane === "page" && session.approvalCount > 0;

  return (
    <div
      className={[
        "icdu-workspace",
        isHome ? "is-home" : "is-content",
        session.hasThread ? "has-thread" : "is-empty",
        workspace.view ? "has-stage" : "no-stage",
        wide ? "is-wide" : "is-narrow",
      ].join(" ")}
      data-pane={session.pane}
      data-assistant-layout={isHome ? "home" : "content"}
    >
      {showSwitch ? (
        <div className="icdu-pane-switch" role="tablist" aria-label="Page and conversation">
          <button
            type="button"
            role="tab"
            aria-selected={session.pane === "page"}
            data-testid="pane-page"
            onClick={() => session.setPane("page")}
          >
            Page
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={session.pane === "conversation"}
            data-testid="pane-conversation"
            onClick={() => session.setPane("conversation")}
          >
            Conversation
          </button>
        </div>
      ) : null}
      {showBanner ? (
        <div className="icdu-approval-banner" role="status">
          <p>A confirmation is waiting in the conversation.</p>
          <button type="button" onClick={() => session.setPane("conversation")} data-testid="pane-review-confirmation">
            Review confirmation
          </button>
        </div>
      ) : null}
      <main className="icdu-workspace-main" id="main-content">
        {children}
      </main>
      <section className="icdu-conversation" aria-label="ICDU conversation" data-testid="icdu-conversation">
        {isHome && session.hasThread ? (
          <div className="icdu-conversation-tools">
            <button
              type="button"
              className="icdu-new-chat"
              data-testid="assistant-new-conversation"
              onClick={() => session.resetRef.current()}
            >
              New conversation
            </button>
          </div>
        ) : null}
        {!isHome ? (
          <div className="icdu-conversation-bar">
            <p>
              Viewing: <span>{page?.title ?? "This page"}</span>
            </p>
            {session.hasThread ? (
              <button
                type="button"
                className="icdu-new-chat"
                data-testid="assistant-new-conversation"
                onClick={() => session.resetRef.current()}
              >
                New conversation
              </button>
            ) : null}
          </div>
        ) : null}
        <AssistantHost />
      </section>
    </div>
  );
}

export function AssistantWorkspace({ children, privateRoute }: { children: ReactNode; privateRoute: boolean }) {
  if (privateRoute) {
    return (
      <div className="icdu-workspace is-private">
        <main className="icdu-workspace-main" id="main-content">
          {children}
        </main>
      </div>
    );
  }
  return (
    <AssistantSessionProvider>
      <WorkspaceFrame>{children}</WorkspaceFrame>
    </AssistantSessionProvider>
  );
}
