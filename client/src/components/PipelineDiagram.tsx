import { FileText, Bot, Scale, Users, FlaskConical, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const pipelineSteps = [
  {
    id: "icdu",
    label: "ICDU",
    sublabel: "Structured Unit",
    icon: FileText,
    description: "Intent, principles, persona, context",
    color: "bg-blue-500 dark:bg-blue-600",
  },
  {
    id: "model",
    label: "Model",
    sublabel: "AI Output",
    icon: Bot,
    description: "Generate response",
    color: "bg-purple-500 dark:bg-purple-600",
  },
  {
    id: "judge",
    label: "AI Judge",
    sublabel: "Quantitative Gate",
    icon: Scale,
    description: "IAS, PAS, AS scoring",
    color: "bg-emerald-500 dark:bg-emerald-600",
  },
  {
    id: "hitl",
    label: "HITL",
    sublabel: "Nuance Rubric",
    icon: Users,
    description: "Empathy, clarity, trust",
    color: "bg-amber-500 dark:bg-amber-600",
  },
  {
    id: "stress",
    label: "Stress Test",
    sublabel: "Perturbations",
    icon: FlaskConical,
    description: "Stability & fairness",
    color: "bg-rose-500 dark:bg-rose-600",
  },
];

export function PipelineDiagram({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {pipelineSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.id} className="flex items-center gap-2">
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-white text-sm font-medium",
                step.color
              )}>
                <Icon className="h-3.5 w-3.5" />
                <span>{step.label}</span>
              </div>
              {index < pipelineSteps.length - 1 && (
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full py-8">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-2">
        {pipelineSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.id} className="flex flex-col lg:flex-row items-center gap-4 lg:gap-2">
              <div className="flex flex-col items-center gap-2">
                <div className={cn(
                  "flex items-center justify-center w-16 h-16 rounded-xl text-white shadow-lg",
                  step.color
                )}>
                  <Icon className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-sm">{step.label}</div>
                  <div className="text-xs text-muted-foreground">{step.sublabel}</div>
                </div>
                <div className="text-xs text-muted-foreground text-center max-w-[120px]">
                  {step.description}
                </div>
              </div>
              {index < pipelineSteps.length - 1 && (
                <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90 lg:rotate-0 flex-shrink-0" />
              )}
            </div>
          );
        })}
        <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90 lg:rotate-0 flex-shrink-0" />
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-green-500 dark:bg-green-600 text-white shadow-lg">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div className="text-center">
            <div className="font-semibold text-sm">Deploy</div>
            <div className="text-xs text-muted-foreground">Safe & Audited</div>
          </div>
        </div>
      </div>
    </div>
  );
}
