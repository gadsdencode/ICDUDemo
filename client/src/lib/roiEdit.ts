import {
  calculateRoi,
  roiCalculatorRanges,
  roiResultSummarySentence,
  type RoiInputs,
  type RoiResults,
} from "@/data/businessCase";

const inputKeys = ["workflows", "dayRate", "incidentProb", "incidentCost", "auditCycles"] as const;
export type RoiInputKey = (typeof inputKeys)[number];

export function applyRoiInputs(
  current: RoiInputs,
  patch: Partial<RoiInputs>,
):
  | { ok: true; inputs: RoiInputs; results: RoiResults; summary: string; modeledEstimate: true }
  | { ok: false; error: string } {
  const present = inputKeys.filter((key) => patch[key] !== undefined);
  if (present.length === 0) return { ok: false, error: "Name at least one calculator input to change." };
  const next: RoiInputs = { ...current };
  for (const key of present) {
    const value = patch[key];
    const range = roiCalculatorRanges[key];
    if (typeof value !== "number" || !Number.isFinite(value) || !Number.isInteger(value)) {
      return { ok: false, error: `${range.label} must be a whole number.` };
    }
    if (value < range.min || value > range.max) {
      return { ok: false, error: `${range.label} must be between ${range.min} and ${range.max}.` };
    }
    if ((value - range.min) % range.step !== 0) {
      return { ok: false, error: `${range.label} must move in steps of ${range.step}.` };
    }
    next[key] = value;
  }
  const results = calculateRoi(next);
  return {
    ok: true,
    inputs: next,
    results,
    summary: roiResultSummarySentence(next, results),
    modeledEstimate: true,
  };
}
