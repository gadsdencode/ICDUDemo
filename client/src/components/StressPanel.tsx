import { useState } from "react";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import { CheckCircle2, AlertTriangle, XCircle, Zap, Shield, MessageSquare } from "lucide-react";
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

function unit(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) hash = Math.imul(hash ^ seed.charCodeAt(i), 16777619);
  return (hash >>> 0) / 4294967295;
}

function generateMockResults(perturbations: Perturbation[], seed: string): RunResult[] {
  return perturbations.map((p) => {
    let stability = unit(`${seed}:${p.id}:s`) * 0.3 + 0.65;
    let fairness = unit(`${seed}:${p.id}:f`) * 0.25 + 0.70;
    let refusalConsistency = unit(`${seed}:${p.id}:r`) * 0.2 + 0.75;
    let hallucinationRate = unit(`${seed}:${p.id}:h`) * 0.15;

    if (p.id === "constraint-none") {
      hallucinationRate = unit(`${seed}:${p.id}:hn`) * 0.15 + 0.08;
    }
    if (p.id === "channel-sms") {
      refusalConsistency = unit(`${seed}:${p.id}:sms`) * 0.2 + 0.60;
    }
    if (p.id === "role-executive") {
      stability = unit(`${seed}:${p.id}:ex`) * 0.2 + 0.75;
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

const statusConfig = {
  pass: { icon: CheckCircle2, color: "text-emerald-500", label: "Pass" },
  warn: { icon: AlertTriangle, color: "text-amber-500", label: "Warn" },
  fail: { icon: XCircle, color: "text-destructive", label: "Fail" },
};

function restoreStress(rows: { id: string; label: string; type?: string; insight?: string; stability: number; fairness: number; refusal: number; hallucination: number; status: "pass" | "warn" | "fail" }[]): RunResult[] {
  return rows.map((row) => {
    const found = perturbationOptions.find((item) => item.id === row.id);
    const perturbation = found ?? { id: row.id, label: row.label, type: (row.type ?? "role") as PerturbationType, value: row.id };
    return {
      perturbation,
      stability: row.stability,
      fairness: row.fairness,
      refusalConsistency: row.refusal,
      hallucinationRate: row.hallucination,
      status: row.status,
      insight: row.insight ?? "",
    };
  });
}

export function StressPanel() {
  const workspace = useWorkspace();
  const [selectedPerturbations, setSelectedPerturbations] = useState<Perturbation[]>([]);
  const [freshResults, setFreshResults] = useState<RunResult[] | null>(null);
  const [useStored, setUseStored] = useState(true);
  const stored = workspace.task.stress;
  const results = freshResults ?? (useStored && stored && stored.sourceId === workspace.contract.icdu_id ? restoreStress(stored.rows) : null);
  const [isRunning, setIsRunning] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const togglePerturbation = (p: Perturbation) => {
    if (selectedPerturbations.find((s) => s.id === p.id)) {
      setSelectedPerturbations(selectedPerturbations.filter((s) => s.id !== p.id));
    } else {
      setSelectedPerturbations([...selectedPerturbations, p]);
    }
    setFreshResults(null);
    setUseStored(false);
    setActivePreset(null);
  };

  const selectPreset = (preset: Preset) => {
    const selected = perturbationOptions.filter(p => preset.perturbations.includes(p.id));
    setSelectedPerturbations(selected);
    setActivePreset(preset.id);
    setFreshResults(null);
    setUseStored(false);
    trackDemoInteraction("stress_panel", `preset_${preset.id}`);
  };

  const runStressTest = () => {
    if (selectedPerturbations.length === 0) return;
    
    setIsRunning(true);
    trackDemoInteraction("stress_panel", "run_test");
    
    setTimeout(() => {
      const seed = `${workspace.contract.icdu_id}:${workspace.contract.revision}`;
      const next = generateMockResults(selectedPerturbations, seed);
      setFreshResults(next);
      setUseStored(true);
      workspace.setStressSelection(next.map((row) => ({
        id: row.perturbation.id,
        label: row.perturbation.label,
        type: row.perturbation.type,
        insight: row.insight,
        stability: row.stability,
        fairness: row.fairness,
        refusal: row.refusalConsistency,
        hallucination: row.hallucinationRate,
        status: row.status,
      })));
      setIsRunning(false);
    }, 2000);
  };

  const reset = () => {
    setSelectedPerturbations([]);
    setFreshResults(null);
    setUseStored(false);
    workspace.setStressSelection([]);
    setActivePreset(null);
    trackDemoInteraction("stress_panel", "reset");
  };

  const stabilityAvg = results
    ? results.reduce((a, r) => a + r.stability, 0) / results.length
    : 0;
  const passCount = results?.filter((r) => r.status === "pass").length || 0;
  const warnCount = results?.filter((r) => r.status === "warn").length || 0;
  const failCount = results ? results.length - passCount - warnCount : 0;

  return (
    <div className="icdu-stress">
      <div className="icdu-lab-toolbar">
        <div>
          <h3>Simulated stress</h3>
          <p className="icdu-work-meta">Preset and custom perturbations stay on this draft. Results are simulated, not a live model run.</p>
        </div>
        <div className="icdu-actions">
          <button type="button" className="icdu-quiet icdu-focus" onClick={reset} data-testid="button-reset-stress">Reset</button>
          <button type="button" className="icdu-primary icdu-focus" onClick={runStressTest} disabled={isRunning || selectedPerturbations.length === 0} data-testid="button-run-stress">
            {isRunning ? "Testing…" : "Run test"}
          </button>
        </div>
      </div>

      <div className="icdu-group">
        <h3>Preset suites</h3>
        <div className="icdu-presets">
          {presets.map((preset) => {
            const Icon = preset.icon;
            const isActive = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => selectPreset(preset)}
                className="icdu-preset icdu-focus"
                data-testid={`preset-${preset.id}`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>
                  <strong>{preset.name}</strong>
                  <small>{preset.description}</small>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="icdu-group">
        <h3>Perturbations</h3>
        <div className="icdu-chips" role="group" aria-label="Perturbations">
          {perturbationOptions.map((p) => {
            const isSelected = Boolean(selectedPerturbations.find((s) => s.id === p.id));
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => togglePerturbation(p)}
                className="icdu-chip icdu-focus"
                data-testid={`perturbation-${p.id}`}
              >
                <span className={cn("icdu-dot", `is-${p.type}`)} />
                {p.label}
              </button>
            );
          })}
        </div>
        <ul className="icdu-legend">
          <li><span className="icdu-dot is-tone" />Tone</li>
          <li><span className="icdu-dot is-role" />Role</li>
          <li><span className="icdu-dot is-constraint" />Constraint</li>
          <li><span className="icdu-dot is-channel" />Channel</li>
        </ul>
      </div>

      {isRunning ? <p className="icdu-empty">Running {selectedPerturbations.length} simulated perturbation{selectedPerturbations.length === 1 ? "" : "s"}.</p> : null}

      {results && !isRunning ? (
        <div className="icdu-group">
          <h3>Simulated results</h3>
          <dl className="icdu-metrics">
            <div>
              <dt>Average stability</dt>
              <dd>{(stabilityAvg * 100).toFixed(0)}%</dd>
            </div>
            <div>
              <dt>Pass / warn / fail</dt>
              <dd>{passCount} / {warnCount} / {failCount}</dd>
            </div>
          </dl>
          <div className="icdu-table-wrap">
            <table className="icdu-table icdu-stress-table">
              <caption>Simulated perturbation results for this draft. Not a live measurement.</caption>
              <thead>
                <tr>
                  <th>Perturbation</th>
                  <th>Status</th>
                  <th>Stability</th>
                  <th>Fairness</th>
                  <th>Refusal</th>
                  <th>Hallucination</th>
                  <th>Insight</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row) => {
                  const StatusIcon = statusConfig[row.status].icon;
                  return (
                    <tr key={row.perturbation.id}>
                      <th data-col="Perturbation">
                        <span className={cn("icdu-dot", `is-${row.perturbation.type}`)} />
                        {row.perturbation.label}
                      </th>
                      <td data-col="Status">
                        <span className={cn("icdu-status", `is-${row.status}`)}>
                          <StatusIcon className="h-4 w-4" aria-hidden="true" />
                          {statusConfig[row.status].label}
                        </span>
                      </td>
                      <td data-col="Stability" className="icdu-num">{Math.round(row.stability * 100)}%</td>
                      <td data-col="Fairness" className="icdu-num">{Math.round(row.fairness * 100)}%</td>
                      <td data-col="Refusal" className="icdu-num">{Math.round(row.refusalConsistency * 100)}%</td>
                      <td data-col="Hallucination" className="icdu-num">{Math.round(row.hallucinationRate * 100)}%</td>
                      <td data-col="Insight">{row.insight}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!results && !isRunning && selectedPerturbations.length === 0 ? (
        <p className="icdu-empty">Select a preset or individual perturbations. Nothing has been run for this view yet.</p>
      ) : null}
    </div>
  );
}

