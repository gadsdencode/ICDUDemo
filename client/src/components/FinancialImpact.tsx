// client/src/components/FinancialImpact.tsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  financialImpact,
  failureIncidents,
  regulations,
  sourcesLine,
} from "@/data/businessCase";

type FinancialImpactProps = {
  compact?: boolean;
};

const headlineStats = [
  financialImpact.hallucination_losses,
  financialImpact.project_failure_rate,
  financialImpact.eu_ai_act_max_fine,
  financialImpact.remediation_costs,
];

function StatGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
      {headlineStats.map((stat) => (
        <Card key={stat.figure} className="p-2.5 sm:p-4 text-center">
          <div className="text-lg sm:text-2xl font-bold text-primary mb-1">
            {stat.figure}
          </div>
          <p className="text-[9px] sm:text-xs text-muted-foreground leading-snug">
            {stat.context}
          </p>
          <p className="text-[8px] sm:text-[10px] text-muted-foreground/60 mt-1">
            {stat.source}
          </p>
        </Card>
      ))}
    </div>
  );
}

export function FinancialImpact({ compact = false }: FinancialImpactProps) {
  if (compact) {
    return <StatGrid />;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <StatGrid />

      {/* Additional headline stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          financialImpact.abandoned_initiatives,
          financialImpact.per_employee_cost,
          financialImpact.ai_roi_ratio,
        ].map((stat) => (
          <Card key={stat.figure} className="p-2 sm:p-3 text-center">
            <div className="text-sm sm:text-lg font-bold text-primary mb-0.5">
              {stat.figure}
            </div>
            <p className="text-[8px] sm:text-xs text-muted-foreground leading-snug">
              {stat.context}
            </p>
            <p className="text-[7px] sm:text-[10px] text-muted-foreground/60 mt-0.5">
              {stat.source}
            </p>
          </Card>
        ))}
      </div>

      {/* Real-World Failure Incidents */}
      <div>
        <h3 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-4">
          Real-World AI Failure Costs
        </h3>
        <div className="border rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[10px] sm:text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-2 sm:p-3 font-medium">Incident</th>
                  <th className="text-left p-2 sm:p-3 font-medium w-20 sm:w-24">Year</th>
                  <th className="text-left p-2 sm:p-3 font-medium w-28 sm:w-40">Financial Impact</th>
                </tr>
              </thead>
              <tbody>
                {failureIncidents.map((item, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="p-2 sm:p-3 text-muted-foreground">{item.incident}</td>
                    <td className="p-2 sm:p-3 text-muted-foreground">{item.year}</td>
                    <td className="p-2 sm:p-3">
                      <Badge variant="destructive" className="text-[8px] sm:text-xs font-medium">
                        {item.impact}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Regulatory Exposure */}
      <div>
        <h3 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-4">
          Regulatory Exposure
        </h3>
        <div className="border rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[10px] sm:text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-2 sm:p-3 font-medium w-28 sm:w-36">Regulation</th>
                  <th className="text-left p-2 sm:p-3 font-medium">Requirement</th>
                  <th className="text-left p-2 sm:p-3 font-medium w-32 sm:w-44">Maximum Penalty</th>
                </tr>
              </thead>
              <tbody>
                {regulations.map((reg, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="p-2 sm:p-3 font-medium">{reg.name}</td>
                    <td className="p-2 sm:p-3 text-muted-foreground">{reg.requirement}</td>
                    <td className="p-2 sm:p-3">
                      <Badge variant="outline" className="text-[8px] sm:text-xs font-medium text-destructive border-destructive/30">
                        {reg.penalty}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sources */}
      <p className="text-[8px] sm:text-[10px] text-muted-foreground/60 italic text-center">
        {sourcesLine}
      </p>
    </div>
  );
}
