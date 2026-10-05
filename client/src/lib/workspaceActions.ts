// Shared workspace decisions for the conversation and the legacy pages.
// One implementation of view selection, guided gates, ROI bounds, and artifact identity.

import { homepageRoleIds, getPersonaAudience, getRoleLens } from "@/data/audience";
import {
  roiCalculatorDefaults,
  roiResultSummarySentence,
  calculateRoi,
  type RoiInputs,
} from "@/data/businessCase";
import { getGuidedScenario, guidedSteps, type GuidedStepId } from "@/data/guidedScenarios";
import { categorizedFaqItems, faqCategories, type FaqCategory } from "@/data/siteResources";
import { applyRoiInputs } from "@/lib/roiEdit";
import {
  freshGuidedProgress,
  readGuidedProgress,
  type GuidedProgress,
} from "@/lib/guidedProgress";
import { advanceGuided, backGuided, discardsGuidedWork, guidedWorkInProgress, revisitGuided } from "@/lib/guidedTransitions";
import { faqItem } from "@shared/siteKnowledge";

export const ROI_STORAGE_KEY = "icdu-roi-inputs-v1";
export const ROI_STORAGE_VERSION = 1 as const;

export type WorkspaceView =
  | "roles"
  | "workflows"
  | "guided"
  | "results"
  | "value"
  | "faq"
  | "resources"
  | "developer"
  | "lab"
  | "contract"
  | "evidence"
  | "readiness"
  | "review"
  | "compare"
  | "pilot"
  | "brief";

export type LabTab = "icdu" | "judge" | "hitl" | "stress";
export type DeveloperSection = "hands-on" | "schema-samples";

export type ShowWorkspaceInput = {
  view: WorkspaceView;
  personaId?: string;
  scenarioId?: string;
  stepId?: GuidedStepId;
  faqId?: string;
  faqCategory?: string;
  resourceId?: string;
  labTab?: LabTab;
  developerSection?: DeveloperSection;
};

export type WorkspaceCore = {
  personaId: string | null;
  industryId: string | null;
  guided: GuidedProgress | null;
  roiInputs: RoiInputs;
  faqCategory: FaqCategory | "all";
  faqOpenId: string | null;
  labTab: LabTab;
  demoMode: "guided" | "lab";
  resourceId: string | null;
  developerSection: DeveloperSection | null;
  view: WorkspaceView | null;
  stateVersion: number;
};

export type PendingConfirmation = {
  operationId: string;
  stateVersion: number;
  kind: "scenario" | "audience" | "navigate" | "clear-progress" | "reset-roi" | "apply-roi";
  scenarioId?: string;
  personaId?: string;
  industryId?: string;
  href?: string;
  roiInputs?: RoiInputs;
};

export type ActionResult = {
  ok: boolean;
  error?: string;
  needsConfirmation?: boolean;
  stale?: boolean;
  cancelled?: boolean;
} & Record<string, unknown>;

export type ArtifactFreeze = {
  view: WorkspaceView;
  personaId: string | null;
  industryId: string | null;
  guided: {
    scenarioId: string;
    step: string;
    furthest: number;
    ranAi: boolean;
    evaluated: boolean;
    scores?: { IAS: number; PAS: number; AS: number; decision: "PROMOTE" | "ESCALATE" | "BLOCK" };
  } | null;
  roiInputs: RoiInputs;
  roiSummary: string;
  faqOpenId: string | null;
  labTab: LabTab;
  resourceId: string | null;
};

export type ArtifactRecord = {
  id: string;
  view: WorkspaceView;
  title: string;
  summary: string;
  freeze: ArtifactFreeze;
};

const roleRecommendations: Record<string, readonly string[]> = {
  executive: ["healthcare-admin", "financial-services", "insurance-claim"],
  administrator: ["healthcare-admin", "support-escalation", "hr-policy"],
  manager: ["support-escalation", "hr-policy", "healthcare-admin"],
  developer: ["healthcare-admin", "document-review", "plant-maintenance"],
};

export function recommendedScenarioIds(personaId: string | null): string[] {
  if (personaId && roleRecommendations[personaId]) return [...roleRecommendations[personaId]];
  return ["healthcare-admin"];
}

