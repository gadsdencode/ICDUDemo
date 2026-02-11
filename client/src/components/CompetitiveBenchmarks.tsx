// client/src/components/CompetitiveBenchmarks.tsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Quote } from "lucide-react";
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
      <h3 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-4">
        What ICDU Adds
      </h3>
      <div className="grid md:grid-cols-2 gap-2 sm:gap-4">
        {replacements.map((item) => (
          <Card key={item.component} className="p-2.5 sm:p-4">
            <div className="font-semibold text-[10px] sm:text-sm mb-1.5 sm:mb-2">
              {item.component}
            </div>
            <p className="text-[9px] sm:text-xs text-destructive/80 mb-1">
              <span className="font-medium">Replaces:</span> {item.replaces}
            </p>
            <p className="text-[9px] sm:text-xs text-emerald-600 dark:text-emerald-400">
              <span className="font-medium">Outcome:</span> {item.outcome}
            </p>
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
              <table className="w-full text-[10px] sm:text-sm">
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
                        <Badge variant="secondary" className="text-[8px] sm:text-xs">
                          {bm.topScore}
                        </Badge>
                      </td>
                      <td className="p-2 sm:p-3 text-destructive/80 text-[9px] sm:text-xs">
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
        <AlertDescription className="text-[10px] sm:text-sm text-foreground italic">
          {executiveMessages.bottomLine}
        </AlertDescription>
      </Alert>
    </div>
  );
}
