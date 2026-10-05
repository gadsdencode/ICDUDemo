import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CheckCircle2, AlertTriangle, XCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackDemoInteraction } from "@/lib/analytics";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import {
  defaultGateThresholds,
  evaluateGate,
  formatGatePercent,
  pasGateExplanation,
} from "@/lib/gateDecision";

type ScoreDriver = {
  metric: string;
  impact: number;
  reason: string;
  icduField: string;
};

type ToPromoteItem = {
  action: string;
  impact: string;
  priority: "high" | "medium" | "low";
};

type JudgeResult = {
  scores: {
    IAS: number;
    PAS: number;
    AS: number;
  };
  decision: "PROMOTE" | "ESCALATE" | "BLOCK";
  thresholds: {
    IAS_min: number;
    PAS_min: number;
    AS_min: number;
  };
  rationale: string[];
  drivers: ScoreDriver[];
  toPromote: ToPromoteItem[];
};

const thresholds = defaultGateThresholds;

function unit(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) hash = Math.imul(hash ^ seed.charCodeAt(i), 16777619);
  return (hash >>> 0) / 4294967295;
}

function generateMockScores(seed: string): JudgeResult {
  const IAS = unit(`${seed}:ias`) * 0.35 + 0.60;
  const PAS = unit(`${seed}:pas`) * 0.35 + 0.60;
  const AS = unit(`${seed}:as`) * 0.40 + 0.55;

  const passIAS = IAS >= thresholds.IAS_min;
  const passAS = AS >= thresholds.AS_min;
  const outcome = evaluateGate({ IAS, PAS, AS }, thresholds);

  const decision = outcome.decision;
  let rationale: string[] = [];
  let drivers: ScoreDriver[] = [];
  let toPromote: ToPromoteItem[] = [];

  if (IAS < 0.75) {
    drivers.push({
      metric: "IAS",
      impact: -15,
      reason: "Intent lacks measurable targets (e.g., 'reduce by X%', 'within Y days')",
      icduField: "intent.primary_goal"
    });
  }
  if (IAS >= 0.85) {
    drivers.push({
      metric: "IAS",
      impact: +10,
      reason: "Intent contains specific, measurable success criteria",
      icduField: "intent.success_criteria"
    });
  }

  if (PAS < 0.80) {
    drivers.push({
      metric: "PAS",
      impact: -20,
      reason: "Potential PII exposure detected (email-like patterns in context)",
      icduField: "principles"
    });
  }
  if (PAS < 0.75) {
    drivers.push({
      metric: "PAS",
      impact: -15,
      reason: "Missing explicit 'no PII disclosure' principle for sensitive domain",
      icduField: "principles"
    });
  }

  if (AS < 0.70) {
    drivers.push({
      metric: "AS",
      impact: -10,
      reason: "Persona/tone not specified or inconsistent with context",
      icduField: "persona"
    });
  }
  if (AS < 0.65) {
    drivers.push({
      metric: "AS",
      impact: -15,
      reason: "Context constraints missing or too vague",
      icduField: "context.constraints"
    });
  }

  if (decision === "PROMOTE") {
    rationale = [
      "All configured score thresholds are met",
      `IAS (${formatGatePercent(IAS)}) demonstrates clear intent alignment`,
      `PAS (${formatGatePercent(PAS)}) shows proper principle adherence`,
      `AS (${formatGatePercent(AS)}) indicates good application quality`,
      "Ready for deployment with standard monitoring"
    ];
  } else if (decision === "BLOCK") {
    rationale = [];
    if (outcome.iasHardFailure) rationale.push("Intent alignment critically low - unclear what success looks like");
    if (outcome.pasBlocks) {
      rationale.push(
        `Principle adherence (${formatGatePercent(PAS)}) is below the configured PAS threshold (${formatGatePercent(thresholds.PAS_min)})`,
      );
    }
    if (outcome.asHardFailure) rationale.push("Application quality insufficient - domain mismatch likely");
    rationale.push("Automatic block triggered - requires significant revision before re-evaluation");

    toPromote = [
      { action: "Add measurable targets to primary goal (e.g., 'reduce X by 30%')", impact: "IAS +15-20%", priority: "high" },
      { action: "Add explicit safety principles (e.g., 'No PII disclosure')", impact: "PAS +10-15%", priority: "high" },
      { action: "Specify persona role and tone for context", impact: "AS +10%", priority: "medium" },
      { action: "Add domain-specific constraints", impact: "AS +5-10%", priority: "medium" }
    ];
  } else {
    rationale = [];
    if (!passIAS) {
      rationale.push(
        `Intent alignment (${formatGatePercent(IAS)}) is below the configured IAS threshold (${formatGatePercent(thresholds.IAS_min)})`,
      );
    }
    if (!passAS) {
      rationale.push(
        `Application score (${formatGatePercent(AS)}) is below the configured AS threshold (${formatGatePercent(thresholds.AS_min)})`,
      );
    }
    rationale.push("Human review recommended - scores are borderline");

    toPromote = [];
    if (!passIAS) {
      toPromote.push({ action: "Refine success criteria with quantifiable metrics", impact: "IAS +5-10%", priority: "high" });
    }
    if (!passAS) {
      toPromote.push({ action: "Clarify persona and add context constraints", impact: "AS +5-10%", priority: "medium" });
    }
  }

  return {
    scores: { IAS, PAS, AS },
    decision,
    thresholds,
    rationale,
    drivers,
    toPromote,
  };
}

