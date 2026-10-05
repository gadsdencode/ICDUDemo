import { lazy, Suspense, useState } from "react";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { guidedScenarios, getGuidedScenario } from "@/data/guidedScenarios";
import { pilotPathPanel, roiModelAssumptions, roiCalculatorDefaults, roiCalculatorRanges, roiResultSummarySentence, calculateRoi, formatBusinessCurrency, type RoiInputs } from "@/data/businessCase";
import { evaluateGate, formatGatePercent } from "@/lib/gateDecision";
import { applyRoiInputs } from "@/lib/roiEdit";
import { briefFacts, evidenceFor, renderBrief, whatIfDecision, type BriefFacts, type RoiSetName } from "@/lib/taskState";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import { useAssistantSession } from "@/components/assistant/session";
import { RubricPanel } from "@/components/RubricPanel";
import { TechnicalRecord } from "@/components/guided/TechnicalRecord";

const Builder = lazy(() => import("@/components/ICDUBuilder").then((module) => ({ default: module.ICDUBuilder })));

function ask(text: string) {
  return text;
}

function DecisionMark({ decision }: { decision: string }) {
  const Icon = decision === "PROMOTE" ? CheckCircle2 : decision === "BLOCK" ? XCircle : AlertTriangle;
  return (
    <span className={`icdu-decision is-${decision.toLowerCase()}`}>
      <Icon aria-hidden="true" className="h-4 w-4" />
      {decision}
    </span>
  );
}

