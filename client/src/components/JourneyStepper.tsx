import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Circle, ChevronRight, AlertTriangle, Sparkles, BarChart3, FileText, ArrowRight, Target, Zap } from "lucide-react";
import { trackJourneyStepViewed } from "@/lib/analytics";
import { useEffect } from "react";

type JourneyStep = {
  stepId: string;
  title: string;
  problem: string;
  withIcdu: string;
  proofMetrics: string;
  example: string;
  whereInPipeline: string;
  keyTakeaways: string[];
  persona_kpi: string;
  decision_moment: string;
};

type JourneyStepperProps = {
  steps: JourneyStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  personaId: string;
};

const pipelineColors: Record<string, string> = {
  "ICDU Creation": "bg-blue-500 dark:bg-blue-600",
  "AI Judge Gate": "bg-emerald-500 dark:bg-emerald-600",
  "HITL Nuance Grading": "bg-amber-500 dark:bg-amber-600",
  "Stress Testing": "bg-rose-500 dark:bg-rose-600",
  "Full Pipeline": "bg-purple-500 dark:bg-purple-600",
};

export function JourneyStepper({
  steps,
  currentStep,
  onStepChange,
  personaId,
}: JourneyStepperProps) {
  const step = steps[currentStep];

  useEffect(() => {
    if (step) {
      trackJourneyStepViewed(personaId, step.stepId, step.title);
    }
  }, [step, personaId]);

  if (!step) return null;

  return (
    <div className="space-y-3 sm:space-y-6">
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 pb-1 sm:pb-2">
        {steps.map((s, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <button
              key={s.stepId}
              onClick={() => onStepChange(index)}
              className={cn(
                "flex items-center justify-center gap-1 sm:gap-2 min-w-[36px] sm:min-w-0 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md border transition-all",
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : isCompleted
                  ? "bg-secondary text-secondary-foreground border-secondary"
                  : "bg-card border-border hover-elevate"
              )}
              data-testid={`journey-step-${index}`}
            >
              <div className={cn(
                "flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full text-[10px] sm:text-xs",
                isActive
                  ? "bg-primary-foreground text-primary"
                  : isCompleted
                  ? "bg-secondary-foreground/20 text-secondary-foreground"
                  : "bg-muted text-muted-foreground"
              )}>
                {isCompleted ? <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> : index + 1}
              </div>
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">{s.title}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-2.5 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4">
          <div>
            <Badge 
              className={cn(
                "text-white text-[10px] sm:text-xs px-1.5 sm:px-2",
                pipelineColors[step.whereInPipeline] || "bg-gray-500"
              )}
            >
              {step.whereInPipeline}
            </Badge>
            <h2 className="text-base sm:text-2xl font-bold mt-1 sm:mt-2">{step.title}</h2>
          </div>
          <div className="text-[10px] sm:text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-2 sm:gap-4">
          <Card className="p-2.5 sm:p-5 border-destructive/30 bg-destructive/5">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-md bg-destructive/20 text-destructive flex-shrink-0">
                <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-[10px] sm:text-sm mb-0.5 sm:mb-2">The Problem</h3>
                <p className="text-[10px] sm:text-sm text-muted-foreground leading-relaxed">{step.problem}</p>
              </div>
            </div>
          </Card>

          <Card className="p-2.5 sm:p-5 border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-[10px] sm:text-sm mb-0.5 sm:mb-2">With ICDU</h3>
                <p className="text-[10px] sm:text-sm text-muted-foreground leading-relaxed">{step.withIcdu}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
          <Card className="p-2.5 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-md bg-primary/20 text-primary flex-shrink-0">
                <Target className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-[10px] sm:text-sm mb-0.5 sm:mb-2">Your KPI</h3>
                <p className="text-[10px] sm:text-sm text-primary font-medium leading-relaxed">{step.persona_kpi}</p>
              </div>
            </div>
          </Card>
          <Card className="p-2.5 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 flex-shrink-0">
                <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-[10px] sm:text-sm mb-0.5 sm:mb-2">Decision Moment</h3>
                <p className="text-[10px] sm:text-sm text-muted-foreground leading-relaxed">{step.decision_moment}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-2.5 sm:p-5">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-md bg-primary/20 text-primary flex-shrink-0">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-[10px] sm:text-sm mb-0.5 sm:mb-2">Success Metrics</h3>
              <p className="text-[10px] sm:text-sm text-muted-foreground leading-relaxed">{step.proofMetrics}</p>
            </div>
          </div>
        </Card>

        <Card className="p-2.5 sm:p-5 bg-muted/50">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-md bg-background text-foreground flex-shrink-0">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-[10px] sm:text-sm mb-0.5 sm:mb-2">Example</h3>
              <p className="text-[10px] sm:text-sm text-muted-foreground leading-relaxed italic">"{step.example}"</p>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-between gap-2 sm:gap-4 pt-1 sm:pt-2">
          <button
            onClick={() => onStepChange(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className={cn(
              "flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md border transition-all text-[10px] sm:text-sm",
              currentStep === 0
                ? "opacity-50 cursor-not-allowed"
                : "hover-elevate"
            )}
            data-testid="button-prev-step"
          >
            <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 rotate-180" />
            Prev
          </button>
          <button
            onClick={() => onStepChange(Math.min(steps.length - 1, currentStep + 1))}
            disabled={currentStep === steps.length - 1}
            className={cn(
              "flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md border transition-all text-[10px] sm:text-sm",
              currentStep === steps.length - 1
                ? "opacity-50 cursor-not-allowed"
                : "hover-elevate"
            )}
            data-testid="button-next-step"
          >
            Next
            <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function KeyTakeawaysPanel({ takeaways }: { takeaways: string[] }) {
  return (
    <Card className="p-2.5 sm:p-5 sticky top-20">
      <h3 className="font-semibold text-[10px] sm:text-sm mb-1.5 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
        <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
        Key Takeaways
      </h3>
      <ul className="space-y-1 sm:space-y-2">
        {takeaways.map((takeaway, index) => (
          <li key={index} className="flex items-start gap-1.5 sm:gap-2 text-[10px] sm:text-sm">
            <Check className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <span className="text-muted-foreground">{takeaway}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
