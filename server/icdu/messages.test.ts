import assert from "node:assert/strict";
import test from "node:test";
import { filterFrontendTools } from "./messages.ts";
import { lookupPublishedTerm } from "./glossaryTool.ts";
import type { RunAgentInput } from "@ag-ui/core";

test("frontend tools drop administrative names and keep a harmless one", () => {
  const tools = [
    { name: "delete_database", description: "drop tables", parameters: { type: "object", properties: {} } },
    { name: "show_safe_note", description: "show a note", parameters: { type: "object", properties: { note: { type: "string" } } } },
    { name: "lookup_icdu_term", description: "reserved", parameters: { type: "object", properties: {} } },
  ] as RunAgentInput["tools"];
  const kept = filterFrontendTools(tools);
  assert.deepEqual(kept.map((tool) => tool.name), ["show_safe_note"]);
});

test("glossary lookup validates arguments before returning a definition", () => {
  const found = lookupPublishedTerm("ICDU");
  assert.equal(found.found, true);
  assert.match(found.definition ?? "", /Intent-Conscious/);
  assert.equal(lookupPublishedTerm("not-a-term").found, false);
  assert.equal(lookupPublishedTerm("").found, false);
  assert.equal(lookupPublishedTerm("x".repeat(81)).found, false);
});
