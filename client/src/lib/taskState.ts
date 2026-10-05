// Visitor task state shared by the conversation and the legacy pages.
// Published examples stay separate from drafts. Scripted scores are not copied onto a draft.

import { calculateRoi, pilotPathPanel, roiCalculatorDefaults, type RoiInputs, type RoiResults } from "@/data/businessCase";
import { getGuidedScenario, type GuidedScenario } from "@/data/guidedScenarios";
import { hitlRubricDimensions } from "@/data/examples";
import {
  AS_HARD_BLOCK_BELOW,
  IAS_HARD_BLOCK_BELOW,
  defaultGateThresholds,
  evaluateGate,
  type GateDecision,
  type GateScores,
  type GateThresholds,
} from "@/lib/gateDecision";
import { applyRoiInputs } from "@/lib/roiEdit";

export const TASK_STORAGE_KEY = "icdu-task-state-v1";
export const TASK_STORAGE_VERSION = 1 as const;

export const FOCUS_KINDS = ["field", "score", "evidence", "criterion", "principle", "assumption"] as const;
export type FocusKind = (typeof FOCUS_KINDS)[number];

export type ContractDraft = {
  icdu_id: string;
  revision: number;
  created_at: string;
  icdu_version: "0.1";
  version: "1.0.0";
  trace: { parent_icdu_id: string; change_note: string };
  sourceScenarioId: string | null;
  owner_team: string;
  policy_set_id: string;
  evaluation_profile_id: string;
  intent: { primary_goal: string; success_criteria: string[] };
  principles: string[];
  persona: { role: string; tone: string };
  context: { domain: string; constraints: string[] };
  prompt: string;
};

export type StoredJudgeResult = {
  scores: GateScores;
  decision: GateDecision;
  thresholds: GateThresholds;
  rationale: string[];
  drivers: { metric: string; impact: number; reason: string; icduField: string }[];
  toPromote: { action: string; impact: string; priority: "high" | "medium" | "low" }[];
};

export type IllustrativeJudge = {
  sourceId: string;
  sourceRevision: number;
  scores: GateScores;
  decision: GateDecision;
  simulated: true;
  label: "Illustrative demo. Not a measurement of this draft.";
  result?: StoredJudgeResult;
};

export type HumanReview = {
  sourceId: string | null;
  sourceRevision: number | null;
  scores: Record<string, number>;
  notes: string;
  saved: boolean;
};

export type StressRow = {
  id: string;
  label: string;
  type?: string;
  insight?: string;
  stability: number;
  fairness: number;
  refusal: number;
  hallucination: number;
  status: "pass" | "warn" | "fail";
};

export type StressRun = {
  sourceId: string;
  sourceRevision: number;
  selection: string[];
  rows: StressRow[];
  simulated: true;
};

export type RoiSetName = "pilot" | "rollout";

export type PilotPhase = { stage: string; title: string; action: string; who: string };

export type PilotDraft = {
  revision: number;
  workflowId: string | null;
  outcome: string;
  owner: string;
  stakeholders: string;
  criteria: string;
  baseline: string;
  dependencies: string;
  questions: string;
  phases: PilotPhase[];
};

export type Proposal = {
  operationId: string;
  target: "contract" | "pilot";
  field: string;
  before: string;
  after: string;
  baseRevision: number;
};

export type TaskState = {
  contract: ContractDraft;
  judge: IllustrativeJudge | null;
  review: HumanReview;
  stress: StressRun | null;
  roiSets: Record<RoiSetName, RoiInputs>;
  pilot: PilotDraft;
  proposal: Proposal | null;
  focus: { kind: FocusKind; id: string } | null;
  whatIf: GateThresholds | null;
  compareIds: [string, string];
};

const TEXT_MAX = 400;
const LIST_MAX = 8;

function clip(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, TEXT_MAX);
}

function clipList(values: string[]): string[] {
  return values.map(clip).filter(Boolean).slice(0, LIST_MAX);
}

