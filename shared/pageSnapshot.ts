import { z } from "zod";

export const CURRENT_PAGE_CONTEXT = "Current page";

const scoreSchema = z
  .object({
    IAS: z.number(),
    PAS: z.number(),
    AS: z.number(),
    decision: z.enum(["PROMOTE", "ESCALATE", "BLOCK"]),
  })
  .strict();

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

/** Shrink a validated snapshot without slicing the JSON text itself. */
export function fitPageSnapshot(value: unknown, maxChars: number): string | null {
  const loose = intakeSchema.safeParse(value);
  if (!loose.success) return null;
  const bounded = boundedSnapshot(loose.data);
  if (!bounded) return null;
  let snapshot: PageSnapshot = bounded;
  if (pack(snapshot).length <= maxChars) return pack(snapshot);

  if (snapshot.guided?.scores) {
    const { scores: _scores, ...guided } = snapshot.guided;
    snapshot = { ...snapshot, guided };
  }
  if (pack(snapshot).length <= maxChars) return pack(snapshot);

  snapshot = {
    ...snapshot,
    summary: snapshot.summary.slice(0, 180),
    labSummary: undefined,
    roi: snapshot.roi
      ? { ...snapshot.roi, summary: snapshot.roi.summary.slice(0, 160) }
      : undefined,
  };
  if (pack(snapshot).length <= maxChars) return pack(snapshot);

  const minimal = pageSnapshotSchema.safeParse({
    route: snapshot.route.slice(0, 160),
    title: snapshot.title.slice(0, 160),
    summary: snapshot.summary.slice(0, 120),
    sectionIds: snapshot.sectionIds.slice(0, 6),
    personaId: snapshot.personaId,
    industryId: snapshot.industryId,
    actions: snapshot.actions.slice(0, 6),
  });
  if (!minimal.success) return null;
  const json = pack(minimal.data);
  return json.length <= maxChars ? json : null;
}
