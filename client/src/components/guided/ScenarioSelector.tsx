import { BrandCard } from "@/components/brand";
import { guidedScenarios, type GuidedScenario } from "@/data/guidedScenarios";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  FileText,
  Factory,
  HeartPulse,
  Headphones,
  Landmark,
  Shield,
  Users,
  Wallet,
} from "lucide-react";

const icons = {
  "support-escalation": Headphones,
  "document-review": FileText,
  "healthcare-admin": HeartPulse,
  "financial-services": Wallet,
  "insurance-claim": Shield,
  "public-benefits": Landmark,
  "plant-maintenance": Factory,
  "hr-policy": Users,
} as const;

type ScenarioSelectorProps = {
  onSelect: (scenario: GuidedScenario) => void;
  selectedId?: string | null;
  intro?: { label: string; title: string; description: string } | null;
  actionLabel?: string;
  showLabNote?: boolean;
};

export function ScenarioSelector({
  onSelect,
  selectedId = null,
  intro,
  actionLabel = "Start this path",
  showLabNote = true,
}: ScenarioSelectorProps) {
  const introCopy =
    intro === null
      ? null
      : intro ?? {
          label: "Choose a scenario",
          title: "Start with a realistic workflow.",
          description:
            "Pick one path. We'll carry the same intent through define → build → run → evaluate → evidence so you see how ICDU changes the work — not just the tooling.",
        };

  return (
    <div data-testid="guided-scenario-selector">
      {introCopy ? (
        <div className="mb-6 sm:mb-8 max-w-2xl">
          <div className="icdu-section-label">{introCopy.label}</div>
          <h2 className="icdu-section-heading mb-3">{introCopy.title}</h2>
          <p className="text-sm sm:text-base leading-relaxed text-[color:var(--icdu-fg-muted)]">
            {introCopy.description}
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        {guidedScenarios.map((scenario) => {
          const Icon = icons[scenario.id as keyof typeof icons] ?? FileText;
          const selected = selectedId === scenario.id;
          return (
            <button
              key={scenario.id}
              type="button"
              onClick={() => onSelect(scenario)}
              aria-pressed={selected}
              className={cn(
                "icdu-focus text-left rounded-xl border-2 border-[color:var(--icdu-fg-whisper)] bg-[color:var(--icdu-surface)] p-5 cursor-pointer transition-colors",
                "hover:border-[color:var(--icdu-fg)]",
                selected && "border-[color:var(--icdu-fg)] bg-[color:var(--icdu-surface-solid)]",
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
              <h3
                className={cn(
                  "font-editorial text-xl tracking-tight mb-2 text-[color:var(--icdu-fg)]",
                  selected && "font-semibold",
                )}
              >
                {scenario.title}
              </h3>
              <p className="text-sm leading-relaxed text-[color:var(--icdu-fg-muted)] mb-4">
                {scenario.subtitle}
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--icdu-blue)]">
                {selected ? "Selected" : actionLabel} <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>
          );
        })}
      </div>

      {showLabNote ? (
        <BrandCard className="mt-6 sm:mt-8 p-4 sm:p-5">
          <p className="text-sm text-[color:var(--icdu-fg-muted)] m-0 leading-relaxed">
            Prefer raw controls? You can switch to{" "}
            <span className="font-medium text-[color:var(--icdu-fg)]">Advanced Lab</span>{" "}
            anytime after — Builder, Judge, HITL, and Stress remain fully available.
          </p>
        </BrandCard>
      ) : null}
    </div>
  );
}
