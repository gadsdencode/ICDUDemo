import assert from "node:assert/strict";
import test from "node:test";
import { roiAssumptionDelta, roiCalculatorDefaults, roiEffectDelta } from "@/data/businessCase";
import { applyRoiInputs } from "./roiEdit.ts";

test("calculator edits stay inside published ranges and keep the modeled-estimate wording", () => {
  const changed = applyRoiInputs(roiCalculatorDefaults, { workflows: 40 });
  assert.equal(changed.ok, true);
  if (changed.ok) {
    assert.equal(changed.inputs.workflows, 40);
    assert.equal(changed.modeledEstimate, true);
    assert.match(changed.summary, /modeled/i);
    assert.notEqual(changed.results.totalReturn, undefined);
  }
  assert.equal(applyRoiInputs(roiCalculatorDefaults, { dayRate: 401 }).ok, false);
  assert.equal(applyRoiInputs(roiCalculatorDefaults, { incidentCost: 1 }).ok, false);
  assert.equal(applyRoiInputs(roiCalculatorDefaults, {}).ok, false);
});

test("assumption deltas name edited inputs and leave incident terms unchanged", () => {
  const delta = roiAssumptionDelta({ ...roiCalculatorDefaults, workflows: 11, dayRate: 1350 });
  assert.deepEqual(delta.edited, ["workflows", "dayRate"]);
  assert.deepEqual(delta.unchanged, ["incidentProb", "incidentCost", "auditCycles"]);
  assert.equal(delta.example.incidentProb, roiCalculatorDefaults.incidentProb);
  assert.equal(delta.example.incidentCost, roiCalculatorDefaults.incidentCost);
});

test("derived effects move engineering, compliance, and cost without moving risk avoidance", () => {
  const effects = roiEffectDelta({ ...roiCalculatorDefaults, workflows: 12, dayRate: 1350 });
  assert.deepEqual(effects.changed, ["engineeringSavings", "complianceLabor", "modeledCost"]);
  assert.deepEqual(effects.unchanged, ["riskAvoidance"]);
});
