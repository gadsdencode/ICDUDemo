import assert from "node:assert/strict";
import test from "node:test";
import {
  GUIDED_PROGRESS_STORAGE_KEY,
  clearGuidedProgress,
  freshGuidedProgress,
  loadGuidedProgress,
  parseGuidedProgress,
  pendingGuidedReturn,
  readGuidedProgress,
  resolveGuidedProgress,
  writeGuidedProgress,
  type GuidedProgress,
  type ProgressStore,
} from "./guidedProgress.ts";

class MemoryStore implements ProgressStore {
  private items = new Map<string, string>();
  getItem(key: string) {
    return this.items.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.items.set(key, value);
  }
  removeItem(key: string) {
    this.items.delete(key);
  }
}

function completedInsurance(): GuidedProgress {
  return {
    version: 1,
    scenarioId: "insurance-claim",
    step: "evidence",
    furthest: 4,
    ranAi: true,
    evaluated: true,
    returnPending: false,
  };
}

test("a first visit starts the selected scenario at step 1", () => {
  const next = resolveGuidedProgress(null, "insurance-claim");
  assert.deepEqual(next, freshGuidedProgress("insurance-claim"));
  assert.equal(next.step, "define");
  assert.equal(next.furthest, 0);
  assert.equal(next.ranAi, false);
  assert.equal(next.evaluated, false);
});

test("the same scenario restores the completed stage and results", () => {
  const saved = { ...completedInsurance(), returnPending: true };
  assert.deepEqual(resolveGuidedProgress(saved, "insurance-claim"), saved);
});

test("switching scenarios drops the previous results", () => {
  const next = resolveGuidedProgress(completedInsurance(), "financial-services");
  assert.equal(next.scenarioId, "financial-services");
  assert.equal(next.step, "define");
  assert.equal(next.furthest, 0);
  assert.equal(next.ranAi, false);
  assert.equal(next.evaluated, false);
  assert.equal(next.returnPending, false);
});

test("an outdated or corrupt record is ignored", () => {
  assert.equal(parseGuidedProgress({ ...completedInsurance(), version: 0 }), null);
  assert.equal(parseGuidedProgress("{"), null);
  assert.equal(parseGuidedProgress({ ...completedInsurance(), scenarioId: "missing" }), null);
  assert.equal(parseGuidedProgress({ ...completedInsurance(), step: "publish" }), null);
});

test("a restored evidence step keeps results reachable", () => {
  const parsed = parseGuidedProgress({
    ...completedInsurance(),
    furthest: 0,
    ranAi: false,
    evaluated: false,
  });
  assert.ok(parsed);
  assert.equal(parsed.step, "evidence");
  assert.equal(parsed.furthest, 4);
  assert.equal(parsed.ranAi, true);
  assert.equal(parsed.evaluated, true);
});

test("storage round-trips the completed demo and clears it", () => {
  const store = new MemoryStore();
  const saved = { ...completedInsurance(), returnPending: true };
  writeGuidedProgress(saved, store);
  assert.deepEqual(readGuidedProgress(store), saved);
  assert.equal(store.getItem(GUIDED_PROGRESS_STORAGE_KEY)?.includes("insurance-claim"), true);

  const reloaded = loadGuidedProgress("insurance-claim", store);
  assert.deepEqual(reloaded, saved);
  assert.deepEqual(pendingGuidedReturn("insurance-claim", store), saved);
  assert.equal(pendingGuidedReturn("financial-services", store), null);

  clearGuidedProgress(store);
  assert.equal(readGuidedProgress(store), null);
  assert.equal(pendingGuidedReturn("insurance-claim", store), null);
  assert.deepEqual(loadGuidedProgress("insurance-claim", store), freshGuidedProgress("insurance-claim"));
});

test("loading a different scenario replaces the stored record", () => {
  const store = new MemoryStore();
  writeGuidedProgress(completedInsurance(), store);
  const next = loadGuidedProgress("hr-policy", store);
  assert.equal(next?.scenarioId, "hr-policy");
  assert.equal(next?.step, "define");
  assert.equal(next?.evaluated, false);
  assert.equal(readGuidedProgress(store)?.scenarioId, "hr-policy");
});
