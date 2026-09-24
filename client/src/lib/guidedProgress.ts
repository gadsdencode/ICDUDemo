// client/src/lib/guidedProgress.ts
// Versioned session record for the public guided walkthrough.
// Survives leaving the demo page without a global history override.

import { getGuidedScenario, guidedSteps, type GuidedStepId } from "../data/guidedScenarios";

export const GUIDED_PROGRESS_VERSION = 1 as const;
export const GUIDED_PROGRESS_STORAGE_KEY = "icdu-guided-progress-v1";

export type GuidedProgress = {
  version: typeof GUIDED_PROGRESS_VERSION;
  scenarioId: string;
  step: GuidedStepId;
  furthest: number;
  ranAi: boolean;
  evaluated: boolean;
  /** Set when the visitor follows the business-case handoff from this demo. */
  returnPending: boolean;
};

export type ProgressStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

const RUN_INDEX = guidedSteps.findIndex((step) => step.id === "run");
const EVALUATE_INDEX = guidedSteps.findIndex((step) => step.id === "evaluate");

function stepIndex(step: GuidedStepId): number {
  return guidedSteps.findIndex((item) => item.id === step);
}

function isGuidedStep(value: unknown): value is GuidedStepId {
  return typeof value === "string" && guidedSteps.some((step) => step.id === value);
}

export function freshGuidedProgress(scenarioId: string): GuidedProgress {
  return {
    version: GUIDED_PROGRESS_VERSION,
    scenarioId,
    step: "define",
    furthest: 0,
    ranAi: false,
    evaluated: false,
    returnPending: false,
  };
}

/** Accepts raw session JSON or an already-parsed value. Invalid records are dropped. */
export function parseGuidedProgress(raw: unknown): GuidedProgress | null {
  try {
    const value = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!value || typeof value !== "object") return null;
    const record = value as Record<string, unknown>;
    if (record.version !== GUIDED_PROGRESS_VERSION) return null;
    if (typeof record.scenarioId !== "string" || !getGuidedScenario(record.scenarioId)) return null;
    if (!isGuidedStep(record.step)) return null;

    const index = stepIndex(record.step);
    const requested =
      typeof record.furthest === "number" && Number.isInteger(record.furthest)
        ? record.furthest
        : index;
    const furthest = Math.min(guidedSteps.length - 1, Math.max(0, index, requested));

    return {
      version: GUIDED_PROGRESS_VERSION,
      scenarioId: record.scenarioId,
      step: record.step,
      furthest,
      ranAi: record.ranAi === true || index > RUN_INDEX,
      evaluated: record.evaluated === true || index > EVALUATE_INDEX,
      returnPending: record.returnPending === true,
    };
  } catch {
    return null;
  }
}

/**
 * Restores progress only when it belongs to the requested scenario.
 * Any other record starts that scenario at step 1 with no prior results.
 */
export function resolveGuidedProgress(
  stored: GuidedProgress | null,
  scenarioId: string,
): GuidedProgress {
  if (stored?.scenarioId === scenarioId) return stored;
  return freshGuidedProgress(scenarioId);
}

function browserStore(): ProgressStore | null {
  try {
    if (typeof sessionStorage === "undefined") return null;
    return sessionStorage;
  } catch {
    return null;
  }
}

export function readGuidedProgress(store: ProgressStore | null = browserStore()): GuidedProgress | null {
  if (!store) return null;
  try {
    return parseGuidedProgress(store.getItem(GUIDED_PROGRESS_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function writeGuidedProgress(
  progress: GuidedProgress,
  store: ProgressStore | null = browserStore(),
): void {
  if (!store) return;
  try {
    store.setItem(GUIDED_PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Persistence is best-effort; the in-memory walkthrough still works.
  }
}

export function clearGuidedProgress(store: ProgressStore | null = browserStore()): void {
  if (!store) return;
  try {
    store.removeItem(GUIDED_PROGRESS_STORAGE_KEY);
  } catch {
    // Ignore unavailable storage.
  }
}

export function loadGuidedProgress(scenarioId: string | null, store?: ProgressStore | null): GuidedProgress | null {
  if (!scenarioId) return null;
  const target = store === undefined ? browserStore() : store;
  const stored = readGuidedProgress(target);
  const next = resolveGuidedProgress(stored, scenarioId);
  if (!stored || stored.scenarioId !== scenarioId || stored.step !== next.step || stored.furthest !== next.furthest) {
    writeGuidedProgress(next, target);
  }
  return next;
}

/** Business Case shows a return control only after the guided-demo handoff. */
export function pendingGuidedReturn(scenarioId: string | null, store?: ProgressStore | null): GuidedProgress | null {
  if (!scenarioId) return null;
  const stored = readGuidedProgress(store === undefined ? browserStore() : store);
  if (!stored?.returnPending || stored.scenarioId !== scenarioId) return null;
  return stored;
}
