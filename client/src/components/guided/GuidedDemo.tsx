import { useMemo, useState } from "react";
import {
  guidedSteps,
  type GuidedScenario,
  type GuidedStepId,
} from "@/data/guidedScenarios";
import { GuidedStepper } from "./GuidedStepper";
import { StageCoach } from "./StageCoach";
import { ScenarioSelector } from "./ScenarioSelector";
import { TechnicalRecord } from "./TechnicalRecord";
import { PrimaryCTA, SecondaryCTA } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { trackDemoInteraction } from "@/lib/analytics";

const WALKTHROUGH_URL =
  "mailto:brian@osscontact.com?subject=ICDU%20Walkthrough";

type GuidedDemoProps = {
  onOpenAdvancedLab: () => void;
};

function stepIndex(id: GuidedStepId) {
  return guidedSteps.findIndex((s) => s.id === id);
}

export function GuidedDemo({ onOpenAdvancedLab }: GuidedDemoProps) {
  const [scenario, setScenario] = useState<GuidedScenario | null>(null);
  const [step, setStep] = useState<GuidedStepId>("define");
  const [furthest, setFurthest] = useState(0);
  const [ranAi, setRanAi] = useState(false);
  const [evaluated, setEvaluated] = useState(false);

  const progressPct = useMemo(() => {
    if (!scenario) return 0;
    return ((stepIndex(step) + 1) / guidedSteps.length) * 100;
  }, [scenario, step]);

  const selectScenario = (s: GuidedScenario) => {
    setScenario(s);
    setStep("define");
    setFurthest(0);
    setRanAi(false);
    setEvaluated(false);
    trackDemoInteraction("guided_demo", `select_${s.id}`);
  };

  const goTo = (next: GuidedStepId) => {
    const idx = stepIndex(next);
    setStep(next);
    setFurthest((f) => Math.max(f, idx));
    trackDemoInteraction("guided_demo", `step_${next}`);
  };

  const continueNext = () => {
    const idx = stepIndex(step);
    if (step === "run" && !ranAi) {
      setRanAi(true);
      trackDemoInteraction("guided_demo", "run_ai");
      return;
    }
    if (step === "evaluate" && !evaluated) {
      setEvaluated(true);
      trackDemoInteraction("guided_demo", "evaluate");
      return;
    }
    if (idx < guidedSteps.length - 1) {
      goTo(guidedSteps[idx + 1].id);
    }
  };

  const resetToScenarios = () => {
    setScenario(null);
    setStep("define");
    setFurthest(0);
    setRanAi(false);
    setEvaluated(false);
    trackDemoInteraction("guided_demo", "try_another");
  };

  if (!scenario) {
    return <ScenarioSelector onSelect={selectScenario} />;
  }

  const canContinue =
    step === "run"
      ? true
      : step === "evaluate"
        ? true
        : step !== "evidence";

  const continueLabel =
    step === "run" && !ranAi
      ? "Run both paths"
      : step === "evaluate" && !evaluated
        ? "Run readiness gate"
        : step === "evidence"
          ? null
          : "Continue";

  return (
    <div data-testid="guided-demo">
      <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--icdu-blue)] mb-1">
            Guided demo
          </div>
          <h2 className="text-base sm:text-lg font-semibold tracking-tight">
            {scenario.title}
          </h2>
          <p className="text-sm text-[color:var(--icdu-fg-muted)]">
            {scenario.subtitle}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="self-start gap-1.5"
          onClick={resetToScenarios}
          data-testid="guided-change-scenario"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Change scenario
        </Button>
      </div>

      <div className="mb-2 flex items-center justify-between gap-3 text-sm text-[color:var(--icdu-fg-faint)]">
        <span>
          Step {stepIndex(step) + 1} of {guidedSteps.length}
        </span>
        <span>{Math.round(progressPct)}% through this path</span>
      </div>
      <Progress value={progressPct} className="h-1.5 mb-5 sm:mb-6" />

      <div className="mb-6 sm:mb-8">
        <GuidedStepper
          current={step}
          furthestIndex={furthest}
          onSelect={goTo}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0">
          {step === "define" && <DefineStep scenario={scenario} />}
          {step === "build" && <BuildStep scenario={scenario} />}
          {step === "run" && <RunStep scenario={scenario} revealed={ranAi} />}
          {step === "evaluate" && (
            <EvaluateStep scenario={scenario} revealed={evaluated} />
          )}
          {step === "evidence" && (
            <EvidenceStep
              scenario={scenario}
              onTryAnother={resetToScenarios}
              onOpenAdvancedLab={onOpenAdvancedLab}
            />
          )}

          {canContinue && continueLabel ? (
            <div className="mt-6 flex flex-wrap gap-3">
              {stepIndex(step) > 0 ? (
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => goTo(guidedSteps[stepIndex(step) - 1].id)}
                >
                  Back
                </Button>
              ) : null}
              <PrimaryCTA onClick={continueNext} data-testid="guided-continue">
                {continueLabel}
                <ArrowRight className="h-4 w-4" />
              </PrimaryCTA>
            </div>
          ) : null}
        </div>

        <StageCoach scenario={scenario} step={step} />
      </div>
    </div>
  );
}

