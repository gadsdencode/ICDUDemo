import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { useLocation } from "wouter";
import {
  useAgent,
  useAgentContext,
  useConfigureSuggestions,
  useFrontendTool,
  useHumanInTheLoop,
  useRenderTool,
  UseAgentUpdate,
} from "@copilotkit/react-core/v2";
import {
  USER_MESSAGES_PER_HOUR,
  reasonMessage,
  type PublicAiReason,
} from "@shared/aiPublic";
import { useAssistantSession } from "@/components/assistant/session";
import { AssistantChat } from "@/components/assistant/AssistantChat";
import {
  confirmSchema,
  frontendToolsForSurface,
  getSiteSectionSchema,
  navigateSiteSchema,
  openFaqSchema,
  recommendResourcesSchema,
  searchSiteSchema,
  selectGuidedScenarioSchema,
  selectLabTabSchema,
  setDemoModeSchema,
  setGuidedStageSchema,
  setRoiInputsSchema,
  setVisitorAudienceSchema,
  proposeWorkspaceEditSchema,
  readWorkspaceSchema,
  showWorkspaceSchema,
  type FrontendToolName,
} from "@shared/assistantContract";
import { SCORE_DEFINITIONS, pageSnapshotSchema, type PageSnapshot } from "@shared/pageSnapshot";
import { getSitePage, pageFromPath, sectionsForPage } from "@shared/siteKnowledge";
import { useAudience } from "@/components/AudienceProvider";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import { getGuidedScenario } from "@/data/guidedScenarios";
import { calculateRoi, roiAssumptionDelta, roiCalculatorDefaults, roiEffectDelta } from "@/data/businessCase";
import { judgeIsCurrent } from "@/lib/taskState";
import { labSummaryFor } from "@/components/guided/AdvancedLab";
import { ConfirmActions, ToolResultCard, statusFromTool } from "@/components/assistant/toolCards";
import { planNavigation, waitForAssistantTarget } from "@/lib/assistantNavigation";
import { discardsGuidedWork, guidedWorkInProgress } from "@/lib/guidedTransitions";
import type { RoiInputs } from "@/data/businessCase";

type ChatStatus = {
  enabled: boolean;
  reason: PublicAiReason | null;
  limit: number;
  remaining: number;
  message: string | null;
};

type Availability = "loading" | "ready" | "busy" | "quota" | "offline" | "unavailable" | "misconfigured";

async function loadStatus(): Promise<ChatStatus> {
  const response = await fetch("/api/chat/status", { credentials: "include" });
  return (await response.json()) as ChatStatus;
}

function suggestionsFor(pageId: string | null, view: string | null) {
  const explain = { title: "Explain this page", message: "What does this page explain?" };
  const developer = { title: "Show the developer path", message: "Show the developer path in this conversation." };
  const result = { title: "Explain these results", message: "Explain the results currently displayed." };
  if (view === "guided" || view === "results") {
    return [{ title: "Continue the walkthrough", message: "Continue the walkthrough." }, result, { title: "Open the value model", message: "Open the value model in this conversation." }];
  }
  if (view === "value") return [result, { title: "Return to the walkthrough", message: "Return to the walkthrough." }];
  if (pageId === "overview" || pageId == null) {
    return [
      { title: "Start the healthcare example", message: "Show the healthcare administrative walkthrough in this conversation." },
      { title: "Open the value model", message: "Open the value model in this conversation." },
      explain,
    ];
  }
  if (pageId === "demos") return [explain, { title: "Continue the demo", message: "Continue the demo." }, result];
  if (pageId === "faq") return [explain, { title: "Find the licensing FAQ", message: "Find the licensing FAQ." }];
  if (pageId === "business-case") return [explain, result];
  if (pageId === "developers") return [developer, explain];
  return [{title:"Guide me through ICDU",message:"Guide me through ICDU step by step. First ask about my role and goal, then recommend a published walkthrough and help me navigate it."}, explain, developer];
}

function stopped(signal: AbortSignal | undefined): boolean {
  return Boolean(signal?.aborted);
}

