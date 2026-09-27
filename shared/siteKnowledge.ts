// Published-page registry for the website assistant.
// Facts come from the site data modules. JSX-only sentences are listed in
// driftAnchors and checked against the source files that render them.

import { personaAudiences } from "../client/src/data/audience.ts";
import {
  businessCaseIntro,
  efficiencyStats,
  exposurePanel,
  financialImpact,
  outcomePillars,
  pilotPathPanel,
  regulations,
  roiModelAssumptionCopy,
  stakeholderArguments,
  standardBenchmarks,
  workComparison,
} from "../client/src/data/businessCase.ts";
import { guidedScenarios, guidedSteps } from "../client/src/data/guidedScenarios.ts";
import {
  investorDifferentiators,
  investorMarketBars,
  investorMarketStat,
  investorPageIntro,
  investorRegulatoryTailwinds,
  investorStatus,
  investorUseCaseCards,
} from "../client/src/data/investorContent.ts";
import journeys from "../client/src/data/journeys.json";
import {
  categorizedFaqItems,
  faqCategories,
  generatedTechnicalDocs,
  researchClaimTypes,
  resourceGroups,
  staticDownloads,
  type CatalogItem,
} from "../client/src/data/siteResources.ts";

export type SiteSection = {
  pageId: string;
  sectionId: string;
  heading: string;
  text: string;
  href: string;
  source: string;
  /** False for searchable text that is not a real page anchor. */
  anchor: boolean;
};

export type SitePage = {
  id: string;
  path: string;
  title: string;
  summary: string;
  source: string;
};

type JourneyTab = { id: string; title: string; h2: string; lead: string };
type JourneyFile = Record<string, { tabs?: JourneyTab[] }>;

const journeyFile = journeys as JourneyFile;

export const personaIds = personaAudiences.map((persona) => persona.id);
export const scenarioIds = guidedScenarios.map((scenario) => scenario.id);
export const faqIds = categorizedFaqItems.map((item) => item.id);
export const labTabIds = ["icdu", "judge", "hitl", "stress"] as const;
export const guidedStepIds = guidedSteps.map((step) => step.id);

const catalog: CatalogItem[] = [...staticDownloads, ...generatedTechnicalDocs];