function DefineStep({ scenario }: { scenario: GuidedScenario }) {
  return (
    <section className="space-y-4" data-testid="guided-step-panel-define">
      <header>
        <h3 className="icdu-section-heading text-[clamp(1.4rem,3vw,1.85rem)] mb-2">
          Define the intent
        </h3>
        <p className="text-sm text-[color:var(--icdu-fg-muted)] leading-relaxed max-w-2xl">
          Before any model runs, lock what good looks like — in plain English.
        </p>
      </header>

      <div className="rounded-xl border border-[color:var(--icdu-border)] bg-[color:var(--icdu-surface)] p-4 sm:p-5 space-y-4">
        <Field label="Business task" value={scenario.businessTask} />
        <Field label="Intended outcome" value={scenario.intendedOutcome} />
        <ListField label="Organizational principles" items={scenario.principles} />
        <ListField label="Allowed context" items={scenario.allowedContext} />
        <ListField label="Constraints" items={scenario.constraints} />
        <ListField label="Success criteria" items={scenario.successCriteria} />
      </div>
    </section>
  );
}

function BuildStep({ scenario }: { scenario: GuidedScenario }) {
  const icdu = scenario.icdu;
  return (
    <section className="space-y-4" data-testid="guided-step-panel-build">
      <header>
        <h3 className="icdu-section-heading text-[clamp(1.4rem,3vw,1.85rem)] mb-2">
          Build the ICDU contract
        </h3>
        <p className="text-sm text-[color:var(--icdu-fg-muted)] leading-relaxed max-w-2xl">
          The same intent, now structured so gates and audits can use it.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <MiniCard title="Primary goal" body={icdu.intent.primary_goal} />
        <MiniCard
          title="Persona"
          body={`${icdu.persona.role} · ${icdu.persona.tone}`}
        />
        <MiniCard title="Domain" body={icdu.context.domain} />
        <MiniCard
          title="Policy / profile"
          body={`${icdu.policy_set_id} / ${icdu.evaluation_profile_id}`}
        />
      </div>

      <div className="rounded-xl border border-[color:var(--icdu-border)] bg-[color:var(--icdu-surface)] p-4 sm:p-5 space-y-3">
        <div className="text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--icdu-fg-ghost)]">
          Contract summary
        </div>
        <ListField label="Success criteria" items={icdu.intent.success_criteria} />
        <ListField label="Principles" items={icdu.principles} />
        <ListField label="Constraints" items={icdu.context.constraints} />
        <Field label="Bound prompt" value={icdu.prompt} />
      </div>

      <TechnicalRecord data={icdu} />
    </section>
  );
}

