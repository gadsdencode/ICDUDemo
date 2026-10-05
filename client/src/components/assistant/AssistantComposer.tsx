import { useEffect, useRef } from "react";
import { ArrowUp, Square } from "lucide-react";
import {
  useAgent,
  useCopilotChatConfiguration,
  useCopilotKit,
  type CopilotChatInputProps,
} from "@copilotkit/react-core/v2";
import {
  ASSISTANT_QUOTA,
  ASSISTANT_TOO_LARGE,
  MAX_VISITOR_MESSAGE_CHARS,
  SEPARATE_CHAT_NOTE,
  USAGE_LIMIT_LABEL,
  reasonMessage,
} from "@shared/aiPublic";
import { decideComposer } from "@/lib/assistantComposer";
import { useAssistantSession } from "@/components/assistant/session";

const MAX_ROWS = 6;

export function IcduComposer({
  value,
  onChange,
  onSubmitMessage,
  onStop,
  isRunning = false,
  autoFocus: _autoFocus,
  keyboardHeight = 0,
  bottomAnchored = false,
  onStartTranscribe: _start,
  onCancelTranscribe: _cancel,
  onFinishTranscribe: _finish,
  onFinishTranscribeWithAudio: _finishAudio,
  onAddFile: _addFile,
  toolsMenu: _tools,
  mode: _mode,
  positioning: _positioning,
  showDisclaimer: _disclaimer,
  containerRef: _containerRef,
}: CopilotChatInputProps) {
  const session = useAssistantSession();
  const config = useCopilotChatConfiguration();
  const { agent } = useAgent();
  const { copilotkit } = useCopilotKit();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const composingRef = useRef(false);
  const lockRef = useRef(false);
  const draft = value ?? "";
  const blocked =
    session.availability === "loading" ||
    session.availability === "quota" ||
    session.availability === "offline" ||
    session.availability === "unavailable" ||
    session.availability === "misconfigured";
  const canStop = Boolean(isRunning && onStop);
  const canSend = !blocked && !isRunning && draft.trim().length > 0 && draft.trim().length <= MAX_VISITOR_MESSAGE_CHARS;

  const attempt = (text?: string) => {
    const decision = decideComposer({
      value: text ?? draft,
      availability: isRunning ? "busy" : session.availability,
      running: isRunning,
    });
    if (decision.action === "ignore") return;
    if (decision.action === "stop") {
      session.setRunSignal("stopped");
      onStop?.();
      return;
    }
    if (decision.action === "block") {
      session.setNotice(decision.message);
      return;
    }
    if (!onSubmitMessage || lockRef.current) return;
    lockRef.current = true;
    session.focusComposerRef.current = true;
    session.setRunSignal("active");
    const current = draft;
    onSubmitMessage(decision.text);
    if (current.trim() !== decision.text) onChange?.(current);
    else session.setNotice(null);
    window.setTimeout(() => {
      lockRef.current = false;
      if (!session.focusComposerRef.current) return;
      session.focusComposerRef.current = false;
      textareaRef.current?.focus({ preventScroll: true });
    }, 350);
  };

  useEffect(() => {
    if (!session.focusComposerRef.current) return;
    session.focusComposerRef.current = false;
    textareaRef.current?.focus({ preventScroll: true });
  }, [session.focusComposerRef, bottomAnchored]);

  session.sendRef.current = (text: string) => {
    if (isRunning || blocked) return;
    attempt(text);
  };
  session.resetRef.current = () => {
    session.dismissRef.current();
    try {
      copilotkit.stopAgent({ agent });
    } catch {
      try {
        agent.abortRun();
      } catch {
        /* The turn is already stopped. */
      }
    }
    // CopilotChat keeps its thread id in a mount-time memo when no threadId
    // prop is set, so startNewThread() alone does not clear this transcript.
    agent.threadId = crypto.randomUUID();
    agent.setMessages([]);
    onChange?.("");
    config?.startNewThread();
    session.afterResetRef.current();
    session.setRunSignal("idle");
    session.setNotice(null);
  };

  useEffect(() => {
    const node = textareaRef.current;
    if (!node) return;
    node.style.height = "auto";
    const computed = window.getComputedStyle(node);
    const line = Number.parseFloat(computed.lineHeight) || 24;
    const padding = (Number.parseFloat(computed.paddingTop) || 0) + (Number.parseFloat(computed.paddingBottom) || 0);
    const max = line * MAX_ROWS + padding;
    node.style.maxHeight = `${max}px`;
    node.style.height = `${Math.min(node.scrollHeight, max)}px`;
  }, [draft]);

  useEffect(() => {
    if (session.notice === ASSISTANT_TOO_LARGE && draft.trim().length <= MAX_VISITOR_MESSAGE_CHARS) {
      session.setNotice(null);
    }
  }, [draft, session]);

  const placeholder = session.availability === "quota"
    ? "Message limit reached"
    : "Ask about ICDU or get help choosing a path.";
  const status = statusCopy(session.availability, session.remaining, session.limit);
  const prominent = session.notice ?? (session.availability !== "ready" && session.availability !== "busy" ? status : null);
  const retryLabel = session.availability === "quota" ? "Check again" : "Try again";
  const showRetry =
    session.availability === "quota" ||
    session.availability === "offline" ||
    session.availability === "unavailable" ||
    session.availability === "misconfigured" ||
    Boolean(session.notice && session.notice !== ASSISTANT_TOO_LARGE && session.availability === "ready");

  return (
    <div
      className="icdu-composer-wrap"
      data-testid="icdu-composer-wrap"
      style={{
        transform: bottomAnchored && keyboardHeight > 0 ? `translateY(-${keyboardHeight}px)` : undefined,
        paddingBottom: bottomAnchored
          ? "max(env(safe-area-inset-bottom), var(--copilotkit-license-banner-offset, 0px))"
          : undefined,
      }}
    >
      <div className="icdu-composer">
        <label className="sr-only" htmlFor="icdu-composer">
          Message ICDU
        </label>
        <textarea
          id="icdu-composer"
          ref={textareaRef}
          data-testid="icdu-composer"
          rows={1}
          value={draft}
          disabled={blocked}
          placeholder={placeholder}
          aria-invalid={session.notice === ASSISTANT_TOO_LARGE || undefined}
          aria-describedby="icdu-composer-status"
          onChange={(event) => onChange?.(event.target.value)}
          onCompositionStart={() => {
            composingRef.current = true;
          }}
          onCompositionEnd={() => {
            composingRef.current = false;
          }}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing || composingRef.current || event.keyCode === 229) return;
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              attempt();
            }
          }}
        />
        <div className="icdu-composer-actions">
          <button
            type="button"
            className="icdu-send"
            data-testid={canStop ? "icdu-stop" : "icdu-send"}
            aria-label={canStop ? "Stop response" : "Send message"}
            disabled={canStop ? false : !canSend}
            onClick={() => attempt()}
          >
            {canStop ? <Square aria-hidden="true" strokeWidth={2} size={15} /> : <ArrowUp aria-hidden="true" strokeWidth={2} size={18} />}
          </button>
        </div>
      </div>
      <div id="icdu-composer-status" className={prominent ? "icdu-composer-status is-prominent" : "icdu-composer-status"} role="status" aria-live="polite">
        <p>{prominent ?? status}</p>
        {session.availability === "ready" || session.availability === "busy" ? (
          <p className="icdu-composer-note">{SEPARATE_CHAT_NOTE}</p>
        ) : null}
        {showRetry ? (
          <button type="button" className="icdu-retry" onClick={() => session.refresh()} data-testid="icdu-retry">
            {retryLabel}
          </button>
        ) : null}
      </div>
      <span className="sr-only">{USAGE_LIMIT_LABEL}</span>
    </div>
  );
}

function statusCopy(availability: ReturnType<typeof useAssistantSession>["availability"], remaining: number, limit: number): string {
  if (availability === "loading") return "Checking whether ICDU can answer.";
  if (availability === "quota") return ASSISTANT_QUOTA;
  if (availability === "offline" || availability === "unavailable" || availability === "misconfigured") {
    return reasonMessage(availability);
  }
  return `${remaining} of ${limit} left this hour`;
}
