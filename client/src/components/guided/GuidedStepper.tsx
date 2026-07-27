import { cn } from "@/lib/utils";
import { guidedSteps, type GuidedStepId } from "@/data/guidedScenarios";
import { Check } from "lucide-react";

type GuidedStepperProps = {
  current: GuidedStepId;
  furthestIndex: number;
  onSelect: (step: GuidedStepId) => void;
};

export function GuidedStepper({
  current,
  furthestIndex,
  onSelect,
}: GuidedStepperProps) {
  const currentIndex = guidedSteps.findIndex((s) => s.id === current);

  return (
    <nav aria-label="Guided demo progress" className="w-full">
      <ol className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-0">
        {guidedSteps.map((step, index) => {
          const isCurrent = step.id === current;
          const isComplete = index < currentIndex;
          const isReachable = index <= furthestIndex;
          return (
            <li key={step.id} className="relative flex-1">
              <button
                type="button"
                disabled={!isReachable}
                onClick={() => isReachable && onSelect(step.id)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors sm:flex-col sm:items-start sm:rounded-none sm:border-0 sm:border-t-2 sm:px-2 sm:pt-3",
                  isCurrent &&
                    "border-[color:var(--icdu-blue)] bg-[color:var(--icdu-glow-blue)] sm:border-t-[color:var(--icdu-blue)]",
                  !isCurrent &&
                    isComplete &&
                    "border-[color:var(--icdu-border)] sm:border-t-[color:var(--icdu-blue)]",
                  !isCurrent &&
                    !isComplete &&
                    "border-[color:var(--icdu-border)] sm:border-t-[color:var(--icdu-border)]",
                  !isReachable && "opacity-50 cursor-not-allowed",
                  isReachable && !isCurrent && "hover:bg-[color:var(--icdu-surface-hover)]",
                )}
                data-testid={`guided-step-${step.id}`}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    isCurrent && "bg-[color:var(--icdu-blue)] text-white",
                    isComplete && !isCurrent && "bg-[color:var(--icdu-green)] text-white",
                    !isComplete && !isCurrent && "bg-[color:var(--icdu-surface-solid)] text-[color:var(--icdu-fg-faint)] border border-[color:var(--icdu-border)]",
                  )}
                >
                  {isComplete && !isCurrent ? (
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    String(index + 1)
                  )}
                </span>
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--icdu-fg-ghost)] sm:mb-0.5">
                    Step {index + 1}
                  </span>
                  <span
                    className={cn(
                      "block text-sm font-medium",
                      isCurrent
                        ? "text-[color:var(--icdu-fg)]"
                        : "text-[color:var(--icdu-fg-muted)]",
                    )}
                  >
                    <span className="sm:hidden">{step.short}</span>
                    <span className="hidden sm:inline">{step.label}</span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
