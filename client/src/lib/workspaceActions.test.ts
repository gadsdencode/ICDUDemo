import assert from "node:assert/strict";
import test from "node:test";
import { roiCalculatorDefaults } from "../data/businessCase.ts";
import { freshGuidedProgress, type GuidedProgress } from "./guidedProgress.ts";
import {
  activateArtifact,
  applyGuidedAction,
  captureFreeze,
  parseStoredRoi,
  planClearProgress,
  planNavigateConfirmation,
  planScenarioChange,
  planShowWorkspace,
  scenarioProgressFor,
  resolvePending,
  serializeRoi,
  type WorkspaceCore,
} from "./workspaceActions.ts";
import { frontendToolsForSurface } from "../../../shared/assistantContract.ts";

function core(overrides: Partial<WorkspaceCore> = {}): WorkspaceCore {
  return {
    personaId: "executive",
    industryId: "healthcare-admin",
    guided: freshGuidedProgress("healthcare-admin"),
    roiInputs: { ...roiCalculatorDefaults },
    faqCategory: "all",
    faqOpenId: null,
    labTab: "icdu",
    demoMode: "guided",
    resourceId: null,
    developerSection: null,
    view: "guided",
    stateVersion: 3,
    ...overrides,
  };
}

function advanced(): GuidedProgress {
  return { ...freshGuidedProgress("healthcare-admin"), step: "build", furthest: 1, ranAi: false, evaluated: false };
}

test("guided stages share one gate and a cancelled scenario change keeps the walkthrough", () => {
  const start = core({ guided: advanced() });
  const blocked = applyGuidedAction(start.guided, "revisit", "evidence");
  assert.equal(blocked.ok, false);
  const ran = applyGuidedAction(start.guided, "continue");
  assert.equal(ran.ok, true);
  if (!ran.ok) return;
  assert.equal(ran.progress.step, "run");
  const running = applyGuidedAction(ran.progress, "continue");
  assert.equal(running.ok, true);
  if (!running.ok) return;
  assert.equal(running.progress.ranAi, true);
  assert.equal(running.progress.step, "run");

  const change = planScenarioChange(start, "hr-policy", "op-1", false);
  assert.equal(change.result.needsConfirmation, true);
  assert.equal(change.core.guided?.scenarioId, "healthcare-admin");
  const cancelled = resolvePending(change.core, change.pending, { operationId: "op-1", stateVersion: 3, approved: false });
  assert.equal(cancelled.result.cancelled, true);
  assert.equal(cancelled.core.guided?.step, "build");
  assert.equal(cancelled.core.industryId, "healthcare-admin");
});

test("show_workspace opens healthcare on the current selection and rejects a future stage", () => {
  const opened = planShowWorkspace(core({ view: null, industryId: null, guided: null }), {
    view: "guided",
    personaId: "executive",
    scenarioId: "healthcare-admin",
  }, "call-health");
  assert.equal(opened.result.ok, true);
  assert.equal(opened.core.view, "guided");
  assert.equal(opened.core.guided?.step, "define");
  assert.equal(opened.result.artifactId, "call-health");
  const early = planShowWorkspace(opened.core, { view: "results", stepId: "evidence" }, "call-results");
  assert.equal(early.result.ok, true);
  assert.equal(early.result.stepApplied, false);
  assert.equal(early.core.guided?.step, "define");
});

test("roi storage rejects out-of-range values and confirm reset is stale after the version moves", () => {
  assert.equal(parseStoredRoi(serializeRoi(roiCalculatorDefaults))?.dayRate, roiCalculatorDefaults.dayRate);
  assert.equal(parseStoredRoi({ version: 1, inputs: { ...roiCalculatorDefaults, dayRate: 12 } }), null);
  assert.equal(parseStoredRoi("{"), null);
  const pending = {
    operationId: "reset-1",
    stateVersion: 3,
    kind: "reset-roi" as const,
  };
  const moved = core({ stateVersion: 4, roiInputs: { ...roiCalculatorDefaults, workflows: 8 } });
  const stale = resolvePending(moved, pending, { operationId: "reset-1", stateVersion: 3, approved: true });
  assert.equal(stale.result.stale, true);
  assert.equal(stale.core.roiInputs.workflows, 8);
  const current = resolvePending(core(), pending, { operationId: "reset-1", stateVersion: 3, approved: true });
  assert.equal(current.result.ok, true);
  assert.equal(current.core.roiInputs.workflows, roiCalculatorDefaults.workflows);
});