export default function AssistantSurface({ onRefresh }: { onRefresh: () => void }) {
  const session = useAssistantSession();
  const [location, navigate] = useLocation();
  const { personaId, industryId } = useAudience();
  const workspace = useWorkspace();
  const epoch = workspace.stateVersion;
  const { agent, isReady } = useAgent({ updates: [UseAgentUpdate.OnRunStatusChanged] });
  const page = pageFromPath(location.split("?")[0] || "/");
  const discardAvailable = workspace.pending !== null || guidedWorkInProgress(workspace.guided);
  const surfaceTools = frontendToolsForSurface({
    pageId: page?.id ?? null,
    demoMode: workspace.demoMode,
    scenarioSelected: Boolean(workspace.guided?.scenarioId || workspace.industryId),
    discardAvailable,
    roiAvailable: true,
    workspaceView: workspace.view,
  });
  const toolKey = surfaceTools.join(",");
  const toolAvailable = useCallback((name: FrontendToolName) => toolKey.split(",").includes(name), [toolKey]);

  const snapshot = useMemo(() => {
    if (!page) return null;
    const view = workspace.view;
    const guidedActive = view === "guided" || view === "results" || view === "workflows" || (view == null && page.id === "demos" && workspace.demoMode !== "lab");
    const valueActive = view === "value" || (view == null && page.id === "business-case");
    const faqActive = view === "faq" || (view == null && page.id === "faq");
    const labActive = view === "lab" || view === "developer" || (view == null && page.id === "demos" && workspace.demoMode === "lab");
    const scenario = workspace.guided ? getGuidedScenario(workspace.guided.scenarioId) : undefined;
    const value: PageSnapshot = {
      route: location || "/",
      title: page.title,
      summary: page.summary.slice(0, 420),
      sectionIds: sectionsForPage(page.id).filter((section) => section.anchor).map((section) => section.sectionId).slice(0, 12),
      personaId,
      industryId,
      actions: surfaceTools,
      workspace: { view, artifactId: workspace.artifactId },
    };
    if (page.id === "demos" || view === "guided" || view === "lab") value.demoMode = workspace.demoMode;
    if (guidedActive && workspace.guided) {
      value.guided = {
        scenarioId: workspace.guided.scenarioId,
        title: scenario?.title ?? workspace.guided.scenarioId,
        step: workspace.guided.step,
        ranAi: workspace.guided.ranAi,
        evaluated: workspace.guided.evaluated,
        simulated: true,
        ...(workspace.guided.evaluated && scenario ? { scores: { ...scenario.judge.scores, decision: scenario.judge.decision } } : {}),
      };
    }
    if (labActive) {
      value.labTab = workspace.labTab;
      value.labSummary = labSummaryFor(workspace.labTab).slice(0, 400);
    }
    if (faqActive) value.faq = { category: workspace.faqCategory, openId: workspace.faqOpenId };
    if (valueActive) {
      value.roi = { inputs: workspace.roiInputs, summary: workspace.roiSummaryText.slice(0, 500), modeledEstimate: true };
    }
    const showScores = Boolean(scenario && workspace.guided?.evaluated && (view === "guided" || view === "results" || view === "evidence" || view === "readiness"));
    const labJudge = view === "lab" && workspace.labTab === "judge" ? workspace.task.judge : null;
    const showLabScores = Boolean(labJudge && judgeIsCurrent(workspace.contract, labJudge));
    const activeKind = view === "results" ? "evidence" : view;
    if (
      activeKind === "guided" || activeKind === "evidence" || activeKind === "contract" || activeKind === "readiness" ||
      activeKind === "review" || activeKind === "compare" || activeKind === "value" || activeKind === "pilot" ||
      activeKind === "brief" || activeKind === "lab" || activeKind === "faq"
    ) {
      const roi = calculateRoi(workspace.roiInputs);
      const roiDelta = roiAssumptionDelta(workspace.roiInputs, roiCalculatorDefaults);
      const roiEffects = roiEffectDelta(workspace.roiInputs, roiCalculatorDefaults);
      value.active = {
        kind: activeKind,
        artifactId: workspace.artifactId,
        revision: workspace.contract.revision,
        sourceId: showScores ? scenario?.icdu.icdu_id ?? null : showLabScores && labJudge ? labJudge.sourceId : workspace.contract.icdu_id,
        stage: workspace.guided?.step ?? null,
        simulated: true,
        evaluated: Boolean(workspace.guided?.evaluated || showLabScores),
        ...(showScores && scenario
          ? {
              provenance: "scripted-example" as const,
              scores: { ...scenario.judge.scores, decision: scenario.judge.decision },
              thresholds: scenario.judge.thresholds,
              definitions: SCORE_DEFINITIONS,
              rationale: [...scenario.judge.rationale, ...scenario.judge.drivers.map((driver) => `${driver.metric}: ${driver.reason}`)].join(" ").slice(0, 280),
            }
          : {}),
        ...(showLabScores && labJudge
          ? {
              provenance: "simulated-lab" as const,
              scores: { IAS: labJudge.scores.IAS, PAS: labJudge.scores.PAS, AS: labJudge.scores.AS, decision: labJudge.decision },
              thresholds: { IAS_min: labJudge.result?.thresholds.IAS_min ?? 0.8, PAS_min: labJudge.result?.thresholds.PAS_min ?? 0.85, AS_min: labJudge.result?.thresholds.AS_min ?? 0.7 },
              definitions: SCORE_DEFINITIONS,
              rationale: (labJudge.label || "Illustrative demo. Not a measurement of this draft.").slice(0, 280),
            }
          : {}),
        ...(valueActive
          ? {
              roi: {
                ...workspace.roiInputs,
                roi: roi.roi,
                netBenefit: roi.netBenefit,
                modeledEstimate: true as const,
                example: roiDelta.example,
                edited: roiDelta.edited,
                unchanged: roiDelta.unchanged,
                effects: roiEffects,
              },
            }
          : {}),
        ...(workspace.task.focus ? { focus: workspace.task.focus } : {}),
        detail: "complete",
        ...(!showScores && (view === "evidence" || view === "results" || view === "lab")
          ? { missing: "No measured IAS, PAS, or AS values are displayed for this view." }
          : {}),
      };
    }
    const parsed = pageSnapshotSchema.safeParse(value);
    return parsed.success ? parsed.data : null;
  }, [page, location, personaId, industryId, surfaceTools, workspace]);

  useAgentContext({
    description: "Current page",
    value: snapshot ?? { route: location || "/", title: "ICDU", summary: "", sectionIds: [], personaId, industryId, actions: surfaceTools },
  });

  useConfigureSuggestions(
    {
      available: "always",
      suggestions: suggestionsFor(page?.id ?? null, workspace.view),
    },
    [page?.id, workspace.view],
  );

  useEffect(() => {
    if (!isReady) return;
    const subscription = agent.subscribe({
      onRunFinalized: () => onRefresh(),
      onRunFailed: () => onRefresh(),
      onRunErrorEvent: () => onRefresh(),
    });
    return () => subscription.unsubscribe();
  }, [agent, isReady, onRefresh]);

  const respondRef = useRef<((result: unknown) => Promise<void>) | null>(null);
  useEffect(() => () => {
    const respond = respondRef.current;
    respondRef.current = null;
    if (respond) void respond({ ok: false, approved: false, cancelled: true }).catch(() => undefined);
  }, []);

  useEffect(() => {
    session.dismissRef.current = () => {
      respondRef.current = null;
      workspace.abandonAgentTurn();
    };
    return () => {
      session.dismissRef.current = () => {};
    };
  }, [session.dismissRef, workspace]);

  useFrontendTool({
    name: "navigate_site",
    description: "Open an approved ICDU page or section. Does not accept arbitrary URLs.",
    parameters: navigateSiteSchema,
    available: toolAvailable("navigate_site"),
    handler: async (args, context) => {
      if (stopped(context.signal)) return { ok: false, error: "Stopped." };
      const parsed = navigateSiteSchema.safeParse(args);
      if (!parsed.success) return { ok: false, error: "That destination was not accepted." };
      const plan = planNavigation(parsed.data, {
        pathname: window.location.pathname,
        personaId,
        industryId,
        demoMode: workspace.demoMode,
      });
      if (!plan.ok) return plan;
      if (parsed.data.industryId && discardsGuidedWork(workspace.guided, parsed.data.industryId)) {
        return workspace.requestNavigate(context.toolCall?.id ?? "navigate", plan.href, parsed.data.industryId);
      }
      navigate(plan.href);
      session.revealPage();
      const landed = await waitForAssistantTarget(plan.page.id, plan.sectionId);
      if (stopped(context.signal)) return { ok: false, error: "Stopped." };
      const destination = getSitePage(plan.page.id);
      return {
        ok: landed.mounted,
        path: `${window.location.pathname}${window.location.search}${window.location.hash}`,
        sectionFound: landed.sectionFound,
        title: destination?.title,
        summary: destination?.summary,
        error: landed.mounted ? undefined : "The page did not open.",
      };
    },
    render: ({ status, args, result }) => (
      <ToolResultCard title={`Open ${args.pageId ?? "page"}`} status={statusFromTool(status, result)}>
        {args.sectionId ? <p className="m-0">Section {args.sectionId}</p> : null}
      </ToolResultCard>
    ),
  }, [epoch, location, personaId, industryId, toolKey]);

  useFrontendTool({
    name: "set_visitor_audience",
    description: "Set the visitor role and workflow using published ids. Does not reset guided progress unless the visitor confirms.",
    parameters: setVisitorAudienceSchema,
    available: toolAvailable("set_visitor_audience"),
    handler: async (args, context) => {
      if (stopped(context.signal)) return { ok: false, error: "Stopped." };
      const parsed = setVisitorAudienceSchema.safeParse(args);
      if (!parsed.success || (!parsed.data.personaId && !parsed.data.industryId)) {
        return { ok: false, error: "Name a published role or workflow." };
      }
      const result = workspace.setAudience(parsed.data, context.toolCall?.id ?? "audience");
      if (!result.needsConfirmation) session.revealPage();
      return result;
    },
  }, [epoch, personaId, industryId, toolKey]);

  useFrontendTool({
    name: "set_demo_mode",
    description: "Switch the demos page between guided and lab mode.",
    parameters: setDemoModeSchema,
    available: toolAvailable("set_demo_mode"),
    handler: async (args) => {
      const parsed = setDemoModeSchema.safeParse(args);
      if (!parsed.success) return { ok: false, error: "Demo mode is not available." };
      return workspace.setDemoMode(parsed.data.mode);
    },
  }, [epoch, toolKey]);

  useFrontendTool({
    name: "select_guided_scenario",
    description: "Select a published guided-demo scenario. Asks the visitor to confirm when that would discard progress.",
    parameters: selectGuidedScenarioSchema,
    available: toolAvailable("select_guided_scenario"),
    handler: async (args, context) => {
      const parsed = selectGuidedScenarioSchema.safeParse(args);
      if (!parsed.success) return { ok: false, error: "The guided demo is not open." };
      return workspace.selectScenario(parsed.data.scenarioId, false, context.toolCall?.id ?? `scenario:${parsed.data.scenarioId}`);
    },
    render: ({ status, args, result }) => (
      <ToolResultCard title="Guided scenario" status={statusFromTool(status, result)}>
        <p className="m-0">{args.scenarioId}</p>
      </ToolResultCard>
    ),
  }, [epoch, toolKey]);

  useFrontendTool({
    name: "set_guided_stage",
    description: "Continue, go back, or revisit an available guided-demo stage. Does not invent scores or completion.",
    parameters: setGuidedStageSchema,
    available: toolAvailable("set_guided_stage"),
    handler: async (args) => {
      const parsed = setGuidedStageSchema.safeParse(args);
      if (!parsed.success) return { ok: false, error: "The guided demo is not open." };
      return workspace.setStage(parsed.data.action, parsed.data.stepId as "define" | "build" | "run" | "evaluate" | "evidence" | undefined);
    },
    render: ({ status, args, result }) => (
      <ToolResultCard title="Guided stage" status={statusFromTool(status, result)}>
        <p className="m-0">{args.action}{args.stepId ? ` ${args.stepId}` : ""}</p>
      </ToolResultCard>
    ),
  }, [epoch, toolKey]);

  useFrontendTool({
    name: "select_lab_tab",
    description: "Select an Advanced Lab tab: icdu, judge, hitl, or stress.",
    parameters: selectLabTabSchema,
    available: toolAvailable("select_lab_tab"),
    handler: async (args) => {
      const parsed = selectLabTabSchema.safeParse(args);
      if (!parsed.success) return { ok: false, error: "The Advanced Lab is not open." };
      const tab = parsed.data.tab;
      if (tab !== "icdu" && tab !== "judge" && tab !== "hitl" && tab !== "stress") {
        return { ok: false, error: "That lab tab is not available." };
      }
      const result = workspace.selectLab(tab, true);
      return { ...result, summary: labSummaryFor(tab) };
    },
  }, [epoch, toolKey]);

  useFrontendTool({
    name: "open_faq",
    description: "Filter the FAQ and expand one question by its stable id.",
    parameters: openFaqSchema,
    available: toolAvailable("open_faq"),
    handler: async (args) => {
      const parsed = openFaqSchema.safeParse(args);
      if (!parsed.success) return { ok: false, error: "The FAQ is not open." };
      return workspace.openFaq(parsed.data);
    },
  }, [epoch, toolKey]);

  useFrontendTool({
    name: "set_roi_inputs",
    description: "Change the business-case calculator inputs inside the published ranges. Results stay modeled estimates.",
    parameters: setRoiInputsSchema,
    available: toolAvailable("set_roi_inputs"),
    handler: async (args) => {
      const parsed = setRoiInputsSchema.safeParse(args);
      if (!parsed.success) return { ok: false, error: "The value model is not open." };
      if (!workspace.view && page?.id !== "business-case") return { ok: false, error: "The value model is not open." };
      return workspace.setRoiInputs(parsed.data as Partial<RoiInputs>);
    },
    render: ({ status, result }) => (
      <ToolResultCard title="Value model" status={statusFromTool(status, result)}>
        <p className="m-0">Modeled estimate. Not a forecast.</p>
      </ToolResultCard>
    ),
  }, [epoch, toolKey]);

  useFrontendTool({
    name: "show_workspace",
    description: "Open one in-conversation view: roles, workflows, guided, results, value, faq, resources, developer, lab, contract, evidence, readiness, review, compare, pilot, or brief. Optional focusKind and focusId point at a field, score, evidence item, or assumption set. This does not change the underlying result.",
    parameters: showWorkspaceSchema,
    available: toolAvailable("show_workspace"),
    handler: async (args, context) => {
      if (stopped(context.signal)) return { ok: false, error: "Stopped." };
      const parsed = showWorkspaceSchema.safeParse(args);
      if (!parsed.success) return { ok: false, error: "That workspace view was not accepted." };
      if (parsed.data.focusKind && parsed.data.focusId) {
        const focus = workspace.setFocus(parsed.data.focusKind, parsed.data.focusId);
        if (!focus.ok) return focus;
      }
      const operationId = context.toolCall?.id ?? `workspace:${parsed.data.view}`;
      const result = workspace.show(parsed.data as Parameters<typeof workspace.show>[0], operationId);
      return { ...result, route: window.location.pathname, artifactId: operationId, revision: workspace.contract.revision };
    },
    render: ({ status, args, result, toolCallId }) => (
      <WorkspaceToolChip status={status} view={typeof args.view === "string" ? args.view : "workspace"} toolCallId={toolCallId} result={result} />
    ),
  }, [epoch, toolKey]);

  useFrontendTool({
    name: "read_workspace",
    description: "Read one bounded section of the current workspace: active, evidence, scores, contract, roi, review, or pilot. Use this when the snapshot says read_workspace or a value is missing. This does not change the record.",
    parameters: readWorkspaceSchema,
    available: toolAvailable("read_workspace"),
    handler: async (args, context) => {
      if (stopped(context.signal)) return { ok: false, error: "Stopped." };
      const parsed = readWorkspaceSchema.safeParse(args);
      if (!parsed.success) return { ok: false, error: "That section is not readable." };
      return { ok: true, ...workspace.readSection(parsed.data.section), revision: workspace.contract.revision };
    },
  }, [epoch, toolKey]);

  useFrontendTool({
    name: "propose_workspace_edit",
    description: "Propose one contract or pilot text change. The visitor must apply it. Do not claim the draft changed until this returns ok and the visitor applies the proposal.",
    parameters: proposeWorkspaceEditSchema,
    available: toolAvailable("propose_workspace_edit"),
    handler: async (args, context) => {
      if (stopped(context.signal)) return { ok: false, error: "Stopped." };
      const parsed = proposeWorkspaceEditSchema.safeParse(args);
      if (!parsed.success) return { ok: false, error: "That edit was not accepted." };
      const before = parsed.data.target === "pilot"
        ? String(workspace.task.pilot[parsed.data.field as "outcome"] ?? "")
        : parsed.data.field === "primary_goal"
          ? workspace.contract.intent.primary_goal
          : parsed.data.field === "prompt"
            ? workspace.contract.prompt
            : "";
      return workspace.proposeEdit({
        operationId: context.toolCall?.id ?? "proposal",
        target: parsed.data.target,
        field: parsed.data.field,
        before,
        after: parsed.data.value,
        baseRevision: workspace.contract.revision,
      });
    },
  }, [epoch, toolKey]);

  useHumanInTheLoop({
    name: "confirm_discard_guided_progress",
    description: "Ask the visitor before discarding guided-demo progress. The change happens only after the visitor confirms.",
    parameters: confirmSchema,
    available: toolAvailable("confirm_discard_guided_progress"),
    render: ({ status, respond, toolCallId }) => (
      <BoundConfirm
        status={status}
        respond={respond}
        toolCallId={toolCallId}
        title="Guided progress"
        body="This replaces the current guided walkthrough."
        confirmLabel="Discard and continue"
        respondRef={respondRef}
        kind="discard"
      />
    ),
  }, [epoch, toolKey]);

  useHumanInTheLoop({
    name: "confirm_reset_roi",
    description: "Ask the visitor before resetting the value-model calculator. Values change only after the visitor confirms.",
    parameters: confirmSchema,
    available: toolAvailable("confirm_reset_roi"),
    render: ({ status, respond, toolCallId }) => (
      <BoundConfirm
        status={status}
        respond={respond}
        toolCallId={toolCallId}
        title="Reset value model"
        body="Reset the calculator to its published defaults? Current inputs will be replaced."
        confirmLabel="Reset calculator"
        respondRef={respondRef}
        kind="reset-roi"
      />
    ),
  }, [epoch, toolKey]);

  useRenderTool({
    name: "search_site_content",
    parameters: searchSiteSchema,
    render: ({ status, result }) => <SourceCard status={status} result={result} title="Site search" />,
  });
  useRenderTool({
    name: "get_site_section",
    parameters: getSiteSectionSchema,
    render: ({ status, result }) => <SourceCard status={status} result={result} title="Site section" />,
  });
  useRenderTool({
    name: "recommend_site_resources",
    parameters: recommendResourcesSchema,
    render: ({ status, result }) => <ResourceCard status={status} result={result} />,
  });

  return null;
}

