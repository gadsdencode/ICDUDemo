import assert from "node:assert/strict";
import test from "node:test";
import { advanceGuided, discardsGuidedWork, revisitGuided } from "./guidedTransitions.ts";
import type { GuidedProgress } from "./guidedProgress.ts";

const start: GuidedProgress = {
  version: 1,
  scenarioId: "healthcare-admin",
  step: "define",
  furthest: 0,
  ranAi: false,
  evaluated: false,
  returnPending: false,
};

test("continue follows the same run and evaluate gates as the manual demo", () => {
  let progress = start;
  const toBuild = advanceGuided(progress);
  assert.equal(toBuild.event, "step");
  progress = { ...toBuild.progress, step: "run", furthest: 2 };
  const run = advanceGuided(progress);
  assert.equal(run.event, "run_ai");
  assert.equal(run.progress.ranAi, true);
  assert.equal(run.progress.step, "run");
  const afterRun = advanceGuided(run.progress);
  assert.equal(afterRun.event, "step");
  assert.equal(afterRun.progress.step, "evaluate");
  const evaluate = advanceGuided(afterRun.progress);
  assert.equal(evaluate.event, "evaluate");
  assert.equal(evaluate.progress.evaluated, true);
  assert.equal(revisitGuided(start, "evidence").ok, false);
});

test("switching scenarios discards guided work only when progress exists", () => {
  assert.equal(discardsGuidedWork(start, "healthcare-admin"), false);
  const started = advanceGuided(start).progress;
  assert.equal(discardsGuidedWork(started, "healthcare-admin"), false);
  assert.equal(discardsGuidedWork(started, "document-review"), true);
  assert.equal(discardsGuidedWork(started, null), true);
});
