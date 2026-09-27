import assert from "node:assert/strict";
import test from "node:test";
import { roiCalculatorDefaults } from "@/data/businessCase";
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
