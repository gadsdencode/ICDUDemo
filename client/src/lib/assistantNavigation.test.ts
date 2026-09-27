import assert from "node:assert/strict";
import test from "node:test";
import { planNavigation } from "./assistantNavigation.ts";

const current = {
  pathname: "/research",
  personaId: "executive" as const,
  industryId: "healthcare-admin" as const,
  demoMode: null,
};

test("navigation accepts registry destinations and rejects arbitrary targets", () => {
  const developers = planNavigation({ pageId: "developers", sectionId: "hands-on" }, current);
  assert.equal(developers.ok, true);
  if (developers.ok) {
    assert.equal(developers.path, "/developers");
    assert.match(developers.href, /persona=executive/);
    assert.match(developers.href, /#hands-on$/);
  }
  assert.equal(planNavigation({ pageId: "https://evil.example" }, current).ok, false);
  assert.equal(planNavigation({ pageId: "developers", sectionId: "javascript:alert(1)" }, current).ok, false);
  assert.equal(planNavigation({ pageId: "demos", personaId: "root" }, current).ok, false);
  assert.equal(planNavigation({ pageId: "faq", industryId: "unknown-workflow" }, current).ok, false);
});

test("healthcare scenario and executive role resolve to existing demo state", () => {
  const planned = planNavigation(
    { pageId: "demos", personaId: "executive", industryId: "healthcare-admin", demoMode: "guided" },
    { ...current, pathname: "/", personaId: null, industryId: null },
  );
  assert.equal(planned.ok, true);
  if (planned.ok) {
    assert.equal(planned.path, "/demos");
    assert.match(planned.href, /persona=executive/);
    assert.match(planned.href, /industry=healthcare-admin/);
    assert.equal(planned.href.includes("mode=lab"), false);
  }
});
