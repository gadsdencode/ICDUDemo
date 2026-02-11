// client/src/components/UseCaseGuide.tsx
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Minus, Quote } from "lucide-react";
import { useCaseGuidance, executiveMessages } from "@/data/businessCase";

type UseCaseGuideProps = {
  compact?: boolean;
};

export function UseCaseGuide({ compact = false }: UseCaseGuideProps) {
  const useItems = compact
    ? useCaseGuidance.useIcdu.slice(0, 2)
    : useCaseGuidance.useIcdu;
  const standardItems = compact
    ? useCaseGuidance.standardEvalIsFine.slice(0, 2)
    : useCaseGuidance.standardEvalIsFine;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid md:grid-cols-2 gap-2 sm:gap-4">
        {/* Use ICDU When */}
        <Card className="p-3 sm:p-5 border-emerald-500/30 bg-emerald-500/5">
          <h3 className="font-semibold text-[10px] sm:text-sm text-emerald-600 dark:text-emerald-400 mb-2 sm:mb-3">
            Use ICDU When...
          </h3>
          <ul className="space-y-1.5 sm:space-y-2">
            {useItems.map((item, i) => (
              <li key={i} className="flex items-start gap-1.5 sm:gap-2">
                <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                <span className="text-[9px] sm:text-xs text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Standard Eval Is Fine */}
        <Card className="p-3 sm:p-5 border-muted-foreground/20">
          <h3 className="font-semibold text-[10px] sm:text-sm text-muted-foreground mb-2 sm:mb-3">
            Standard Eval Is Fine When...
          </h3>
          <ul className="space-y-1.5 sm:space-y-2">
            {standardItems.map((item, i) => (
              <li key={i} className="flex items-start gap-1.5 sm:gap-2">
                <Minus className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="text-[9px] sm:text-xs text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Deployability tagline */}
      <Alert className="border-primary/30 bg-primary/5">
        <Quote className="h-4 w-4 text-primary" />
        <AlertDescription className="text-[10px] sm:text-sm text-foreground italic text-center">
          {executiveMessages.deployability}
        </AlertDescription>
      </Alert>
    </div>
  );
}
