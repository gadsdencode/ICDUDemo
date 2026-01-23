import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FlaskConical, Play, RotateCcw, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackDemoInteraction } from "@/lib/analytics";

type PerturbationType = "tone" | "role" | "constraint" | "channel";

type Perturbation = {
  id: string;
  type: PerturbationType;
  value: string;
  label: string;
};

type RunResult = {
  perturbation: Perturbation;
  stability: number;
  fairness: number;
  refusalConsistency: number;
  hallucinationRate: number;
  status: "pass" | "warn" | "fail";
};

const perturbationOptions: Perturbation[] = [
  { id: "tone-rushed", type: "tone", value: "rushed", label: "Rushed Tone" },
  { id: "tone-formal", type: "tone", value: "formal", label: "Formal Tone" },
  { id: "tone-casual", type: "tone", value: "casual", label: "Casual Tone" },
  { id: "role-regulator", type: "role", value: "regulator", label: "Regulator Role" },
  { id: "role-novice", type: "role", value: "novice", label: "Novice User" },
  { id: "role-expert", type: "role", value: "expert", label: "Expert User" },
  { id: "constraint-short", type: "constraint", value: "short_answer", label: "Short Answers Only" },
  { id: "constraint-detailed", type: "constraint", value: "detailed", label: "Detailed Required" },
  { id: "channel-voice", type: "channel", value: "voice", label: "Voice Transcript" },
  { id: "channel-chat", type: "channel", value: "chat", label: "Chat Interface" },
];

function generateMockResults(perturbations: Perturbation[]): RunResult[] {
  return perturbations.map((p) => {
    const stability = Math.random() * 0.3 + 0.65;
    const fairness = Math.random() * 0.25 + 0.70;
    const refusalConsistency = Math.random() * 0.2 + 0.75;
    const hallucinationRate = Math.random() * 0.15;

    let status: "pass" | "warn" | "fail";
    if (stability >= 0.85 && fairness >= 0.85 && hallucinationRate < 0.05) {
      status = "pass";
    } else if (stability < 0.70 || fairness < 0.70 || hallucinationRate > 0.10) {
      status = "fail";
    } else {
      status = "warn";
    }

    return {
      perturbation: p,
      stability,
      fairness,
      refusalConsistency,
      hallucinationRate,
      status,
    };
  });
}

const typeColors: Record<PerturbationType, string> = {
  tone: "bg-blue-500",
  role: "bg-purple-500",
  constraint: "bg-amber-500",
  channel: "bg-emerald-500",
};

const statusConfig = {
  pass: { icon: CheckCircle2, color: "text-emerald-500", label: "Pass" },
  warn: { icon: AlertTriangle, color: "text-amber-500", label: "Warn" },
  fail: { icon: XCircle, color: "text-destructive", label: "Fail" },
};

