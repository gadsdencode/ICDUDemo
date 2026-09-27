import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import {
  CopilotPopup,
  useAgent,
  useAgentContext,
  useConfigureSuggestions,
  useFrontendTool,
  useHumanInTheLoop,
  useRenderTool,
  UseAgentUpdate,
} from "@copilotkit/react-core/v2";
import {
  ASSISTANT_QUOTA,
  SEPARATE_CHAT_NOTE,
  USAGE_LIMIT_LABEL,
  USER_MESSAGES_PER_HOUR,
  reasonMessage,
  type PublicAiReason,
} from "@shared/aiPublic";
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
  type FrontendToolName,
} from "@shared/assistantContract";
import { pageSnapshotSchema, type PageSnapshot } from "@shared/pageSnapshot";
import { getSitePage, pageFromPath, sectionsForPage } from "@shared/siteKnowledge";
import { useAudience } from "@/components/AudienceProvider";
import { useAssistantBridge } from "@/components/assistant/bridge";
import { ConfirmActions, ToolResultCard, statusFromTool } from "@/components/assistant/toolCards";
import { planNavigation, waitForAssistantTarget } from "@/lib/assistantNavigation";
import { discardsGuidedWork, guidedWorkInProgress } from "@/lib/guidedTransitions";
import { readGuidedProgress, clearGuidedProgress } from "@/lib/guidedProgress";
import type { RoiInputs } from "@/data/businessCase";

type ChatStatus = {
  enabled: boolean;
  reason: PublicAiReason | null;
  limit: number;
  remaining: number;
  message: string | null;
};

type PendingAction =
  | { kind: "navigate"; href: string; label: string }
  | { kind: "audience"; personaId?: string; industryId?: string }
  | { kind: "scenario"; scenarioId: string }
  | { kind: "reset" };

type Availability = "loading" | "ready" | "busy" | "quota" | "offline" | "unavailable" | "misconfigured";

async function loadStatus(): Promise<ChatStatus> {
  const response = await fetch("/api/chat/status", { credentials: "include" });
  return (await response.json()) as ChatStatus;
}

function suggestionsFor(pageId: string | null) {
  const explain = { title: "Explain this page", message: "What does this page explain?" };
  const developer = { title: "Show me the developer path", message: "Take me to the developer guide." };
  const result = { title: "Explain this result", message: "Explain this result." };
  if (pageId === "demos") {
    return [explain, { title: "Continue the demo", message: "Continue the demo." }, result];
  }
  if (pageId === "faq") return [explain, { title: "Find the licensing FAQ", message: "Find the licensing FAQ." }];
  if (pageId === "business-case") return [explain, result];
  if (pageId === "developers") return [developer, explain];
  return [explain, developer];
}

function stopped(signal: AbortSignal | undefined): boolean {
  return Boolean(signal?.aborted);
}

