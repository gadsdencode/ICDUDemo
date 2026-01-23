import { Card } from "@/components/ui/card";
import { XCircle, CheckCircle2, AlertTriangle, Target, Shield, Eye, Repeat, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const beforePoints = [
  { icon: AlertTriangle, text: "Best-effort prompting" },
  { icon: XCircle, text: "Inconsistent outcomes" },
  { icon: XCircle, text: "No audit trail" },
  { icon: XCircle, text: "Unclear constraints" },
  { icon: XCircle, text: "Hard to evaluate changes" },
];

const afterPoints = [
  { icon: Target, text: "Defined intent" },
  { icon: Shield, text: "Enforceable principles" },
  { icon: Eye, text: "Traceable governance IDs" },
  { icon: Repeat, text: "Repeatable evaluations" },
  { icon: FileCheck, text: "Gated release decisions" },
];

type BeforeAfterProps = {
  compact?: boolean;
};

export function BeforeAfter({ compact = false }: BeforeAfterProps) {
  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <div className="p-2 sm:p-3 rounded-md bg-destructive/10 border border-destructive/20">
          <div className="flex items-center gap-1 sm:gap-1.5 mb-1.5 sm:mb-2">
            <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
            <span className="text-[10px] sm:text-xs font-semibold text-destructive">Before ICDU</span>
          </div>
          <ul className="space-y-0.5 sm:space-y-1">
            {beforePoints.slice(0, 3).map((point, i) => (
              <li key={i} className="text-[9px] sm:text-xs text-muted-foreground flex items-center gap-1">
                <span className="w-1 h-1 bg-destructive/50 rounded-full flex-shrink-0" />
                {point.text}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-2 sm:p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-1 sm:gap-1.5 mb-1.5 sm:mb-2">
            <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[10px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400">With ICDU</span>
          </div>
          <ul className="space-y-0.5 sm:space-y-1">
            {afterPoints.slice(0, 3).map((point, i) => (
              <li key={i} className="text-[9px] sm:text-xs text-muted-foreground flex items-center gap-1">
                <span className="w-1 h-1 bg-emerald-500/50 rounded-full flex-shrink-0" />
                {point.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-3 sm:gap-6">
      <Card className="p-3 sm:p-6 border-destructive/30 bg-destructive/5">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-destructive/20 flex items-center justify-center">
            <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base text-destructive">Before ICDU</h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Unstructured AI deployment</p>
          </div>
        </div>
        <ul className="space-y-2 sm:space-y-3">
          {beforePoints.map((point, i) => {
            const Icon = point.icon;
            return (
              <li key={i} className="flex items-start gap-2 sm:gap-3">
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-destructive/70 mt-0.5 flex-shrink-0" />
                <span className="text-[11px] sm:text-sm text-muted-foreground">{point.text}</span>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card className="p-3 sm:p-6 border-emerald-500/30 bg-emerald-500/5">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base text-emerald-600 dark:text-emerald-400">With ICDU</h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Structured AI governance</p>
          </div>
        </div>
        <ul className="space-y-2 sm:space-y-3">
          {afterPoints.map((point, i) => {
            const Icon = point.icon;
            return (
              <li key={i} className="flex items-start gap-2 sm:gap-3">
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                <span className="text-[11px] sm:text-sm text-muted-foreground">{point.text}</span>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
