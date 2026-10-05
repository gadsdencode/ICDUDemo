// client/src/components/AudienceFunnel.tsx
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { useAudience } from "@/components/AudienceProvider";
import { type Persona } from "@/components/RoleTrackSelector";
import {
  businessCaseLinkLabel,
  describeAudience,
  getPersonaAudience,
  getRoleLens,
  homepageRoleIds,
  markJourneyIndexBrowse,
} from "@/data/audience";
import { guidedScenarios } from "@/data/guidedScenarios";
import personasData from "@/data/personas.json";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";

const personas = homepageRoleIds.flatMap((id) => {
  const persona = (personasData as Persona[]).find((item) => item.id === id);
  return persona ? [persona] : [];
});

type Stage = "role" | "industry" | "result";

function stageFromChoice(personaId: string | null, industryId: string | null): Stage {
  if (personaId && industryId) return "result";
  if (personaId) return "industry";
  return "role";
}

export function AudienceFunnel() {
  const { personaId, industryId, route, scenario, resetKey, setPersonaId } = useAudience();
  const workspace = useWorkspace();
  const [stage, setStage] = useState<Stage>(() => stageFromChoice(personaId, industryId));
  const [announcement, setAnnouncement] = useState("");
  const [seenReset, setSeenReset] = useState(resetKey);
  if (resetKey !== seenReset) {
    setSeenReset(resetKey);
    setStage("role");
    setAnnouncement("Choose your role.");
  }
  const chooserRef = useRef<HTMLElement>(null);
  const focusNext = useRef(false);

  useEffect(() => {
    setStage(stageFromChoice(personaId, industryId));
  }, [personaId, industryId]);

  useEffect(() => {
    if (resetKey === 0) return;
    setAnnouncement("Choose your role.");
    setStage("role");
  }, [resetKey]);

  useEffect(() => {
    if (window.location.hash === "#funnel" || window.location.hash === "#chooser") {
      chooserRef.current?.scrollIntoView({ block: "start" });
    }
  }, []);

  useEffect(() => {
    if (!focusNext.current) return;
    focusNext.current = false;
    const title = document.getElementById("step-title");
    title?.focus({ preventScroll: true });
    const node = chooserRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (rect.top < 0 || rect.top > window.innerHeight * 0.65) {
      node.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
    }
  }, [stage]);

  const role = getPersonaAudience(personaId);
  const view = describeAudience(personaId, industryId);
  const journeyHref = personaId ? `/journey/${personaId}` : "/journey";
  const demosHref = scenario ? `/demos?scenario=${scenario.id}` : "/demos";
  const businessHref = route?.businessCaseHref ?? "/business-case";
  const businessLabel =
    route?.id === "executive"
      ? "Explore the value model"
      : route
        ? `Explore the ${businessCaseLinkLabel(route).replace(/^Value/, "value").replace(/^Business/, "business")}`
        : "Explore the business case";

  const showStage = (next: Stage, message: string) => {
    focusNext.current = true;
    setAnnouncement(message);
    setStage(next);
  };

  const chooseRole = (id: string) => {
    const staying = id === personaId;
    if (!staying) setPersonaId(id);
    workspace.openView("workflows", "manual:workflows");
    const message = industryId
      ? `Path ready: ${getPersonaAudience(id)?.chipLabel ?? id}, ${scenario?.industryShort ?? "workflow"}.`
      : "Choose your industry.";
    if (staying) showStage(industryId ? "result" : "industry", message);
    else {
      focusNext.current = true;
      setAnnouncement(message);
    }
  };

  const chooseIndustry = (id: string) => {
    const staying = id === industryId;
    const next = guidedScenarios.find((item) => item.id === id);
    const selected = workspace.selectScenario(id, false, `scenario:${id}`);
    if (!selected.ok) {
      setAnnouncement("Confirm before replacing the current walkthrough.");
      return;
    }
    const message = personaId
      ? `Path ready: ${role?.chipLabel ?? personaId}, ${next?.industryShort ?? "workflow"}.`
      : "Choose your role.";
    if (staying) showStage(personaId ? "result" : "role", message);
    else {
      focusNext.current = true;
      setAnnouncement(message);
    }
  };

  const stepLabel = stage === "industry" ? "2 of 2" : null;
  const showChooserMeta = Boolean(stepLabel) || (stage === "role" && Boolean(scenario));

  return (
    <div className="icdu-chooser-wrap">
        <section
          ref={chooserRef}
          id="chooser"
          className={cn("icdu-chooser", stage === "result" && "is-result")}
          aria-label="Find your path through ICDU"
          data-testid={
            stage === "result"
              ? "your-path"
              : stage === "role" && !personaId && !industryId
                ? "funnel-incomplete"
                : stage === "role"
                  ? "funnel-preview-workflow"
                  : "funnel-preview-role"
          }
        >
          {showChooserMeta ? (
            <div className="icdu-chooser-meta">
              <div>
                {stage === "role" && scenario ? (
                  <button
                    type="button"
                    className="icdu-context-button icdu-focus"
                    onClick={() => showStage("industry", "Choose your industry.")}
                  >
                    <strong>{scenario.industryShort}</strong> · Change industry
                  </button>
                ) : stage === "industry" && role ? (
                  <button
                    type="button"
                    className="icdu-context-button icdu-focus"
                    onClick={() => showStage("role", "Choose your role.")}
                  >
                    <strong>{role.chipLabel}</strong> · Change role
                  </button>
                ) : null}
              </div>
              {stepLabel ? <span className="icdu-step-count">{stepLabel}</span> : null}
            </div>
          ) : null}

          <div className="icdu-step-content" data-testid="audience-funnel">
            {stage === "role" ? (
              <>
                <h2 id="step-title" tabIndex={-1}>
                  Who are you?
                </h2>
                <div className="icdu-role-options" role="group" aria-labelledby="step-title">
                  {personas.map((persona) => {
                    const audience = getPersonaAudience(persona.id);
                    const lens = getRoleLens(persona.id);
                    const label = audience?.chipLabel ?? persona.name;
                    const description = audience?.alias ?? lens?.focus ?? persona.valueProposition;
                    const selected = personaId === persona.id;
                    return (
                      <button
                        key={persona.id}
                        type="button"
                        className="icdu-role-option icdu-focus"
                        aria-pressed={selected}
                        aria-label={`${label}: ${description}`}
                        data-testid={`persona-card-${persona.id}`}
                        onClick={() => chooseRole(persona.id)}
                      >
                        <span>{label}</span>
                        <small>{description}</small>
                      </button>
                    );
                  })}
                </div>
                <div className="icdu-step-foot">
                  <button
                    type="button"
                    className="icdu-subtle icdu-focus"
                    onClick={() => showStage("industry", "Choose your industry.")}
                  >
                    Start with an industry instead ↗
                  </button>
                  <Link
                    href="/journey"
                    className="icdu-subtle icdu-focus"
                    data-testid="funnel-link-journey"
                    onClick={() => markJourneyIndexBrowse()}
                  >
                    Explore every role ↗
                  </Link>
                </div>
              </>
            ) : null}

            {stage === "industry" ? (
              <>
                <h2 id="step-title" tabIndex={-1}>
                  Where would you apply ICDU?
                </h2>
                <div className="icdu-industry-options" role="group" aria-labelledby="step-title">
                  {guidedScenarios.map((item) => {
                    const selected = industryId === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className="icdu-industry-option icdu-focus"
                        aria-pressed={selected}
                        aria-label={`${item.industryShort}: ${item.title}`}
                        data-testid={`guided-scenario-${item.id}`}
                        onClick={() => chooseIndustry(item.id)}
                      >
                        <strong>{item.industryShort}</strong>
                        <small>{item.title}</small>
                      </button>
                    );
                  })}
                </div>
                <div className="icdu-step-foot">
                  <button
                    type="button"
                    className="icdu-subtle icdu-focus"
                    onClick={() => showStage("role", "Choose your role.")}
                  >
                    {role ? "Back to roles" : "Choose a role instead"} ↗
                  </button>
                  {role ? (
                    <Link href={journeyHref} className="icdu-subtle icdu-focus" data-testid="funnel-link-journey">
                      Open your journey now ↗
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="icdu-subtle icdu-focus"
                      data-testid="funnel-link-demos"
                      onClick={() => workspace.openView("workflows", "manual:workflows")}
                    >
                      Explore every workflow ↗
                    </button>
                  )}
                </div>
              </>
            ) : null}

            {stage === "result" && role && scenario && view.status === "result" ? (
              <>
                <div className="icdu-path-pair">
                  <span>{role.chipLabel}</span>
                  <span>{scenario.industryShort}</span>
                </div>
                <h2 className="icdu-path-title" id="step-title" tabIndex={-1}>
                  {scenario.title}
                </h2>
                <p className="icdu-path-description">{view.detail}</p>
                <div className="icdu-path-actions" data-testid="funnel-actions">
                  <button
                    type="button"
                    className="icdu-path-primary icdu-focus"
                    data-testid="funnel-link-demos"
                    onClick={() => workspace.openView("guided", "manual:guided")}
                  >
                    See this workflow <span aria-hidden="true">→</span>
                  </button>
                  <Link href={journeyHref} className="icdu-path-secondary icdu-focus" data-testid="funnel-link-journey">
                    Your journey <span aria-hidden="true">↗</span>
                  </Link>
                </div>
                <div className="icdu-path-additional">
                  <button type="button" data-testid="funnel-link-business" onClick={() => workspace.openView("value", "manual:value")}>
                    {businessLabel} ↗
                  </button>
                  {role.id === "developer" ? (
                    <button type="button" data-testid="funnel-link-lab" onClick={() => workspace.openView("lab", "manual:lab")}>
                      Advanced Lab ↗
                    </button>
                  ) : null}
                </div>
                <div className="icdu-path-edit">
                  <button type="button" className="icdu-focus" onClick={() => showStage("role", "Choose your role.")}>
                    Change role
                  </button>
                  <button
                    type="button"
                    className="icdu-focus"
                    onClick={() => showStage("industry", "Choose your industry.")}
                  >
                    Change industry
                  </button>
                </div>
              </>
            ) : null}
          </div>
          <p className="sr-only" aria-live="polite">
            {announcement}
          </p>
        </section>

        <p className="icdu-browse">
          <span>Just looking around?</span>
          <Link href="/journey" onClick={() => markJourneyIndexBrowse()}>
            Browse without choosing <span aria-hidden="true">↗</span>
          </Link>
        </p>
      </div>
  );
}
