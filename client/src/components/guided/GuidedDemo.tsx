import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  getGuidedScenario,
  guidedSteps,
  type GuidedScenario,
  type GuidedJudgeResult,
  type GuidedStepId,
} from "@/data/guidedScenarios";
import {
  clearGuidedProgress,
  loadGuidedProgress,
  writeGuidedProgress,
  type GuidedProgress,
} from "@/lib/guidedProgress";
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
import { formatGatePercent, pasGateExplanation } from "@/lib/gateDecision";

const WALKTHROUGH_URL =
  "mailto:brian@osscontact.com?subject=ICDU%20Walkthrough";

type GuidedDemoProps = {
  onOpenAdvancedLab: () => void;
  scenarioId?: string | null;
  onScenarioChange?: (id: string | null) => void;
  handoffHref?: string;
  handoffLabel?: string;
};

const SCORE_EXPLANATIONS = [
  {
    id: "IAS" as const,
    name: "Intent-Alignment Score",
    body: "Measures how well the response matches the stated intent and success criteria. It is the score for the declared task.",
  },
  {
    id: "PAS" as const,
    name: "Principle-Adherence Score",
    body: "Measures how well the response follows the governing principles and constraints. It is the score for the organizational principles.",
  },
  {
    id: "AS" as const,
    name: "Application Score",
    body: "Measures how well the response applies domain knowledge and produces actionable output. It is the score for a usable result in this domain.",
  },
];

function stepIndex(id: GuidedStepId) {
  return guidedSteps.findIndex((s) => s.id === id);
}

