import assert from "node:assert/strict";
import test from "node:test";
import { evaluateGate } from "./gateDecision.ts";
import {
  applyProposal,
  evidenceFor,
  briefFacts,
  escapeHtml,
  freshTask,
  illustrativeScores,
  judgeIsCurrent,
  parseStoredTask,
  renderBrief,
  runIllustrativeJudge,
  serializeTask,
  validateFocus,
  whatIfDecision,
} from "./taskState.ts";
import { getGuidedScenario } from "../data/guidedScenarios.ts";
import { frontendToolsForSurface } from "../../../shared/assistantContract.ts";

test("a draft id stays stable across storage and a new id is explicit", () => {
  const task = freshTask("healthcare-admin");
  const id = task.contract.icdu_id;
  const restored = parseStoredTask(serializeTask(task));
  assert.ok(restored);
  assert.equal(restored.contract.icdu_id, id);
  assert.equal(restored.contract.revision, 1);
  assert.equal(restored.judge, null);
  const again = freshTask("healthcare-admin");
  assert.notEqual(again.contract.icdu_id, id);
});

test("an illustrative judge stays attached to its revision", () => {
  const task = freshTask("healthcare-admin");
  const first = runIllustrativeJudge(task.contract);
  const same = runIllustrativeJudge(task.contract);
  assert.deepEqual(first.scores, same.scores);
  assert.equal(judgeIsCurrent(task.contract, first), true);
  const edited = { ...task.contract, revision: task.contract.revision + 1 };
  assert.equal(judgeIsCurrent(edited, first), false);
  assert.deepEqual(illustrativeScores("same"), illustrativeScores("same"));
});

test("a proposal applies once and a stale proposal does not rewrite the draft", () => {
  const task = freshTask(null);
  const proposed = {
    ...task,
    proposal: {
      operationId: "p1",
      target: "contract" as const,
      field: "primary_goal",
      before: "",
      after: "Reduce rework",
      baseRevision: task.contract.revision,
    },
  };
  const applied = applyProposal(proposed);
  assert.equal(applied.contract.intent.primary_goal, "Reduce rework");
  assert.equal(applied.contract.revision, task.contract.revision + 1);
  assert.equal(applied.proposal, null);
  const stale = applyProposal({ ...proposed, contract: applied.contract });
  assert.equal(stale.proposal, null);
  assert.equal(stale.contract.intent.primary_goal, "Reduce rework");
});

test("threshold exploration does not change the published decision inputs", () => {
  const scenario = getGuidedScenario("healthcare-admin");
  assert.ok(scenario);
  const original = evaluateGate(scenario.judge.scores, scenario.judge.thresholds).decision;
  const explored = whatIfDecision(scenario.judge.scores, { IAS_min: 0.99, PAS_min: 0.99, AS_min: 0.99 });
  assert.equal(evaluateGate(scenario.judge.scores, scenario.judge.thresholds).decision, original);
  assert.notEqual(explored.decision, original);
  assert.match(explored.rule, /PAS|threshold|ESCALATE|hard-failure/);
});

test("focus targets and the tool cap stay bounded", () => {
  const scenario = getGuidedScenario("healthcare-admin") ?? null;
  assert.equal(validateFocus(scenario, "score", "PAS").ok, true);
  assert.equal(validateFocus(scenario, "score", "made-up").ok, false);
  const names = frontendToolsForSurface({ pageId: "overview", workspaceView: "guided", scenarioSelected: true, discardAvailable: true });
  assert.ok(names.length <= 7);
  assert.ok(names.includes("read_workspace"));
  assert.equal(names.includes("propose_workspace_edit"), false);
});

test("reviewed evidence links use authored drivers and leave unmapped requirements unmapped", () => {
  const healthcare = getGuidedScenario("healthcare-admin");
  assert.ok(healthcare);
  const mapped = evidenceFor(healthcare, "principle", healthcare.principles[0]);
  assert.equal(mapped.mapped, true);
  assert.match(mapped.text, /clinical/);
  const fee = getGuidedScenario("financial-services");
  assert.ok(fee);
  const unmapped = evidenceFor(fee, "criterion", fee.successCriteria[0]);
  assert.equal(unmapped.mapped, false);
  assert.match(unmapped.text, /no recorded mapping/);
});

test("the brief escapes visitor text and keeps the selected revision", () => {
  const task = freshTask("healthcare-admin");
  task.contract.intent.primary_goal = `<script>alert("x")</script>`;
  const facts = briefFacts({
    scenarioTitle: "Healthcare",
    contract: task.contract,
    evidence: "Scripted example",
    review: task.review,
    roiLine: "Modeled estimate",
    pilot: task.pilot,
  });
  const rendered = renderBrief(facts);
  assert.match(rendered.markdown, /revision 1/);
  assert.match(rendered.html, /&lt;script&gt;/);
  assert.equal(escapeHtml(`&<>"'`), "&amp;&lt;&gt;&quot;&#39;");
  assert.doesNotMatch(rendered.html, /<script>/);
  assert.match(rendered.html, /article p:last-child\{break-before:avoid\}/);
  assert.match(rendered.html, /color:#182635/);
  assert.match(rendered.html, /color-scheme" content="light"/);
});