function SourceCard({ status, result, title }: { status: string; result: string | undefined; title: string }) {
  const parsed = parseResult(result);
  const hits = Array.isArray(parsed?.results) ? parsed.results : parsed?.found ? [parsed] : [];
  return (
    <ToolResultCard title={title} status={statusFromTool(status, result)}>
      {hits.length === 0 ? <p className="m-0">No published section matched.</p> : hits.map((hit) => (
        <p className="m-0 mt-1" key={`${hit.pageId}-${hit.sectionId}`}>
          <a className="underline" href={typeof hit.href === "string" ? hit.href : "#"}>{String(hit.heading ?? hit.title ?? "Section")}</a>
        </p>
      ))}
    </ToolResultCard>
  );
}

function ResourceCard({ status, result }: { status: string; result: string | undefined }) {
  const parsed = parseResult(result);
  const items = Array.isArray(parsed?.items) ? parsed.items : [];
  return (
    <ToolResultCard title="Resources" status={statusFromTool(status, result)}>
      <p className="m-0">Catalog links only. File contents were not read.</p>
      {items.map((item) => (
        <p className="m-0 mt-1" key={String(item.id)}>
          {typeof item.href === "string" ? (
            <a className="underline" href={item.href}>{String(item.title)}</a>
          ) : (
            <span>{String(item.title)}</span>
          )}
        </p>
      ))}
    </ToolResultCard>
  );
}

