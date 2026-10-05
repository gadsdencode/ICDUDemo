import { z } from "zod";
import { workspaceViewIds } from "./siteKnowledge.ts";

export const CURRENT_PAGE_CONTEXT = "Current page";

export const SCORE_DEFINITIONS = {
  IAS: "Intent-Alignment Score",
  PAS: "Principle-Adherence Score",
  AS: "Application Score",
} as const;

const definitionSchema = z
  .object({
    IAS: z.literal(SCORE_DEFINITIONS.IAS),
    PAS: z.literal(SCORE_DEFINITIONS.PAS),
    AS: z.literal(SCORE_DEFINITIONS.AS),
  })
  .strict();

const thresholdSchema = z
  .object({
    IAS_min: z.number(),
    PAS_min: z.number(),
    AS_min: z.number(),
  })
  .strict();

const scoreSchema = z
  .object({
    IAS: z.number(),
    PAS: z.number(),
    AS: z.number(),
    decision: z.enum(["PROMOTE", "ESCALATE", "BLOCK"]),
  })
  .strict();

const assumptionKeySchema = z.enum(["workflows", "dayRate", "incidentProb", "incidentCost", "auditCycles"]);

const assumptionValuesSchema = z
  .object({
    workflows: z.number(),
    dayRate: z.number(),
    incidentProb: z.number(),
    incidentCost: z.number(),
    auditCycles: z.number(),
  })
  .strict();

const effectKeySchema = z.enum(["engineeringSavings", "complianceLabor", "riskAvoidance", "modeledCost"]);

const effectDeltaSchema = z
  .object({
    changed: z.array(effectKeySchema).max(4),
    unchanged: z.array(effectKeySchema).max(4),
  })
  .strict();

const activeSchema = z
  .object({
    kind: z.enum(["guided", "evidence", "contract", "readiness", "review", "compare", "value", "pilot", "brief", "lab", "faq"]),
    artifactId: z.string().max(80).nullable(),
    revision: z.number().int(),
    sourceId: z.string().max(80).nullable(),
    stage: z.string().max(40).nullable(),
    simulated: z.literal(true).optional(),
    evaluated: z.boolean().optional(),
    provenance: z.enum(["scripted-example", "simulated-lab"]).optional(),
    scores: scoreSchema.optional(),
    thresholds: thresholdSchema.optional(),
    definitions: definitionSchema.optional(),
    rationale: z.string().max(280).optional(),
    roi: z
      .object({
        workflows: z.number(),
        dayRate: z.number(),
        incidentProb: z.number().optional(),
        incidentCost: z.number().optional(),
        auditCycles: z.number().optional(),
        roi: z.number(),
        netBenefit: z.number(),
        modeledEstimate: z.literal(true),
        example: assumptionValuesSchema.optional(),
        edited: z.array(assumptionKeySchema).max(5).optional(),
        unchanged: z.array(assumptionKeySchema).max(5).optional(),
        effects: effectDeltaSchema.optional(),
      })
      .strict()
      .optional(),
    focus: z
      .object({
        kind: z.string().max(40),
        id: z.string().max(80),
      })
      .strict()
      .optional(),
    detail: z.enum(["complete", "read_workspace"]),
    missing: z.string().max(180).optional(),
  })
  .strict();

const workspaceViewSchema = z.enum(workspaceViewIds);

const guidedSchema = z
  .object({
    scenarioId: z.string().max(80),
    title: z.string().max(160),
    step: z.string().max(40),
    ranAi: z.boolean(),
    evaluated: z.boolean(),
    simulated: z.literal(true),
    scores: scoreSchema.optional(),
  })
  .strict();

const roiSchema = z
  .object({
    inputs: z
      .object({
        workflows: z.number(),
        dayRate: z.number(),
        incidentProb: z.number(),
        incidentCost: z.number(),
        auditCycles: z.number(),
      })
      .strict(),
    summary: z.string().max(500),
    modeledEstimate: z.literal(true),
  })
  .strict();