export function createDraftId(): string {
  const bytes = new Uint8Array(8);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  const hex = Array.from(bytes).map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `icdu-draft-${hex}`;
}

function blankReview(): HumanReview {
  const scores: Record<string, number> = {};
  for (const dimension of hitlRubricDimensions) scores[dimension.id] = 3;
  return { sourceId: null, sourceRevision: null, scores, notes: "", saved: false };
}

export function freshPilot(workflowId: string | null = null): PilotDraft {
  return {
    revision: 1,
    workflowId,
    outcome: "",
    owner: "",
    stakeholders: "",
    criteria: "",
    baseline: "",
    dependencies: "",
    questions: "",
    phases: pilotPathPanel.phases.map((phase) => ({
      stage: phase.stage,
      title: phase.title,
      action: phase.action,
      who: phase.who,
    })),
  };
}

export function freshContract(scenario?: GuidedScenario | null): ContractDraft {
  const published = scenario?.icdu;
  return {
    icdu_id: createDraftId(),
    revision: 1,
    created_at: new Date().toISOString(),
    icdu_version: "0.1",
    version: "1.0.0",
    trace: { parent_icdu_id: "", change_note: "" },
    sourceScenarioId: scenario?.id ?? null,
    owner_team: published?.owner_team ?? "",
    policy_set_id: published?.policy_set_id ?? "",
    evaluation_profile_id: published?.evaluation_profile_id ?? "",
    intent: {
      primary_goal: published?.intent.primary_goal ?? scenario?.businessTask ?? "",
      success_criteria: [...(published?.intent.success_criteria ?? scenario?.successCriteria ?? [])],
    },
    principles: [...(published?.principles ?? scenario?.principles ?? [])],
    persona: {
      role: published?.persona.role ?? "",
      tone: published?.persona.tone ?? "",
    },
    context: {
      domain: published?.context.domain ?? "",
      constraints: [...(published?.context.constraints ?? scenario?.constraints ?? [])],
    },
    prompt: published?.prompt ?? scenario?.intendedOutcome ?? "",
  };
}

export function freshTask(scenarioId: string | null = null): TaskState {
  const scenario = scenarioId ? getGuidedScenario(scenarioId) : undefined;
  return {
    contract: freshContract(scenario),
    judge: null,
    review: blankReview(),
    stress: null,
    roiSets: {
      pilot: { ...roiCalculatorDefaults, workflows: 5 },
      rollout: { ...roiCalculatorDefaults, workflows: 25 },
    },
    pilot: freshPilot(scenarioId),
    proposal: null,
    focus: null,
    whatIf: null,
    compareIds: ["healthcare-admin", "document-review"],
  };
}

function hashUnit(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) hash = Math.imul(hash ^ seed.charCodeAt(i), 16777619);
  return (hash >>> 0) / 4294967295;
}

export function illustrativeScores(seed: string): GateScores {
  const round = (salt: string, span: number, floor: number) => Math.round((floor + hashUnit(`${seed}:${salt}`) * span) * 100) / 100;
  return {
    IAS: round("ias", 0.35, 0.6),
    PAS: round("pas", 0.35, 0.6),
    AS: round("as", 0.4, 0.55),
  };
}

export function runIllustrativeJudge(contract: ContractDraft): IllustrativeJudge {
  const scores = illustrativeScores(`${contract.icdu_id}:${contract.revision}`);
  return {
    sourceId: contract.icdu_id,
    sourceRevision: contract.revision,
    scores,
    decision: evaluateGate(scores).decision,
    simulated: true,
    label: "Illustrative demo. Not a measurement of this draft.",
    result: {
      scores,
      decision: evaluateGate(scores).decision,
      thresholds: defaultGateThresholds,
      rationale: ["Illustrative demo. Not a measurement of this draft."],
      drivers: [],
      toPromote: [],
    },
  };
}

