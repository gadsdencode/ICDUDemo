import { z } from "zod";
import {
  developerSectionIds,
  faqCategoryIds,
  faqIds,
  guidedStepIds,
  labTabIds,
  personaIds,
  resourceIds,
  scenarioIds,
  sitePages,
  workspaceViewIds,
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
  "show_workspace",
  "read_workspace",
  "propose_workspace_edit",
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

export const showWorkspaceSchema = z
  .object({
    view: z.enum(enumValues(workspaceViewIds)),
    personaId: z.enum(enumValues(personaIds)).optional(),
    scenarioId: z.enum(enumValues(scenarioIds)).optional(),
    stepId: z.enum(enumValues(guidedStepIds)).optional(),
    faqId: z.enum(enumValues(faqIds)).optional(),
    faqCategory: z.enum(enumValues(faqCategories)).optional(),
    resourceId: z.enum(enumValues(resourceIds)).optional(),
    labTab: z.enum(enumValues(labTabIds)).optional(),
    developerSection: z.enum(enumValues(developerSectionIds)).optional(),
    focusKind: z.enum(["field", "score", "evidence", "criterion", "principle", "assumption"]).optional(),
    focusId: z.string().trim().min(1).max(80).optional(),
  })
  .strict();

export const readWorkspaceSchema = z
  .object({
    section: z.enum(["active", "evidence", "scores", "contract", "roi", "review", "pilot"]),
  })
  .strict();

export const proposeWorkspaceEditSchema = z
  .object({
    target: z.enum(["contract", "pilot"]),
    field: z.enum(["primary_goal", "prompt", "domain", "criterion", "principle", "constraint", "outcome", "owner", "stakeholders", "criteria", "dependencies", "questions", "baseline"]),
    value: z.string().trim().min(1).max(400),
  })
  .strict();

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
  show_workspace: objectSchema(
    {
      view: stringEnum(workspaceViewIds),
      personaId: stringEnum(personaIds),
      scenarioId: stringEnum(scenarioIds),
      stepId: stringEnum(guidedStepIds),
      faqId: stringEnum(faqIds),
      faqCategory: stringEnum(faqCategoryIds()),
      resourceId: stringEnum(resourceIds),
      labTab: stringEnum(labTabIds),
      developerSection: stringEnum(developerSectionIds),
      focusKind: stringEnum(["field", "score", "evidence", "criterion", "principle", "assumption"]),
      focusId: { type: "string", minLength: 1, maxLength: 80 },
    },
    ["view"],
  ),
  read_workspace: objectSchema(
    { section: stringEnum(["active", "evidence", "scores", "contract", "roi", "review", "pilot"]) },
    ["section"],
  ),
  propose_workspace_edit: objectSchema(
    {
      target: stringEnum(["contract", "pilot"]),
      field: stringEnum(["primary_goal", "prompt", "domain", "criterion", "principle", "constraint", "outcome", "owner", "stakeholders", "criteria", "dependencies", "questions", "baseline"]),
      value: { type: "string", minLength: 1, maxLength: 400 },
    },
    ["target", "field", "value"],
  ),
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
  show_workspace: showWorkspaceSchema,
  read_workspace: readWorkspaceSchema,
  propose_workspace_edit: proposeWorkspaceEditSchema,
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
  /** In-conversation view. Tools follow this capability, not a pretended route. */
  workspaceView?: (typeof workspaceViewIds)[number] | null;
};

const TOOL_CAP = 7;

/** Tools that should be visible together. Stays within the seven-tool gateway cap. */
export function frontendToolsForSurface(surface: AssistantSurface): FrontendToolName[] {
  const names: FrontendToolName[] = ["navigate_site", "set_visitor_audience", "show_workspace"];
  const view = surface.workspaceView ?? null;
  const readable = view != null || surface.pageId === "demos" || surface.pageId === "business-case";
  const pageGuided = surface.pageId === "demos" && surface.demoMode !== "lab";
  const pageLab = surface.pageId === "demos" && surface.demoMode === "lab";
  const guidedCap =
    view === "workflows" || view === "guided" || view === "results" || (view == null && pageGuided);
  const labCap = view === "lab" || view === "developer" || (view == null && pageLab);
  const faqCap = view === "faq" || (view == null && surface.pageId === "faq");
  const roiCap = view === "value" || (view == null && surface.pageId === "business-case" && Boolean(surface.roiAvailable));
  const add = (name: FrontendToolName) => {
    if (names.length >= TOOL_CAP || names.includes(name)) return;
    names.push(name);
  };
  if (readable) add("read_workspace");
  if (view === "contract" || view === "pilot") add("propose_workspace_edit");
  if (surface.discardAvailable) add("confirm_discard_guided_progress");
  if (guidedCap) {
    add("select_guided_scenario");
    if (surface.scenarioSelected || view === "guided" || view === "results") add("set_guided_stage");
  }
  if (roiCap) {
    add("set_roi_inputs");
    add("confirm_reset_roi");
  }
  if (faqCap) add("open_faq");
  if (labCap) add("select_lab_tab");
  if (surface.pageId === "demos") add("set_demo_mode");
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
