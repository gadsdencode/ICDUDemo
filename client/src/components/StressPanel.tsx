import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FlaskConical, Play, RotateCcw, CheckCircle2, AlertTriangle, XCircle, Zap, Shield, MessageSquare, Lightbulb } from "lucide-react";
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
  insight: string;
};

type Preset = {
  id: string;
  name: string;
  icon: typeof Zap;
  description: string;
  perturbations: string[];
};

const perturbationOptions: Perturbation[] = [
  { id: "tone-rushed", type: "tone", value: "rushed", label: "Rushed Tone" },
  { id: "tone-formal", type: "tone", value: "formal", label: "Formal Tone" },
  { id: "tone-casual", type: "tone", value: "casual", label: "Casual Tone" },
  { id: "role-regulator", type: "role", value: "regulator", label: "Regulator Role" },
  { id: "role-novice", type: "role", value: "novice", label: "Novice User" },
  { id: "role-expert", type: "role", value: "expert", label: "Expert User" },
  { id: "role-executive", type: "role", value: "executive", label: "Executive" },
  { id: "constraint-short", type: "constraint", value: "short_answer", label: "Short Answers" },
  { id: "constraint-detailed", type: "constraint", value: "detailed", label: "Detailed Required" },
  { id: "constraint-none", type: "constraint", value: "none", label: "No Constraints" },
  { id: "channel-voice", type: "channel", value: "voice", label: "Voice" },
  { id: "channel-chat", type: "channel", value: "chat", label: "Chat" },
  { id: "channel-sms", type: "channel", value: "sms", label: "SMS" },
  { id: "channel-email", type: "channel", value: "email", label: "Email" },
];

const presets: Preset[] = [
  {
    id: "executive-comms",
    name: "Executive Comms Safety",
    icon: Shield,
    description: "Test executive-facing outputs",
    perturbations: ["role-executive", "tone-formal", "channel-email", "constraint-short"]
  },
  {
    id: "regulated-hard",
    name: "Regulated Domain Hard Mode",
    icon: AlertTriangle,
    description: "Stress test for compliance",
    perturbations: ["role-regulator", "constraint-none", "tone-casual", "channel-chat"]
  },
  {
    id: "tone-drift",
    name: "Tone Drift Test",
    icon: MessageSquare,
    description: "Test tone consistency",
    perturbations: ["tone-rushed", "tone-formal", "tone-casual", "channel-sms"]
  }
];

function generateInsight(p: Perturbation, status: "pass" | "warn" | "fail"): string {
  const insights: Record<string, Record<"pass" | "warn" | "fail", string>> = {
    "tone-rushed": {
      pass: "Maintains quality under time pressure",
      warn: "Slight accuracy drop under rushed conditions",
      fail: "Rushed tone triggers unsafe shortcuts"
    },
    "tone-formal": {
      pass: "Formal tone consistency maintained",
      warn: "Minor formality drift detected",
      fail: "Formal tone breaks under edge cases"
    },
    "tone-casual": {
      pass: "Casual tone stays within bounds",
      warn: "Casual tone may compromise precision",
      fail: "Casual tone leads to policy violations"
    },
    "role-regulator": {
      pass: "Handles regulatory scrutiny well",
      warn: "Some responses need compliance review",
      fail: "Fails regulatory persona requirements"
    },
    "role-novice": {
      pass: "Appropriate for novice users",
      warn: "May overcomplicate for novices",
      fail: "Not suitable for novice audience"
    },
    "role-expert": {
      pass: "Expert-level depth maintained",
      warn: "May oversimplify for experts",
      fail: "Fails expert expectations"
    },
    "role-executive": {
      pass: "Executive-ready outputs",
      warn: "Tone compliance needs review for execs",
      fail: "Tone compliance failed for executive persona"
    },
    "constraint-short": {
      pass: "Short answers maintain quality",
      warn: "Brevity may sacrifice completeness",
      fail: "Short constraint causes info loss"
    },
    "constraint-detailed": {
      pass: "Detailed responses well-structured",
      warn: "Detail level may overwhelm",
      fail: "Detail constraint causes drift"
    },
    "constraint-none": {
      pass: "Stable without explicit constraints",
      warn: "Higher hallucination risk when constraints removed",
      fail: "Unsafe without constraints"
    },
    "channel-voice": {
      pass: "Voice-optimized outputs",
      warn: "Voice transcription needs polish",
      fail: "Not suitable for voice channel"
    },
    "channel-chat": {
      pass: "Chat-ready responses",
      warn: "Chat formatting needs adjustment",
      fail: "Chat channel issues detected"
    },
    "channel-sms": {
      pass: "SMS-appropriate brevity",
      warn: "Refusal consistency dropped under channel=SMS",
      fail: "SMS constraint causes failures"
    },
    "channel-email": {
      pass: "Email-appropriate formatting",
      warn: "Email length may need trimming",
      fail: "Email format violations"
    }
  };

  return insights[p.id]?.[status] || `${p.label}: ${status}`;
}

