import { z } from "zod";
import {
  faqCategoryIds,
  guidedStepIds,
  labTabIds,
  personaIds,
  scenarioIds,
  sitePages,
} from "./siteKnowledge.ts";

export const SERVER_TOOL_NAMES = [
  "lookup_icdu_term",
  "search_site_content",
  "get_site_section",
  "recommend_site_resources",
] as const;

export const FRONTEND_TOOL_NAMES = [
  "navigate_site",
  "set_visitor_audience",
  "set_demo_mode",
  "select_guided_scenario",
  "set_guided_stage",
  "select_lab_tab",
  "open_faq",
  "set_roi_inputs",
  "confirm_reset_roi",
  "confirm_discard_guided_progress",
] as const;

export type FrontendToolName = (typeof FRONTEND_TOOL_NAMES)[number];

const pageIds = sitePages.map((page) => page.id);
const faqCategories = faqCategoryIds();

function enumValues(values: readonly string[]): [string, ...string[]] {
  if (values.length === 0) throw new Error("Cannot build an empty tool enum.");
  return [values[0], ...values.slice(1)];
}

export const navigateSiteSchema = z
  .object({
    pageId: z.enum(enumValues(pageIds)),
    sectionId: z.string().max(80).optional(),
    personaId: z.enum(enumValues(personaIds)).optional(),
    industryId: z.enum(enumValues(scenarioIds)).optional(),
    demoMode: z.enum(["guided", "lab"]).optional(),
  })
  .strict();

export const setVisitorAudienceSchema = z
  .object({
    personaId: z.enum(enumValues(personaIds)).optional(),
    industryId: z.enum(enumValues(scenarioIds)).optional(),
  })
  .strict();

export const setDemoModeSchema = z
  .object({
    mode: z.enum(["guided", "lab"]),
  })
  .strict();

export const selectGuidedScenarioSchema = z
  .object({
    scenarioId: z.enum(enumValues(scenarioIds)),
  })
  .strict();

export const setGuidedStageSchema = z
  .object({
    action: z.enum(["continue", "back", "revisit"]),
    stepId: z.enum(enumValues(guidedStepIds)).optional(),
  })
  .strict();

export const selectLabTabSchema = z
  .object({
    tab: z.enum(enumValues(labTabIds)),
  })
  .strict();

export const openFaqSchema = z
  .object({
    id: z.string().max(80).optional(),
    category: z.enum(enumValues(faqCategories)).optional(),
  })
  .strict();

export const setRoiInputsSchema = z
  .object({
    workflows: z.number().int().min(1).max(50).optional(),
    dayRate: z.number().int().min(400).max(2000).optional(),
    incidentProb: z.number().int().min(5).max(40).optional(),
    incidentCost: z.number().int().min(100_000).max(10_000_000).optional(),
    auditCycles: z.number().int().min(1).max(12).optional(),
  })
  .strict();

export const confirmSchema = z.object({}).strict();

export const searchSiteSchema = z
  .object({
    query: z.string().trim().min(2).max(120),
  })
  .strict();

export const getSiteSectionSchema = z
  .object({
    pageId: z.enum(enumValues(pageIds)),
    sectionId: z.string().trim().min(1).max(80),
  })
  .strict();

export const recommendResourcesSchema = z
  .object({
    query: z.string().trim().max(120).optional(),
    group: z.enum(["executive", "research", "technical"]).optional(),
    id: z.string().trim().max(80).optional(),
  })
  .strict();

function stringEnum(values: readonly string[]) {
  return { type: "string", enum: [...values] };
}

function objectSchema(properties: Record<string, unknown>, required: string[] = []) {
  const schema: Record<string, unknown> = { type: "object", properties };
  if (required.length > 0) schema.required = required;
  return schema;
}