const decisionConfig = {
  PROMOTE: {
    icon: CheckCircle2,
    color: "bg-emerald-500 text-white",
    borderColor: "border-emerald-500",
    bgColor: "bg-emerald-500/10",
    label: "PROMOTE",
    description: "All gates passed - ready for deployment",
  },
  ESCALATE: {
    icon: AlertTriangle,
    color: "bg-amber-500 text-white",
    borderColor: "border-amber-500",
    bgColor: "bg-amber-500/10",
    label: "ESCALATE",
    description: "Human review required before deployment",
  },
  BLOCK: {
    icon: XCircle,
    color: "bg-destructive text-white",
    borderColor: "border-destructive",
    bgColor: "bg-destructive/10",
    label: "BLOCK",
    description: "Critical issues detected - revision required",
  },
};

export function JudgePanel() {
  const workspace = useWorkspace();
  const stored = workspace.task.judge;
  const current = Boolean(
    stored && stored.sourceId === workspace.contract.icdu_id && stored.sourceRevision === workspace.contract.revision,
  );
  const result = (stored?.result as JudgeResult | undefined) ?? null;
  const [isRunning, setIsRunning] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showJson, setShowJson] = useState(false);

  const runJudge = () => {
    setIsRunning(true);
    trackDemoInteraction("judge_panel", "run_evaluation");
    
    setTimeout(() => {
      const seed = `${workspace.contract.icdu_id}:${workspace.contract.revision}`;
      workspace.saveJudge(generateMockScores(seed));
      setIsRunning(false);
      setShowExplanation(false);
    }, 1500);
  };

  const reset = () => {
    workspace.clearJudge();
    setShowExplanation(false);
    setShowJson(false);
    trackDemoInteraction("judge_panel", "reset");
  };

  const ScoreBar = ({
    label,
    score,
    threshold,
    description,
  }: {
    label: string;
    score: number;
    threshold: number;
    description: string;
  }) => {
    const passed = score >= threshold;
    const percentage = score * 100;
    const thresholdPercentage = threshold * 100;
    return (
      <div className="icdu-score-block">
        <div className="icdu-score-head">
          <div>
            <span className="icdu-label">{label}</span>
            <span className="icdu-score-name">{description}</span>
          </div>
          <span className={cn("icdu-num", passed ? "is-pass" : "is-fail")}>
            {percentage.toFixed(1)}%
            <span>{passed ? "Meets threshold" : "Below threshold"}</span>
          </span>
        </div>
        <div className="icdu-score-track">
          <Progress value={percentage} className={cn("h-2.5", passed ? "[&>div]:bg-[color:var(--icdu-green)]" : "[&>div]:bg-[color:var(--icdu-red)]")} />
          <div className="icdu-score-mark" style={{ left: `${thresholdPercentage}%` }} />
        </div>
        <div className="icdu-slider-ends">
          <span>0%</span>
          <span>Threshold {thresholdPercentage}%</span>
          <span>100%</span>
        </div>
      </div>
    );
  };

  const config = result ? decisionConfig[result.decision] : null;
  const DecisionIcon = config?.icon;

  return (
    <div className="icdu-judge">
      <div className="icdu-lab-toolbar">
        <div>
          <h3>Simulated Judge</h3>
          <p className="icdu-work-meta">Illustrative scoring from the open draft. Not a measurement of a live model.</p>
        </div>
        <div className="icdu-actions">
          {result ? (
            <button type="button" className="icdu-quiet icdu-focus" onClick={reset} data-testid="button-reset-judge">
              Reset
            </button>
          ) : null}
          <button type="button" className="icdu-primary icdu-focus" onClick={runJudge} disabled={isRunning} data-testid="button-run-judge">
            {isRunning ? "Evaluating…" : "Run evaluation"}
          </button>
        </div>
      </div>
      {result && !current ? (
        <p className="icdu-empty">This illustrative demo was saved for an earlier draft revision. Run it again to attach a new demo. It is not a measurement.</p>
      ) : null}
      <div className="icdu-threshold-row">
        <p className="icdu-label">Configured thresholds</p>
        <p className="icdu-scoreline">
          Intent-Alignment Score ≥ {formatGatePercent(thresholds.IAS_min)}
          <span>Principle-Adherence Score ≥ {formatGatePercent(thresholds.PAS_min)}</span>
          <span>Application Score ≥ {formatGatePercent(thresholds.AS_min)}</span>
        </p>
        <p className="icdu-work-meta" data-testid="judge-pas-rule">{pasGateExplanation(thresholds)}</p>
      </div>
      {!result || !config || !DecisionIcon ? (
        <p className="icdu-empty">Run evaluation to simulate IAS, PAS, and AS for this draft. The result stays with this revision until you reset it.</p>
      ) : (
        <div className="icdu-judge-result">
          <div className={`icdu-decision-block is-${result.decision.toLowerCase()}`}>
            <DecisionIcon aria-hidden="true" className="h-5 w-5" />
            <div>
              <p className="icdu-decision-label">{config.label}</p>
              <p>{config.description}</p>
            </div>
          </div>
          <div className="icdu-score-list">
            <ScoreBar label="IAS" description="Intent-Alignment Score" score={result.scores.IAS} threshold={result.thresholds.IAS_min} />
            <ScoreBar label="PAS" description="Principle-Adherence Score" score={result.scores.PAS} threshold={result.thresholds.PAS_min} />
            <ScoreBar label="AS" description="Application Score" score={result.scores.AS} threshold={result.thresholds.AS_min} />
          </div>
          <Collapsible open={showExplanation} onOpenChange={setShowExplanation}>
            <CollapsibleTrigger asChild>
              <button type="button" className="icdu-quiet icdu-focus" data-testid="button-explain">
                Explain this decision
                <ChevronDown className={cn("h-4 w-4", showExplanation && "rotate-180")} aria-hidden="true" />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="icdu-rationale">
              <h3>Rationale</h3>
              <ul>
                {result.rationale.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
              {result.drivers.length > 0 ? (
                <>
                  <h3>Score drivers</h3>
                  <ul className="icdu-driver-list">
                    {result.drivers.map((driver, i) => (
                      <li key={i}>
                        <span className="icdu-num">{driver.metric} {driver.impact > 0 ? "+" : ""}{driver.impact}</span>
                        <p>{driver.reason}</p>
                        <p className="icdu-work-meta">Field {driver.icduField}</p>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
              {result.toPromote.length > 0 ? (
                <>
                  <h3>What would need to change</h3>
                  <ul className="icdu-driver-list">
                    {result.toPromote.map((item, i) => (
                      <li key={i}>
                        <span className="icdu-num">{item.priority}</span>
                        <p>{item.action}</p>
                        <p className="icdu-work-meta">Illustrative expected change: {item.impact}</p>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
              <button type="button" className="icdu-quiet icdu-focus" onClick={() => setShowJson(!showJson)}>
                {showJson ? "Hide report JSON" : "View report JSON"}
              </button>
              {showJson ? <pre className="icdu-code-panel">{JSON.stringify(result, null, 2)}</pre> : null}
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </div>
  );
}

