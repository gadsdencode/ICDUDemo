import { guidedSteps, type GuidedStepId } from "@/data/guidedScenarios";
import type { GuidedProgress } from "@/lib/guidedProgress";

export function guidedStepIndex(id: GuidedStepId): number {
  return guidedSteps.findIndex((step) => step.id === id);
}

export function advanceGuided(progress: GuidedProgress): {
  progress: GuidedProgress;
  event: "run_ai" | "evaluate" | "step" | "done";
} {
  const index = guidedStepIndex(progress.step);
  if (progress.step === "run" && !progress.ranAi) {
    return { progress: { ...progress, ranAi: true }, event: "run_ai" };
  }
  if (progress.step === "evaluate" && !progress.evaluated) {
    return { progress: { ...progress, evaluated: true }, event: "evaluate" };
  }
  if (index < guidedSteps.length - 1) {
    const next = guidedSteps[index + 1].id;
    return {
      progress: {
        ...progress,
        step: next,
        furthest: Math.max(progress.furthest, index + 1),
      },
      event: "step",
    };
  }
  return { progress, event: "done" };
}

export function revisitGuided(
  progress: GuidedProgress,
  stepId: GuidedStepId,
): { ok: true; progress: GuidedProgress } | { ok: false; error: string } {
  const index = guidedStepIndex(stepId);
  if (index < 0) return { ok: false, error: "That stage is not part of the guided demo." };
  if (index > progress.furthest) return { ok: false, error: "That stage is not available yet." };
  return {
    ok: true,
    progress: { ...progress, step: stepId, furthest: Math.max(progress.furthest, index) },
  };
}

export function backGuided(
  progress: GuidedProgress,
): { ok: true; progress: GuidedProgress } | { ok: false; error: string } {
  const index = guidedStepIndex(progress.step);
  if (index <= 0) return { ok: false, error: "This is the first stage." };
  return revisitGuided(progress, guidedSteps[index - 1].id);
}

export function guidedWorkInProgress(progress: GuidedProgress | null): boolean {
  if (!progress) return false;
  return progress.step !== "define" || progress.furthest > 0 || progress.ranAi || progress.evaluated;
}

export function discardsGuidedWork(
  progress: GuidedProgress | null,
  nextScenarioId: string | null,
): boolean {
  if (!progress || !guidedWorkInProgress(progress)) return false;
  if (nextScenarioId == null) return true;
  return progress.scenarioId !== nextScenarioId;
}
