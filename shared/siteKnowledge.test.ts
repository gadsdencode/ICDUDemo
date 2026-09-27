import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  driftAnchors,
  getSiteSection,
  pageFromPath,
  recommendSiteResources,
  searchSiteContent,
  sitePages,
} from "./siteKnowledge.ts";

const published = ["/", "/journey", "/demos", "/business-case", "/faq", "/resources", "/research", "/developers", "/licensing", "/investor"];

test("published routes are registered and private or redirect paths are not knowledge pages", () => {
  for (const path of published) {
    assert.ok(pageFromPath(path), path);
  }
  assert.equal(pageFromPath("/ask"), undefined);
  assert.equal(pageFromPath("/fine-tune"), undefined);
  assert.equal(sitePages.some((page) => page.path === "/ask" || page.path === "/fine-tune"), false);
});

test("search returns source links and says when a section is missing", () => {
  const found = searchSiteContent("commercial use license");
  assert.equal(found.found, true);
  assert.ok(found.results.some((hit) => hit.href.startsWith("/licensing") || hit.href.startsWith("/faq")));
  const missing = getSiteSection("research", "not-a-section");
  assert.equal(missing, undefined);
  const recommendation = recommendSiteResources({ group: "research" });
  assert.match(recommendation.note, /has not read/);
  assert.ok(recommendation.items.every((item) => item.fileBodyRead === false));
});

test("embedded page sentences still match the registry drift anchors", () => {
  for (const anchor of driftAnchors) {
    const source = readFileSync(anchor.file, "utf8");
    assert.ok(source.includes(anchor.text), `${anchor.file} lost: ${anchor.text}`);
  }
});
