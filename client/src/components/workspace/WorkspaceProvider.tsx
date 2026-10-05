import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { useAudience } from "@/components/AudienceProvider";
import {
  applyProposal,
  bumpContract,
  createDraftId,
  freshContract,
  freshTask,
  judgeIsCurrent,
  parseStoredTask,
  runIllustrativeJudge,
  TASK_STORAGE_KEY,
  serializeTask,
  validateFocus,
  type ContractDraft,
  type FocusKind,
  type HumanReview,
  type PilotDraft,
  type Proposal,
  type RoiSetName,
  type StoredJudgeResult,
  type StressRow,
  type TaskState,
} from "@/lib/taskState";
import { calculateRoi, roiCalculatorDefaults, roiResultSummarySentence, type RoiInputs } from "@/data/businessCase";
import { getGuidedScenario, type GuidedStepId } from "@/data/guidedScenarios";
import type { GateThresholds } from "@/lib/gateDecision";
import { SCORE_DEFINITIONS } from "@shared/pageSnapshot";
import type { FaqCategory } from "@/data/siteResources";
import { applyRoiInputs } from "@/lib/roiEdit";
import {
  clearGuidedProgress,
  loadGuidedProgress,
  writeGuidedProgress,
  type GuidedProgress,
} from "@/lib/guidedProgress";
import {
  ROI_STORAGE_KEY,
  activateArtifact,
  applyGuidedAction,
  artifactSummary,
  artifactTitle,
  captureFreeze,
  parseStoredRoi,
  planApplyFrozenRoi,
  planAudienceChange,
  planClearProgress,
  planNavigateConfirmation,
  planResetRoi,
  planScenarioChange,
  planShowWorkspace,
  resolvePending,
  roiSummary,
  serializeRoi,
  type ActionResult,
  type ArtifactRecord,
  type DeveloperSection,
  type LabTab,
  type PendingConfirmation,
  type ShowWorkspaceInput,
  type WorkspaceCore,
  type WorkspaceView,
} from "@/lib/workspaceActions";

type WorkspaceApi = {
  personaId: string | null;
  industryId: string | null;
  view: WorkspaceView | null;
  artifactId: string | null;
  artifacts: ArtifactRecord[];
  guided: GuidedProgress | null;
  roiInputs: RoiInputs;
  roiSummaryText: string;
  faqCategory: FaqCategory | "all";
  faqOpenId: string | null;
  labTab: LabTab;
  demoMode: "guided" | "lab";
  resourceId: string | null;
  developerSection: DeveloperSection | null;
  pending: PendingConfirmation | null;
  stateVersion: number;
  openView: (view: WorkspaceView, operationId?: string) => void;
  reopen: (artifactId: string) => void;
  show: (input: ShowWorkspaceInput, operationId: string) => ActionResult;
  selectScenario: (scenarioId: string, confirmed: boolean, operationId: string) => ActionResult;
  clearProgress: (operationId: string) => ActionResult;
  setStage: (action: "continue" | "back" | "revisit", stepId?: GuidedStepId) => ActionResult;
  setAudience: (input: { personaId?: string; industryId?: string }, operationId: string) => ActionResult;
  setRoiInputs: (patch: Partial<RoiInputs>) => ActionResult;
  requestResetRoi: (operationId: string) => ActionResult;
  requestNavigate: (operationId: string, href: string, industryId?: string) => ActionResult;
  requestApplyRoi: (artifactId: string, operationId: string) => ActionResult;
  openFaq: (input: { id?: string; category?: string }) => ActionResult;
  selectLab: (tab: LabTab, reveal?: boolean) => ActionResult;
  setDemoMode: (mode: "guided" | "lab") => ActionResult;
  selectResource: (id: string | null) => void;
  selectDeveloperSection: (section: DeveloperSection) => void;
  confirm: (decision: { operationId: string; stateVersion: number; approved: boolean }) => ActionResult;
  cancelPending: () => ActionResult;
  patchGuided: (patch: (current: GuidedProgress) => GuidedProgress) => void;
  clearArtifactHistory: () => void;
  /** Closes the open stage so the homepage can return to its first-visit layout. */
  returnHome: () => void;
  /** Registered by the conversation frame so the home control can clear the transcript. */
  onHomeReset: MutableRefObject<() => void>;
  setFaqCategory: (category: FaqCategory | "all") => void;
  task: TaskState;
  contract: ContractDraft;
  editContract: (patch: Partial<ContractDraft>) => void;
  newContract: () => void;
  newContractIdentity: () => void;
  saveJudge: (result?: StoredJudgeResult) => void;
  clearJudge: () => void;
  setReview: (review: HumanReview) => void;
  saveReview: (sourceId: string | null, sourceRevision: number | null) => void;
  setStressSelection: (rows: StressRow[]) => void;
  editRoiSet: (name: RoiSetName, inputs: RoiInputs) => void;
  requestApplyRoiSet: (name: RoiSetName, operationId: string) => ActionResult;
  editPilot: (patch: Partial<PilotDraft>) => void;
  proposeEdit: (proposal: Proposal) => { ok: true } | { ok: false; error: string };
  applyPendingProposal: () => { ok: boolean; error?: string };
  cancelProposal: () => void;
  setFocus: (kind: string, id: string) => { ok: true; focus: { kind: FocusKind; id: string } } | { ok: false; error: string };
  setWhatIf: (thresholds: GateThresholds | null) => void;
  setCompare: (left: string, right: string) => void;
  readSection: (section: string) => Record<string, unknown>;
  abandonAgentTurn: () => void;
};

