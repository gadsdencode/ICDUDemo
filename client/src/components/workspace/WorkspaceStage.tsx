import { lazy, Suspense, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { getPersonaAudience, getRoleLens } from "@/data/audience";
import { getGuidedScenario } from "@/data/guidedScenarios";
import { generatedTechnicalDocs, staticDownloads, categorizedFaqItems, faqCategories } from "@/data/siteResources";
import { GuidedDemo, GuidedReview } from "@/components/guided/GuidedDemo";
import { ScenarioSelector } from "@/components/guided/ScenarioSelector";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAssistantSession } from "@/components/assistant/session";
import { recommendedScenarioIds, roleChoices, sameRoi, type WorkspaceView } from "@/lib/workspaceActions";
import { getSiteSection } from "@shared/siteKnowledge";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import { BriefView, CompareView, ContractView, EvidenceView, PilotView, ReadinessView, ReviewView, ValueComparison } from "@/components/workspace/experience";
import { cn } from "@/lib/utils";

const ValueModel = lazy(() => import("@/pages/BusinessCase").then((mod) => ({ default: mod.RoiCalculatorPanel })));
const AdvancedLab = lazy(() => import("@/components/guided/AdvancedLab").then((mod) => ({ default: mod.AdvancedLab })));

function PendingNotice() {
  const workspace = useWorkspace();
  const [, navigate] = useLocation();
  const pending = workspace.pending;
  if (!pending) return null;
  const apply = () => {
    const result = workspace.confirm({
      operationId: pending.operationId,
      stateVersion: pending.stateVersion,
      approved: true,
    });
    if (typeof result.href === "string") navigate(result.href);
  };
  return (
    <div className="icdu-stage-confirm" role="alertdialog" aria-label="Confirm before changing work" data-testid="workspace-confirm">
      <p>This replaces the current guided walkthrough or calculator values. Cancel leaves the current work intact.</p>
      <div className="icdu-actions">
        <button type="button" className="icdu-primary icdu-focus" onClick={apply} data-testid="workspace-confirm-apply">
          Continue
        </button>
        <button type="button" className="icdu-quiet icdu-focus" onClick={() => workspace.cancelPending()} data-testid="workspace-confirm-cancel">
          Keep current work
        </button>
      </div>
    </div>
  );
}