function generateMockResults(perturbations: Perturbation[]): RunResult[] {
  return perturbations.map((p) => {
    let stability = Math.random() * 0.3 + 0.65;
    let fairness = Math.random() * 0.25 + 0.70;
    let refusalConsistency = Math.random() * 0.2 + 0.75;
    let hallucinationRate = Math.random() * 0.15;

    if (p.id === "constraint-none") {
      hallucinationRate = Math.random() * 0.15 + 0.08;
    }
    if (p.id === "channel-sms") {
      refusalConsistency = Math.random() * 0.2 + 0.60;
    }
    if (p.id === "role-executive") {
      stability = Math.random() * 0.2 + 0.75;
    }

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
      insight: generateInsight(p, status),
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
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const togglePerturbation = (p: Perturbation) => {
    if (selectedPerturbations.find((s) => s.id === p.id)) {
      setSelectedPerturbations(selectedPerturbations.filter((s) => s.id !== p.id));
    } else {
      setSelectedPerturbations([...selectedPerturbations, p]);
    }
    setResults(null);
    setActivePreset(null);
  };

  const selectPreset = (preset: Preset) => {
    const selected = perturbationOptions.filter(p => preset.perturbations.includes(p.id));
    setSelectedPerturbations(selected);
    setActivePreset(preset.id);
    setResults(null);
    trackDemoInteraction("stress_panel", `preset_${preset.id}`);
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
    setActivePreset(null);
    trackDemoInteraction("stress_panel", "reset");
  };

  const stabilityAvg = results
    ? results.reduce((a, r) => a + r.stability, 0) / results.length
    : 0;
  const passCount = results?.filter((r) => r.status === "pass").length || 0;
  const warnCount = results?.filter((r) => r.status === "warn").length || 0;

  return (
    <Card className="p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <h3 className="font-semibold text-sm sm:text-base">Stress Engine</h3>
          <Badge variant="outline" className="text-[10px] sm:text-xs">Presets</Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={reset}
            className="gap-1 sm:gap-2 flex-1 sm:flex-none h-7 sm:h-8 text-[10px] sm:text-xs"
            data-testid="button-reset-stress"
          >
            <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Reset</span>
          </Button>
          <Button
            size="sm"
            onClick={runStressTest}
            disabled={isRunning || selectedPerturbations.length === 0}
            className="gap-1 sm:gap-2 flex-1 sm:flex-none h-7 sm:h-8 text-[10px] sm:text-xs"
            data-testid="button-run-stress"
          >
            <Play className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{isRunning ? "Testing..." : "Run Test"}</span>
          </Button>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div>
          <div className="font-medium text-xs sm:text-sm mb-2 sm:mb-3">Preset Suites</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {presets.map((preset) => {
              const Icon = preset.icon;
              const isActive = activePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => selectPreset(preset)}
                  className={cn(
                    "flex items-start gap-2 p-2.5 sm:p-3 rounded-md border text-left transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover-elevate"
                  )}
                  data-testid={`preset-${preset.id}`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="font-medium text-[10px] sm:text-xs">{preset.name}</div>
                    <div className={cn(
                      "text-[9px] sm:text-[10px] mt-0.5",
                      isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                    )}>
                      {preset.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="font-medium text-xs sm:text-sm mb-2 sm:mb-3">Or Select Individual Perturbations</div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {perturbationOptions.map((p) => {
              const isSelected = selectedPerturbations.find((s) => s.id === p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => togglePerturbation(p)}
                  className={cn(
                    "flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-md border text-[10px] sm:text-xs transition-all",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover-elevate"
                  )}
                  data-testid={`perturbation-${p.id}`}
                >
                  <div className={cn("w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full", typeColors[p.type])} />
                  {p.label}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-4 mt-2 sm:mt-3 text-[9px] sm:text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500" /> Tone
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-500" /> Role
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500" /> Constraint
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500" /> Channel
            </div>
          </div>
        </div>

        {isRunning && (
          <div className="text-center py-6 sm:py-8">
            <div className="animate-spin h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-3 sm:mb-4 border-4 border-primary border-t-transparent rounded-full" />
            <p className="text-xs sm:text-sm text-muted-foreground">
              Running {selectedPerturbations.length} perturbation{selectedPerturbations.length !== 1 ? "s" : ""}...
            </p>
          </div>
        )}

        {results && !isRunning && (
          <>
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <Card className="p-2.5 sm:p-4 bg-muted/50">
                <div className="text-[10px] sm:text-sm text-muted-foreground">Avg Stability</div>
                <div className="text-lg sm:text-2xl font-semibold mt-0.5 sm:mt-1">
                  {(stabilityAvg * 100).toFixed(0)}%
                </div>
              </Card>
              <Card className="p-2.5 sm:p-4 bg-muted/50">
                <div className="text-[10px] sm:text-sm text-muted-foreground">Results</div>
                <div className="text-lg sm:text-2xl font-semibold mt-0.5 sm:mt-1 flex items-center gap-1.5 sm:gap-2">
                  <span className="text-emerald-500">{passCount}</span>
                  <span className="text-muted-foreground text-sm">/</span>
                  <span className="text-amber-500">{warnCount}</span>
                  <span className="text-muted-foreground text-sm">/</span>
                  <span className="text-destructive">{results.length - passCount - warnCount}</span>
                </div>
              </Card>
            </div>

            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px] sm:text-xs">Perturbation</TableHead>
                    <TableHead className="text-center text-[10px] sm:text-xs w-16">Status</TableHead>
                    <TableHead className="text-[10px] sm:text-xs hidden sm:table-cell">Insight</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((r) => {
                    const StatusIcon = statusConfig[r.status].icon;
                    return (
                      <TableRow key={r.perturbation.id}>
                        <TableCell className="py-2">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <Badge 
                              className={cn(
                                "text-white text-[8px] sm:text-[10px] px-1 sm:px-1.5",
                                typeColors[r.perturbation.type]
                              )}
                            >
                              {r.perturbation.type.slice(0, 4)}
                            </Badge>
                            <span className="text-[10px] sm:text-xs">{r.perturbation.label}</span>
                          </div>
                          <div className="sm:hidden mt-1">
                            <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                              <Lightbulb className="h-2.5 w-2.5" />
                              {r.insight}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center py-2">
                          <div className="flex items-center justify-center gap-1">
                            <StatusIcon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", statusConfig[r.status].color)} />
                            <span className={cn("text-[10px] sm:text-xs font-medium", statusConfig[r.status].color)}>
                              {statusConfig[r.status].label}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-2 hidden sm:table-cell">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Lightbulb className="h-3 w-3 flex-shrink-0" />
                            {r.insight}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {results.some(r => r.status !== "pass") && (
              <div className="p-2.5 sm:p-4 rounded-md bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600 dark:text-amber-400" />
                  <span className="font-medium text-xs sm:text-sm text-amber-600 dark:text-amber-400">Key Insights</span>
                </div>
                <ul className="space-y-1">
                  {results.filter(r => r.status !== "pass").slice(0, 3).map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-[10px] sm:text-xs text-muted-foreground">
                      <span className="w-1 h-1 mt-1.5 bg-amber-500 rounded-full flex-shrink-0" />
                      {r.insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {!results && !isRunning && selectedPerturbations.length === 0 && (
          <div className="text-center py-6 sm:py-8 text-muted-foreground">
            <FlaskConical className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-3 opacity-20" />
            <p className="text-xs sm:text-sm">Select a preset or individual perturbations to test</p>
            <p className="text-[10px] sm:text-xs mt-1">Test robustness across controlled changes</p>
          </div>
        )}
      </div>
    </Card>
  );
}
