// client/src/components/CompetitiveBenchmarks.tsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Quote, XCircle, CheckCircle2, ArrowRight, ArrowDown } from "lucide-react";
import {
  standardBenchmarks,
  componentReplacements,
  executiveMessages,
} from "@/data/businessCase";

type CompetitiveBenchmarksProps = {
  compact?: boolean;
};

function WhatIcduAdds() {
  const replacements = [
    componentReplacements.icduRecord,
    componentReplacements.aiJudge,
    componentReplacements.hitlGrader,
    componentReplacements.stressEngine,
  ];

  return (
    <div>
      <h3 className="text-base sm:text-xl font-semibold mb-3 sm:mb-5">
        What ICDU Adds
      </h3>
      <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
        {replacements.map((item) => (
          <Card
            key={item.component}
            className="p-4 sm:p-5 flex flex-col gap-3 sm:gap-4"
            data-testid={`card-icdu-adds-${item.component.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <h4
              className="text-base sm:text-lg font-bold tracking-tight"
              data-testid={`text-component-${item.component.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {item.component}
            </h4>

            <div className="flex flex-col sm:flex-row sm:items-stretch gap-2 sm:gap-3">
              {/* Replaces (before) */}
              <div className="flex-1 rounded-md border border-destructive/20 bg-destructive/5 p-3 sm:p-3.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-destructive">
                    Replaces
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-snug line-through decoration-destructive/40 decoration-1">
                  {item.replaces}
                </p>
              </div>

              {/* Connector arrow */}
              <div
                className="flex sm:flex-col items-center justify-center text-muted-foreground/60 shrink-0"
                aria-hidden="true"
              >
                <ArrowDown className="h-4 w-4 sm:hidden" />
                <ArrowRight className="hidden sm:block h-4 w-4" />
              </div>

              {/* Outcome (after) */}
              <div className="flex-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/10 p-3 sm:p-3.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Outcome
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-foreground font-medium leading-snug">
                  {item.outcome}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function CompetitiveBenchmarks({ compact = false }: CompetitiveBenchmarksProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Benchmark comparison table — hidden in compact mode */}
      {!compact && (
        <div>
          <h3 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-4">
            Standard Benchmarks vs. ICDU
          </h3>
          <div className="border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-2 sm:p-3 font-medium w-24 sm:w-28">Benchmark</th>
                    <th className="text-left p-2 sm:p-3 font-medium">What It Measures</th>
                    <th className="text-left p-2 sm:p-3 font-medium w-28 sm:w-36">Typical Top Score</th>
                    <th className="text-left p-2 sm:p-3 font-medium w-32 sm:w-44">Blind Spot</th>
                  </tr>
                </thead>
                <tbody>
                  {standardBenchmarks.map((bm, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="p-2 sm:p-3 font-medium">{bm.name}</td>
                      <td className="p-2 sm:p-3 text-muted-foreground">{bm.measures}</td>
                      <td className="p-2 sm:p-3">
                        <Badge variant="secondary" className="text-xs sm:text-sm">
                          {bm.topScore}
                        </Badge>
                      </td>
                      <td className="p-2 sm:p-3 text-destructive/80 text-xs sm:text-sm">
                        {bm.blindSpot}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* What ICDU Adds cards */}
      <WhatIcduAdds />

      {/* Bottom-line callout */}
      <Alert className="border-primary/30 bg-primary/5">
        <Quote className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm text-foreground italic">
          {executiveMessages.bottomLine}
        </AlertDescription>
      </Alert>
    </div>
  );
}