export const pageSnapshotSchema = z
  .object({
    route: z.string().max(160),
    title: z.string().max(160),
    summary: z.string().max(500),
    sectionIds: z.array(z.string().max(80)).max(16),
    personaId: z.string().max(40).nullable(),
    industryId: z.string().max(40).nullable(),
    demoMode: z.enum(["guided", "lab"]).optional(),
    guided: guidedSchema.optional(),
    labTab: z.enum(["icdu", "judge", "hitl", "stress"]).optional(),
    labSummary: z.string().max(400).optional(),
    faq: z
      .object({
        category: z.string().max(40),
        openId: z.string().max(80).nullable(),
      })
      .strict()
      .optional(),
    roi: roiSchema.optional(),
    actions: z.array(z.string().max(64)).max(12),
    workspace: z
      .object({
        view: workspaceViewSchema.nullable(),
        artifactId: z.string().max(80).nullable(),
      })
      .strict()
      .optional(),
    active: activeSchema.optional(),
  })
  .strict();

export type PageSnapshot = z.infer<typeof pageSnapshotSchema>;

const intakeSchema = z
  .object({
    route: z.string().max(2_000),
    title: z.string().max(2_000),
    summary: z.string().max(8_000),
    sectionIds: z.array(z.string().max(200)).max(40),
    personaId: z.string().max(80).nullable(),
    industryId: z.string().max(80).nullable(),
    demoMode: z.enum(["guided", "lab"]).optional(),
    guided: z
      .object({
        scenarioId: z.string().max(200),
        title: z.string().max(400),
        step: z.string().max(80),
        ranAi: z.boolean(),
        evaluated: z.boolean(),
        simulated: z.literal(true),
        scores: scoreSchema.optional(),
      })
      .optional(),
    labTab: z.enum(["icdu", "judge", "hitl", "stress"]).optional(),
    labSummary: z.string().max(2_000).optional(),
    faq: z
      .object({
        category: z.string().max(80),
        openId: z.string().max(160).nullable(),
      })
      .optional(),
    roi: z
      .object({
        inputs: z
          .object({
            workflows: z.number(),
            dayRate: z.number(),
            incidentProb: z.number(),
            incidentCost: z.number(),
            auditCycles: z.number(),
          })
          .strict(),
        summary: z.string().max(2_000),
        modeledEstimate: z.literal(true),
      })
      .optional(),
    actions: z.array(z.string().max(80)).max(20),
    workspace: z
      .object({
        view: workspaceViewSchema.nullable(),
        artifactId: z.string().max(200).nullable(),
      })
      .optional(),
    active: z
      .object({
        kind: z.enum(["guided", "evidence", "contract", "readiness", "review", "compare", "value", "pilot", "brief", "lab", "faq"]),
        artifactId: z.string().max(200).nullable(),
        revision: z.number(),
        sourceId: z.string().max(200).nullable(),
        stage: z.string().max(80).nullable(),
        simulated: z.literal(true).optional(),
        evaluated: z.boolean().optional(),
        provenance: z.enum(["scripted-example", "simulated-lab"]).optional(),
        scores: scoreSchema.optional(),
        thresholds: thresholdSchema.optional(),
        definitions: definitionSchema.optional(),
        rationale: z.string().max(2_000).optional(),
        roi: z
          .object({
            workflows: z.number(),
            dayRate: z.number(),
            incidentProb: z.number().optional(),
            incidentCost: z.number().optional(),
            auditCycles: z.number().optional(),
            roi: z.number(),
            netBenefit: z.number(),
            modeledEstimate: z.literal(true),
            example: assumptionValuesSchema.optional(),
            edited: z.array(assumptionKeySchema).max(5).optional(),
            unchanged: z.array(assumptionKeySchema).max(5).optional(),
            effects: effectDeltaSchema.optional(),
          })
          .optional(),
        focus: z.object({ kind: z.string().max(80), id: z.string().max(200) }).optional(),
        detail: z.enum(["complete", "read_workspace"]),
        missing: z.string().max(500).optional(),
      })
      .optional(),
  })
  .strip();