const WorkspaceContext = createContext<WorkspaceApi | null>(null);

function readRoi(): RoiInputs {
  try {
    return parseStoredRoi(sessionStorage.getItem(ROI_STORAGE_KEY)) ?? { ...roiCalculatorDefaults };
  } catch {
    return { ...roiCalculatorDefaults };
  }
}

function syncDemoUrl(mode: "guided" | "lab") {
  if (typeof window === "undefined" || window.location.pathname !== "/demos") return;
  const url = new URL(window.location.href);
  if (mode === "lab") url.searchParams.set("mode", "lab");
  else url.searchParams.delete("mode");
  const next = `${url.pathname}${url.search}${url.hash}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (next !== current) window.history.pushState(window.history.state, "", next);
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const audience = useAudience();
  const [guided, setGuided] = useState<GuidedProgress | null>(() => loadGuidedProgress(audience.industryId));
  const [roiInputs, setRoiInputsState] = useState<RoiInputs>(readRoi);
  const [faqCategory, setFaqCategoryState] = useState<FaqCategory | "all">("all");
  const [faqOpenId, setFaqOpenId] = useState<string | null>(null);
  const [labTab, setLabTab] = useState<LabTab>("icdu");
  const [demoMode, setDemoModeState] = useState<"guided" | "lab">("guided");
  const [resourceId, setResourceId] = useState<string | null>(null);
  const [developerSection, setDeveloperSection] = useState<DeveloperSection | null>(null);
  const [view, setView] = useState<WorkspaceView | null>(null);
  const [artifacts, setArtifacts] = useState<ArtifactRecord[]>([]);
  const [artifactId, setArtifactId] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingConfirmation | null>(null);
  const [stateVersion, setStateVersion] = useState(0);
  const [task, setTask] = useState<TaskState>(() => {
    try {
      return parseStoredTask(sessionStorage.getItem(TASK_STORAGE_KEY)) ?? freshTask(null);
    } catch {
      return freshTask(null);
    }
  });
  const skipIndustryLoad = useRef(false);
  const onHomeReset = useRef<() => void>(() => {});
  const artifactIdRef = useRef(artifactId);
  artifactIdRef.current = artifactId;

  const core = useCallback((): WorkspaceCore => ({
    personaId: audience.personaId,
    industryId: audience.industryId,
    guided,
    roiInputs,
    faqCategory,
    faqOpenId,
    labTab,
    demoMode,
    resourceId,
    developerSection,
    view,
    stateVersion,
  }), [audience.personaId, audience.industryId, guided, roiInputs, faqCategory, faqOpenId, labTab, demoMode, resourceId, developerSection, view, stateVersion]);

  const applyCore = useCallback((next: WorkspaceCore, nextPending: PendingConfirmation | null) => {
    const previous = core();
    if (next.guided) writeGuidedProgress(next.guided);
    else if (!next.industryId && previous.guided) clearGuidedProgress();
    if (next.personaId !== audience.personaId) {
      audience.setPersonaId(next.personaId, { history: "push" });
    }
    if (next.industryId !== audience.industryId) {
      skipIndustryLoad.current = true;
      audience.setIndustryId(next.industryId, { history: "push" });
    }
    setGuided(next.guided);
    setRoiInputsState(next.roiInputs);
    setFaqCategoryState(next.faqCategory);
    setFaqOpenId(next.faqOpenId);
    setLabTab(next.labTab);
    setDemoModeState(next.demoMode);
    setResourceId(next.resourceId);
    setDeveloperSection(next.developerSection);
    setView(next.view);
    setStateVersion(next.stateVersion);
    setPending(nextPending);
  }, [audience, core]);

  const remember = useCallback((operationId: string, nextView: WorkspaceView, snapshot: WorkspaceCore) => {
    const freeze = captureFreeze({ ...snapshot, view: nextView }, nextView);
    const title = artifactTitle(nextView, snapshot);
    const summary = artifactSummary(freeze);
    const activated = activateArtifact(artifacts, artifactIdRef.current, { id: operationId, view: nextView, title, summary }, freeze);
    setArtifacts(activated.artifacts);
    setArtifactId(activated.activeId);
  }, [artifacts]);

  useEffect(() => {
    if (skipIndustryLoad.current) {
      skipIndustryLoad.current = false;
      return;
    }
    setGuided(loadGuidedProgress(audience.industryId));
  }, [audience.industryId]);

  useEffect(() => {
    try {
      sessionStorage.setItem(ROI_STORAGE_KEY, serializeRoi(roiInputs));
    } catch {
      // Calculator values still apply in memory when storage is blocked.
    }
  }, [roiInputs]);

  useEffect(() => {
    try {
      sessionStorage.setItem(TASK_STORAGE_KEY, serializeTask(task));
    } catch {
      // The draft still applies in memory when storage is blocked.
    }
  }, [task]);

  useEffect(() => {
    if (!audience.industryId) return;
    const scenario = getGuidedScenario(audience.industryId);
    if (!scenario) return;
    setTask((current) => {
      const untouched = current.contract.revision === 1 && !current.contract.intent.primary_goal && !current.contract.sourceScenarioId;
      if (!untouched) return current;
      const seeded = freshContract(scenario);
      return {
        ...current,
        contract: { ...seeded, icdu_id: current.contract.icdu_id, created_at: current.contract.created_at },
        pilot: current.pilot.outcome ? current.pilot : { ...current.pilot, workflowId: scenario.id },
      };
    });
  }, [audience.industryId]);

  const api = useMemo<WorkspaceApi>(() => {
    const openView = (nextView: WorkspaceView, operationId = `manual:${nextView}`) => {
      const snapshot = core();
      setView(nextView);
      remember(operationId, nextView, { ...snapshot, view: nextView });
    };
    return {
      personaId: audience.personaId,
      industryId: audience.industryId,
      view,
      artifactId,
      artifacts,
      guided,
      roiInputs,
      roiSummaryText: roiSummary(roiInputs),
      faqCategory,
      faqOpenId,
      labTab,
      demoMode,
      resourceId,
      developerSection,
      pending,
      stateVersion,
      openView,
      reopen: (id: string) => {
        const artifact = artifacts.find((item) => item.id === id);
        if (!artifact) return;
        setView(artifact.view);
        setArtifactId(artifact.id);
      },
      show: (input, operationId) => {
        const planned = planShowWorkspace(core(), input, operationId);
        applyCore(planned.core, planned.pending);
        if (planned.result.ok) remember(operationId, planned.core.view ?? input.view, planned.core);
        return { ...planned.result, artifactId: operationId };
      },
      selectScenario: (scenarioId, confirmed, operationId) => {
        const planned = planScenarioChange(core(), scenarioId, operationId, confirmed);
        applyCore(planned.core, planned.pending);
        if (planned.result.ok) remember(operationId, planned.core.view ?? "guided", planned.core);
        return planned.result;
      },
      clearProgress: (operationId) => {
        const planned = planClearProgress(core(), operationId);
        applyCore(planned.core, planned.pending);
        return planned.result;
      },
      setStage: (action, stepId) => {
        const moved = applyGuidedAction(guided, action, stepId);
        if (!moved.ok) return moved;
        const scenario = getGuidedScenario(moved.progress.scenarioId);
        writeGuidedProgress(moved.progress);
        setGuided(moved.progress);
        setStateVersion((value) => value + 1);
        return {
          ok: true,
          step: moved.progress.step,
          ranAi: moved.progress.ranAi,
          evaluated: moved.progress.evaluated,
          simulated: true,
          scores: moved.progress.evaluated && scenario ? { ...scenario.judge.scores, decision: scenario.judge.decision } : undefined,
        };
      },
      setAudience: (input, operationId) => {
        const planned = planAudienceChange(core(), input, operationId);
        applyCore(planned.core, planned.pending);
        return planned.result;
      },
      setRoiInputs: (patch) => {
        const applied = applyRoiInputs(roiInputs, patch);
        if (!applied.ok) return applied;
        setRoiInputsState(applied.inputs);
        setStateVersion((value) => value + 1);
        return applied;
      },
      requestResetRoi: (operationId) => {
        const planned = planResetRoi(core(), operationId);
        setPending(planned.pending);
        return planned.result;
      },
      requestNavigate: (operationId, href, industryId) => {
        const planned = planNavigateConfirmation(core(), operationId, href, industryId);
        setPending(planned.pending);
        return planned.result;
      },
      requestApplyRoi: (id, operationId) => {
        const artifact = artifacts.find((item) => item.id === id);
        if (!artifact) return { ok: false, error: "That earlier result is no longer available." };
        const planned = planApplyFrozenRoi(core(), artifact, operationId);
        if (planned.pending) setPending(planned.pending);
        return planned.result;
      },
      openFaq: (input) => {
        const planned = planShowWorkspace(core(), { view: "faq", faqId: input.id, faqCategory: input.category }, `faq:${input.id ?? input.category ?? "list"}`);
        if (!planned.result.ok && !input.id && !input.category) {
          setView("faq");
          return { ok: true, view: "faq" };
        }
        applyCore(planned.core, planned.pending);
        if (planned.result.ok) remember(`faq:${planned.core.faqOpenId ?? "list"}`, "faq", planned.core);
        return planned.result;
      },
      selectLab: (tab, reveal = false) => {
        if (tab !== "icdu" && tab !== "judge" && tab !== "hitl" && tab !== "stress") {
          return { ok: false, error: "That lab tab is not available." };
        }
        setLabTab(tab);
        setDemoModeState("lab");
        if (reveal) setView("lab");
        setStateVersion((value) => value + 1);
        return { ok: true, tab, simulated: true };
      },
      setDemoMode: (mode) => {
        setDemoModeState(mode);
        setView((current) =>
          current === "guided" || current === "lab" || current === "developer" ? (mode === "lab" ? "lab" : "guided") : current,
        );
        syncDemoUrl(mode);
        return { ok: true, mode };
      },
      selectResource: (id) => {
        setResourceId(id);
        setView("resources");
      },
      selectDeveloperSection: (section) => {
        setDeveloperSection(section);
        setView("developer");
      },
      confirm: (decision) => {
        const planned = resolvePending(core(), pending, decision);
        if (planned.result.stale) return planned.result;
        applyCore(planned.core, planned.pending);
        return planned.result;
      },
      cancelPending: () => {
        if (!pending) return { ok: false, cancelled: true };
        setPending(null);
        return { ok: false, approved: false, cancelled: true };
      },
      patchGuided: (patch: (current: GuidedProgress) => GuidedProgress) => {
        setGuided((current) => {
          if (!current) return current;
          const next = patch(current);
          writeGuidedProgress(next);
          return next;
        });
        setStateVersion((value) => value + 1);
      },
      clearArtifactHistory: () => {
        setArtifacts([]);
        setArtifactId(null);
        setPending(null);
      },
      returnHome: () => {
        setView(null);
        setArtifacts([]);
        setArtifactId(null);
        setPending(null);
        setTask((current) =>
          current.proposal || current.focus ? { ...current, proposal: null, focus: null } : current,
        );
        onHomeReset.current();
      },
      onHomeReset,
      setFaqCategory: (category) => {
        setFaqCategoryState(category);
        setFaqOpenId(null);
      },
      task,
      contract: task.contract,
      editContract: (patch) => {
        setTask((current) => ({ ...current, contract: bumpContract(current.contract, patch), proposal: null }));
      },
      newContract: () => {
        const scenario = audience.industryId ? getGuidedScenario(audience.industryId) : undefined;
        setTask((current) => ({ ...current, contract: freshContract(scenario), proposal: null }));
      },
      newContractIdentity: () => {
        setTask((current) => ({
          ...current,
          contract: {
            ...current.contract,
            icdu_id: createDraftId(),
            created_at: new Date().toISOString(),
            revision: 1,
          },
          proposal: null,
        }));
      },
      saveJudge: (result) => {
        setTask((current) => {
          const judge = runIllustrativeJudge(current.contract);
          if (!result) return { ...current, judge };
          return {
            ...current,
            judge: {
              ...judge,
              scores: result.scores,
              decision: result.decision,
              result,
            },
          };
        });
      },
      clearJudge: () => setTask((current) => ({ ...current, judge: null })),
      setReview: (review) => setTask((current) => ({ ...current, review: { ...review, saved: false } })),
      saveReview: (sourceId, sourceRevision) => {
        setTask((current) => ({
          ...current,
          review: { ...current.review, sourceId, sourceRevision, saved: true },
        }));
      },
      setStressSelection: (rows) => {
        setTask((current) => ({
          ...current,
          stress: rows.length
            ? {
                sourceId: current.contract.icdu_id,
                sourceRevision: current.contract.revision,
                selection: rows.map((row) => row.id),
                rows,
                simulated: true,
              }
            : null,
        }));
      },
      editRoiSet: (name, inputs) => {
        setTask((current) => ({ ...current, roiSets: { ...current.roiSets, [name]: inputs } }));
      },
      requestApplyRoiSet: (name, operationId) => {
        setPending({
          operationId,
          stateVersion,
          kind: "apply-roi",
          roiInputs: task.roiSets[name],
        });
        return { ok: true, pending: true, name };
      },
      editPilot: (patch) => {
        setTask((current) => ({ ...current, pilot: { ...current.pilot, ...patch, revision: current.pilot.revision + 1 } }));
      },
      proposeEdit: (proposal) => {
        const text = proposal.after.trim().slice(0, 400);
        if (!text) return { ok: false, error: "The proposed text is empty." };
        if (proposal.target === "contract" && proposal.baseRevision !== task.contract.revision) {
          return { ok: false, error: "The contract changed. Read it again before proposing an edit." };
        }
        setTask((current) => ({ ...current, proposal: { ...proposal, after: text } }));
        return { ok: true };
      },
      applyPendingProposal: () => {
        if (!task.proposal) return { ok: false, error: "There is no proposal to apply." };
        if (task.proposal.target === "contract" && task.proposal.baseRevision !== task.contract.revision) {
          setTask((current) => ({ ...current, proposal: null }));
          return { ok: false, error: "That proposal is stale." };
        }
        setTask((current) => applyProposal(current));
        return { ok: true, revision: task.proposal.target === "contract" ? task.contract.revision + 1 : task.pilot.revision + 1 };
      },
      cancelProposal: () => setTask((current) => ({ ...current, proposal: null })),
      setFocus: (kind, id) => {
        const scenario = audience.industryId ? getGuidedScenario(audience.industryId) ?? null : null;
        const checked = validateFocus(scenario, kind, id);
        if (!checked.ok) return checked;
        setTask((current) => ({ ...current, focus: checked.focus }));
        return checked;
      },
      setWhatIf: (thresholds) => setTask((current) => ({ ...current, whatIf: thresholds })),
      setCompare: (left, right) => {
        if (!getGuidedScenario(left) || !getGuidedScenario(right)) return;
        setTask((current) => ({ ...current, compareIds: [left, right] }));
      },
      readSection: (section) => {
        const scenario = audience.industryId ? getGuidedScenario(audience.industryId) : undefined;
        const example = scenario && guided?.evaluated
          ? {
              scenarioId: scenario.id,
              icduId: scenario.icdu.icdu_id,
              simulated: true as const,
              scores: scenario.judge.scores,
              thresholds: scenario.judge.thresholds,
              decision: scenario.judge.decision,
              definitions: SCORE_DEFINITIONS,
              rationale: [...scenario.judge.rationale, ...scenario.judge.drivers.map((driver) => `${driver.metric}: ${driver.reason}`)].join(" ").slice(0, 500),
            }
          : { missing: "No evaluated example is on the walkthrough." };
        const results = calculateRoi(roiInputs);
        if (section === "scores" || section === "evidence" || section === "active") return { section, example, focus: task.focus };
        if (section === "contract") {
          return {
            section,
            icdu_id: task.contract.icdu_id,
            revision: task.contract.revision,
            goal: task.contract.intent.primary_goal,
            criteria: task.contract.intent.success_criteria,
            principles: task.contract.principles,
            constraints: task.contract.context.constraints,
            measuredScores: false,
          };
        }
        if (section === "roi") {
          return {
            section,
            inputs: roiInputs,
            roi: results.roi,
            netBenefit: results.netBenefit,
            modeledEstimate: true,
            sets: task.roiSets,
            summary: roiResultSummarySentence(roiInputs, results),
          };
        }
        if (section === "review") return { section, review: task.review, judgeCurrent: judgeIsCurrent(task.contract, task.judge) };
        if (section === "pilot") return { section, pilot: task.pilot, duration: "Estimate only. Not a commitment." };
        return { ok: false, error: "That section is not readable." };
      },
      abandonAgentTurn: () => {
        setPending(null);
        setTask((current) => ({ ...current, proposal: null }));
      },
    };
  }, [applyCore, artifactId, artifacts, audience.industryId, audience.personaId, core, demoMode, developerSection, faqCategory, faqOpenId, guided, labTab, onHomeReset, pending, remember, resourceId, roiInputs, stateVersion, task, view]);

  return <WorkspaceContext.Provider value={api}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceApi {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("Workspace is missing.");
  return value;
}
