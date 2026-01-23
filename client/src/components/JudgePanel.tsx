import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Scale, Play, CheckCircle2, AlertTriangle, XCircle, RotateCcw, ChevronDown, FileText, Lightbulb, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackDemoInteraction } from "@/lib/analytics";

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

const thresholds = {
  IAS_min: 0.80,
  PAS_min: 0.85,
  AS_min: 0.70,
};

function generateMockScores(): JudgeResult {
  const IAS = Math.random() * 0.35 + 0.60;
  const PAS = Math.random() * 0.35 + 0.60;
  const AS = Math.random() * 0.40 + 0.55;

  const passIAS = IAS >= thresholds.IAS_min;
  const passPAS = PAS >= thresholds.PAS_min;
  const passAS = AS >= thresholds.AS_min;

  let decision: "PROMOTE" | "ESCALATE" | "BLOCK";
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

  if (passIAS && passPAS && passAS) {
    decision = "PROMOTE";
    rationale = [
      "All scores exceed minimum thresholds",
      `IAS (${(IAS * 100).toFixed(0)}%) demonstrates clear intent alignment`,
      `PAS (${(PAS * 100).toFixed(0)}%) shows proper principle adherence`,
      `AS (${(AS * 100).toFixed(0)}%) indicates good application quality`,
      "Ready for deployment with standard monitoring"
    ];
  } else if (IAS < 0.65 || PAS < 0.70 || AS < 0.55) {
    decision = "BLOCK";
    rationale = [];
    if (IAS < 0.65) rationale.push("Intent alignment critically low - unclear what success looks like");
    if (PAS < 0.70) rationale.push("Principle adherence below safety threshold - governance risk");
    if (AS < 0.55) rationale.push("Application quality insufficient - domain mismatch likely");
    rationale.push("Automatic block triggered - requires significant revision before re-evaluation");

    toPromote = [
      { action: "Add measurable targets to primary goal (e.g., 'reduce X by 30%')", impact: "IAS +15-20%", priority: "high" },
      { action: "Add explicit safety principles (e.g., 'No PII disclosure')", impact: "PAS +10-15%", priority: "high" },
      { action: "Specify persona role and tone for context", impact: "AS +10%", priority: "medium" },
      { action: "Add domain-specific constraints", impact: "AS +5-10%", priority: "medium" }
    ];
  } else {
    decision = "ESCALATE";
    rationale = [];
    if (!passIAS) rationale.push(`Intent alignment (${(IAS * 100).toFixed(0)}%) slightly below 80% threshold`);
    if (!passPAS) rationale.push(`Principle adherence (${(PAS * 100).toFixed(0)}%) needs review against 85% threshold`);
    if (!passAS) rationale.push(`Application score (${(AS * 100).toFixed(0)}%) may need improvement vs 70% threshold`);
    rationale.push("Human review recommended - scores are borderline");

    toPromote = [];
    if (!passIAS) {
      toPromote.push({ action: "Refine success criteria with quantifiable metrics", impact: "IAS +5-10%", priority: "high" });
    }
    if (!passPAS) {
      toPromote.push({ action: "Review and strengthen governing principles", impact: "PAS +5-10%", priority: "high" });
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
  const [result, setResult] = useState<JudgeResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showJson, setShowJson] = useState(false);

  const runJudge = () => {
    setIsRunning(true);
    trackDemoInteraction("judge_panel", "run_evaluation");
    
    setTimeout(() => {
      setResult(generateMockScores());
      setIsRunning(false);
      setShowExplanation(false);
    }, 1500);
  };

  const reset = () => {
    setResult(null);
    setShowExplanation(false);
    setShowJson(false);
    trackDemoInteraction("judge_panel", "reset");
  };

  const ScoreBar = ({ 
    label, 
    score, 
    threshold,
    description
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
      <div className="space-y-1.5 sm:space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <span className="font-medium text-xs sm:text-sm">{label}</span>
            <span className="text-[10px] sm:text-xs text-muted-foreground ml-1 sm:ml-2">{description}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className={cn(
              "font-mono text-xs sm:text-sm font-semibold",
              passed ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
            )}>
              {percentage.toFixed(0)}%
            </span>
            {passed ? (
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" />
            ) : (
              <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-destructive" />
            )}
          </div>
        </div>
        <div className="relative">
          <Progress value={percentage} className={cn(
            "h-2.5 sm:h-3",
            passed ? "[&>div]:bg-emerald-500" : "[&>div]:bg-destructive"
          )} />
          <div 
            className="absolute top-0 h-2.5 sm:h-3 w-0.5 bg-foreground/50"
            style={{ left: `${thresholdPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground">
          <span>0%</span>
          <span className="font-medium">Threshold: {thresholdPercentage}%</span>
          <span>100%</span>
        </div>
      </div>
    );
  };

  return (
    <Card className="p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <h3 className="font-semibold text-sm sm:text-base">AI Judge</h3>
          <Badge variant="outline" className="text-[10px] sm:text-xs">Explainable</Badge>
        </div>
        <div className="flex gap-2">
          {result && (
            <Button
              variant="outline"
              size="sm"
              onClick={reset}
              className="gap-1 sm:gap-2 flex-1 sm:flex-none h-7 sm:h-8 text-[10px] sm:text-xs"
              data-testid="button-reset-judge"
            >
              <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Reset</span>
            </Button>
          )}
          <Button
            size="sm"
            onClick={runJudge}
            disabled={isRunning}
            className="gap-1 sm:gap-2 flex-1 sm:flex-none h-7 sm:h-8 text-[10px] sm:text-xs"
            data-testid="button-run-judge"
          >
            <Play className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{isRunning ? "Evaluating..." : "Run Evaluation"}</span>
          </Button>
        </div>
      </div>

      <div className="p-2.5 sm:p-4 rounded-md bg-muted/50 border mb-4 sm:mb-6">
        <div className="text-[10px] sm:text-xs font-medium mb-2">Gate Thresholds</div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Badge variant="outline" className="text-[10px] sm:text-xs">IAS ≥ 80%</Badge>
          <Badge variant="outline" className="text-[10px] sm:text-xs">PAS ≥ 85%</Badge>
          <Badge variant="outline" className="text-[10px] sm:text-xs">AS ≥ 70%</Badge>
        </div>
        <p className="text-[9px] sm:text-xs text-muted-foreground mt-2">
          Principles are non-negotiable: PAS below threshold triggers BLOCK regardless of other scores.
        </p>
      </div>

      {!result ? (
        <div className="text-center py-8 sm:py-12 text-muted-foreground">
          <Scale className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-20" />
          <p className="text-xs sm:text-sm">Click "Run Evaluation" to simulate AI Judge scoring</p>
          <p className="text-[10px] sm:text-xs mt-1">Scores are deterministic based on ICDU field heuristics</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          <div className={cn(
            "p-3 sm:p-4 rounded-md border-2",
            decisionConfig[result.decision].borderColor,
            decisionConfig[result.decision].bgColor
          )}>
            <div className="flex items-center gap-2 sm:gap-3">
              {(() => {
                const config = decisionConfig[result.decision];
                const Icon = config.icon;
                return (
                  <>
                    <div className={cn("p-1.5 sm:p-2 rounded-md", config.color)}>
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm sm:text-base">{config.label}</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">{config.description}</div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <ScoreBar
              label="IAS"
              description="Intent Alignment"
              score={result.scores.IAS}
              threshold={result.thresholds.IAS_min}
            />
            <ScoreBar
              label="PAS"
              description="Principle Adherence"
              score={result.scores.PAS}
              threshold={result.thresholds.PAS_min}
            />
            <ScoreBar
              label="AS"
              description="Application Score"
              score={result.scores.AS}
              threshold={result.thresholds.AS_min}
            />
          </div>

          <Collapsible open={showExplanation} onOpenChange={setShowExplanation}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full gap-2 h-8 sm:h-9 text-xs sm:text-sm" data-testid="button-explain">
                <Lightbulb className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Explain this decision</span>
                <ChevronDown className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4 ml-auto transition-transform", showExplanation && "rotate-180")} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
              <div className="p-2.5 sm:p-4 rounded-md bg-muted/50 border">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                  <span className="font-medium text-xs sm:text-sm">Rationale</span>
                </div>
                <ul className="space-y-1.5 sm:space-y-2">
                  {result.rationale.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-[10px] sm:text-xs text-muted-foreground">
                      <span className="w-1 h-1 mt-1.5 bg-primary rounded-full flex-shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {result.drivers.length > 0 && (
                <div className="p-2.5 sm:p-4 rounded-md bg-muted/50 border">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <ArrowUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                    <span className="font-medium text-xs sm:text-sm">Score Drivers</span>
                  </div>
                  <div className="space-y-2">
                    {result.drivers.map((d, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded bg-background border">
                        <Badge variant={d.impact > 0 ? "default" : "destructive"} className="text-[9px] sm:text-xs px-1.5 flex-shrink-0">
                          {d.metric} {d.impact > 0 ? '+' : ''}{d.impact}
                        </Badge>
                        <div className="min-w-0">
                          <p className="text-[10px] sm:text-xs">{d.reason}</p>
                          <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">Field: {d.icduField}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.toPromote.length > 0 && (
                <div className="p-2.5 sm:p-4 rounded-md bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-medium text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">To Promote</span>
                  </div>
                  <div className="space-y-2">
                    {result.toPromote.map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[9px] sm:text-xs px-1.5 flex-shrink-0",
                            item.priority === "high" && "border-destructive text-destructive",
                            item.priority === "medium" && "border-amber-500 text-amber-600 dark:text-amber-400"
                          )}
                        >
                          {item.priority}
                        </Badge>
                        <div className="min-w-0">
                          <p className="text-[10px] sm:text-xs">{item.action}</p>
                          <p className="text-[9px] sm:text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">Expected: {item.impact}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowJson(!showJson)}
                className="w-full text-[10px] sm:text-xs h-7 sm:h-8"
              >
                {showJson ? "Hide" : "View as"} Report JSON
              </Button>
              
              {showJson && (
                <pre className="p-2.5 sm:p-3 rounded-md bg-background border text-[9px] sm:text-xs font-mono overflow-auto max-h-48">
                  {JSON.stringify(result, null, 2)}
                </pre>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </Card>
  );
}