export function judgeIsCurrent(contract: ContractDraft, judge: IllustrativeJudge | null): boolean {
  return Boolean(judge && judge.sourceId === contract.icdu_id && judge.sourceRevision === contract.revision);
}

export function runStress(contract: ContractDraft, selection: { id: string; label: string }[]): StressRun {
  const rows = selection.map((item) => {
    const seed = `${contract.icdu_id}:${contract.revision}:${item.id}`;
    const stability = Math.round((0.65 + hashUnit(`${seed}:s`) * 0.3) * 100) / 100;
    const fairness = Math.round((0.7 + hashUnit(`${seed}:f`) * 0.25) * 100) / 100;
    const refusal = Math.round((0.6 + hashUnit(`${seed}:r`) * 0.35) * 100) / 100;
    const hallucination = Math.round(hashUnit(`${seed}:h`) * 0.15 * 100) / 100;
    const status: StressRow["status"] =
      stability >= 0.85 && fairness >= 0.85 && hallucination < 0.05
        ? "pass"
        : stability < 0.7 || fairness < 0.7 || hallucination > 0.1
          ? "fail"
          : "warn";
    return { id: item.id, label: item.label, stability, fairness, refusal, hallucination, status };
  });
  return {
    sourceId: contract.icdu_id,
    sourceRevision: contract.revision,
    selection: selection.map((item) => item.id),
    rows,
    simulated: true,
  };
}

export function bumpContract(contract: ContractDraft, patch: Partial<ContractDraft>): ContractDraft {
  return {
    ...contract,
    ...patch,
    icdu_id: contract.icdu_id,
    created_at: contract.created_at,
    icdu_version: contract.icdu_version,
    version: contract.version,
    revision: contract.revision + 1,
    intent: patch.intent ?? contract.intent,
    persona: patch.persona ?? contract.persona,
    context: patch.context ?? contract.context,
  };
}

export function applyProposal(task: TaskState): TaskState {
  const proposal = task.proposal;
  if (!proposal) return task;
  if (proposal.target === "pilot") {
    const pilot = { ...task.pilot, revision: task.pilot.revision + 1 };
    if (proposal.field === "outcome") pilot.outcome = proposal.after;
    else if (proposal.field === "owner") pilot.owner = proposal.after;
    else if (proposal.field === "stakeholders") pilot.stakeholders = proposal.after;
    else if (proposal.field === "criteria") pilot.criteria = proposal.after;
    else if (proposal.field === "dependencies") pilot.dependencies = proposal.after;
    else if (proposal.field === "questions") pilot.questions = proposal.after;
    else if (proposal.field === "baseline") pilot.baseline = proposal.after;
    else return { ...task, proposal: null };
    return { ...task, pilot, proposal: null };
  }
  if (proposal.baseRevision !== task.contract.revision) return { ...task, proposal: null };
  const contract = { ...task.contract, revision: task.contract.revision + 1 };
  if (proposal.field === "primary_goal") contract.intent = { ...contract.intent, primary_goal: proposal.after };
  else if (proposal.field === "prompt") contract.prompt = proposal.after;
  else if (proposal.field === "domain") contract.context = { ...contract.context, domain: proposal.after };
  else if (proposal.field === "criterion") contract.intent = { ...contract.intent, success_criteria: clipList([...contract.intent.success_criteria, proposal.after]) };
  else if (proposal.field === "principle") contract.principles = clipList([...contract.principles, proposal.after]);
  else if (proposal.field === "constraint") contract.context = { ...contract.context, constraints: clipList([...contract.context.constraints, proposal.after]) };
  else return { ...task, proposal: null };
  return { ...task, contract, proposal: null };
}

