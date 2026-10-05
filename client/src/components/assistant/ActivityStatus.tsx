import { useEffect, useRef, useState } from "react";
import { activityPhase, type ActivityMessage, type ActivityPhase } from "@/lib/activityPhase";
import { useAssistantSession } from "@/components/assistant/session";

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}

function Trace({ steady }: { steady: boolean }) {
  return (
    <span className={steady ? "icdu-trace is-steady" : "icdu-trace"} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

export function ActivityStatus({ running, messages }: { running: boolean; messages: ActivityMessage[] }) {
  const session = useAssistantSession();
  const reduced = useReducedMotion();
  const phase = activityPhase({
    messages,
    running,
    approvalPending: session.approvalCount > 0,
    signal: session.runSignal,
  });
  const [display, setDisplay] = useState<ActivityPhase | null>(null);
  const [leaving, setLeaving] = useState(false);
  const displayRef = useRef<ActivityPhase | null>(null);

  useEffect(() => {
    const previous = displayRef.current;
    if (phase.kind === "failed") {
      displayRef.current = null;
      setLeaving(false);
      setDisplay(null);
      return;
    }
    if (phase.kind !== "idle") {
      displayRef.current = phase;
      setLeaving(false);
      setDisplay(phase);
      return;
    }
    if (!previous || previous.kind === "stopped" || previous.kind === "failed") {
      displayRef.current = null;
      setLeaving(false);
      setDisplay(null);
      return;
    }
    if (reduced) {
      displayRef.current = null;
      setLeaving(false);
      setDisplay(null);
      return;
    }
    setLeaving(true);
    const timer = window.setTimeout(() => {
      displayRef.current = null;
      setLeaving(false);
      setDisplay(null);
    }, 180);
    return () => window.clearTimeout(timer);
  }, [phase.kind, phase.label, reduced]);

  if (!display) return null;
  const steady = display.kind === "confirm" || display.kind === "stopped" || reduced;
  const quiet = display.kind === "responding";
  return (
    <div
      className={["icdu-activity", leaving ? "is-leaving" : "", quiet ? "is-quiet" : "", steady ? "is-steady" : ""].filter(Boolean).join(" ")}
      data-testid="icdu-activity"
      data-phase={display.kind}
    >
      {display.kind === "stopped" ? null : <Trace steady={steady} />}
      <p aria-live="polite" aria-atomic="true">{display.label}</p>
    </div>
  );
}