export default function AssistantSurface({
  remaining,
  limit,
  availability,
  onRefresh,
}: {
  remaining: number;
  limit: number;
  availability: Availability;
  onRefresh: () => void;
}) {
  const [location, navigate] = useLocation();
  const { personaId, industryId, setPersonaId, setIndustryId } = useAudience();
  const { slots, handlersRef, epoch } = useAssistantBridge();
  const [pending, setPending] = useState<PendingAction | null>(null);
  const { agent, isReady } = useAgent({ updates: [UseAgentUpdate.OnRunStatusChanged] });
  const page = pageFromPath(location.split("?")[0] || "/");
  const storedProgress = readGuidedProgress();
  const discardAvailable = pending !== null || guidedWorkInProgress(storedProgress);
  const surfaceTools = frontendToolsForSurface({
    pageId: page?.id ?? null,
    demoMode: page?.id === "demos" ? slots.demo?.mode ?? "guided" : null,
    scenarioSelected: Boolean(slots.guided?.scenarioId),
    discardAvailable,
    roiAvailable: page?.id === "business-case" && Boolean(slots.roi),
  });
  const toolKey = surfaceTools.join(",");
  const toolAvailable = useCallback((name: FrontendToolName) => toolKey.split(",").includes(name), [toolKey]);

  const snapshot = useMemo(() => {
    if (!page) return null;
    const guided = page.id === "demos" && slots.demo?.mode !== "lab" ? slots.guided : null;
    const value: PageSnapshot = {
      route: `${location}`,
      title: page.title,
      summary: page.summary.slice(0, 420),
      sectionIds: sectionsForPage(page.id).filter((section) => section.anchor).map((section) => section.sectionId).slice(0, 12),
      personaId,
      industryId,
      actions: surfaceTools,
    };
    if (page.id === "demos" && slots.demo) value.demoMode = slots.demo.mode;
    if (guided?.scenarioId && guided.step) {
      value.guided = {
        scenarioId: guided.scenarioId,
        title: guided.title ?? guided.scenarioId,
        step: guided.step,
        ranAi: guided.ranAi,
        evaluated: guided.evaluated,
        simulated: true,
        ...(guided.scores ? { scores: guided.scores } : {}),
      };
    }
    if (page.id === "demos" && slots.demo?.mode === "lab" && slots.lab) {
      value.labTab = slots.lab.tab;
      value.labSummary = slots.lab.summary.slice(0, 400);
    }
    if (page.id === "faq" && slots.faq) value.faq = slots.faq;
    if (page.id === "business-case" && slots.roi) {
      value.roi = { inputs: slots.roi.inputs, summary: slots.roi.summary.slice(0, 500), modeledEstimate: true };
    }
    const parsed = pageSnapshotSchema.safeParse(value);
    return parsed.success ? parsed.data : null;
  }, [page, location, slots, personaId, industryId, surfaceTools]);

  useAgentContext({
    description: "Current page",
    value: snapshot ?? { route: location || "/", title: "ICDU", summary: "", sectionIds: [], personaId, industryId, actions: surfaceTools },
  });

  useConfigureSuggestions(
    {
      available: "always",
      suggestions: suggestionsFor(page?.id ?? null),
    },
    [page?.id],
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
        demoMode: slots.demo?.mode ?? null,
      });
      if (!plan.ok) return plan;
      const nextIndustry = parsed.data.industryId ?? industryId;
      if (parsed.data.industryId && discardsGuidedWork(readGuidedProgress(), nextIndustry)) {
        setPending({ kind: "navigate", href: plan.href, label: plan.page.title });
        return { ok: false, needsConfirmation: true, error: "Changing the workflow would discard guided progress. Ask the visitor to confirm." };
      }
      navigate(plan.href);
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
  }, [epoch, location, personaId, industryId, pending, toolKey]);

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
      if (parsed.data.industryId && discardsGuidedWork(readGuidedProgress(), parsed.data.industryId)) {
        setPending({ kind: "audience", personaId: parsed.data.personaId, industryId: parsed.data.industryId });
        return { ok: false, needsConfirmation: true, error: "That workflow change would discard guided progress." };
      }
      if (parsed.data.personaId) setPersonaId(parsed.data.personaId, { history: "push" });
      if (parsed.data.industryId) setIndustryId(parsed.data.industryId, { history: "push" });
      return { ok: true, personaId: parsed.data.personaId ?? personaId, industryId: parsed.data.industryId ?? industryId };
    },
  }, [epoch, personaId, industryId, toolKey]);

  useFrontendTool({
    name: "set_demo_mode",
    description: "Switch the demos page between guided and lab mode.",
    parameters: setDemoModeSchema,
    available: toolAvailable("set_demo_mode"),
    handler: async (args) => {
      const parsed = setDemoModeSchema.safeParse(args);
      const demo = handlersRef.current.demo;
      if (!parsed.success || !demo) return { ok: false, error: "Demo mode is not on this page." };
      return demo.setMode(parsed.data.mode);
    },
  }, [epoch, toolKey]);

  useFrontendTool({
    name: "select_guided_scenario",
    description: "Select a published guided-demo scenario. Asks the visitor to confirm when that would discard progress.",
    parameters: selectGuidedScenarioSchema,
    available: toolAvailable("select_guided_scenario"),
    handler: async (args) => {
      const parsed = selectGuidedScenarioSchema.safeParse(args);
      const guided = handlersRef.current.guided;
      if (!parsed.success || !guided) return { ok: false, error: "The guided demo is not open." };
      const result = guided.selectScenario(parsed.data.scenarioId, false);
      if (result.needsConfirmation) setPending({ kind: "scenario", scenarioId: parsed.data.scenarioId });
      return result;
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
      const guided = handlersRef.current.guided;
      if (!parsed.success || !guided) return { ok: false, error: "The guided demo is not open." };
      return guided.setStage(parsed.data.action, parsed.data.stepId);
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
      const lab = handlersRef.current.lab;
      if (!parsed.success || !lab) return { ok: false, error: "The Advanced Lab is not open." };
      const tab = parsed.data.tab;
      if (tab !== "icdu" && tab !== "judge" && tab !== "hitl" && tab !== "stress") {
        return { ok: false, error: "That lab tab is not available." };
      }
      return lab.selectTab(tab);
    },
  }, [epoch, toolKey]);

  useFrontendTool({
    name: "open_faq",
    description: "Filter the FAQ and expand one question by its stable id.",
    parameters: openFaqSchema,
    available: toolAvailable("open_faq"),
    handler: async (args) => {
      const parsed = openFaqSchema.safeParse(args);
      const faq = handlersRef.current.faq;
      if (!parsed.success || !faq) return { ok: false, error: "The FAQ is not open." };
      return faq.open(parsed.data);
    },
  }, [epoch, toolKey]);

  useFrontendTool({
    name: "set_roi_inputs",
    description: "Change the business-case calculator inputs inside the published ranges. Results stay modeled estimates.",
    parameters: setRoiInputsSchema,
    available: toolAvailable("set_roi_inputs"),
    handler: async (args) => {
      const parsed = setRoiInputsSchema.safeParse(args);
      const roi = handlersRef.current.roi;
      if (!parsed.success || !roi) return { ok: false, error: "The value model is not open." };
      return roi.setInputs(parsed.data as Partial<RoiInputs>);
    },
    render: ({ status, result }) => (
      <ToolResultCard title="Value model" status={statusFromTool(status, result)}>
        <p className="m-0">Modeled estimate. Not a forecast.</p>
      </ToolResultCard>
    ),
  }, [epoch, toolKey]);

  useHumanInTheLoop({
    name: "confirm_discard_guided_progress",
    description: "Ask the visitor before discarding guided-demo progress. The change happens only after the visitor confirms.",
    parameters: confirmSchema,
    available: toolAvailable("confirm_discard_guided_progress"),
    render: ({ status, respond }) => {
      if (status === "executing" && respond) respondRef.current = respond;
      if (status === "complete") {
        return <ToolResultCard title="Guided progress" status={statusFromTool(status, undefined)} />;
      }
      if (status !== "executing" || !respond) {
        return <ToolResultCard title="Guided progress" status="working" />;
      }
      const apply = () => {
        const action = pending;
        setPending(null);
        respondRef.current = null;
        let outcome: { ok: boolean; error?: string } = { ok: true };
        if (!action || action.kind === "reset") {
          const guided = handlersRef.current.guided;
          if (guided) outcome = guided.resetProgress();
          else {
            clearGuidedProgress();
            setIndustryId(null);
            outcome = { ok: true };
          }
        } else if (action.kind === "scenario") {
          outcome = handlersRef.current.guided?.selectScenario(action.scenarioId, true) ?? { ok: false, error: "The guided demo is not open." };
        } else if (action.kind === "audience") {
          if (action.personaId) setPersonaId(action.personaId);
          if (action.industryId) setIndustryId(action.industryId);
        } else {
          navigate(action.href);
        }
        void respond({ ok: outcome.ok, approved: outcome.ok, error: outcome.error });
      };
      return (
        <ConfirmActions
          body={pending ? "This replaces the current guided walkthrough." : "This clears the current guided walkthrough."}
          confirmLabel="Discard and continue"
          onConfirm={apply}
          onCancel={() => {
            setPending(null);
            respondRef.current = null;
            void respond({ ok: false, approved: false, cancelled: true });
          }}
        />
      );
    },
  }, [epoch, pending, toolKey]);

  useHumanInTheLoop({
    name: "confirm_reset_roi",
    description: "Ask the visitor before resetting the value-model calculator. Values change only after the visitor confirms.",
    parameters: confirmSchema,
    available: toolAvailable("confirm_reset_roi"),
    render: ({ status, respond }) => {
      if (status === "executing" && respond) respondRef.current = respond;
      if (status !== "executing" || !respond) {
        return <ToolResultCard title="Reset value model" status={status === "complete" ? "done" : "working"} />;
      }
      return (
        <ConfirmActions
          body="Reset the calculator to its published defaults? Current inputs will be replaced."
          confirmLabel="Reset calculator"
          onConfirm={() => {
            respondRef.current = null;
            const outcome = handlersRef.current.roi?.resetInputs() ?? { ok: false, error: "The value model is not open." };
            void respond({ ...outcome, approved: outcome.ok });
          }}
          onCancel={() => {
            respondRef.current = null;
            void respond({ ok: false, approved: false, cancelled: true });
          }}
        />
      );
    },
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

  const unavailable = availability === "offline" || availability === "unavailable" || availability === "misconfigured" || availability === "quota";
  const headline = availability === "quota"
    ? ASSISTANT_QUOTA
    : availability === "busy"
      ? "ICDU is answering."
      : availability === "loading"
        ? "Checking whether ICDU can answer."
        : unavailable
          ? reasonMessage(availability === "misconfigured" ? "misconfigured" : availability === "offline" ? "offline" : "unavailable")
          : `Ask a question about ICDU. ${USAGE_LIMIT_LABEL}`;

  return (
    <CopilotPopup
      agentId="default"
      defaultOpen={false}
      clickOutsideToClose
      labels={{
        modalHeaderTitle: "Ask ICDU",
        chatToggleOpenLabel: "Ask ICDU",
        chatToggleCloseLabel: "Close chat",
        welcomeMessageText: headline,
        chatDisclaimerText:
          availability === "quota"
            ? `${ASSISTANT_QUOTA} ${SEPARATE_CHAT_NOTE}`
            : availability === "ready" || availability === "busy"
              ? `${USAGE_LIMIT_LABEL} ${remaining} of ${limit} left this hour. ${SEPARATE_CHAT_NOTE}`
              : SEPARATE_CHAT_NOTE,
        chatInputPlaceholder: availability === "quota" ? "Message limit reached" : "Ask about ICDU",
      }}
    />
  );
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

export function AssistantLive() {
  const { status, availability, refresh } = useAssistantAvailability(0);
  return (
    <AssistantSurface
      remaining={status?.remaining ?? USER_MESSAGES_PER_HOUR}
      limit={status?.limit ?? USER_MESSAGES_PER_HOUR}
      availability={availability}
      onRefresh={refresh}
    />
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