/** Item links only where a published driver restates that requirement. */
const reviewedEvidenceLinks: Record<string, { kind: "criterion" | "principle"; id: string; metric: "IAS" | "PAS" | "AS" }[]> = {
  "healthcare-admin": [
    {
      kind: "criterion",
      id: "Administrative information only, using plan-document language for preventive visits",
      metric: "IAS",
    },
    {
      kind: "criterion",
      id: "Insurer confirmation steps are included, and clinical advice is refused",
      metric: "AS",
    },
    {
      kind: "principle",
      id: "No diagnosis, treatment, or medication guidance, and do not reinterpret plan language clinically.",
      metric: "PAS",
    },
    {
      kind: "principle",
      id: "Always include confirmation with the insurer or plan administrator, and escalate urgent medical concerns to appropriate care channels.",
      metric: "AS",
    },
  ],
  "support-escalation": [
    {
      kind: "criterion",
      id: "The issue is restated accurately, with a concrete correction path",
      metric: "AS",
    },
    {
      kind: "principle",
      id: "Acknowledge the customer's frustration before explaining, and never invent credits, SLAs, or policy exceptions.",
      metric: "PAS",
    },
  ],
  "document-review": [
    {
      kind: "criterion",
      id: "Each flagged change cites a clause, and risks are labeled as document facts or open questions",
      metric: "AS",
    },
    {
      kind: "principle",
      id: "Cite clause numbers for every material claim, and separate facts in the document from recommendations.",
      metric: "IAS",
    },
  ],
};

export function evidenceFor(scenario: GuidedScenario, kind: FocusKind, id: string): { mapped: boolean; text: string } {
  if (kind === "score") {
    const driver = scenario.judge.drivers.find((item) => item.metric === id);
    if (!driver) return { mapped: false, text: "This example has no recorded driver for that score." };
    const rationale = scenario.judge.rationale.join(" ");
    return { mapped: true, text: rationale ? `${driver.reason} ${rationale}` : driver.reason };
  }
  if (kind === "evidence") {
    const index = Number(id);
    const line = scenario.evidenceSummary[index];
    if (!line) return { mapped: false, text: "That evidence item is not in the published record." };
    return { mapped: true, text: line };
  }
  if (kind === "criterion") {
    const criterion = scenario.successCriteria.find((item) => item === id);
    if (!criterion) return { mapped: false, text: "That success criterion is not in this example." };
    return reviewedLink(scenario, "criterion", id, "This example has no recorded mapping for that success criterion.");
  }
  if (kind === "principle") {
    const principle = scenario.principles.find((item) => item === id);
    if (!principle) return { mapped: false, text: "That principle is not in this example." };
    return reviewedLink(scenario, "principle", id, "This example has no recorded mapping for that principle.");
  }
  return { mapped: false, text: "That focus is not an evidence target." };
}

function reviewedLink(
  scenario: GuidedScenario,
  kind: "criterion" | "principle",
  id: string,
  missing: string,
): { mapped: boolean; text: string } {
  const link = reviewedEvidenceLinks[scenario.id]?.find((item) => item.kind === kind && item.id === id);
  const driver = link ? scenario.judge.drivers.find((item) => item.metric === link.metric) : undefined;
  if (!driver) return { mapped: false, text: missing };
  return { mapped: true, text: driver.reason };
}

export function whatIfDecision(scores: GateScores, thresholds: GateThresholds): { decision: GateDecision; rule: string } {
  const outcome = evaluateGate(scores, thresholds);
  if (outcome.pasBlocks) {
    return { decision: outcome.decision, rule: "PAS below its threshold blocks, even when IAS and AS would pass." };
  }
  if (outcome.iasHardFailure) {
    return { decision: outcome.decision, rule: `IAS is below the hard-failure floor of ${IAS_HARD_BLOCK_BELOW}.` };
  }
  if (outcome.asHardFailure) {
    return { decision: outcome.decision, rule: `AS is below the hard-failure floor of ${AS_HARD_BLOCK_BELOW}.` };
  }
  if (outcome.decision === "PROMOTE") {
    return { decision: outcome.decision, rule: "IAS, PAS, and AS each meet the exploratory thresholds." };
  }
  return { decision: outcome.decision, rule: "A score is below its promote threshold and above the hard-failure floors, so the exploratory result is ESCALATE." };
}