function RoleChoices() {
  const workspace = useWorkspace();
  return (
    <div data-testid="workspace-roles">
      <h2 className="icdu-section-heading text-xl mb-2">Who are you?</h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {roleChoices().map((role) => (
          <button
            key={role.id}
            type="button"
            className={cn("icdu-role-option icdu-focus text-left", workspace.view === "roles" && undefined)}
            aria-pressed={workspace.personaId === role.id}
            onClick={() => {
              workspace.setAudience({ personaId: role.id }, `role:${role.id}`);
              workspace.openView("workflows", "manual:workflows");
            }}
          >
            <span>{role.label}</span>
            <small>{role.description || role.focus}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

function WorkflowChoices() {
  const workspace = useWorkspace();
  const role = getPersonaAudience(workspace.personaId);
  const lens = getRoleLens(workspace.personaId);
  return (
    <ScenarioSelector
      selectedId={workspace.industryId}
      recommendedIds={recommendedScenarioIds(workspace.personaId)}
      showLabNote={false}
      intro={{
        label: role?.chipLabel ?? "Workflow",
        title: "Where would you apply ICDU?",
        description: lens?.focus
          ? `${lens.focus}. Pick a published workflow. Suggested paths match this role. Scores in the walkthrough stay simulated.`
          : "Pick a published workflow. Scores in the walkthrough stay simulated.",
      }}
      onSelect={(scenario) => {
        workspace.selectScenario(scenario.id, false, `scenario:${scenario.id}`);
      }}
    />
  );
}

function FollowUps() {
  const workspace = useWorkspace();
  const session = useAssistantSession();
  const explain = (topic: "results" | "value") => {
    const text = topic === "value"
      ? "Explain the value model results currently displayed. Use the current inputs and keep the modeled-estimate wording."
      : "Explain the guided demo results currently displayed. The scores are simulated.";
    session.sendRef.current(text);
  };
  return (
    <div className="icdu-stage-follow">
      {workspace.view === "results" || workspace.view === "guided" ? (
        <button type="button" className="icdu-quiet icdu-focus" onClick={() => explain("results")} data-testid="workspace-explain-results">
          Explain these results
        </button>
      ) : null}
      {workspace.view === "value" ? (
        <button type="button" className="icdu-quiet icdu-focus" onClick={() => explain("value")} data-testid="workspace-explain-value">
          Explain these results
        </button>
      ) : null}
      {workspace.view !== "guided" && workspace.guided ? (
        <button type="button" className="icdu-quiet icdu-focus" onClick={() => workspace.openView("guided", "manual:guided")} data-testid="workspace-return-walkthrough">
          Return to the walkthrough
        </button>
      ) : null}
      {workspace.view === "guided" || workspace.view === "results" ? (
        <button type="button" className="icdu-quiet icdu-focus" onClick={() => workspace.openView("value", "manual:value")} data-testid="workspace-open-value">
          Open the value model
        </button>
      ) : null}
    </div>
  );
}

function FaqView() {
  const workspace = useWorkspace();
  const items = workspace.faqCategory === "all"
    ? categorizedFaqItems
    : categorizedFaqItems.filter((item) => item.category === workspace.faqCategory);
  return (
    <div className="icdu-faq" data-testid="workspace-faq">
      <div className="icdu-tab-strip mb-3" role="tablist" aria-label="FAQ categories">
        <button type="button" className="icdu-focus" aria-pressed={workspace.faqCategory === "all"} onClick={() => workspace.setFaqCategory("all")}>All</button>
        {faqCategories.map((category) => (
          <button key={category.id} type="button" className="icdu-focus" aria-pressed={workspace.faqCategory === category.id} onClick={() => workspace.setFaqCategory(category.id)}>
            {category.label}
          </button>
        ))}
      </div>
      <Accordion type="single" collapsible value={workspace.faqOpenId ?? ""} onValueChange={(id) => (id ? workspace.openFaq({ id }) : workspace.setFaqCategory(workspace.faqCategory))}>
        {items.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger className="text-left text-sm">{item.question}</AccordionTrigger>
            <AccordionContent className="text-sm text-[color:var(--icdu-fg-muted)]">{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

function ResourceView() {
  const workspace = useWorkspace();
  const items = [...staticDownloads, ...generatedTechnicalDocs];
  const visible = workspace.resourceId ? items.filter((item) => item.id === workspace.resourceId) : items;
  return (
    <div data-testid="workspace-resources">
      <p className="icdu-work-lead">Catalog descriptions and links. File contents were not read.</p>
      {visible.map((item) => (
        <article key={item.id} className="icdu-resource">
          <h3>{item.title}</h3>
          <p>{item.purpose}</p>
          {item.href ? <Link href={item.href}>{item.format}</Link> : <span className="icdu-work-meta">{item.format}</span>}
        </article>
      ))}
    </div>
  );
}

function DeveloperView() {
  const workspace = useWorkspace();
  const hands = getSiteSection("developers", "hands-on");
  const schema = getSiteSection("developers", "schema-samples");
  const section = workspace.developerSection;
  return (
    <div className="space-y-4" data-testid="workspace-developer">
      <div className="flex flex-wrap gap-2">
        <button type="button" className="icdu-quiet icdu-focus" aria-pressed={section !== "schema-samples"} onClick={() => workspace.selectDeveloperSection("hands-on")}>Hands-on</button>
        <button type="button" className="icdu-quiet icdu-focus" aria-pressed={section === "schema-samples"} onClick={() => workspace.selectDeveloperSection("schema-samples")}>Schema samples</button>
      </div>
      {section !== "schema-samples" ? (
        <>
          <p className="m-0 text-sm text-[color:var(--icdu-fg-muted)]">{hands?.text}</p>
          <Suspense fallback={<p className="m-0 text-sm">Opening the Advanced Lab…</p>}>
            <AdvancedLab />
          </Suspense>
        </>
      ) : (
        <>
          <p className="m-0 text-sm text-[color:var(--icdu-fg-muted)]">{schema?.text}</p>
          <div className="grid gap-2">
            {generatedTechnicalDocs.map((item) => (
              <article key={item.id} className="icdu-resource">
                <h3>{item.title}</h3>
                <p>{item.purpose}</p>
                <p className="icdu-work-meta">{item.format}. Catalog description only.</p>
              </article>
            ))}
          </div>
        </>
      )}
      <p className="m-0 text-xs text-[color:var(--icdu-fg-faint)]">
        Fine-Tune is a local developer utility, not part of this conversation.{" "}
        <Link href="/fine-tune">Open the Fine-Tune page</Link>
      </p>
    </div>
  );
}

const moves: { view: WorkspaceView; label: string }[] = [
  { view: "guided", label: "Walkthrough" },
  { view: "evidence", label: "Evidence" },
  { view: "readiness", label: "Readiness" },
  { view: "contract", label: "Contract" },
  { view: "review", label: "Review" },
  { view: "compare", label: "Compare" },
  { view: "value", label: "Value" },
  { view: "pilot", label: "Pilot" },
  { view: "brief", label: "Brief" },
];

function WorkspaceMoves() {
  const workspace = useWorkspace();
  if (!workspace.view || workspace.view === "roles" || workspace.view === "workflows") return null;
  return (
    <div className="icdu-moves" aria-label="Workspace sections">
      {moves.map((move) => (
        <button
          key={move.view}
          type="button"
          className="icdu-focus"
          aria-current={workspace.view === move.view ? "true" : undefined}
          onClick={() => workspace.openView(move.view, `manual:${move.view}`)}
        >
          {move.label}
        </button>
      ))}
    </div>
  );
}

function StageBody() {
  const workspace = useWorkspace();
  if (workspace.view === "roles") return <RoleChoices />;
  if (workspace.view === "workflows") return <WorkflowChoices />;
  if (workspace.view === "guided") {
    return (
      <GuidedDemo
        scenarioId={workspace.industryId}
        onOpenAdvancedLab={() => workspace.openView("lab", "manual:lab")}
        onHandoffInPlace={() => workspace.openView("value", "manual:value")}
        handoffLabel="Value model"
      />
    );
  }
  if (workspace.view === "results") return <GuidedReview scenarioId={workspace.guided?.scenarioId ?? null} />;
  if (workspace.view === "value") {
    return (
      <Suspense fallback={<p className="m-0 text-sm">Opening the value model…</p>}>
        <ValueModel />
        <ValueComparison />
      </Suspense>
    );
  }
  if (workspace.view === "contract") return <ContractView />;
  if (workspace.view === "evidence") return <EvidenceView />;
  if (workspace.view === "readiness") return <ReadinessView />;
  if (workspace.view === "review") return <ReviewView />;
  if (workspace.view === "compare") return <CompareView />;
  if (workspace.view === "pilot") return <PilotView />;
  if (workspace.view === "brief") return <BriefView />;
  if (workspace.view === "faq") return <FaqView />;
  if (workspace.view === "resources") return <ResourceView />;
  if (workspace.view === "developer" || workspace.view === "lab") {
    if (workspace.view === "lab") {
      return (
        <Suspense fallback={<p className="m-0 text-sm">Opening the Advanced Lab…</p>}>
          <AdvancedLab />
        </Suspense>
      );
    }
    return <DeveloperView />;
  }
  return null;
}

export function WorkspaceStage() {
  const workspace = useWorkspace();
  const session = useAssistantSession();
  useEffect(() => {
    session.afterResetRef.current = () => workspace.clearArtifactHistory();
    return () => {
      session.afterResetRef.current = () => {};
    };
  }, [session.afterResetRef, workspace]);
  if (!workspace.view) return null;
  const scenario = workspace.guided ? getGuidedScenario(workspace.guided.scenarioId) : undefined;
  return (
    <section className="icdu-workspace-stage" data-testid="workspace-stage" data-workspace-view={workspace.view} aria-label="Active workspace">
      <PendingNotice />
      <WorkspaceMoves />
      <StageBody />
      <FollowUps />
      {scenario && workspace.view === "guided" ? (
        <p className="icdu-stage-note">Simulated walkthrough for {scenario.title}. Scores are scripted examples.</p>
      ) : null}
      {workspace.artifacts.filter((artifact) => artifact.id !== workspace.artifactId).length > 0 ? (
        <div className="icdu-stage-history">
          <p className="icdu-stage-history-label">Earlier in this visit</p>
          {workspace.artifacts.filter((artifact) => artifact.id !== workspace.artifactId).map((artifact) => (
            <div key={artifact.id} className="icdu-stage-chip">
              <span>{artifact.title}</span>
              <button type="button" className="icdu-focus" onClick={() => workspace.reopen(artifact.id)}>Reopen</button>
              {artifact.view === "value" && !sameRoi(artifact.freeze.roiInputs, workspace.roiInputs) ? (
                <button type="button" className="icdu-focus" onClick={() => workspace.requestApplyRoi(artifact.id, `apply:${artifact.id}`)}>
                  Apply these inputs
                </button>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
