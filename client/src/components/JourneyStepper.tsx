import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Circle, ChevronRight, AlertTriangle, Sparkles, BarChart3, FileText, ArrowRight } from "lucide-react";
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {steps.map((s, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <button
              key={s.stepId}
              onClick={() => onStepChange(index)}
              className={cn(
                "flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-md border transition-all whitespace-nowrap flex-shrink-0",
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : isCompleted
                  ? "bg-secondary text-secondary-foreground border-secondary"
                  : "bg-card border-border hover-elevate"
              )}
              data-testid={`journey-step-${index}`}
            >
              <div className={cn(
                "flex items-center justify-center w-5 h-5 rounded-full text-xs",
                isActive
                  ? "bg-primary-foreground text-primary"
                  : isCompleted
                  ? "bg-secondary-foreground/20 text-secondary-foreground"
                  : "bg-muted text-muted-foreground"
              )}>
                {isCompleted ? <Check className="h-3 w-3" /> : index + 1}
              </div>
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">{s.title}</span>
              <span className="text-xs font-medium sm:hidden">Step {index + 1}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <div>
            <Badge 
              className={cn(
                "text-white text-xs",
                pipelineColors[step.whereInPipeline] || "bg-gray-500"
              )}
            >
              {step.whereInPipeline}
            </Badge>
            <h2 className="text-xl sm:text-2xl font-bold mt-2">{step.title}</h2>
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
          <Card className="p-4 sm:p-5 border-destructive/30 bg-destructive/5">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-destructive/20 text-destructive flex-shrink-0">
                <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">The Problem</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{step.problem}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5 border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">With ICDU</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{step.withIcdu}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-4 sm:p-5">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-primary/20 text-primary flex-shrink-0">
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">How Success is Measured</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{step.proofMetrics}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-muted/50">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-background text-foreground flex-shrink-0">
              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">Example in Practice</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic">"{step.example}"</p>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-between gap-2 sm:gap-4 pt-2">
          <button
            onClick={() => onStepChange(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className={cn(
              "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-md border transition-all text-sm",
              currentStep === 0
                ? "opacity-50 cursor-not-allowed"
                : "hover-elevate"
            )}
            data-testid="button-prev-step"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </button>
          <button
            onClick={() => onStepChange(Math.min(steps.length - 1, currentStep + 1))}
            disabled={currentStep === steps.length - 1}
            className={cn(
              "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-md border transition-all text-sm",
              currentStep === steps.length - 1
                ? "opacity-50 cursor-not-allowed"
                : "hover-elevate"
            )}
            data-testid="button-next-step"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function KeyTakeawaysPanel({ takeaways }: { takeaways: string[] }) {
  return (
    <Card className="p-4 sm:p-5 sticky top-20">
      <h3 className="font-semibold text-xs sm:text-sm mb-2 sm:mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        Key Takeaways
      </h3>
      <ul className="space-y-1.5 sm:space-y-2">
        {takeaways.map((takeaway, index) => (
          <li key={index} className="flex items-start gap-2 text-xs sm:text-sm">
            <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <span className="text-muted-foreground">{takeaway}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
