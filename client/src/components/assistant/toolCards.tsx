import { useEffect, type ReactNode } from "react";
import { useAssistantSession } from "@/components/assistant/session";

type CardProps = {
  title: string;
  status: "working" | "done" | "failed" | "cancelled";
  children?: ReactNode;
};

const statusLabel = {
  working: "Working",
  done: "Done",
  failed: "Could not finish",
  cancelled: "Cancelled",
} as const;

export function ToolResultCard({ title, status, children }: CardProps) {
  return (
    <div
      className="my-2 rounded-md border border-[color:var(--icdu-border)] bg-[color:var(--icdu-surface)] px-3 py-2 text-sm text-[color:var(--icdu-fg)]"
      role="status"
      aria-live="polite"
      data-testid={`assistant-card-${status}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="m-0 font-medium">{title}</p>
        <span className="text-xs uppercase tracking-wide text-[color:var(--icdu-fg-muted)]">{statusLabel[status]}</span>
      </div>
      {children ? <div className="mt-1 text-[color:var(--icdu-fg-muted)]">{children}</div> : null}
    </div>
  );
}

export function statusFromTool(status: string, result: string | undefined): CardProps["status"] {
  if (status !== "complete") return "working";
  try {
    const parsed = result ? (JSON.parse(result) as { ok?: boolean; approved?: boolean; cancelled?: boolean }) : null;
    if (parsed?.cancelled || parsed?.approved === false) return "cancelled";
    if (parsed && parsed.ok === false) return "failed";
    return "done";
  } catch {
    return "failed";
  }
}

export function ConfirmActions({
  body,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { retainApproval } = useAssistantSession();
  useEffect(() => retainApproval(), [retainApproval]);
  return (
    <ToolResultCard title="Confirm before discarding work" status="working">
      <p className="m-0">{body}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" className="icdu-focus rounded-md border px-3 py-1.5 text-sm" onClick={onConfirm}>
          {confirmLabel}
        </button>
        <button type="button" className="icdu-focus rounded-md border px-3 py-1.5 text-sm" onClick={onCancel}>
          Keep current work
        </button>
      </div>
    </ToolResultCard>
  );
}