export function roleChoices() {
  return homepageRoleIds.map((id) => {
    const audience = getPersonaAudience(id);
    const lens = getRoleLens(id);
    return {
      id,
      label: audience?.chipLabel ?? id,
      description: audience?.alias ?? lens?.focus ?? "",
      focus: lens?.focus ?? "",
    };
  });
}

export function parseStoredRoi(raw: unknown): RoiInputs | null {
  try {
    const value = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!value || typeof value !== "object") return null;
    const record = value as { version?: unknown; inputs?: Partial<RoiInputs> };
    if (record.version !== ROI_STORAGE_VERSION || !record.inputs) return null;
    const applied = applyRoiInputs(roiCalculatorDefaults, record.inputs);
    if (!applied.ok) return null;
    const keys = ["workflows", "dayRate", "incidentProb", "incidentCost", "auditCycles"] as const;
    if (!keys.every((key) => applied.inputs[key] === record.inputs?.[key])) return null;
    return applied.inputs;
  } catch {
    return null;
  }
}

export function serializeRoi(inputs: RoiInputs): string {
  return JSON.stringify({ version: ROI_STORAGE_VERSION, inputs });
}

export function roiSummary(inputs: RoiInputs): string {
  return roiResultSummarySentence(inputs, calculateRoi(inputs));
}

export function captureFreeze(core: WorkspaceCore, view: WorkspaceView): ArtifactFreeze {
  const scenario = core.guided ? getGuidedScenario(core.guided.scenarioId) : undefined;
  return {
    view,
    personaId: core.personaId,
    industryId: core.industryId,
    guided: core.guided
      ? {
          scenarioId: core.guided.scenarioId,
          step: core.guided.step,
          furthest: core.guided.furthest,
          ranAi: core.guided.ranAi,
          evaluated: core.guided.evaluated,
          scores:
            core.guided.evaluated && scenario
              ? { ...scenario.judge.scores, decision: scenario.judge.decision }
              : undefined,
        }
      : null,
    roiInputs: { ...core.roiInputs },
    roiSummary: roiSummary(core.roiInputs),
    faqOpenId: core.faqOpenId,
    labTab: core.labTab,
    resourceId: core.resourceId,
  };
}

export function artifactTitle(view: WorkspaceView, core: WorkspaceCore): string {
  const scenario = core.industryId ? getGuidedScenario(core.industryId) : undefined;
  switch (view) {
    case "roles":
      return "Choose a role";
    case "workflows":
      return "Choose a workflow";
    case "guided":
      return scenario ? scenario.title : "Guided walkthrough";
    case "results":
      return scenario ? `${scenario.title} results` : "Walkthrough results";
    case "value":
      return "Value model";
    case "faq":
      return "FAQ";
    case "resources":
      return "Resources";
    case "developer":
      return "Developer path";
    case "lab":
      return "Advanced Lab";
    case "contract":
      return "Intent and expertise";
    case "evidence":
      return "Example evidence";
    case "readiness":
      return "Readiness exploration";
    case "review":
      return "Human review";
    case "compare":
      return "Scenario comparison";
    case "pilot":
      return "Pilot plan";
    case "brief":
      return "Takeaway brief";
    default:
      return "Workspace";
  }
}

export function artifactSummary(freeze: ArtifactFreeze): string {
  if (freeze.view === "value") return freeze.roiSummary;
  if (freeze.guided && (freeze.view === "guided" || freeze.view === "results")) {
    const scenario = getGuidedScenario(freeze.guided.scenarioId);
    const step = guidedSteps.find((item) => item.id === freeze.guided?.step)?.label ?? freeze.guided.step;
    return `${scenario?.title ?? freeze.guided.scenarioId} · ${step}`;
  }
  if (freeze.view === "faq" && freeze.faqOpenId) return freeze.faqOpenId;
  if (freeze.view === "lab") return `Advanced Lab · ${freeze.labTab}`;
  return artifactTitle(freeze.view, {
    personaId: freeze.personaId,
    industryId: freeze.industryId,
    guided: null,
    roiInputs: freeze.roiInputs,
    faqCategory: "all",
    faqOpenId: freeze.faqOpenId,
    labTab: freeze.labTab,
    demoMode: "guided",
    resourceId: freeze.resourceId,
    developerSection: null,
    view: freeze.view,
    stateVersion: 0,
  });
}