function WorkspaceToolChip({
  status,
  view,
  toolCallId,
  result,
}: {
  status: string;
  view: string;
  toolCallId: string;
  result: string | undefined;
}) {
  const workspace = useWorkspace();
  const artifact = workspace.artifacts.find((item) => item.id === toolCallId);
  const active = workspace.artifactId === toolCallId;
  return (
    <ToolResultCard title={artifact?.title ?? `Open ${view}`} status={statusFromTool(status, result)}>
      <p className="m-0">{artifact?.summary ?? "In this conversation."}</p>
      {artifact && !active ? (
        <button type="button" className="icdu-focus mt-1 text-sm underline" onClick={() => workspace.reopen(toolCallId)}>
          Reopen
        </button>
      ) : null}
    </ToolResultCard>
  );
}

function BoundConfirm({
  status,
  respond,
  toolCallId,
  title,
  body,
  confirmLabel,
  respondRef,
  kind,
}: {
  status: string;
  respond?: (result: unknown) => void | Promise<void>;
  toolCallId: string;
  title: string;
  body: string;
  confirmLabel: string;
  respondRef: MutableRefObject<((result: unknown) => Promise<void>) | null>;
  kind: "discard" | "reset-roi";
}) {
  const workspace = useWorkspace();
  const [, navigate] = useLocation();
  const captured = useRef<{ operationId: string; stateVersion: number } | null>(null);
  useEffect(() => {
    if (status !== "executing") return;
    if (respond) respondRef.current = (result) => Promise.resolve(respond(result));
    if (captured.current) return;
    if (kind === "reset-roi") {
      workspace.requestResetRoi(toolCallId);
      captured.current = { operationId: toolCallId, stateVersion: workspace.stateVersion };
      return;
    }
    if (workspace.pending && workspace.pending.kind !== "reset-roi" && workspace.pending.kind !== "apply-roi") {
      captured.current = { operationId: workspace.pending.operationId, stateVersion: workspace.pending.stateVersion };
    }
  }, [kind, respond, respondRef, status, toolCallId, workspace]);

  if (status !== "executing" || !respond) {
    return <ToolResultCard title={title} status={status === "complete" ? "done" : "working"} />;
  }
  const finish = (approved: boolean) => {
    const shot = captured.current;
    respondRef.current = null;
    if (!shot) {
      void respond({ ok: false, error: "Nothing is waiting for confirmation." });
      return;
    }
    const outcome = workspace.confirm({ ...shot, approved });
    if (approved && typeof outcome.href === "string") navigate(outcome.href);
    void respond(outcome);
  };
  return (
    <ConfirmActions
      body={body}
      confirmLabel={confirmLabel}
      onConfirm={() => finish(true)}
      onCancel={() => finish(false)}
    />
  );
}