function clip(value: string, max: number): string {
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

function hrefFor(path: string, sectionId: string): string {
  return sectionId === "intro" ? path : `${path}#${sectionId}`;
}

function section(
  pageId: string,
  path: string,
  sectionId: string,
  heading: string,
  text: string,
  source: string,
  anchor = true,
): SiteSection {
  return {
    pageId,
    sectionId,
    heading,
    text: clip(text, 1_200),
    href: hrefFor(path, sectionId),
    source,
    anchor,
  };
}

const pages: SitePage[] = [
  {
    id: "overview",
    path: "/",
    title: "Overview",
    summary:
      "AI Guided by Intent. ICDU turns a work request into a clear, guided AI process: it captures what the user intends, applies the relevant expertise and rules, checks the result against those requirements, and keeps a record of how the outcome was produced. This helps teams get more consistent, reviewable, and accountable results from AI. Visitors choose a role and a workflow, then continue to a journey, demo, or business case.",
    source: "client/src/components/AudienceFunnel.tsx",
  },
  {
    id: "journey",
    path: "/journey",
    title: "Role journeys",
    summary:
      "Choose a Leadership, Governance & Risk, or Technical path. Each role has a guided journey: situation, what changes, how it works, evidence, and next steps.",
    source: "client/src/pages/Journey.tsx",
  },
  {
    id: "demos",
    path: "/demos",
    title: "Interactive demos",
    summary:
      "A guided scenario carries one workflow from intent to evidence. The Advanced Lab opens Builder, Judge, HITL, and Stress controls. Guided scores and lab results are simulated.",
    source: "client/src/pages/Demos.tsx",
  },
  {
    id: "business-case",
    path: "/business-case",
    title: "Business case",
    summary: businessCaseIntro.description,
    source: "client/src/data/businessCase.ts",
  },
  {
    id: "faq",
    path: "/faq",
    title: "FAQ",
    summary:
      "Short answers about the product, licensing, security, and where to start. Evidence tables live on Research. License terms live on Licensing.",
    source: "client/src/pages/FAQ.tsx",
  },
  {
    id: "resources",
    path: "/resources",
    title: "Resources",
    summary:
      "Downloadable executive, research, and technical materials. Catalog descriptions are not the same as having read the file.",
    source: "client/src/pages/Resources.tsx",
  },
  {
    id: "research",
    path: "/research",
    title: "Evidence and research",
    summary:
      "Supporting evidence, benchmark comparisons, methodology, and regulatory context. Market statistics describe industry conditions and do not by themselves prove an ICDU product result.",
    source: "client/src/pages/Research.tsx",
  },
  {
    id: "developers",
    path: "/developers",
    title: "Developers",
    summary:
      "Schema samples, the Advanced Lab, and a local Fine-Tune utility for teams that already run a training API. Fine-Tune is not a public production service.",
    source: "client/src/pages/Developers.tsx",
  },
  {
    id: "licensing",
    path: "/licensing",
    title: "Licensing",
    summary:
      "ICDU is patented. Public materials support evaluation and research; commercial use requires a license.",
    source: "client/src/pages/Licensing.tsx",
  },
  {
    id: "investor",
    path: "/investor",
    title: "Investor",
    summary: investorPageIntro.description,
    source: "client/src/data/investorContent.ts",
  },
];

function buildSections(): SiteSection[] {
  const built: SiteSection[] = [];
  for (const page of pages) {
    built.push(section(page.id, page.path, "intro", page.title, page.summary, page.source));
  }

  built.push(
    section(
      "overview",
      "/",
      "chooser",
      "Choose a role and workflow",
      "The homepage chooser asks for a role and an industry workflow. The choice is kept in the page address so Back and Forward restore it.",
      "client/src/components/AudienceFunnel.tsx",
    ),
  );

  built.push(
    section(
      "journey",
      "/journey",
      "journey-roles",
      "Choose a role",
      "The journey index lists Leadership, Governance & Risk, and Technical paths.",
      "client/src/pages/Journey.tsx",
    ),
  );
  for (const persona of personaAudiences) {
    const journey = journeyFile[persona.id];
    const tabs = journey?.tabs ?? [];
    built.push(
      section(
        "journey",
        `/journey/${persona.id}`,
        persona.id,
        `${persona.chipLabel} journey`,
        tabs.map((tab) => `${tab.title}: ${tab.h2}`).join(" "),
        "client/src/data/journeys.json",
      ),
    );
    for (const tab of tabs) {
      built.push(
        section(
          "journey",
          `/journey/${persona.id}`,
          `${persona.id}-${tab.id}`,
          tab.h2,
          `${tab.title}. ${tab.lead}`,
          "client/src/data/journeys.json",
        ),
      );
    }
  }

  built.push(
    section(
      "demos",
      "/demos",
      "demo-experience",
      "Guided demo and Advanced Lab",
      "Guided Demo walks one scripted scenario from intent to evidence. Advanced Lab exposes ICDU Builder, AI Judge, HITL rubric, and Stress Engine with deterministic mock behavior. Simulated demo: the reply, scores, and gate decision are scripted. They are not a live model run or a customer outcome.",
      "client/src/pages/Demos.tsx",
    ),
  );
  for (const scenario of guidedScenarios) {
    built.push(
      section(
        "demos",
        "/demos",
        `scenario-${scenario.id}`,
        scenario.title,
        `${scenario.industry}. ${scenario.subtitle} Business task: ${scenario.businessTask} Intended outcome: ${scenario.intendedOutcome} This walkthrough is simulated.`,
        "client/src/data/guidedScenarios.ts",
        false,
      ),
    );
  }

  built.push(
    section(
      "business-case",
      "/business-case",
      "comparison",
      workComparison.heading,
      `${workComparison.lead} ${workComparison.without.map((item) => item.title).join(", ")} compared with ${workComparison.with.map((item) => item.title).join(", ")}.`,
      "client/src/data/businessCase.ts",
    ),
    section(
      "business-case",
      "/business-case",
      "outcomes",
      "Outcomes",
      outcomePillars.map((pillar) => `${pillar.title}: ${pillar.body}`).join(" "),
      "client/src/data/businessCase.ts",
    ),
    section(
      "business-case",
      "/business-case",
      "value-model",
      "Value model",
      `${exposurePanel.heading} ${exposurePanel.lead} ${roiModelAssumptionCopy.map((item) => item.label).join("; ")}. Calculator outputs are modeled estimates for planning, not forecasts or guarantees.`,
      "client/src/data/businessCase.ts",
    ),
    section(
      "business-case",
      "/business-case",
      "value-by-stakeholder",
      "Value by stakeholder",
      stakeholderArguments.map((item) => `${item.role}: ${item.headline}`).join(" "),
      "client/src/data/businessCase.ts",
    ),
    section(
      "business-case",
      "/business-case",
      "pilot-path",
      pilotPathPanel.heading,
      `${pilotPathPanel.lead} ${pilotPathPanel.phases.map((phase) => phase.title).join(", ")}. ${pilotPathPanel.estimateNote}`,
      "client/src/data/businessCase.ts",
    ),
  );

  for (const item of categorizedFaqItems) {
    built.push(
      section(
        "faq",
        "/faq",
        item.id,
        item.question,
        item.answer,
        "client/src/data/siteResources.ts",
      ),
    );
  }

  for (const group of resourceGroups) {
    const items = catalog.filter((item) => item.group === group.id);
    built.push(
      section(
        "resources",
        "/resources",
        group.id,
        group.title,
        `${group.description} ${items.map((item) => `${item.title} (${item.format}): ${item.purpose}`).join(" ")} Catalog text only; file bodies are not included here.`,
        "client/src/data/siteResources.ts",
      ),
    );
  }

  built.push(
    section(
      "research",
      "/research",
      "claim-types",
      "Distinguish evidence types",
      researchClaimTypes.map((type) => `${type.title}: ${type.description}`).join(" "),
      "client/src/data/siteResources.ts",
    ),
    section(
      "research",
      "/research",
      "industry-context",
      "Industry and financial context",
      `Third-party figures. ${Object.values(financialImpact).map((item) => `${item.figure} ${item.context} (${item.source})`).join("; ")}.`,
      "client/src/data/businessCase.ts",
    ),
    section(
      "research",
      "/research",
      "efficiency-targets",
      "ICDU efficiency targets",
      `These figures are pilot targets or benchmark-oriented projections, not independent market proof. ${efficiencyStats.map((stat) => `${stat.value} ${stat.label}`).join("; ")}.`,
      "client/src/pages/Research.tsx",
    ),
    section(
      "research",
      "/research",
      "benchmarks",
      "How ICDU compares to standard benchmarks",
      `Capability benchmarks answer different questions than readiness gates. ${standardBenchmarks.map((item) => `${item.name} measures ${item.measures} and does not cover ${item.blindSpot}`).join("; ")}.`,
      "client/src/data/businessCase.ts",
    ),
    section(
      "research",
      "/research",
      "regulatory",
      "Frameworks that shape evidence needs",
      regulations.map((row) => `${row.name}: ${row.requirement} Penalty: ${row.penalty}`).join(" "),
      "client/src/data/businessCase.ts",
    ),
    section(
      "research",
      "/research",
      "research-downloads",
      "Research documents",
      `Catalog titles only. ${catalog
        .filter((item) => item.group === "research")
        .map((item) => `${item.title} (${item.format}): ${item.purpose}`)
        .join(" ")}. File bodies are not included here.`,
      "client/src/data/siteResources.ts",
    ),
    section(
      "developers",
      "/developers",
      "hands-on",
      "Where to work hands-on",
      "Advanced Lab: Builder, Judge, HITL, and Stress tools with deterministic mock behavior. Fine-Tune is a local developer utility, not a public production service. Guided Demo is a scenario-led walkthrough from intent to evidence.",
      "client/src/pages/Developers.tsx",
    ),
    section(
      "developers",
      "/developers",
      "schema-samples",
      "Schema samples and exports",
      generatedTechnicalDocs.map((item) => `${item.title} (${item.format}): ${item.purpose}`).join(" "),
      "client/src/data/siteResources.ts",
    ),
    section(
      "licensing",
      "/licensing",
      "patent-status",
      "Patent status",
      "ICDU is patented technology in the United States. PCT filing is planned. Publication of product materials, demos, and documentation on this website does not grant a license to practice any patented method.",
      "client/src/pages/Licensing.tsx",
    ),
    section(
      "licensing",
      "/licensing",
      "evaluation-uses",
      "Permitted evaluation uses",
      "Academic research and teaching. Internal testing without revenue impact. Benchmarking and technical comparison. Due diligence and architectural review.",
      "client/src/pages/Licensing.tsx",
    ),
    section(
      "licensing",
      "/licensing",
      "commercial-use",
      "Commercial use",
      "A separate license agreement is required before production deployment or monetized use. Examples: deployment in a production system, use in a paid product or service, internal use that supports revenue-generating operations, model training or fine-tuning for commercial delivery, and offering ICDU-based evaluation as a service.",
      "client/src/pages/Licensing.tsx",
    ),
    section(
      "investor",
      "/investor",
      "status",
      investorStatus.heading,
      `${investorStatus.body} ${investorStatus.bullets.join(" ")}`,
      "client/src/data/investorContent.ts",
    ),
    section(
      "investor",
      "/investor",
      "market",
      "AI governance and efficiency TAM",
      `${investorMarketStat.value} ${investorMarketStat.label}. Market sizing is an estimate for diligence context and does not prove ICDU revenue. ${investorMarketBars.map((bar) => `${bar.label} ${bar.value}`).join("; ")}.`,
      "client/src/data/investorContent.ts",
    ),
    section(
      "investor",
      "/investor",
      "tailwinds",
      "Regulatory and operational pressure",
      investorRegulatoryTailwinds.map((item) => `${item.tag}: ${item.desc}`).join(" "),
      "client/src/data/investorContent.ts",
    ),
    section(
      "investor",
      "/investor",
      "differentiators",
      "Differentiators",
      investorDifferentiators.map((item) => `${item.title}: ${item.desc}`).join(" "),
      "client/src/data/investorContent.ts",
    ),
    section(
      "investor",
      "/investor",
      "sectors",
      "Where governance demand concentrates",
      investorUseCaseCards.map((card) => `${card.category}: ${card.title}. ${card.desc}`).join(" "),
      "client/src/data/investorContent.ts",
    ),
  );

  return built;
}

export const sitePages: readonly SitePage[] = pages;
export const siteSections: readonly SiteSection[] = buildSections();

export const driftAnchors: readonly { file: string; text: string }[] = [
  {
    file: "client/src/components/AudienceFunnel.tsx",
    text: "ICDU turns a work request into a clear, guided AI process:",
  },
  {
    file: "client/src/pages/Demos.tsx",
    text: "Simulated demo. The reply, scores, and gate decision are scripted for this walkthrough.",
  },
  {
    file: "client/src/pages/Research.tsx",
    text: "they do not prove an ICDU product result by themselves.",
  },
  {
    file: "client/src/pages/Research.tsx",
    text: "These figures are pilot targets or benchmark-oriented projections used in product materials",
  },
  {
    file: "client/src/pages/Licensing.tsx",
    text: "ICDU is patented. Public materials support evaluation and research; commercial use requires a license.",
  },
  {
    file: "client/src/pages/Licensing.tsx",
    text: "does not grant a license to practice any patented method.",
  },
  {
    file: "client/src/pages/Licensing.tsx",
    text: "Academic research and teaching",
  },
  {
    file: "client/src/pages/Developers.tsx",
    text: "Fine-Tune — local developer utility",
  },
  {
    file: "client/src/pages/FAQ.tsx",
    text: "Evidence tables and research downloads live on Research; license terms on Licensing.",
  },
];

export function getSitePage(pageId: string): SitePage | undefined {
  return sitePages.find((page) => page.id === pageId);
}

export function pageFromPath(pathname: string): SitePage | undefined {
  if (pathname === "/ask" || pathname === "/fine-tune") return undefined;
  if (pathname === "/") return getSitePage("overview");
  if (pathname === "/journey" || pathname.startsWith("/journey/")) return getSitePage("journey");
  return sitePages.find((page) => page.path === pathname);
}

export function personaFromJourneyPath(pathname: string): string | null {
  const match = /^\/journey\/([a-z0-9-]+)$/.exec(pathname);
  if (!match) return null;
  return personaIds.includes(match[1]) ? match[1] : null;
}

export function getSiteSection(pageId: string, sectionId: string): SiteSection | undefined {
  return siteSections.find((entry) => entry.pageId === pageId && entry.sectionId === sectionId);
}

export function sectionsForPage(pageId: string): SiteSection[] {
  return siteSections.filter((entry) => entry.pageId === pageId);
}

function tokens(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2);
}