function RunStep({
  scenario,
  revealed,
}: {
  scenario: GuidedScenario;
  revealed: boolean;
}) {
  return (
    <section className="space-y-4" data-testid="guided-step-panel-run">
      <header>
        <h3 className="icdu-section-heading text-[clamp(1.4rem,3vw,1.85rem)] mb-2">
          Run the AI
        </h3>
        <p className="text-sm text-[color:var(--icdu-fg-muted)] leading-relaxed max-w-2xl">
          Same business ask. Two execution paths — unstructured vs. ICDU-governed.
        </p>
      </header>

      <div className="rounded-xl border border-[color:var(--icdu-border)] bg-[color:var(--icdu-glow-blue)] p-4">
        <div className="text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--icdu-fg-ghost)] mb-1">
          Incoming request
        </div>
        <p className="text-sm text-[color:var(--icdu-fg)] m-0 leading-relaxed">
          {scenario.unstructuredRequest}
        </p>
      </div>

      {!revealed ? (
        <div className="rounded-xl border border-dashed border-[color:var(--icdu-border)] p-6 text-center text-sm text-[color:var(--icdu-fg-faint)]">
          Run both paths to compare the unstructured reply with the ICDU-governed
          reply.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="text-xs font-semibold text-destructive uppercase tracking-wide">
                Unstructured request
              </span>
            </div>
            <p className="text-sm text-[color:var(--icdu-fg-muted)] leading-relaxed m-0 mb-3">
              {scenario.unstructuredOutcome}
            </p>
            <Badge variant="outline" className="text-xs">
              No contract · no gate · no evidence
            </Badge>
          </div>
          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                ICDU-governed request
              </span>
            </div>
            <p className="text-sm text-[color:var(--icdu-fg-muted)] leading-relaxed m-0 whitespace-pre-wrap mb-3">
              {scenario.governedResponse}
            </p>
            <Badge variant="outline" className="text-xs border-emerald-500/30">
              Bound to contract · ready for gate
            </Badge>
          </div>
        </div>
      )}
    </section>
  );
}