export function AssistantLive() {
  const statusApi = useAssistantAvailability(0);
  const session = useAssistantSession();
  useEffect(() => {
    session.publishStatus({
      availability: statusApi.availability,
      remaining: statusApi.status?.remaining ?? USER_MESSAGES_PER_HOUR,
      limit: statusApi.status?.limit ?? USER_MESSAGES_PER_HOUR,
    });
    session.refreshRef.current = statusApi.refresh;
  }, [session, statusApi.availability, statusApi.refresh, statusApi.status]);
  return (
    <>
      <AssistantSurface onRefresh={statusApi.refresh} />
      <AssistantChat />
    </>
  );
}

function parseResult(result: string | undefined): Record<string, unknown> | null {
  if (!result) return null;
  try {
    const parsed = JSON.parse(result) as unknown;
    return parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

export function useAssistantAvailability(refreshKey: number): {
  status: ChatStatus | null;
  availability: Availability;
  refresh: () => void;
} {
  const [status, setStatus] = useState<ChatStatus | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((value) => value + 1), []);
  useEffect(() => {
    let cancelled = false;
    void loadStatus()
      .then((body) => {
        if (!cancelled) setStatus(body);
      })
      .catch(() => {
        if (!cancelled) {
          setStatus({
            enabled: false,
            reason: "offline",
            limit: USER_MESSAGES_PER_HOUR,
            remaining: 0,
            message: reasonMessage("offline"),
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [tick, refreshKey]);
  const { agent } = useAgent({ updates: [UseAgentUpdate.OnRunStatusChanged] });
  let availability: Availability = "loading";
  if (status) {
    if (!status.enabled) availability = status.reason ?? "unavailable";
    else if (status.remaining <= 0) availability = "quota";
    else if (agent.isRunning) availability = "busy";
    else availability = "ready";
  }
  return { status, availability, refresh };
}