function TextList({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  return (
    <div className="icdu-list">
      <p className="icdu-label">{label}</p>
      {items.length === 0 ? <p className="icdu-empty">None yet. Add the first item below.</p> : null}
      <ul>
        {items.map((item) => (
          <li key={item}>
            <span>{item}</span>
            <button type="button" className="icdu-focus" onClick={() => onChange(items.filter((entry) => entry !== item))}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      <div className="icdu-inline">
        <input
          className="icdu-control"
          aria-label={`Add ${label}`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button
          type="button"
          className="icdu-quiet icdu-focus"
          onClick={() => {
            const next = draft.trim();
            if (!next) return;
            onChange([...items, next].slice(0, 8));
            setDraft("");
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  placeholder,
  multiline,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  multiline?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="icdu-field" htmlFor={id}>
      <span className="icdu-label">{label}</span>
      {multiline ? (
        <textarea id={id} className="icdu-control" value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input id={id} className="icdu-control" value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

function ProposalReview({
  field,
  before,
  after,
  onApply,
  onCancel,
  testId,
}: {
  field: string;
  before: string;
  after: string;
  onApply: () => void;
  onCancel: () => void;
  testId?: string;
}) {
  return (
    <div className="icdu-change" data-testid={testId}>
      <p className="icdu-label">Proposed {field}</p>
      <div className="icdu-change-pair">
        <div>
          <span>Before</span>
          <p>{before || "Empty"}</p>
        </div>
        <div>
          <span>After</span>
          <p>{after}</p>
        </div>
      </div>
      <div className="icdu-actions">
        <button type="button" className="icdu-primary icdu-focus" onClick={onApply} data-testid={testId ? `${testId}-apply` : undefined}>Apply</button>
        <button type="button" className="icdu-quiet icdu-focus" onClick={onCancel} data-testid={testId ? `${testId}-cancel` : undefined}>Cancel</button>
      </div>
    </div>
  );
}

export function ContractView() {
  const workspace = useWorkspace();
  const contract = workspace.contract;
  const proposal = workspace.task.proposal?.target === "contract" ? workspace.task.proposal : null;
  return (
    <section className="icdu-work" aria-label="Intent and expertise">
      <header className="icdu-work-head">
        <h2 className="icdu-work-title">Intent and expertise</h2>
        <p className="icdu-work-lead">This is a visitor draft. Naming a policy does not mean it was ingested. Scripted example scores are not copied onto this draft.</p>
        <p className="icdu-work-meta">Draft {contract.icdu_id} · revision {contract.revision}</p>
      </header>
      {proposal ? (
        <ProposalReview
          testId="contract-proposal"
          field={proposal.field}
          before={proposal.before}
          after={proposal.after}
          onApply={() => workspace.applyPendingProposal()}
          onCancel={() => workspace.cancelProposal()}
        />
      ) : null}
      <div className="icdu-group">
        <h3>Task and outcome</h3>
        <Field id="contract-goal" label="Task" multiline value={contract.intent.primary_goal} onChange={(primary_goal) => workspace.editContract({ intent: { ...contract.intent, primary_goal } })} />
        <Field id="contract-outcome" label="Intended outcome" multiline value={contract.prompt} onChange={(prompt) => workspace.editContract({ prompt })} />
      </div>
      <div className="icdu-group">
        <TextList
          label="Success criteria"
          items={contract.intent.success_criteria}
          onChange={(success_criteria) => workspace.editContract({ intent: { ...contract.intent, success_criteria } })}
        />
      </div>
      <div className="icdu-group">
        <h3>Expertise and principles</h3>
        <TextList
          label="Governing principles"
          items={contract.principles}
          onChange={(principles) => workspace.editContract({ principles })}
        />
        <Field id="contract-domain" label="Relevant expertise" value={contract.context.domain} placeholder="Unset" onChange={(domain) => workspace.editContract({ context: { ...contract.context, domain } })} />
      </div>
      <div className="icdu-group">
        <h3>Context and constraints</h3>
        <TextList
          label="Constraints"
          items={contract.context.constraints}
          onChange={(constraints) => workspace.editContract({ context: { ...contract.context, constraints } })}
        />
        <div className="icdu-actions">
          <button type="button" className="icdu-quiet icdu-focus" onClick={() => workspace.newContract()}>New draft</button>
        </div>
      </div>
      <details>
        <summary>Technical representation</summary>
        <Suspense fallback={<p className="icdu-empty">Loading the record editor…</p>}>
          <Builder />
        </Suspense>
      </details>
    </section>
  );
}

export function EvidenceView() {
  const workspace = useWorkspace();
  const session = useAssistantSession();
  const scenario = getGuidedScenario(workspace.guided?.scenarioId ?? workspace.industryId ?? "");
  if (!scenario || !workspace.guided?.evaluated) {
    return (
      <section className="icdu-work" aria-label="Example evidence">
        <header className="icdu-work-head">
          <h2 className="icdu-work-title">Evidence</h2>
          <p className="icdu-empty">Finish Evaluate on a published example to inspect its scripted record. A visitor draft does not receive measured scores.</p>
        </header>
        <div className="icdu-actions">
          <button type="button" className="icdu-primary icdu-focus" onClick={() => workspace.openView("guided", "manual:guided")}>Open the walkthrough</button>
        </div>
      </section>
    );
  }
  const focus = workspace.task.focus;
  const selected = focus && (focus.kind === "score" || focus.kind === "evidence" || focus.kind === "criterion" || focus.kind === "principle")
    ? evidenceFor(scenario, focus.kind, focus.id)
    : null;
  const choose = (kind: "score" | "criterion" | "principle" | "evidence", id: string) => workspace.setFocus(kind, id);
  return (
    <section className="icdu-work" aria-label="Example evidence">
      <header className="icdu-work-head">
        <h2 className="icdu-work-title">{scenario.title}</h2>
        <p className="icdu-work-lead">Scripted example {scenario.icdu.icdu_id}. These scores are authored for the example, not a live measurement.</p>
      </header>
      <div className="icdu-split">
        <article>
          <p className="icdu-label">Before</p>
          <p>{scenario.unstructuredOutcome}</p>
        </article>
        <article>
          <p className="icdu-label">After</p>
          <p>{scenario.governedResponse}</p>
        </article>
      </div>
      <p className="icdu-scoreline">
        IAS {scenario.judge.scores.IAS} · PAS {scenario.judge.scores.PAS} · AS {scenario.judge.scores.AS} · <DecisionMark decision={scenario.judge.decision} />
      </p>
      <p className="icdu-work-meta">Thresholds IAS {scenario.judge.thresholds.IAS_min} · PAS {scenario.judge.thresholds.PAS_min} · AS {scenario.judge.thresholds.AS_min}</p>
      <div className="icdu-scores">
        {(["IAS", "PAS", "AS"] as const).map((score) => (
          <button key={score} type="button" className="icdu-quiet icdu-focus" aria-pressed={focus?.id === score} onClick={() => choose("score", score)}>{score}</button>
        ))}
      </div>
      <div className="icdu-group">
        <h3>Success criteria</h3>
        <ul className="icdu-pick">
          {scenario.successCriteria.map((item) => (
            <li key={item}><button type="button" className="icdu-focus" aria-pressed={focus?.kind === "criterion" && focus.id === item} onClick={() => choose("criterion", item)}>{item}</button></li>
          ))}
        </ul>
      </div>
      <div className="icdu-group">
        <h3>Principles</h3>
        <ul className="icdu-pick">
          {scenario.principles.map((item) => (
            <li key={item}><button type="button" className="icdu-focus" aria-pressed={focus?.kind === "principle" && focus.id === item} onClick={() => choose("principle", item)}>{item}</button></li>
          ))}
        </ul>
      </div>
      <div className="icdu-group">
        <h3>Evidence notes</h3>
        <ul className="icdu-pick">
          {scenario.evidenceSummary.map((item, index) => (
            <li key={item}><button type="button" className="icdu-focus" aria-pressed={focus?.kind === "evidence" && focus.id === String(index)} onClick={() => choose("evidence", String(index))}>{item}</button></li>
          ))}
        </ul>
      </div>
      <div className="icdu-excerpt" data-testid="evidence-detail">
        <p className="icdu-label">Selected record</p>
        <p>{selected ? selected.text : "Select a score, criterion, principle, or evidence note."}</p>
      </div>
      <TechnicalRecord
        title={`Technical record ${scenario.icdu.icdu_id}`}
        data={{ icdu_id: scenario.icdu.icdu_id, scores: scenario.judge.scores, decision: scenario.judge.decision, drivers: scenario.judge.drivers, rationale: scenario.judge.rationale }}
      />
      <div className="icdu-actions">
        <button
          type="button"
          className="icdu-primary icdu-focus"
          onClick={() => session.sendRef.current(ask(`Explain the selected ${focus?.kind ?? "example"} ${focus?.id ?? scenario.judge.decision} using only the displayed record.`))}
        >
          Explain this
        </button>
      </div>
    </section>
  );
}

export function ReadinessView() {
  const workspace = useWorkspace();
  const scenario = getGuidedScenario(workspace.guided?.scenarioId ?? workspace.industryId ?? "");
  if (!scenario) {
    return (
      <section className="icdu-work" aria-label="Readiness exploration">
        <header className="icdu-work-head">
          <h2 className="icdu-work-title">Readiness</h2>
          <p className="icdu-empty">Open a published example first.</p>
        </header>
        <div className="icdu-actions">
          <button type="button" className="icdu-primary icdu-focus" onClick={() => workspace.openView("workflows", "manual:workflows")}>Choose a workflow</button>
        </div>
      </section>
    );
  }
  const original = scenario.judge.thresholds;
  const thresholds = workspace.task.whatIf ?? original;
  const scores = scenario.judge.scores;
  const exploratory = whatIfDecision(scores, thresholds);
  const originalDecision = evaluateGate(scores, original).decision;
  const exploring = workspace.task.whatIf != null;
  const field = (key: "IAS_min" | "PAS_min" | "AS_min", label: string) => (
    <label className="icdu-slider">
      <span className="icdu-slider-top">
        <span className="icdu-label">{label}</span>
        <span className="icdu-num">{thresholds[key].toFixed(2)}</span>
      </span>
      <input
        type="range"
        min={0.5}
        max={0.99}
        step={0.01}
        value={thresholds[key]}
        onChange={(event) => workspace.setWhatIf({ ...thresholds, [key]: Number(event.target.value) })}
      />
      <span className="icdu-slider-ends">
        <span>0.50</span>
        <span>Original {original[key].toFixed(2)}</span>
        <span>0.99</span>
      </span>
    </label>
  );
  return (
    <section className="icdu-work" aria-label="Readiness exploration">
      <header className="icdu-work-head">
        <h2 className="icdu-work-title">Readiness</h2>
        <p className="icdu-work-lead">The example scores stay fixed. These thresholds are local and do not change the published result.</p>
      </header>
      <div className="icdu-split">
        <article>
          <p className="icdu-label">Original decision</p>
          <p><DecisionMark decision={originalDecision} /></p>
        </article>
        <article>
          <p className="icdu-label">{exploring ? "Exploratory decision" : "Decision at the published thresholds"}</p>
          <p><DecisionMark decision={exploratory.decision} /></p>
        </article>
      </div>
      <p className="icdu-work-lead">{exploratory.rule}</p>
      <p className="icdu-scoreline">Displayed scores remain IAS {formatGatePercent(scores.IAS)}, PAS {formatGatePercent(scores.PAS)}, AS {formatGatePercent(scores.AS)}.</p>
      {field("IAS_min", "Intent-Alignment Score threshold")}
      {field("PAS_min", "Principle-Adherence Score threshold")}
      {field("AS_min", "Application Score threshold")}
      <div className="icdu-actions">
        <button type="button" className="icdu-quiet icdu-focus" onClick={() => workspace.setWhatIf(null)} disabled={!exploring}>Reset thresholds</button>
      </div>
    </section>
  );
}

export function ReviewView() {
  const session = useAssistantSession();
  const workspace = useWorkspace();
  return (
    <section className="icdu-work" aria-label="Human review">
      <header className="icdu-work-head">
        <h2 className="icdu-work-title">Human review</h2>
        <p className="icdu-work-lead">Human ratings use the published 1 to 5 rubric. They are not averaged with scripted 0 to 1 Judge scores.</p>
      </header>
      <RubricPanel embedded />
      <div className="icdu-actions">
        <button
          type="button"
          className="icdu-quiet icdu-focus"
          onClick={() => {
            const review = workspace.task.review;
            const summary = review.saved
              ? `Discuss the saved human review for ${review.sourceId} revision ${review.sourceRevision}. Notes: ${review.notes || "none"}. Ratings are 1 to 5 and are not Judge scores.`
              : "The human review is not saved yet. Explain the 1 to 5 rubric without inventing ratings.";
            session.sendRef.current(ask(summary));
          }}
        >
          Discuss this review
        </button>
      </div>
    </section>
  );
}

export function CompareView() {
  const workspace = useWorkspace();
  const [left, right] = workspace.task.compareIds;
  const first = getGuidedScenario(left);
  const second = getGuidedScenario(right);
  const rows = first && second
    ? [
        ["Goal", first.businessTask, second.businessTask],
        ["Outcome", first.intendedOutcome, second.intendedOutcome],
        ["Rules", first.principles.join("; "), second.principles.join("; ")],
        ["Constraints", first.constraints.join("; "), second.constraints.join("; ")],
        ["Success criteria", first.successCriteria.join("; "), second.successCriteria.join("; ")],
        ["Before", first.unstructuredOutcome, second.unstructuredOutcome],
        ["After", first.governedResponse, second.governedResponse],
        ["Evidence notes", `${first.evidenceSummary.length}. Scripted scores stay on the example record and are not a ranking.`, `${second.evidenceSummary.length}. Scripted scores stay on the example record and are not a ranking.`],
      ]
    : [];
  return (
    <section className="icdu-work" aria-label="Scenario comparison">
      <header className="icdu-work-head">
        <h2 className="icdu-work-title">Compare examples</h2>
        <p className="icdu-work-lead">Published examples side by side. Scripted scores are not a performance leaderboard. The open walkthrough stays where it is.</p>
      </header>
      <div className="icdu-compare-picks">
        {[left, right].map((id, index) => (
          <label key={index} className="icdu-field">
            <span className="icdu-label">Example {index + 1}</span>
            <select
              className="icdu-control"
              value={id}
              aria-label={`Example ${index + 1}`}
              onChange={(event) => workspace.setCompare(index === 0 ? event.target.value : left, index === 1 ? event.target.value : right)}
            >
              {guidedScenarios.map((scenario) => <option key={scenario.id} value={scenario.id}>{scenario.title}</option>)}
            </select>
          </label>
        ))}
      </div>
      {first && second ? (
        <div className="icdu-compare">
          <div className="icdu-compare-head">
            <span />
            <strong>{first.title}</strong>
            <strong>{second.title}</strong>
          </div>
          {rows.map(([label, a, b]) => (
            <div className="icdu-compare-row" key={label}>
              <div className="icdu-compare-label">{label}</div>
              <div data-example={first.title}><p>{a}</p></div>
              <div data-example={second.title}><p>{b}</p></div>
            </div>
          ))}
        </div>
      ) : null}
      <div className="icdu-actions">
        <button type="button" className="icdu-primary icdu-focus" onClick={() => workspace.selectScenario(left, false, `compare:${left}`)}>Start this scenario</button>
      </div>
    </section>
  );
}

const assumptionKeys = ["workflows", "dayRate", "incidentProb", "incidentCost", "auditCycles"] as const;

function exampleAssumptions(name: "current" | RoiSetName): RoiInputs {
  if (name === "pilot") return { ...roiCalculatorDefaults, workflows: 5 };
  if (name === "rollout") return { ...roiCalculatorDefaults, workflows: 25 };
  return { ...roiCalculatorDefaults };
}

function formatAssumption(key: (typeof assumptionKeys)[number], value: number): string {
  if (key === "dayRate") return `${formatBusinessCurrency(value)}/day`;
  if (key === "incidentProb") return `${value}%`;
  if (key === "incidentCost") return formatBusinessCurrency(value);
  return String(value);
}

function sameAssumptions(left: RoiInputs, right: RoiInputs): boolean {
  return assumptionKeys.every((key) => left[key] === right[key]);
}

function versusCurrent(base: number, next: number, format: (value: number) => string): string {
  const diff = next - base;
  if (diff === 0) return "Same as current";
  const sign = diff > 0 ? "+" : "−";
  return `${sign}${format(Math.abs(diff))} vs current`;
}

export function ValueComparison() {
  const workspace = useWorkspace();
  const currentInputs = workspace.roiInputs;
  const pilotInputs = workspace.task.roiSets.pilot;
  const rolloutInputs = workspace.task.roiSets.rollout;
  const current = calculateRoi(currentInputs);
  const pilot = calculateRoi(pilotInputs);
  const rollout = calculateRoi(rolloutInputs);
  const sets = [
    { name: "current" as const, label: "Current", inputs: currentInputs, results: current },
    { name: "pilot" as const, label: "Pilot", inputs: pilotInputs, results: pilot },
    { name: "rollout" as const, label: "Rollout", inputs: rolloutInputs, results: rollout },
  ];
  const chartData = sets.map((set) => ({
    name: set.label,
    net: set.results.netBenefit,
    roi: set.results.roi,
  }));
  const chartConfig = {
    net: { label: "Modeled 3-year net benefit", color: "var(--icdu-accent)" },
  };
  const renderSet = (name: RoiSetName) => {
    const inputs = workspace.task.roiSets[name];
    const example = exampleAssumptions(name);
    const selected = sameAssumptions(currentInputs, inputs);
    const focused = workspace.task.focus?.kind === "assumption" && workspace.task.focus.id === name;
    const title = name === "pilot" ? "Pilot" : "Rollout";
    return (
      <article key={name} className="icdu-set" data-selected={selected ? "true" : "false"} data-focused={focused ? "true" : undefined}>
        <header>
          <h3>{title}</h3>
          <p>{selected ? "Selected. These assumptions match the open calculator." : "Named set. Apply copies these assumptions into the open calculator."}</p>
        </header>
        <div className="icdu-assumptions">
          {assumptionKeys.map((key) => (
            <label key={key} className="icdu-assumption" htmlFor={`${name}-${key}`}>
              <span className="icdu-assumption-top">
                <span className="icdu-label">{roiCalculatorRanges[key].label}</span>
                <span className="icdu-assumption-value">{formatAssumption(key, inputs[key])}</span>
              </span>
              <input
                id={`${name}-${key}`}
                className="icdu-range"
                type="range"
                min={roiCalculatorRanges[key].min}
                max={roiCalculatorRanges[key].max}
                step={roiCalculatorRanges[key].step}
                value={inputs[key]}
                aria-valuetext={formatAssumption(key, inputs[key])}
                onChange={(event) => {
                  const applied = applyRoiInputs(inputs, { [key]: Number(event.target.value) });
                  if (applied.ok) workspace.editRoiSet(name, applied.inputs);
                }}
              />
              <span className="icdu-slider-ends">
                <span>{formatAssumption(key, roiCalculatorRanges[key].min)}</span>
                <span>{formatAssumption(key, roiCalculatorRanges[key].max)}</span>
              </span>
              {inputs[key] !== example[key] ? (
                <span className="icdu-assumption-help">Example start {formatAssumption(key, example[key])}</span>
              ) : (
                <span className="icdu-assumption-help">{roiCalculatorRanges[key].help}</span>
              )}
            </label>
          ))}
        </div>
        <p className="icdu-work-meta">
          Modeled ROI {name === "pilot" ? pilot.roi : rollout.roi}% versus current {current.roi}%. Modeled estimate, not a quote.
        </p>
        <div className="icdu-actions">
          <button type="button" className="icdu-primary icdu-focus" onClick={() => workspace.requestApplyRoiSet(name, `apply-${name}`)}>
            Apply these assumptions
          </button>
          <button
            type="button"
            className="icdu-quiet icdu-focus"
            disabled={sameAssumptions(inputs, example)}
            onClick={() => workspace.editRoiSet(name, example)}
          >
            Reset set
          </button>
        </div>
      </article>
    );
  };
  return (
    <section className="icdu-work icdu-compare-value" aria-label="Value model comparison">
      <header className="icdu-work-head">
        <h2 className="icdu-work-title">Assumption comparison</h2>
        <p className="icdu-work-lead">{roiResultSummarySentence(currentInputs, current)} Subscription and setup constants in the model are illustrative.</p>
        <p className="icdu-work-meta">
          Illustrative annual subscription {formatBusinessCurrency(roiModelAssumptions.annualSubscriptionUsd)} and setup {formatBusinessCurrency(roiModelAssumptions.yearOneSetupUsd)}. Not a commercial quote.
        </p>
      </header>
      <div className="icdu-table-wrap">
        <table className="icdu-table icdu-value-table">
          <caption>Current calculator compared with the named Pilot and Rollout sets. Figures are modeled estimates.</caption>
          <thead>
            <tr>
              <th>Assumption</th>
              <th>Current</th>
              <th>Pilot</th>
              <th>Rollout</th>
            </tr>
          </thead>
          <tbody>
            {assumptionKeys.map((key) => (
              <tr key={key}>
                <th>{roiCalculatorRanges[key].label}</th>
                <td data-col="Current">
                  <span className="icdu-num">{formatAssumption(key, currentInputs[key])}</span>
                  {currentInputs[key] !== exampleAssumptions("current")[key] ? (
                    <small>Example start {formatAssumption(key, exampleAssumptions("current")[key])}</small>
                  ) : null}
                </td>
                <td data-col="Pilot">
                  <span className="icdu-num">{formatAssumption(key, pilotInputs[key])}</span>
                  <small>{versusCurrent(currentInputs[key], pilotInputs[key], (value) => formatAssumption(key, value))}</small>
                </td>
                <td data-col="Rollout">
                  <span className="icdu-num">{formatAssumption(key, rolloutInputs[key])}</span>
                  <small>{versusCurrent(currentInputs[key], rolloutInputs[key], (value) => formatAssumption(key, value))}</small>
                </td>
              </tr>
            ))}
            <tr>
              <th>Modeled ROI</th>
              <td data-col="Current"><span className="icdu-num">{current.roi}%</span></td>
              <td data-col="Pilot">
                <span className="icdu-num">{pilot.roi}%</span>
                <small>{versusCurrent(current.roi, pilot.roi, (value) => `${value}%`)}</small>
              </td>
              <td data-col="Rollout">
                <span className="icdu-num">{rollout.roi}%</span>
                <small>{versusCurrent(current.roi, rollout.roi, (value) => `${value}%`)}</small>
              </td>
            </tr>
            <tr>
              <th>Modeled net benefit</th>
              <td data-col="Current"><span className="icdu-num">{formatBusinessCurrency(current.netBenefit)}</span></td>
              <td data-col="Pilot">
                <span className="icdu-num">{formatBusinessCurrency(pilot.netBenefit)}</span>
                <small>{versusCurrent(current.netBenefit, pilot.netBenefit, formatBusinessCurrency)}</small>
              </td>
              <td data-col="Rollout">
                <span className="icdu-num">{formatBusinessCurrency(rollout.netBenefit)}</span>
                <small>{versusCurrent(current.netBenefit, rollout.netBenefit, formatBusinessCurrency)}</small>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="icdu-chart-panel">
        <div className="icdu-chart-head">
          <h3>Modeled net benefit</h3>
          <p>Current, Pilot, and Rollout on the same scale. Illustrative, not a quote.</p>
        </div>
        <ChartContainer config={chartConfig} className="icdu-chart-plot is-compare aspect-auto">
          <BarChart data={chartData} margin={{ top: 12, right: 8, left: 4, bottom: 4 }}>
            <CartesianGrid stroke="var(--icdu-border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "var(--icdu-fg-muted)", fontSize: 13 }} />
            <YAxis width={64} tickLine={false} axisLine={false} tick={{ fill: "var(--icdu-fg-muted)", fontSize: 13 }} tickFormatter={(value) => formatBusinessCurrency(value as number)} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, _name, item) => (
                    <span>
                      {item?.payload?.name ?? "Set"}: {formatBusinessCurrency(value as number)} modeled net benefit, {item?.payload?.roi}% ROI
                    </span>
                  )}
                />
              }
            />
            <Bar dataKey="net" radius={[6, 6, 0, 0]} barSize={48} maxBarSize={64}>
              {chartData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.name === "Current" ? "var(--icdu-accent)" : entry.name === "Pilot" ? "var(--icdu-series-cost)" : "var(--icdu-green)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
        <ul className="icdu-legend">
          <li><span className="icdu-swatch" style={{ background: "var(--icdu-accent)" }} />Current {formatBusinessCurrency(current.netBenefit)}</li>
          <li><span className="icdu-swatch" style={{ background: "var(--icdu-series-cost)" }} />Pilot {formatBusinessCurrency(pilot.netBenefit)}</li>
          <li><span className="icdu-swatch" style={{ background: "var(--icdu-green)" }} />Rollout {formatBusinessCurrency(rollout.netBenefit)}</li>
        </ul>
      </div>
      {renderSet("pilot")}
      {renderSet("rollout")}
    </section>
  );
}

export function PilotView() {
  const workspace = useWorkspace();
  const pilot = workspace.task.pilot;
  const proposal = workspace.task.proposal?.target === "pilot" ? workspace.task.proposal : null;
  return (
    <section className="icdu-work icdu-pilot" aria-label="Pilot plan">
      <header className="icdu-work-head">
        <h2 className="icdu-work-title">Pilot plan</h2>
        <p className="icdu-work-lead">{pilotPathPanel.estimateNote} This prepares a plan. It does not book a meeting or create an account.</p>
      </header>
      {proposal ? (
        <ProposalReview
          field={proposal.field}
          before={proposal.before}
          after={proposal.after}
          onApply={() => workspace.applyPendingProposal()}
          onCancel={() => workspace.cancelProposal()}
        />
      ) : null}
      <p className="icdu-work-meta">
        {[
          pilot.owner ? null : "Owner unset",
          pilot.stakeholders ? null : "Stakeholders unset",
          pilot.criteria ? null : "Success criteria unset",
          pilot.baseline ? null : "Baseline unset",
          "Dates unset",
        ].filter(Boolean).join(" · ")}
      </p>
      <div className="icdu-group">
        <h3>Scope</h3>
        <Field id="pilot-outcome" label="Intended outcome" multiline value={pilot.outcome} placeholder="Unset" onChange={(outcome) => workspace.editPilot({ outcome })} />
      </div>
      <div className="icdu-group">
        <h3>Success criteria</h3>
        <Field id="pilot-criteria" label="What would count as success" multiline value={pilot.criteria} placeholder="Unset" onChange={(criteria) => workspace.editPilot({ criteria })} />
        {!pilot.criteria ? <p className="icdu-empty">No success criteria recorded yet.</p> : null}
      </div>
      <div className="icdu-group">
        <h3>Owners and stakeholders</h3>
        <div className="icdu-field-row">
          <Field id="pilot-owner" label="Owner" multiline value={pilot.owner} placeholder="Unset" onChange={(owner) => workspace.editPilot({ owner })} />
          <Field id="pilot-stakeholders" label="Stakeholders" multiline value={pilot.stakeholders} placeholder="Unset" onChange={(stakeholders) => workspace.editPilot({ stakeholders })} />
        </div>
        {!pilot.owner && !pilot.stakeholders ? <p className="icdu-empty">No owner or stakeholders are assigned. Names stay blank until you enter them.</p> : null}
      </div>
      <div className="icdu-group">
        <h3>Dependencies and unknowns</h3>
        <Field id="pilot-baseline" label="Baseline to collect" multiline value={pilot.baseline} placeholder="Unset" onChange={(baseline) => workspace.editPilot({ baseline })} />
        <Field id="pilot-dependencies" label="Dependencies" multiline value={pilot.dependencies} placeholder="Unset" onChange={(dependencies) => workspace.editPilot({ dependencies })} />
        <Field id="pilot-questions" label="Unresolved questions" multiline value={pilot.questions} placeholder="Unset" onChange={(questions) => workspace.editPilot({ questions })} />
      </div>
      <div className="icdu-group">
        <h3>Proposed phases</h3>
        <p className="icdu-work-meta">This is an estimated sequence for one workflow. It is not recorded progress and not a commitment. No phase is marked complete.</p>
        <ol className="icdu-phase-track">
          {pilot.phases.map((phase, index) => (
            <li key={phase.stage}>
              <span className="icdu-phase-kicker">Proposed · {phase.stage}</span>
              <strong>{phase.title}</strong>
              <p>{phase.action}</p>
              <p className="icdu-phase-who">{phase.who ? `Suggested roles: ${phase.who}` : "Suggested roles unset"}</p>
              <span className="icdu-phase-index">{index + 1} of {pilot.phases.length}</span>
            </li>
          ))}
        </ol>
        <p className="icdu-empty">Recorded progress: none. Dates are unset and are not filled in from the estimate.</p>
      </div>
    </section>
  );
}

export function BriefView() {
  const workspace = useWorkspace();
  const scenario = getGuidedScenario(workspace.guided?.scenarioId ?? "");
  const evidence = scenario && workspace.guided?.evaluated
    ? `Scripted example ${scenario.icdu.icdu_id}: IAS ${scenario.judge.scores.IAS}, PAS ${scenario.judge.scores.PAS}, AS ${scenario.judge.scores.AS}, ${scenario.judge.decision}.`
    : null;
  const capture = (): BriefFacts => briefFacts({
    scenarioTitle: scenario?.title ?? null,
    contract: workspace.contract,
    evidence,
    review: workspace.task.review,
    roiLine: workspace.roiSummaryText,
    pilot: workspace.task.pilot,
  });
  const [facts, setFacts] = useState<BriefFacts>(capture);
  const rendered = renderBrief(facts);
  const download = (filename: string, contents: string, type: string) => {
    const blob = new Blob([contents], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <section className="icdu-work" aria-label="Takeaway brief">
      <article className="icdu-brief" data-testid="brief-preview">
        <h2>ICDU pilot brief</h2>
        <p>Draft assembled from selected workspace snapshots. Scripted evidence is not a live measurement. Calculator figures are modeled estimates.</p>
        <h3>Workflow</h3>
        <p>{facts.workflow}</p>
        <h3>Contract draft</h3>
        <p>{facts.contractId} · revision {facts.contractRevision}</p>
        <p>{facts.goal}</p>
        <h3>Example evidence</h3>
        <p>{facts.evidence}</p>
        <h3>Human review</h3>
        <p>{facts.review}</p>
        <h3>Value model</h3>
        <p>{facts.roi}</p>
        <h3>Pilot plan</h3>
        <p>{facts.pilot}</p>
        <p>Unknown owners, baselines, and dates stay unset. The published pilot duration is an estimate, not a commitment.</p>
      </article>
      <div className="icdu-actions">
        <button type="button" className="icdu-quiet icdu-focus" onClick={() => setFacts(capture())}>Refresh from current work</button>
        <button type="button" className="icdu-primary icdu-focus" onClick={() => navigator.clipboard.writeText(rendered.markdown)}>Copy</button>
        <button type="button" className="icdu-quiet icdu-focus" onClick={() => download("icdu-brief.md", rendered.markdown, "text/markdown")}>Download Markdown</button>
        <button type="button" className="icdu-quiet icdu-focus" onClick={() => download("icdu-brief.html", rendered.html, "text/html")}>Download HTML</button>
      </div>
    </section>
  );
}