function EvaluateStep({
  scenario,
  revealed,
}: {
  scenario: GuidedScenario;
  revealed: boolean;
}) {
  const { judge } = scenario;
  return (
    <section className="space-y-4" data-testid="guided-step-panel-evaluate">
      <header>
        <h3 className="icdu-section-heading text-[clamp(1.4rem,3vw,1.85rem)] mb-2">
          Evaluate readiness
        </h3>
        <p className="text-sm text-[color:var(--icdu-fg-muted)] leading-relaxed max-w-2xl">
          Score the governed output against the contract — then decide promote,
          escalate, or block.
        </p>
      </header>

      {!revealed ? (
        <div className="rounded-xl border border-dashed border-[color:var(--icdu-border)] p-6 text-center text-sm text-[color:var(--icdu-fg-faint)]">
          Run the readiness gate to see IAS, PAS, AS, and the release decision.
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              className={cn(
                "text-xs px-3 py-1",
                judge.decision === "PROMOTE" &&
                  "bg-emerald-600 hover:bg-emerald-600 text-white",
                judge.decision === "ESCALATE" &&
                  "bg-amber-500 hover:bg-amber-500 text-white",
                judge.decision === "BLOCK" &&
                  "bg-destructive hover:bg-destructive text-white",
              )}
            >
              Readiness decision: {judge.decision}
            </Badge>
            <span className="text-xs text-[color:var(--icdu-fg-faint)]">
              Thresholds IAS ≥ {judge.thresholds.IAS_min} · PAS ≥{" "}
              {judge.thresholds.PAS_min} · AS ≥ {judge.thresholds.AS_min}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {(
              [
                ["IAS", judge.scores.IAS],
                ["PAS", judge.scores.PAS],
                ["AS", judge.scores.AS],
              ] as const
            ).map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-[color:var(--icdu-border)] bg-[color:var(--icdu-surface)] p-4 text-center"
              >
                <div className="text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--icdu-fg-ghost)] mb-1">
                  {label}
                </div>
                <div className="icdu-metric-value text-2xl">
                  {(value * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-[color:var(--icdu-border)] bg-[color:var(--icdu-surface)] p-4 sm:p-5 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--icdu-fg-ghost)]">
              Rationale
            </div>
            <ul className="space-y-2 m-0 p-0 list-none">
              {judge.rationale.map((r) => (
                <li
                  key={r}
                  className="text-sm text-[color:var(--icdu-fg-muted)] leading-relaxed pl-3 relative"
                >
                  <span className="absolute left-0 top-2 h-1.5 w-1.5 rounded-full bg-[color:var(--icdu-blue)]" />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <TechnicalRecord
            title="View Technical Record — Judge Report"
            data={judge}
          />
        </>
      )}
    </section>
  );
}

function EvidenceStep({
  scenario,
  onTryAnother,
  onOpenAdvancedLab,
}: {
  scenario: GuidedScenario;
  onTryAnother: () => void;
  onOpenAdvancedLab: () => void;
}) {
  const evidencePack = {
    scenario_id: scenario.id,
    icdu_id: scenario.icdu.icdu_id,
    decision: scenario.judge.decision,
    scores: scenario.judge.scores,
    evidence: scenario.evidenceSummary,
    generated_at: scenario.icdu.created_at,
  };

  return (
    <section className="space-y-5" data-testid="guided-step-panel-evidence">
      <header>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          Path complete
        </div>
        <h3 className="icdu-section-heading text-[clamp(1.4rem,3vw,1.85rem)] mb-2">
          Review the evidence
        </h3>
        <p className="text-sm text-[color:var(--icdu-fg-muted)] leading-relaxed max-w-2xl">
          Before/after, readiness decision, and the trail ICDU leaves behind.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-destructive/25 bg-destructive/5 p-4">
          <div className="text-xs font-semibold text-destructive mb-2">
            Unstructured request
          </div>
          <p className="text-sm text-[color:var(--icdu-fg-muted)] m-0 leading-relaxed">
            {scenario.unstructuredOutcome}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
            ICDU-governed request
          </div>
          <p className="text-sm text-[color:var(--icdu-fg-muted)] m-0 leading-relaxed line-clamp-5 whitespace-pre-wrap">
            {scenario.governedResponse}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[color:var(--icdu-border)] bg-[color:var(--icdu-surface)] p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="h-4 w-4 text-[color:var(--icdu-blue)]" />
          <span className="text-sm font-semibold">
            Readiness decision: {scenario.judge.decision}
          </span>
        </div>
        <div className="text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--icdu-fg-ghost)] mb-2">
          Evidence produced
        </div>
        <ul className="space-y-2 m-0 p-0 list-none">
          {scenario.evidenceSummary.map((item) => (
            <li
              key={item}
              className="text-sm text-[color:var(--icdu-fg-muted)] leading-relaxed flex gap-2"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[color:var(--icdu-green)] mt-0.5" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <TechnicalRecord title="View Technical Record — Evidence Pack" data={evidencePack} />

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2">
        <PrimaryCTA onClick={onTryAnother} data-testid="guided-try-another">
          Try Another Scenario
        </PrimaryCTA>
        <SecondaryCTA onClick={onOpenAdvancedLab} data-testid="guided-open-lab">
          Open Advanced Lab
        </SecondaryCTA>
        <SecondaryCTA href={WALKTHROUGH_URL} data-testid="guided-book-walkthrough">
          Book a Walkthrough
        </SecondaryCTA>
      </div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--icdu-fg-ghost)] mb-1">
        {label}
      </div>
      <p className="text-sm text-[color:var(--icdu-fg-muted)] m-0 leading-relaxed">
        {value}
      </p>
    </div>
  );
}

function ListField({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--icdu-fg-ghost)] mb-1.5">
        {label}
      </div>
      <ul className="space-y-1.5 m-0 p-0 list-none">
        {items.map((item) => (
          <li
            key={item}
            className="text-sm text-[color:var(--icdu-fg-muted)] leading-relaxed pl-3 relative"
          >
            <span className="absolute left-0 top-2 h-1.5 w-1.5 rounded-full bg-[color:var(--icdu-blue)]" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MiniCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-[color:var(--icdu-border)] bg-[color:var(--icdu-surface)] p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--icdu-fg-ghost)] mb-1">
        {title}
      </div>
      <p className="text-sm text-[color:var(--icdu-fg)] m-0 leading-snug">{body}</p>
    </div>
  );
}