/** Opening an existing artifact keeps its snapshot. Leaving the active one freezes current work. */
export function activateArtifact(
  artifacts: ArtifactRecord[],
  activeId: string | null,
  next: { id: string; view: WorkspaceView; title: string; summary: string },
  currentFreeze: ArtifactFreeze,
): { artifacts: ArtifactRecord[]; activeId: string } {
  const frozen = artifacts.map((artifact) =>
    artifact.id === activeId && artifact.id !== next.id
      ? { ...artifact, freeze: currentFreeze, summary: artifactSummary({ ...currentFreeze, view: artifact.view }) }
      : artifact,
  );
  if (frozen.some((artifact) => artifact.id === next.id)) {
    return {
      activeId: next.id,
      artifacts: frozen.map((artifact) =>
        artifact.id === next.id ? { ...artifact, view: next.view, title: next.title } : artifact,
      ),
    };
  }
  return {
    activeId: next.id,
    artifacts: [...frozen, { id: next.id, view: next.view, title: next.title, summary: next.summary, freeze: currentFreeze }],
  };
}

export function applyGuidedAction(
  progress: GuidedProgress | null,
  action: "continue" | "back" | "revisit",
  stepId?: string,
): { ok: true; progress: GuidedProgress; event?: string } | { ok: false; error: string } {
  if (!progress) return { ok: false, error: "Choose a scenario first." };
  if (action === "continue") {
    const advanced = advanceGuided(progress);
    if (advanced.event === "done") return { ok: false, error: "The walkthrough is already at the end." };
    return { ok: true, progress: advanced.progress, event: advanced.event };
  }
  if (action === "back") {
    const moved = backGuided(progress);
    if (!moved.ok) return moved;
    return { ok: true, progress: moved.progress };
  }
  const step = guidedSteps.find((item) => item.id === stepId);
  if (!step) return { ok: false, error: "Name an available stage." };
  const moved = revisitGuided(progress, step.id);
  if (!moved.ok) return moved;
  return { ok: true, progress: moved.progress };
}

export function openFaqSelection(input: { id?: string; category?: string }): ActionResult & {
  category?: FaqCategory | "all";
  openId?: string;
} {
  const match = input.id ? faqItem(input.id) : undefined;
  if (input.id && !match) return { ok: false, error: "That question is not on the FAQ." };
  if (input.category && match && match.category !== input.category) {
    return { ok: false, error: "That question is not in that category." };
  }
  const nextCategory = match?.category ?? input.category;
  if (nextCategory && !faqCategories.some((item) => item.id === nextCategory)) {
    return { ok: false, error: "That category is not on the FAQ." };
  }
  const target = match ?? categorizedFaqItems.find((item) => item.category === nextCategory);
  if (!target) return { ok: false, error: "Name a published FAQ question." };
  return {
    ok: true,
    id: target.id,
    category: target.category,
    openId: target.id,
    question: target.question,
    answer: target.answer,
  };
}

function withVersion(core: WorkspaceCore): WorkspaceCore {
  return { ...core, stateVersion: core.stateVersion + 1 };
}

export function scenarioProgressFor(
  memory: GuidedProgress | null,
  scenarioId: string,
  stored: GuidedProgress | null,
): GuidedProgress {
  if (memory?.scenarioId === scenarioId) return memory;
  if (stored?.scenarioId === scenarioId) return stored;
  return freshGuidedProgress(scenarioId);
}

function adoptScenario(core: WorkspaceCore, scenarioId: string): WorkspaceCore {
  return {
    ...core,
    industryId: scenarioId,
    guided: scenarioProgressFor(core.guided, scenarioId, readGuidedProgress()),
    demoMode: "guided",
  };
}

