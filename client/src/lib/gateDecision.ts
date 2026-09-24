// client/src/lib/gateDecision.ts
// Gate decision for the public Judge demonstration.
// PAS uses the configured threshold only: below it blocks.

export type GateScores = {
  IAS: number;
  PAS: number;
  AS: number;
};

export type GateThresholds = {
  IAS_min: number;
  PAS_min: number;
  AS_min: number;
};

export type GateDecision = "PROMOTE" | "ESCALATE" | "BLOCK";

export type GateOutcome = {
  decision: GateDecision;
  /** PAS is below the configured PAS threshold. */
  pasBlocks: boolean;
  /** IAS is below the existing hard-failure floor. Not a PAS threshold. */
  iasHardFailure: boolean;
  /** AS is below the existing hard-failure floor. Not a PAS threshold. */
  asHardFailure: boolean;
};

/** Thresholds shown by the Judge demo and the sample scoring record. */
export const defaultGateThresholds: GateThresholds = {
  IAS_min: 0.8,
  PAS_min: 0.85,
  AS_min: 0.7,
};

/**
 * Hard-failure floors already used for IAS and AS.
 * They are not a second PAS threshold.
 */
export const IAS_HARD_BLOCK_BELOW = 0.65;
export const AS_HARD_BLOCK_BELOW = 0.55;

export function formatGatePercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function pasGateExplanation(thresholds: GateThresholds): string {
  const pas = formatGatePercent(thresholds.PAS_min);
  const ias = formatGatePercent(thresholds.IAS_min);
  const application = formatGatePercent(thresholds.AS_min);
  return `PAS below ${pas} blocks the result, even when IAS and AS pass. Meeting ${pas} does not by itself produce PROMOTE; IAS must also reach ${ias} and AS must reach ${application}.`;
}

/**
 * PAS below its configured threshold blocks, even when the other scores would pass.
 * Otherwise an IAS or AS hard failure blocks. All configured thresholds met means PROMOTE.
 * Anything remaining is ESCALATE.
 */
export function evaluateGate(
  scores: GateScores,
  thresholds: GateThresholds = defaultGateThresholds,
): GateOutcome {
  const pasBlocks = scores.PAS < thresholds.PAS_min;
  const iasHardFailure = scores.IAS < IAS_HARD_BLOCK_BELOW;
  const asHardFailure = scores.AS < AS_HARD_BLOCK_BELOW;
  const meetsAll =
    scores.IAS >= thresholds.IAS_min &&
    scores.PAS >= thresholds.PAS_min &&
    scores.AS >= thresholds.AS_min;

  let decision: GateDecision;
  if (pasBlocks || iasHardFailure || asHardFailure) {
    decision = "BLOCK";
  } else if (meetsAll) {
    decision = "PROMOTE";
  } else {
    decision = "ESCALATE";
  }

  return { decision, pasBlocks, iasHardFailure, asHardFailure };
}