export function StressPanel() {
  const [selectedPerturbations, setSelectedPerturbations] = useState<Perturbation[]>([]);
  const [results, setResults] = useState<RunResult[] | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const togglePerturbation = (p: Perturbation) => {
    if (selectedPerturbations.find((s) => s.id === p.id)) {
      setSelectedPerturbations(selectedPerturbations.filter((s) => s.id !== p.id));
    } else {
      setSelectedPerturbations([...selectedPerturbations, p]);
    }
    setResults(null);
  };

  const runStressTest = () => {
    if (selectedPerturbations.length === 0) return;
    
    setIsRunning(true);
    trackDemoInteraction("stress_panel", "run_test");
    
    setTimeout(() => {
      setResults(generateMockResults(selectedPerturbations));
      setIsRunning(false);
    }, 2000);
  };

  const reset = () => {
    setSelectedPerturbations([]);
    setResults(null);
    trackDemoInteraction("stress_panel", "reset");
  };

  const selectDefault = () => {
    const defaults = perturbationOptions.slice(0, 4);
    setSelectedPerturbations(defaults);
    setResults(null);
  };

  const stabilityAvg = results
    ? results.reduce((a, r) => a + r.stability, 0) / results.length
    : 0;
  const passCount = results?.filter((r) => r.status === "pass").length || 0;

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-sm sm:text-base">Stress Engine</h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={reset}
            className="gap-1 sm:gap-2 flex-1 sm:flex-none"
            data-testid="button-reset-stress"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="sm:inline">Reset</span>
          </Button>
          <Button
            size="sm"
            onClick={runStressTest}
            disabled={isRunning || selectedPerturbations.length === 0}
            className="gap-1 sm:gap-2 flex-1 sm:flex-none"
            data-testid="button-run-stress"
          >
            <Play className="h-4 w-4" />
            <span>{isRunning ? "Testing..." : "Run"}</span>
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between gap-4 mb-3">
            <span className="font-medium text-sm">Select Perturbations</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={selectDefault}
              className="text-xs"
              data-testid="button-select-default"
            >
              Select Default (4)
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {perturbationOptions.map((p) => {
              const isSelected = selectedPerturbations.find((s) => s.id === p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => togglePerturbation(p)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm transition-all",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover-elevate"
                  )}
                  data-testid={`perturbation-${p.id}`}
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    typeColors[p.type]
                  )} />
                  {p.label}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-3 sm:gap-4 mt-3 text-[10px] sm:text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500" /> Tone
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-purple-500" /> Role
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-500" /> Constraint
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" /> Channel
            </div>
          </div>
        </div>

        {isRunning && (
          <div className="text-center py-8">
            <div className="animate-spin h-10 w-10 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full" />
            <p className="text-sm text-muted-foreground">
              Running {selectedPerturbations.length} perturbation{selectedPerturbations.length !== 1 ? "s" : ""}...
            </p>
          </div>
        )}

        {results && !isRunning && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-muted/50">
                <div className="text-sm text-muted-foreground">Average Stability</div>
                <div className="text-2xl font-semibold mt-1">
                  {(stabilityAvg * 100).toFixed(0)}%
                </div>
              </Card>
              <Card className="p-4 bg-muted/50">
                <div className="text-sm text-muted-foreground">Tests Passed</div>
                <div className="text-2xl font-semibold mt-1">
                  {passCount}/{results.length}
                </div>
              </Card>
            </div>

            <div className="border rounded-md overflow-x-auto -mx-4 sm:mx-0">
              <Table className="min-w-[500px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Perturbation</TableHead>
                    <TableHead className="text-center text-xs sm:text-sm">Stab.</TableHead>
                    <TableHead className="text-center text-xs sm:text-sm">Fair.</TableHead>
                    <TableHead className="text-center text-xs sm:text-sm hidden sm:table-cell">Refusal</TableHead>
                    <TableHead className="text-center text-xs sm:text-sm hidden sm:table-cell">Halluc.</TableHead>
                    <TableHead className="text-center text-xs sm:text-sm">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((r) => {
                    const StatusIcon = statusConfig[r.status].icon;
                    return (
                      <TableRow key={r.perturbation.id}>
                        <TableCell className="py-2">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Badge 
                              className={cn("text-white text-[10px] sm:text-xs px-1.5 sm:px-2", typeColors[r.perturbation.type])}
                            >
                              {r.perturbation.type}
                            </Badge>
                            <span className="text-xs sm:text-sm">{r.perturbation.value}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-mono text-xs sm:text-sm py-2">
                          {(r.stability * 100).toFixed(0)}%
                        </TableCell>
                        <TableCell className="text-center font-mono text-xs sm:text-sm py-2">
                          {(r.fairness * 100).toFixed(0)}%
                        </TableCell>
                        <TableCell className="text-center font-mono text-xs sm:text-sm py-2 hidden sm:table-cell">
                          {(r.refusalConsistency * 100).toFixed(0)}%
                        </TableCell>
                        <TableCell className="text-center font-mono text-xs sm:text-sm py-2 hidden sm:table-cell">
                          {(r.hallucinationRate * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-center py-2">
                          <div className="flex items-center justify-center gap-1">
                            <StatusIcon className={cn("h-3 w-3 sm:h-4 sm:w-4", statusConfig[r.status].color)} />
                            <span className={cn("text-[10px] sm:text-xs", statusConfig[r.status].color)}>
                              {statusConfig[r.status].label}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {!results && !isRunning && selectedPerturbations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <FlaskConical className="h-10 w-10 mx-auto mb-4 opacity-50" />
            <p className="text-sm">Select perturbations to test</p>
            <p className="text-xs mt-1">Each variation tests AI behavior under different conditions</p>
          </div>
        )}

        {!results && !isRunning && selectedPerturbations.length > 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">
              {selectedPerturbations.length} perturbation{selectedPerturbations.length !== 1 ? "s" : ""} selected
            </p>
            <p className="text-xs mt-1">Click "Run Test" to generate results</p>
          </div>
        )}
      </div>
    </Card>
  );
}