/** JSON schemas the browser is allowed to register. Kept aligned with the Zod tools. */
export const frontendParameterSchemas: Record<FrontendToolName, Record<string, unknown>> = {
  navigate_site: objectSchema(
    {
      pageId: stringEnum(pageIds),
      sectionId: { type: "string", maxLength: 80 },
      personaId: stringEnum(personaIds),
      industryId: stringEnum(scenarioIds),
      demoMode: stringEnum(["guided", "lab"]),
    },
    ["pageId"],
  ),
  set_visitor_audience: objectSchema({
    personaId: stringEnum(personaIds),
    industryId: stringEnum(scenarioIds),
  }),
  set_demo_mode: objectSchema({ mode: stringEnum(["guided", "lab"]) }, ["mode"]),
  select_guided_scenario: objectSchema({ scenarioId: stringEnum(scenarioIds) }, ["scenarioId"]),
  set_guided_stage: objectSchema(
    {
      action: stringEnum(["continue", "back", "revisit"]),
      stepId: stringEnum(guidedStepIds),
    },
    ["action"],
  ),
  select_lab_tab: objectSchema({ tab: stringEnum(labTabIds) }, ["tab"]),
  open_faq: objectSchema({
    id: { type: "string", maxLength: 80 },
    category: stringEnum(faqCategories),
  }),
  set_roi_inputs: objectSchema({
    workflows: { type: "integer", minimum: 1, maximum: 50 },
    dayRate: { type: "integer", minimum: 400, maximum: 2000 },
    incidentProb: { type: "integer", minimum: 5, maximum: 40 },
    incidentCost: { type: "integer", minimum: 100_000, maximum: 10_000_000 },
    auditCycles: { type: "integer", minimum: 1, maximum: 12 },
  }),
  confirm_reset_roi: objectSchema({}),
  confirm_discard_guided_progress: objectSchema({}),
};

export const frontendToolSchemas = {
  navigate_site: navigateSiteSchema,
  set_visitor_audience: setVisitorAudienceSchema,
  set_demo_mode: setDemoModeSchema,
  select_guided_scenario: selectGuidedScenarioSchema,
  set_guided_stage: setGuidedStageSchema,
  select_lab_tab: selectLabTabSchema,
  open_faq: openFaqSchema,
  set_roi_inputs: setRoiInputsSchema,
  confirm_reset_roi: confirmSchema,
  confirm_discard_guided_progress: confirmSchema,
} as const;

export type AssistantSurface = {
  pageId: string | null;
  demoMode?: "guided" | "lab" | null;
  scenarioSelected?: boolean;
  discardAvailable?: boolean;
  roiAvailable?: boolean;
};

/** Tools that should be visible together. Stays within the seven-tool gateway cap. */
export function frontendToolsForSurface(surface: AssistantSurface): FrontendToolName[] {
  const names: FrontendToolName[] = ["navigate_site", "set_visitor_audience"];
  if (surface.pageId === "demos") {
    names.push("set_demo_mode");
    if (surface.demoMode === "lab") {
      names.push("select_lab_tab");
    } else {
      names.push("select_guided_scenario");
      if (surface.scenarioSelected) names.push("set_guided_stage");
    }
  }
  if (surface.discardAvailable) names.push("confirm_discard_guided_progress");
  if (surface.pageId === "faq") names.push("open_faq");
  if (surface.pageId === "business-case" && surface.roiAvailable) {
    names.push("set_roi_inputs", "confirm_reset_roi");
  }
  return names;
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => canonicalize(item));
  if (!value || typeof value !== "object") return value;
  const record = value as Record<string, unknown>;
  const next: Record<string, unknown> = {};
  for (const key of Object.keys(record).sort()) {
    if (key === "$schema") continue;
    if (key === "additionalProperties" && record[key] === false) continue;
    next[key] = canonicalize(record[key]);
  }
  return next;
}

export function schemasMatch(actual: unknown, expected: unknown): boolean {
  return JSON.stringify(canonicalize(actual)) === JSON.stringify(canonicalize(expected));
}

export function frontendToolRejection(
  tool: { name?: unknown; parameters?: unknown; description?: unknown },
  seen: Set<string>,
): string | null {
  if (!tool || typeof tool.name !== "string") return "unnamed";
  if (seen.has(tool.name)) return "duplicate";
  if ((SERVER_TOOL_NAMES as readonly string[]).includes(tool.name)) return "server-collision";
  if (!(FRONTEND_TOOL_NAMES as readonly string[]).includes(tool.name)) return "unknown";
  const expected = frontendParameterSchemas[tool.name as FrontendToolName];
  if (!schemasMatch(tool.parameters, expected)) return "schema";
  const encoded = JSON.stringify(tool);
  if (encoded.length > 8_000) return "too-large";
  return null;
}
