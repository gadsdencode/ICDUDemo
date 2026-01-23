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
    <div className="space-y-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {steps.map((s, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <button
              key={s.stepId}
              onClick={() => onStepChange(index)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md border transition-all whitespace-nowrap flex-shrink-0",
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
              <span className="text-sm font-medium">{s.title}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <Badge 
              className={cn(
                "text-white",
                pipelineColors[step.whereInPipeline] || "bg-gray-500"
              )}
            >
              {step.whereInPipeline}
            </Badge>
            <h2 className="text-2xl font-bold mt-2">{step.title}</h2>
          </div>
          <div className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-5 border-destructive/30 bg-destructive/5">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-destructive/20 text-destructive flex-shrink-0">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-2">The Problem</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.problem}</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-2">With ICDU</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.withIcdu}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/20 text-primary flex-shrink-0">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-2">How Success is Measured</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.proofMetrics}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-muted/50">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-background text-foreground flex-shrink-0">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-2">Example in Practice</h3>
              <p className="text-sm text-muted-foreground leading-relaxed italic">"{step.example}"</p>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-between gap-4 pt-2">
          <button
            onClick={() => onStepChange(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md border transition-all",
              currentStep === 0
                ? "opacity-50 cursor-not-allowed"
                : "hover-elevate"
            )}
            data-testid="button-prev-step"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Previous
          </button>
          <button
            onClick={() => onStepChange(Math.min(steps.length - 1, currentStep + 1))}
            disabled={currentStep === steps.length - 1}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md border transition-all",
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
    <Card className="p-5 sticky top-20">
      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        Key Takeaways
      </h3>
      <ul className="space-y-2">
        {takeaways.map((takeaway, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <span className="text-muted-foreground">{takeaway}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