function boundedSnapshot(value: z.infer<typeof intakeSchema>): PageSnapshot | null {
  const parsed = pageSnapshotSchema.safeParse({
    route: value.route.slice(0, 160),
    title: value.title.slice(0, 160),
    summary: value.summary.slice(0, 500),
    sectionIds: value.sectionIds.slice(0, 16).map((id) => id.slice(0, 80)),
    personaId: value.personaId ? value.personaId.slice(0, 40) : null,
    industryId: value.industryId ? value.industryId.slice(0, 40) : null,
    demoMode: value.demoMode,
    guided: value.guided
      ? {
          ...value.guided,
          scenarioId: value.guided.scenarioId.slice(0, 80),
          title: value.guided.title.slice(0, 160),
          step: value.guided.step.slice(0, 40),
        }
      : undefined,
    labTab: value.labTab,
    labSummary: value.labSummary?.slice(0, 400),
    faq: value.faq
      ? {
          category: value.faq.category.slice(0, 40),
          openId: value.faq.openId ? value.faq.openId.slice(0, 80) : null,
        }
      : undefined,
    roi: value.roi ? { ...value.roi, summary: value.roi.summary.slice(0, 500) } : undefined,
    actions: value.actions.slice(0, 12).map((action) => action.slice(0, 64)),
    workspace: value.workspace
      ? {
          view: value.workspace.view,
          artifactId: value.workspace.artifactId ? value.workspace.artifactId.slice(0, 80) : null,
        }
      : undefined,
    active: value.active
      ? {
          ...value.active,
          artifactId: value.active.artifactId ? value.active.artifactId.slice(0, 80) : null,
          revision: Math.trunc(value.active.revision),
          sourceId: value.active.sourceId ? value.active.sourceId.slice(0, 80) : null,
          stage: value.active.stage ? value.active.stage.slice(0, 40) : null,
          rationale: value.active.rationale?.slice(0, 280),
          missing: value.active.missing?.slice(0, 180),
          focus: value.active.focus
            ? { kind: value.active.focus.kind.slice(0, 40), id: value.active.focus.id.slice(0, 80) }
            : undefined,
        }
      : undefined,
  });
  return parsed.success ? parsed.data : null;
}

export function parseContextValue(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return trimmed;
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return null;
  }
}

function pack(snapshot: PageSnapshot): string {
  return JSON.stringify(snapshot);
}

function activeKept(snapshot: PageSnapshot): PageSnapshot["active"] {
  if (!snapshot.active) return undefined;
  const next = { ...snapshot.active, rationale: undefined, detail: "read_workspace" as const };
  if (!next.missing) next.missing = "Rationale was shortened. Call read_workspace for the displayed record.";
  return next;
}

/** Shrink a validated snapshot without slicing the JSON text itself. Scores stay until the page text is gone. */
export function fitPageSnapshot(value: unknown, maxChars: number): string | null {
  const loose = intakeSchema.safeParse(value);
  if (!loose.success) return null;
  const bounded = boundedSnapshot(loose.data);
  if (!bounded) return null;
  let snapshot: PageSnapshot = bounded;
  if (pack(snapshot).length <= maxChars) return pack(snapshot);

  snapshot = {
    ...snapshot,
    summary: snapshot.summary.slice(0, 80),
    sectionIds: snapshot.sectionIds.slice(0, 2),
    labSummary: undefined,
    roi: snapshot.roi ? { ...snapshot.roi, summary: snapshot.roi.summary.slice(0, 80) } : undefined,
    active: snapshot.active ? { ...snapshot.active, rationale: snapshot.active.rationale?.slice(0, 120) } : undefined,
  };
  if (pack(snapshot).length <= maxChars) return pack(snapshot);

  snapshot = {
    ...snapshot,
    summary: "",
    sectionIds: [],
    labSummary: undefined,
    guided: snapshot.guided ? { ...snapshot.guided, title: snapshot.guided.title.slice(0, 40), scores: undefined } : undefined,
    roi: undefined,
    faq: undefined,
    active: activeKept(snapshot),
  };
  if (pack(snapshot).length <= maxChars) return pack(snapshot);

  const minimal = pageSnapshotSchema.safeParse({
    route: snapshot.route.slice(0, 160),
    title: snapshot.title.slice(0, 40),
    summary: "",
    sectionIds: [],
    personaId: snapshot.personaId,
    industryId: snapshot.industryId,
    actions: snapshot.actions.slice(0, 4),
    workspace: snapshot.workspace,
    active: snapshot.active,
  });
  if (!minimal.success) return null;
  const json = pack(minimal.data);
  return json.length <= maxChars ? json : null;
}