test("reopening an artifact keeps its snapshot and does not copy those inputs forward", () => {
  const first = core({ view: "value", roiInputs: { ...roiCalculatorDefaults, workflows: 4 } });
  const freeze = captureFreeze(first, "value");
  const created = activateArtifact([], null, { id: "call-1", view: "value", title: "Value model", summary: freeze.roiSummary }, freeze);
  const later = core({ view: "guided", roiInputs: { ...roiCalculatorDefaults, workflows: 9 }, stateVersion: 5 });
  const departed = captureFreeze(later, "value");
  const second = activateArtifact(created.artifacts, "call-1", { id: "call-2", view: "guided", title: "Walkthrough", summary: "saved" }, departed);
  const historical = second.artifacts.find((item) => item.id === "call-1");
  assert.equal(historical?.freeze.roiInputs.workflows, 9);
  assert.equal(later.roiInputs.workflows, 9);
  const newer = captureFreeze(core({ roiInputs: { ...roiCalculatorDefaults, workflows: 2 } }), "guided");
  const reopened = activateArtifact(second.artifacts, "call-2", { id: "call-1", view: "value", title: "Value model", summary: "saved" }, newer);
  assert.equal(reopened.artifacts.find((item) => item.id === "call-1")?.freeze.roiInputs.workflows, 9);
  assert.equal(reopened.artifacts.find((item) => item.id === "call-2")?.freeze.roiInputs.workflows, 2);
  assert.equal(reopened.activeId, "call-1");
});

test("a navigate confirmation discards the walkthrough only after the same operation is approved", () => {
  const started = core({ guided: advanced(), industryId: "healthcare-admin" });
  const queued = planNavigateConfirmation(started, "nav-1", "/demos?industry=document-review", "document-review");
  assert.equal(queued.result.needsConfirmation, true);
  const cancelled = resolvePending(started, queued.pending, { operationId: "nav-1", stateVersion: started.stateVersion, approved: false });
  assert.equal(cancelled.result.cancelled, true);
  assert.equal(cancelled.core.guided?.scenarioId, "healthcare-admin");
  assert.equal(cancelled.core.guided?.step, "build");
  const approved = resolvePending(started, queued.pending, { operationId: "nav-1", stateVersion: started.stateVersion, approved: true });
  assert.equal(approved.result.ok, true);
  assert.equal(approved.result.href, "/demos?industry=document-review");
  assert.equal(approved.core.industryId, "document-review");
  assert.equal(approved.core.guided?.scenarioId, "document-review");
  assert.equal(approved.core.guided?.step, "define");
});

test("selecting the stored scenario again restores that walkthrough instead of starting over", () => {
  const saved = advanced();
  saved.step = "evidence";
  saved.furthest = 4;
  saved.ranAi = true;
  saved.evaluated = true;
  assert.equal(scenarioProgressFor(null, "healthcare-admin", saved).step, "evidence");
  assert.equal(scenarioProgressFor(null, "hr-policy", saved).step, "define");
  assert.equal(scenarioProgressFor(saved, "healthcare-admin", null).furthest, 4);
});

test("clearing progress waits for the same operation and workspace tools stay within seven", () => {
  const pending = planClearProgress(core({ guided: advanced() }), "clear-1");
  assert.equal(pending.result.needsConfirmation, true);
  const wrong = resolvePending(pending.core, pending.pending, { operationId: "clear-2", stateVersion: 3, approved: true });
  assert.equal(wrong.result.stale, true);
  assert.equal(wrong.core.guided?.scenarioId, "healthcare-admin");
  const names = frontendToolsForSurface({
    pageId: "overview",
    workspaceView: "guided",
    scenarioSelected: true,
    discardAvailable: true,
    roiAvailable: true,
  });
  assert.ok(names.length <= 7);
  assert.equal(new Set(names).size, names.length);
  assert.ok(names.includes("show_workspace"));
  assert.ok(names.includes("set_guided_stage"));
});
