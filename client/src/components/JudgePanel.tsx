import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Scale, Play, CheckCircle2, AlertTriangle, XCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackDemoInteraction } from "@/lib/analytics";

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

  if (passIAS && passPAS && passAS) {
    decision = "PROMOTE";
    rationale = [
      "All scores exceed minimum thresholds",
      "Output aligns with stated intent",
      "Principles are properly adhered to",
      "Application demonstrates domain knowledge"
    ];
  } else if (IAS < 0.65 || PAS < 0.70 || AS < 0.55) {
    decision = "BLOCK";
    rationale = [];
    if (IAS < 0.65) rationale.push("Intent alignment critically low");
    if (PAS < 0.70) rationale.push("Principle adherence below safety threshold");
    if (AS < 0.55) rationale.push("Application quality insufficient");
    rationale.push("Automatic block triggered - requires revision");
  } else {
    decision = "ESCALATE";
    rationale = [];
    if (!passIAS) rationale.push(`Intent alignment (${(IAS * 100).toFixed(0)}%) below threshold`);
    if (!passPAS) rationale.push(`Principle adherence (${(PAS * 100).toFixed(0)}%) needs review`);
    if (!passAS) rationale.push(`Application score (${(AS * 100).toFixed(0)}%) may need improvement`);
    rationale.push("Human review recommended before deployment");
  }

  return {
    scores: { IAS, PAS, AS },
    decision,
    thresholds,
    rationale,
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

  const runJudge = () => {
    setIsRunning(true);
    trackDemoInteraction("judge_panel", "run_evaluation");
    
    setTimeout(() => {
      setResult(generateMockScores());
      setIsRunning(false);
    }, 1500);
  };

  const reset = () => {
    setResult(null);
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
    <Card className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-sm sm:text-base">AI Judge</h3>
        </div>
        <div className="flex gap-2">
          {result && (
            <Button
              variant="outline"
              size="sm"
              onClick={reset}
              className="gap-1 sm:gap-2 flex-1 sm:flex-none"
              data-testid="button-reset-judge"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </Button>
          )}
          <Button
            size="sm"
            onClick={runJudge}
            disabled={isRunning}
            className="gap-1 sm:gap-2 flex-1 sm:flex-none"
            data-testid="button-run-judge"
          >
            <Play className="h-4 w-4" />
            <span>{isRunning ? "Evaluating..." : "Run"}</span>
          </Button>
        </div>
      </div>

      {!result && !isRunning && (
        <div className="text-center py-8 sm:py-12 text-muted-foreground">
          <Scale className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
          <p className="text-xs sm:text-sm">Click "Run" to simulate AI Judge scoring</p>
          <p className="text-[10px] sm:text-xs mt-1">Scores are generated based on configurable thresholds</p>
        </div>
      )}

      {isRunning && (
        <div className="text-center py-8 sm:py-12">
          <div className="animate-spin h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 border-4 border-primary border-t-transparent rounded-full" />
          <p className="text-xs sm:text-sm text-muted-foreground">Evaluating output against gates...</p>
        </div>
      )}

      {result && !isRunning && (
        <div className="space-y-4 sm:space-y-6">
          <div className={cn(
            "p-3 sm:p-4 rounded-md border-2",
            decisionConfig[result.decision].borderColor,
            decisionConfig[result.decision].bgColor
          )}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <Badge className={decisionConfig[result.decision].color}>
                {(() => {
                  const Icon = decisionConfig[result.decision].icon;
                  return <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />;
                })()}
                {decisionConfig[result.decision].label}
              </Badge>
              <span className="text-xs sm:text-sm">{decisionConfig[result.decision].description}</span>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-5">
            <ScoreBar
              label="IAS"
              description="Intent Alignment Score"
              score={result.scores.IAS}
              threshold={result.thresholds.IAS_min}
            />
            <ScoreBar
              label="PAS"
              description="Principle Adherence Score"
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

          <div className="pt-3 sm:pt-4 border-t">
            <h4 className="font-medium text-xs sm:text-sm mb-2">Rationale</h4>
            <ul className="space-y-1">
              {result.rationale.map((item, i) => (
                <li key={i} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}