export function planShowWorkspace(
  core: WorkspaceCore,
  input: ShowWorkspaceInput,
  operationId: string,
): { core: WorkspaceCore; pending: PendingConfirmation | null; result: ActionResult } {
  let next: WorkspaceCore = { ...core, view: input.view };
  if (input.personaId) next.personaId = input.personaId;
  if (input.developerSection) next.developerSection = input.developerSection;
  if (input.labTab) {
    next.labTab = input.labTab;
    next.demoMode = input.view === "lab" || input.view === "developer" ? "lab" : next.demoMode;
  }
  if (input.resourceId) next.resourceId = input.resourceId;
  if (input.faqId || input.faqCategory) {
    const opened = openFaqSelection({ id: input.faqId, category: input.faqCategory });
    if (!opened.ok) return { core, pending: null, result: opened };
    next.faqCategory = opened.category ?? "all";
    next.faqOpenId = opened.openId ?? null;
  }
  if (input.scenarioId && discardsGuidedWork(core.guided, input.scenarioId)) {
    return {
      core: { ...core, view: "workflows" },
      pending: {
        operationId,
        stateVersion: core.stateVersion,
        kind: "scenario",
        scenarioId: input.scenarioId,
        personaId: input.personaId,
      },
      result: {
        ok: false,
        needsConfirmation: true,
        error: "Changing the workflow would discard guided progress. Ask the visitor to confirm.",
        view: "workflows",
      },
    };
  }
  if (input.scenarioId) next = adoptScenario(next, input.scenarioId);
  let stepApplied = true;
  let stepError: string | undefined;
  if (input.stepId) {
    const moved = applyGuidedAction(next.guided, "revisit", input.stepId);
    if (!moved.ok) {
      stepApplied = false;
      stepError = moved.error;
    } else {
      next.guided = moved.progress;
    }
  }
  next = withVersion(next);
  const scenario = next.guided ? getGuidedScenario(next.guided.scenarioId) : undefined;
  return {
    core: next,
    pending: null,
    result: {
      ok: true,
      view: next.view,
      personaId: next.personaId,
      scenarioId: next.industryId,
      step: next.guided?.step ?? null,
      ranAi: next.guided?.ranAi ?? false,
      evaluated: next.guided?.evaluated ?? false,
      simulated: true,
      modeledEstimate: next.view === "value",
      stepApplied,
      stepError,
      artifactId: operationId,
      scores:
        next.guided?.evaluated && scenario
          ? { ...scenario.judge.scores, decision: scenario.judge.decision }
          : undefined,
    },
  };
}

export function planScenarioChange(
  core: WorkspaceCore,
  scenarioId: string,
  operationId: string,
  confirmed: boolean,
): { core: WorkspaceCore; pending: PendingConfirmation | null; result: ActionResult } {
  if (!getGuidedScenario(scenarioId)) {
    return { core, pending: null, result: { ok: false, error: "That scenario is not on the site." } };
  }
  if (!confirmed && discardsGuidedWork(core.guided, scenarioId)) {
    return {
      core,
      pending: { operationId, stateVersion: core.stateVersion, kind: "scenario", scenarioId },
      result: { ok: false, needsConfirmation: true, scenarioId, error: "That workflow change would discard guided progress." },
    };
  }
  const next = withVersion({ ...adoptScenario(core, scenarioId), view: core.view === "workflows" || core.view == null ? "guided" : core.view });
  return {
    core: next,
    pending: null,
    result: { ok: true, scenarioId, title: getGuidedScenario(scenarioId)?.title, step: next.guided?.step, simulated: true },
  };
}

export function planClearProgress(
  core: WorkspaceCore,
  operationId: string,
): { core: WorkspaceCore; pending: PendingConfirmation | null; result: ActionResult } {
  if (!guidedWorkInProgress(core.guided)) {
    const next = withVersion({ ...core, guided: null, industryId: null, view: "workflows" });
    return { core: next, pending: null, result: { ok: true, cleared: true } };
  }
  return {
    core,
    pending: { operationId, stateVersion: core.stateVersion, kind: "clear-progress" },
    result: { ok: false, needsConfirmation: true, error: "Clearing the walkthrough needs confirmation." },
  };
}

export function planAudienceChange(
  core: WorkspaceCore,
  input: { personaId?: string; industryId?: string },
  operationId: string,
): { core: WorkspaceCore; pending: PendingConfirmation | null; result: ActionResult } {
  if (!input.personaId && !input.industryId) {
    return { core, pending: null, result: { ok: false, error: "Name a published role or workflow." } };
  }
  if (input.industryId && discardsGuidedWork(core.guided, input.industryId)) {
    return {
      core,
      pending: {
        operationId,
        stateVersion: core.stateVersion,
        kind: "audience",
        personaId: input.personaId,
        industryId: input.industryId,
      },
      result: { ok: false, needsConfirmation: true, error: "That workflow change would discard guided progress." },
    };
  }
  let next = { ...core };
  if (input.personaId) next.personaId = input.personaId;
  if (input.industryId) next = adoptScenario(next, input.industryId);
  next = withVersion(next);
  return {
    core: next,
    pending: null,
    result: { ok: true, personaId: next.personaId, industryId: next.industryId },
  };
}

