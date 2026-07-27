import { BrandCard } from "@/components/brand";
import { guidedScenarios, type GuidedScenario } from "@/data/guidedScenarios";
import { cn } from "@/lib/utils";
import { ArrowRight, FileText, HeartPulse, Headphones } from "lucide-react";

const icons = {
  "support-escalation": Headphones,
  "document-review": FileText,
  "healthcare-admin": HeartPulse,
} as const;

type ScenarioSelectorProps = {
  onSelect: (scenario: GuidedScenario) => void;
};

export function ScenarioSelector({ onSelect }: ScenarioSelectorProps) {
  return (
    <div data-testid="guided-scenario-selector">
      <div className="mb-6 sm:mb-8 max-w-2xl">
        <div className="icdu-section-label">Choose a scenario</div>
        <h2 className="icdu-section-heading mb-3">
          Start with a realistic workflow.
        </h2>
        <p className="text-sm sm:text-base leading-relaxed text-[color:var(--icdu-fg-muted)]">
          Pick one path. We&apos;ll carry the same intent through define → build →
          run → evaluate → evidence so you see how ICDU changes the work — not
          just the tooling.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {guidedScenarios.map((scenario) => {
          const Icon = icons[scenario.id as keyof typeof icons] ?? FileText;
          return (
            <button
              key={scenario.id}
              type="button"
              onClick={() => onSelect(scenario)}
              className={cn(
                "text-left rounded-xl border border-[color:var(--icdu-border)] bg-[color:var(--icdu-surface)] p-5 cursor-pointer shadow-sm transition-all",
                "hover:border-[color:var(--icdu-border-hover)] hover:bg-[color:var(--icdu-surface-hover)] hover:shadow-md hover:-translate-y-0.5",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--icdu-blue)]",
                "active:translate-y-0",
              )}
              data-testid={`guided-scenario-${scenario.id}`}
            >
              <div
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-md text-white"
                style={{ background: "var(--icdu-blue)" }}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--icdu-fg-faint)] mb-1.5">
                {scenario.industry}
              </div>
              <h3 className="font-editorial text-xl tracking-tight mb-2 text-[color:var(--icdu-fg)]">
                {scenario.title}
              </h3>
              <p className="text-sm leading-relaxed text-[color:var(--icdu-fg-muted)] mb-4">
                {scenario.subtitle}
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--icdu-blue)]">
                Start this path <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>
          );
        })}
      </div>

      <BrandCard className="mt-6 sm:mt-8 p-4 sm:p-5">
        <p className="text-sm text-[color:var(--icdu-fg-muted)] m-0 leading-relaxed">
          Prefer raw controls? You can switch to{" "}
          <span className="font-medium text-[color:var(--icdu-fg)]">Advanced Lab</span>{" "}
          anytime after — Builder, Judge, HITL, and Stress remain fully available.
        </p>
      </BrandCard>
    </div>
  );
}