export function GuidedDemo({
  onOpenAdvancedLab,
  scenarioId = null,
  onScenarioChange,
  handoffHref = "/business-case",
  handoffLabel = "Business case",
}: GuidedDemoProps) {
  const scenario = scenarioId ? getGuidedScenario(scenarioId) ?? null : null;
  const [trackedScenarioId, setTrackedScenarioId] = useState(scenarioId);
  const [progress, setProgress] = useState<GuidedProgress | null>(() => loadGuidedProgress(scenarioId));

  // Restore during render so a remount does not paint step 1 before the saved stage.
  let activeProgress = progress;
  if (scenarioId !== trackedScenarioId) {
    activeProgress = loadGuidedProgress(scenarioId);
    setTrackedScenarioId(scenarioId);
    setProgress(activeProgress);
  }

  const step = activeProgress?.step ?? "define";
  const furthest = activeProgress?.furthest ?? 0;
  const ranAi = activeProgress?.ranAi ?? false;
  const evaluated = activeProgress?.evaluated ?? false;

  const commitProgress = (patch: (current: GuidedProgress) => GuidedProgress) => {
    setProgress((current) => {
      if (!current) return current;
      const next = patch(current);
      writeGuidedProgress(next);
      return next;
    });
  };

  const progressPct = useMemo(() => {
    if (!scenario) return 0;
    return ((stepIndex(step) + 1) / guidedSteps.length) * 100;
  }, [scenario, step]);

  const selectScenario = (s: GuidedScenario) => {
    onScenarioChange?.(s.id);
    trackDemoInteraction("guided_demo", `select_${s.id}`);
  };

  const goTo = (next: GuidedStepId) => {
    const idx = stepIndex(next);
    commitProgress((current) => ({
      ...current,
      step: next,
      furthest: Math.max(current.furthest, idx),
    }));
    trackDemoInteraction("guided_demo", `step_${next}`);
  };

  const continueNext = () => {
    const idx = stepIndex(step);
    if (step === "run" && !ranAi) {
      commitProgress((current) => ({ ...current, ranAi: true }));
      trackDemoInteraction("guided_demo", "run_ai");
      return;
    }
    if (step === "evaluate" && !evaluated) {
      commitProgress((current) => ({ ...current, evaluated: true }));
      trackDemoInteraction("guided_demo", "evaluate");
      return;
    }
    if (idx < guidedSteps.length - 1) {
      goTo(guidedSteps[idx + 1].id);
    }
  };

  const resetToScenarios = () => {
    clearGuidedProgress();
    onScenarioChange?.(null);
    trackDemoInteraction("guided_demo", "try_another");
  };

  const markBusinessCaseReturn = () => {
    if (!handoffHref.startsWith("/business-case")) return;
    commitProgress((current) => ({ ...current, returnPending: true }));
  };

  if (!scenario) {
    return <ScenarioSelector onSelect={selectScenario} selectedId={scenarioId} />;
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
        ? "Check readiness"
        : step === "evidence"
          ? null
          : "Continue";

  return (
    <div data-testid="guided-demo">
      <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--icdu-accent)] mb-1">
            Guided demo
          </div>
          <h2 className="font-display text-base sm:text-lg font-medium tracking-tight">
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
              handoffHref={handoffHref}
              handoffLabel={handoffLabel}
              onHandoff={markBusinessCaseReturn}
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
          Before any model runs, lock in the expertise and rules that guide the work.
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
          The same intent, now structured for audit.
        </p>
        <p className="text-sm text-[color:var(--icdu-fg-muted)] leading-relaxed max-w-2xl">
          The ICDU contract records the task, rules, context, and success criteria used to check the response.
        </p>
      </header>

      <div
        className="rounded-xl border border-[color:var(--icdu-border)] bg-[color:var(--icdu-surface)] p-4 sm:p-5"
        data-testid="guided-contract-summary"
      >
        <h4 className="m-0 mb-4 text-center text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--icdu-fg-ghost)]">
          Contract summary
        </h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <MiniCard title="Primary goal" body={icdu.intent.primary_goal} emphasized />
          <MiniCard
            title="Persona"
            body={`${icdu.persona.role} · ${icdu.persona.tone}`}
            emphasized
          />
          <MiniCard title="Domain" body={icdu.context.domain} emphasized />
          <MiniCard
            title="Policy / profile"
            body={`${icdu.policy_set_id} / ${icdu.evaluation_profile_id}`}
            emphasized
          />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3 md:items-start">
          <ListField label="Success criteria" items={icdu.intent.success_criteria} />
          <ListField label="Principles" items={icdu.principles} />
          <ListField label="Constraints" items={icdu.context.constraints} />
        </div>
        <div className="mt-4 border-t border-[color:var(--icdu-border)] pt-4 text-left">
          <Field label="Bound prompt" value={icdu.prompt} />
        </div>
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
            <Badge variant="outline" className="h-auto max-w-full whitespace-normal text-left text-xs">
              No ICDU contract · no readiness check · no evidence
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
            <Badge variant="outline" className="h-auto max-w-full whitespace-normal text-left text-xs border-emerald-500/30">
              Bound to the ICDU contract · ready for review.
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
          Check the response against the ICDU contract, then decide whether it can proceed, needs review, or should be blocked.
        </p>
        <p className="text-sm text-[color:var(--icdu-fg-muted)] leading-relaxed max-w-2xl">
          That check is the readiness gate. Promote means the result can proceed, escalate means it needs review, and block means it should be blocked.
        </p>
        <p
          className="text-sm text-[color:var(--icdu-fg-muted)] leading-relaxed max-w-2xl"
          data-testid="guided-pas-rule"
        >
          {pasGateExplanation(judge.thresholds)}
        </p>
      </header>

      <ScoreExplanations judge={judge} revealed={revealed} />
      <p
        className="m-0 text-sm leading-relaxed text-[color:var(--icdu-fg-muted)] max-w-2xl"
        data-testid="guided-score-disclaimer"
      >
        These explanations describe the metrics. The scores and release decision in this walkthrough are scripted examples, not live measurements.
      </p>

      {!revealed ? (
        <p
          className="m-0 text-sm leading-relaxed text-[color:var(--icdu-fg)] max-w-2xl"
          data-testid="guided-readiness-prompt"
        >
          Check whether the response meets the ICDU contract, then review the scores and release decision.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              className={cn(
                "h-auto max-w-full whitespace-normal text-left text-xs px-3 py-1",
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
              Thresholds IAS ≥ {formatGatePercent(judge.thresholds.IAS_min)} · PAS ≥{" "}
              {formatGatePercent(judge.thresholds.PAS_min)} · AS ≥ {formatGatePercent(judge.thresholds.AS_min)}
            </span>
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

          <p className="m-0 text-sm leading-relaxed text-[color:var(--icdu-fg-muted)]">
            Evaluation results: the scores, the release decision, and the reasons for this response.
          </p>
          <TechnicalRecord
            title="View Technical Record — Evaluation Results"
            data={judge}
          />
        </>
      )}
    </section>
  );
}

function ScoreExplanations({
  judge,
  revealed,
}: {
  judge: GuidedJudgeResult;
  revealed: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {SCORE_EXPLANATIONS.map((score) => (
        <article
          key={score.id}
          className="min-w-0 rounded-xl border border-[color:var(--icdu-border)] bg-[color:var(--icdu-surface)] p-4 text-left"
          data-testid={`guided-score-${score.id}`}
        >
          <h4 className="m-0 text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--icdu-fg-ghost)]">
            {score.id}
          </h4>
          <p className="m-0 mt-1 text-sm font-medium text-[color:var(--icdu-fg)]">{score.name}</p>
          <p className="m-0 mt-2 text-sm leading-relaxed text-[color:var(--icdu-fg-muted)]">{score.body}</p>
          {revealed ? (
            <p className="icdu-metric-value m-0 mt-3 text-2xl text-left">
              {(judge.scores[score.id] * 100).toFixed(0)}%
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function EvidenceStep({
  scenario,
  onTryAnother,
  onOpenAdvancedLab,
  handoffHref,
  handoffLabel,
  onHandoff,
}: {
  scenario: GuidedScenario;
  onTryAnother: () => void;
  onOpenAdvancedLab: () => void;
  handoffHref: string;
  handoffLabel: string;
  onHandoff: () => void;
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
          <ShieldCheck className="h-4 w-4 text-[color:var(--icdu-accent)]" />
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

      <p className="m-0 text-sm leading-relaxed text-[color:var(--icdu-fg-muted)]">
        Evidence record: the scenario and ICDU identifiers, the scores, the decision, and the evidence notes recorded for this walkthrough.
      </p>
      <TechnicalRecord title="View Technical Record — Evidence Pack" data={evidencePack} />

      <div
        className="rounded-md border-2 border-[color:var(--icdu-accent)] p-4"
        data-testid="guided-handoff"
      >
        <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--icdu-fg-faint)]">
          Continue to the decision
        </p>
        <p className="m-0 mt-1 text-sm leading-relaxed text-[color:var(--icdu-fg-muted)]">
          Take {scenario.title} into {handoffLabel}.
        </p>
        <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-3">
          <PrimaryCTA asChild>
            <Link href={handoffHref} onClick={onHandoff}>
              {handoffLabel}
            </Link>
          </PrimaryCTA>
          <SecondaryCTA onClick={onTryAnother} data-testid="guided-try-another">
            Try Another Scenario
          </SecondaryCTA>
          <SecondaryCTA onClick={onOpenAdvancedLab} data-testid="guided-open-lab">
            Open Advanced Lab
          </SecondaryCTA>
          <SecondaryCTA href={WALKTHROUGH_URL} data-testid="guided-book-walkthrough">
            Book a Walkthrough
          </SecondaryCTA>
        </div>
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

function ListField({
  label,
  items,
  columns = 1,
}: {
  label: string;
  items: string[];
  columns?: 1 | 2;
}) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--icdu-fg-ghost)] mb-1.5">
        {label}
      </div>
      <ul
        className={
          columns === 2
            ? "grid grid-cols-2 gap-x-5 gap-y-2 m-0 p-0 list-none"
            : "space-y-1.5 m-0 p-0 list-none"
        }
      >
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

function MiniCard({
  title,
  body,
  emphasized = false,
}: {
  title: string;
  body: string;
  emphasized?: boolean;
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-xl border p-4 text-left",
        emphasized
          ? "border-[color:var(--icdu-accent)]/45 bg-[color:var(--icdu-bg)]"
          : "border-[color:var(--icdu-border)] bg-[color:var(--icdu-surface)]",
      )}
    >
      <div
        className={cn(
          "text-xs font-semibold uppercase tracking-[0.1em] mb-1",
          emphasized ? "text-[color:var(--icdu-accent)]" : "text-[color:var(--icdu-fg-ghost)]",
        )}
      >
        {title}
      </div>
      <p className="text-sm font-medium text-[color:var(--icdu-fg)] m-0 leading-snug">{body}</p>
    </div>
  );
}