export function planNavigateConfirmation(
  core: WorkspaceCore,
  operationId: string,
  href: string,
  industryId?: string,
): { pending: PendingConfirmation; result: ActionResult } {
  return {
    pending: { operationId, stateVersion: core.stateVersion, kind: "navigate", href, industryId },
    result: {
      ok: false,
      needsConfirmation: true,
      error: "Changing the workflow would discard guided progress. Ask the visitor to confirm.",
    },
  };
}

export function planResetRoi(
  core: WorkspaceCore,
  operationId: string,
): { pending: PendingConfirmation; result: ActionResult } {
  return {
    pending: { operationId, stateVersion: core.stateVersion, kind: "reset-roi" },
    result: { ok: false, needsConfirmation: true, error: "Resetting the calculator needs confirmation." },
  };
}

export function planApplyFrozenRoi(
  core: WorkspaceCore,
  artifact: ArtifactRecord,
  operationId: string,
): { pending: PendingConfirmation | null; result: ActionResult } {
  if (!artifact.freeze.roiInputs) return { pending: null, result: { ok: false, error: "That snapshot has no calculator inputs." } };
  return {
    pending: {
      operationId,
      stateVersion: core.stateVersion,
      kind: "apply-roi",
      roiInputs: artifact.freeze.roiInputs,
    },
    result: { ok: false, needsConfirmation: true, error: "Applying an earlier snapshot needs confirmation." },
  };
}

export function resolvePending(
  core: WorkspaceCore,
  pending: PendingConfirmation | null,
  decision: { operationId: string; stateVersion: number; approved: boolean },
): { core: WorkspaceCore; pending: PendingConfirmation | null; result: ActionResult } {
  if (!pending || pending.operationId !== decision.operationId) {
    return {
      core,
      pending,
      result: { ok: false, stale: true, error: "This confirmation is no longer current." },
    };
  }
  if (pending.stateVersion !== decision.stateVersion || pending.stateVersion !== core.stateVersion) {
    return {
      core,
      pending: null,
      result: { ok: false, stale: true, error: "This confirmation is no longer current." },
    };
  }
  if (!decision.approved) {
    return { core, pending: null, result: { ok: false, approved: false, cancelled: true } };
  }
  let next = { ...core };
  if (pending.kind === "scenario" && pending.scenarioId) {
    next = { ...adoptScenario(next, pending.scenarioId), view: "guided" };
    if (pending.personaId) next.personaId = pending.personaId;
  } else if (pending.kind === "audience") {
    if (pending.personaId) next.personaId = pending.personaId;
    if (pending.industryId) next = adoptScenario(next, pending.industryId);
  } else if (pending.kind === "clear-progress") {
    next = { ...next, guided: null, industryId: null, view: "workflows" };
  } else if (pending.kind === "reset-roi") {
    next = { ...next, roiInputs: { ...roiCalculatorDefaults } };
  } else if (pending.kind === "apply-roi" && pending.roiInputs) {
    const applied = applyRoiInputs(roiCalculatorDefaults, pending.roiInputs);
    if (!applied.ok) return { core, pending: null, result: applied };
    next = { ...next, roiInputs: applied.inputs };
  } else if (pending.kind === "navigate") {
    if (pending.industryId) next = adoptScenario(next, pending.industryId);
    return {
      core: withVersion(next),
      pending: null,
      result: { ok: true, approved: true, href: pending.href, industryId: next.industryId },
    };
  }
  next = withVersion(next);
  return {
    core: next,
    pending: null,
    result: {
      ok: true,
      approved: true,
      personaId: next.personaId,
      industryId: next.industryId,
      step: next.guided?.step ?? null,
      modeledEstimate: pending.kind === "reset-roi" || pending.kind === "apply-roi",
      summary: roiSummary(next.roiInputs),
    },
  };
}

export function sameRoi(left: RoiInputs, right: RoiInputs): boolean {
  return (
    left.workflows === right.workflows &&
    left.dayRate === right.dayRate &&
    left.incidentProb === right.incidentProb &&
    left.incidentCost === right.incidentCost &&
    left.auditCycles === right.auditCycles
  );
}
