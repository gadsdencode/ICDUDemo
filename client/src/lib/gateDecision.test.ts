import assert from "node:assert/strict";
import test from "node:test";
import { guidedScenarios } from "../data/guidedScenarios.ts";
import {
  AS_HARD_BLOCK_BELOW,
  IAS_HARD_BLOCK_BELOW,
  defaultGateThresholds,
  evaluateGate,
  type GateScores,
  type GateThresholds,
} from "./gateDecision.ts";

const passing: GateScores = { IAS: 0.95, PAS: 0.95, AS: 0.95 };

function justBelow(value: number): number {
  return value - 0.001;
}

function justAbove(value: number): number {
  return value + 0.001;
}

function decide(scores: Partial<GateScores>, thresholds?: GateThresholds) {
  return evaluateGate({ ...passing, ...scores }, thresholds).decision;
}

test("default PAS threshold blocks below 0.85 and promotes at and above it", () => {
  const pas = defaultGateThresholds.PAS_min;
  assert.equal(pas, 0.85);
  assert.equal(decide({ PAS: justBelow(pas) }), "BLOCK");
  assert.equal(decide({ PAS: pas }), "PROMOTE");
  assert.equal(decide({ PAS: justAbove(pas) }), "PROMOTE");
});

test("0.70 is not a separate PAS boundary under the default threshold", () => {
  assert.equal(decide({ PAS: justBelow(0.7) }), "BLOCK");
  assert.equal(decide({ PAS: 0.7 }), "BLOCK");
  assert.equal(decide({ PAS: justAbove(0.7) }), "BLOCK");
});

test("a configured PAS threshold moves the block boundary", () => {
  const thresholds: GateThresholds = { ...defaultGateThresholds, PAS_min: 0.7 };
  assert.equal(decide({ PAS: justBelow(0.7) }, thresholds), "BLOCK");
  assert.equal(decide({ PAS: 0.7 }, thresholds), "PROMOTE");
  assert.equal(decide({ PAS: justAbove(0.7) }, thresholds), "PROMOTE");
  assert.equal(decide({ PAS: 0.84 }, { ...defaultGateThresholds, PAS_min: 0.9 }), "BLOCK");
  assert.equal(decide({ PAS: 0.9 }, { ...defaultGateThresholds, PAS_min: 0.9 }), "PROMOTE");
});

test("meeting PAS does not promote when IAS or AS misses its threshold", () => {
  const ias = defaultGateThresholds.IAS_min;
  const application = defaultGateThresholds.AS_min;
  assert.equal(decide({ IAS: justBelow(ias) }), "ESCALATE");
  assert.equal(decide({ IAS: ias }), "PROMOTE");
  assert.equal(decide({ IAS: justAbove(ias) }), "PROMOTE");
  assert.equal(decide({ AS: justBelow(application) }), "ESCALATE");
  assert.equal(decide({ AS: application }), "PROMOTE");
  assert.equal(decide({ AS: justAbove(application) }), "PROMOTE");
});

test("IAS and AS hard failures still block when PAS passes", () => {
  assert.equal(decide({ IAS: justBelow(IAS_HARD_BLOCK_BELOW) }), "BLOCK");
  assert.equal(decide({ IAS: IAS_HARD_BLOCK_BELOW }), "ESCALATE");
  assert.equal(decide({ IAS: justAbove(IAS_HARD_BLOCK_BELOW) }), "ESCALATE");
  assert.equal(decide({ AS: justBelow(AS_HARD_BLOCK_BELOW) }), "BLOCK");
  assert.equal(decide({ AS: AS_HARD_BLOCK_BELOW }), "ESCALATE");
  assert.equal(decide({ AS: justAbove(AS_HARD_BLOCK_BELOW) }), "ESCALATE");
});

test("PAS below threshold blocks even when another score has a hard failure or would promote", () => {
  const outcome = evaluateGate({
    IAS: justBelow(IAS_HARD_BLOCK_BELOW),
    PAS: justBelow(defaultGateThresholds.PAS_min),
    AS: 0.95,
  });
  assert.equal(outcome.decision, "BLOCK");
  assert.equal(outcome.pasBlocks, true);
  assert.equal(outcome.iasHardFailure, true);

  assert.equal(decide({ IAS: 0.99, PAS: justBelow(0.85), AS: 0.99 }), "BLOCK");
});

test("scripted guided decisions match the gate rule", () => {
  for (const scenario of guidedScenarios) {
    const outcome = evaluateGate(scenario.judge.scores, scenario.judge.thresholds);
    assert.equal(outcome.decision, scenario.judge.decision, scenario.id);
    assert.equal(outcome.pasBlocks, false, scenario.id);
  }
});