function excerpt(text: string, queryTokens: string[], max = 320): string {
  const hay = text.toLowerCase();
  const at = queryTokens.map((token) => hay.indexOf(token)).find((index) => index >= 0) ?? 0;
  const start = Math.max(0, at - 40);
  const slice = text.slice(start, start + max).trim();
  return `${start > 0 ? "…" : ""}${slice}${start + max < text.length ? "…" : ""}`;
}

export type SearchHit = {
  pageId: string;
  title: string;
  sectionId: string;
  heading: string;
  href: string;
  excerpt: string;
  source: string;
};

export function searchSiteContent(query: string): { found: boolean; results: SearchHit[] } {
  const queryTokens = tokens(query).slice(0, 8);
  if (queryTokens.length === 0) return { found: false, results: [] };
  const ranked = siteSections
    .map((entry) => {
      const page = getSitePage(entry.pageId);
      const blob = `${page?.title ?? ""} ${entry.heading} ${entry.text}`;
      const score = queryTokens.reduce((sum, token) => sum + (blob.toLowerCase().includes(token) ? 1 : 0), 0);
      return { entry, page, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.heading.localeCompare(b.entry.heading))
    .slice(0, 4);
  if (ranked.length === 0) return { found: false, results: [] };
  return {
    found: true,
    results: ranked.map(({ entry, page }) => ({
      pageId: entry.pageId,
      title: page?.title ?? entry.pageId,
      sectionId: entry.sectionId,
      heading: entry.heading,
      href: entry.href,
      excerpt: excerpt(`${entry.heading}. ${entry.text}`, queryTokens),
      source: entry.source,
    })),
  };
}

export function readSiteSection(pageId: string, sectionId: string): {
  found: boolean;
  pageId: string;
  sectionId: string;
  title?: string;
  heading?: string;
  href?: string;
  text?: string;
  source?: string;
  message?: string;
} {
  const page = getSitePage(pageId);
  const entry = page ? getSiteSection(pageId, sectionId) : undefined;
  if (!page || !entry) {
    return {
      found: false,
      pageId,
      sectionId,
      message: "Published material does not include that section.",
    };
  }
  return {
    found: true,
    pageId,
    sectionId,
    title: page.title,
    heading: entry.heading,
    href: entry.href,
    text: entry.text,
    source: entry.source,
  };
}

export type ResourceRecommendation = {
  id: string;
  title: string;
  purpose: string;
  format: string;
  href: string | null;
  group: string;
  fileBodyRead: false;
};

export function recommendSiteResources(input: {
  query?: string;
  group?: "executive" | "research" | "technical";
  id?: string;
}): { note: string; items: ResourceRecommendation[] } {
  const note =
    "Catalog titles and descriptions only. The assistant has not read the PDF, DOCX, or other file body.";
  if (input.id) {
    const item = catalog.find((entry) => entry.id === input.id);
    return {
      note,
      items: item ? [toRecommendation(item)] : [],
    };
  }
  const queryTokens = tokens(input.query ?? "");
  const items = catalog
    .filter((item) => (input.group ? item.group === input.group : true))
    .map((item) => ({
      item,
      score: queryTokens.reduce(
        (sum, token) => sum + (`${item.title} ${item.purpose} ${item.audience}`.toLowerCase().includes(token) ? 1 : 0),
        0,
      ),
    }))
    .filter((item) => queryTokens.length === 0 || item.score > 0)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
    .slice(0, 4)
    .map((item) => toRecommendation(item.item));
  return { note, items };
}

function toRecommendation(item: CatalogItem): ResourceRecommendation {
  return {
    id: item.id,
    title: item.title,
    purpose: item.purpose,
    format: item.format,
    href: item.href ?? null,
    group: item.group,
    fileBodyRead: false,
  };
}

export function isPersonaId(id: string): boolean {
  return personaIds.includes(id);
}

export function isScenarioId(id: string): boolean {
  return scenarioIds.includes(id);
}

export function isFaqId(id: string): boolean {
  return faqIds.includes(id);
}

export function faqItem(id: string) {
  return categorizedFaqItems.find((item) => item.id === id);
}

export function faqCategoryIds(): string[] {
  return faqCategories.map((category) => category.id);
}