export function compareRoi(current: RoiInputs, named: RoiInputs): { current: RoiResults; named: RoiResults } {
  return { current: calculateRoi(current), named: calculateRoi(named) };
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type BriefFacts = {
  workflow: string;
  contractId: string;
  contractRevision: number;
  goal: string;
  evidence: string;
  review: string;
  roi: string;
  pilot: string;
};

function closeSentence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

export function briefFacts(input: {
  scenarioTitle: string | null;
  contract: ContractDraft;
  evidence: string | null;
  review: HumanReview;
  roiLine: string;
  pilot: PilotDraft;
}): BriefFacts {
  const review = input.review.saved
    ? `Human review saved against ${input.review.sourceId ?? "unspecified"} revision ${input.review.sourceRevision ?? "unset"}. Notes: ${closeSentence(input.review.notes || "none")}`
    : "No saved human review.";
  return {
    workflow: input.scenarioTitle ?? "No workflow selected.",
    contractId: input.contract.icdu_id,
    contractRevision: input.contract.revision,
    goal: input.contract.intent.primary_goal || "Goal not set.",
    evidence: input.evidence ?? "No scripted example is selected. A visitor draft does not have measured scores.",
    review,
    roi: input.roiLine,
    pilot: [
      input.pilot.outcome || "Outcome not set.",
      input.pilot.owner ? `Owner: ${closeSentence(input.pilot.owner)}` : "Owner is unset.",
      input.pilot.stakeholders ? `Stakeholders: ${closeSentence(input.pilot.stakeholders)}` : "Stakeholders are unset.",
      input.pilot.criteria ? `Success criteria: ${closeSentence(input.pilot.criteria)}` : "Success criteria are unset.",
      input.pilot.baseline ? `Baseline: ${closeSentence(input.pilot.baseline)}` : "Baseline is unset.",
      input.pilot.dependencies ? `Dependencies: ${closeSentence(input.pilot.dependencies)}` : "Dependencies are unset.",
      input.pilot.questions ? `Unresolved questions: ${closeSentence(input.pilot.questions)}` : "Unresolved questions are unset.",
      `Proposed phases, estimate only, not recorded progress: ${input.pilot.phases.map((phase) => `${phase.stage} ${phase.title}`).join("; ")}. Dates are unset.`,
    ].join(" "),
  };
}

export function renderBrief(facts: BriefFacts): { markdown: string; html: string } {
  const markdown = [
    "# ICDU pilot brief",
    "",
    "Draft assembled from selected workspace snapshots. Scripted evidence is not a live measurement. Calculator figures are modeled estimates.",
    "",
    `## Workflow`,
    facts.workflow,
    "",
    `## Contract draft`,
    `${facts.contractId} · revision ${facts.contractRevision}`,
    facts.goal,
    "",
    `## Example evidence`,
    facts.evidence,
    "",
    `## Human review`,
    facts.review,
    "",
    `## Value model`,
    facts.roi,
    "",
    `## Pilot plan`,
    facts.pilot,
    "",
    "Unknown owners, baselines, and dates stay unset. The published pilot duration is an estimate, not a commitment.",
  ].join("\n");
  const body = markdown
    .split("\n")
    .map((line) => {
      if (!line) return "";
      if (line.startsWith("# ")) return `<h1>${escapeHtml(line.slice(2))}</h1>`;
      if (line.startsWith("## ")) return `<h2>${escapeHtml(line.slice(3))}</h2>`;
      return `<p>${escapeHtml(line)}</p>`;
    })
    .join("");
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>ICDU pilot brief</title><style>
    :root{color-scheme:light}
    body{margin:0;background:#fff;color:#182635;font:16px/1.55 Georgia,"Iowan Old Style",Palatino,serif}
    article{max-width:40rem;margin:0 auto;padding:48px 32px}
    h1{margin:0 0 8px;font-size:26px;font-weight:500;line-height:1.25;break-after:avoid}
    h2{margin:16px 0 4px;font-size:17px;font-weight:600;line-height:1.3;break-after:avoid}
    p{margin:0 0 6px;overflow-wrap:anywhere;orphans:2;widows:2}
    @page{margin:0.6in;size:auto}
    @media print{
      body{background:#fff;color:#182635;-webkit-print-color-adjust:exact;print-color-adjust:exact}
      article{max-width:none;margin:0;padding:0}
      h1,h2{break-after:avoid}
      h2+p{break-before:avoid}
      article p:last-child{break-before:avoid}
    }
  </style></head><body><article>${body}</article></body></html>`;
  return { markdown, html };
}

export function validateFocus(scenario: GuidedScenario | null, kind: string, id: string): { ok: true; focus: { kind: FocusKind; id: string } } | { ok: false; error: string } {
  if (!FOCUS_KINDS.includes(kind as FocusKind)) return { ok: false, error: "That focus is not supported." };
  const focusKind = kind as FocusKind;
  if (focusKind === "score" && !["IAS", "PAS", "AS"].includes(id)) return { ok: false, error: "Name IAS, PAS, or AS." };
  if (focusKind === "assumption" && !["current", "pilot", "rollout"].includes(id)) return { ok: false, error: "Name current, pilot, or rollout." };
  if (focusKind === "field" && !["primary_goal", "prompt", "domain", "criterion", "principle", "constraint"].includes(id)) {
    return { ok: false, error: "That contract field is not editable here." };
  }
  if (scenario && (focusKind === "criterion" || focusKind === "principle" || focusKind === "evidence")) {
    const found = evidenceFor(scenario, focusKind, id);
    if (!found.mapped && found.text.startsWith("That")) return { ok: false, error: found.text };
  }
  return { ok: true, focus: { kind: focusKind, id: id.slice(0, 80) } };
}

export function sanitizeRoiSet(value: Partial<RoiInputs> | undefined, fallback: RoiInputs): RoiInputs {
  const applied = applyRoiInputs(fallback, value ?? {});
  return applied.ok ? applied.inputs : fallback;
}

export function parseStoredTask(raw: unknown): TaskState | null {
  try {
    const value = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!value || typeof value !== "object") return null;
    const record = value as { version?: unknown; task?: TaskState };
    if (record.version !== TASK_STORAGE_VERSION || !record.task?.contract?.icdu_id) return null;
    const task = record.task;
    if (!task.contract.icdu_id.startsWith("icdu-draft-")) return null;
    if (!Number.isInteger(task.contract.revision) || task.contract.revision < 1) return null;
    task.contract.icdu_version = "0.1";
    task.contract.version = "1.0.0";
    task.contract.trace = {
      parent_icdu_id: clip(task.contract.trace?.parent_icdu_id ?? ""),
      change_note: clip(task.contract.trace?.change_note ?? ""),
    };
    task.contract.intent.primary_goal = clip(task.contract.intent.primary_goal ?? "");
    task.contract.intent.success_criteria = clipList(task.contract.intent.success_criteria ?? []);
    task.contract.principles = clipList(task.contract.principles ?? []);
    task.contract.context.constraints = clipList(task.contract.context.constraints ?? []);
    task.roiSets = {
      pilot: sanitizeRoiSet(task.roiSets?.pilot, { ...roiCalculatorDefaults, workflows: 5 }),
      rollout: sanitizeRoiSet(task.roiSets?.rollout, { ...roiCalculatorDefaults, workflows: 25 }),
    };
    if (!task.review?.scores) task.review = blankReview();
    if (!task.pilot?.phases?.length) task.pilot = freshPilot(task.pilot?.workflowId ?? null);
    if (!Array.isArray(task.compareIds) || task.compareIds.length !== 2) task.compareIds = ["healthcare-admin", "document-review"];
    return task;
  } catch {
    return null;
  }
}

export function serializeTask(task: TaskState): string {
  return JSON.stringify({ version: TASK_STORAGE_VERSION, task });
}
