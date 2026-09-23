import { useState, useEffect } from "react";
import { Link, useLocation, useRoute } from "wouter";
import {
  RoleTrackSelector,
  type Persona,
} from "@/components/RoleTrackSelector";
import { JourneyStepper, type PersonaJourney } from "@/components/JourneyStepper";
import { ArrowLeft } from "lucide-react";
import { trackPageViewed } from "@/lib/analytics";
import { useSEO } from "@/lib/seo";
import { BrandPage, PageHero, PrimaryCTA, SecondaryCTA } from "@/components/brand";
import { PathEntrance } from "@/components/PathChrome";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import personasData from "@/data/personas.json";
import journeysData from "@/data/journeys.json";
import { cn } from "@/lib/utils";
import { useAudience } from "@/components/AudienceProvider";
import {
  businessCaseLinkLabel,
  clearJourneyIndexBrowse,
  isJourneyIndexBrowse,
  isPersonaId,
  markJourneyIndexBrowse,
} from "@/data/audience";

type JourneysData = Record<string, PersonaJourney>;

const personas = personasData as Persona[];
const journeys = journeysData as JourneysData;

export default function Journey() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/journey/:personaId");
  const personaId = params?.personaId || null;
  const { personaId: audiencePersonaId, scenario, route, setPersonaId } = useAudience();

  const selectedPersona = personas.find((p) => p.id === personaId);
  const personaJourney = personaId ? journeys[personaId] : null;
  const firstTabId = personaJourney?.tabs[0]?.id ?? null;

  const [currentTabId, setCurrentTabId] = useState<string | null>(null);

  const activeTabId =
    personaJourney &&
    currentTabId &&
    personaJourney.tabs.some((t) => t.id === currentTabId)
      ? currentTabId
      : firstTabId;

  useSEO({
    title: selectedPersona
      ? `${selectedPersona.name} Journey | ICDU`
      : "Choose Your Role | ICDU Journey",
    description: selectedPersona
      ? `Explore the ICDU journey for ${selectedPersona.name} — situation, what changes, how it works, evidence, and recommended next steps.`
      : "Choose a Leadership, Governance & Risk, or Technical path to explore ICDU through a guided five-step journey.",
  });

  useEffect(() => {
    trackPageViewed("journey");
  }, []);

  useEffect(() => {
    if (firstTabId) {
      setCurrentTabId(firstTabId);
    }
  }, [personaId, firstTabId]);

  useEffect(() => {
    if (personaId) return;
    return () => clearJourneyIndexBrowse();
  }, [personaId]);

  useEffect(() => {
    if (personaId) {
      if (isPersonaId(personaId)) clearJourneyIndexBrowse();
      return;
    }
    if (isJourneyIndexBrowse()) return;
    if (audiencePersonaId) {
      setLocation(`/journey/${audiencePersonaId}`);
    }
  }, [personaId, audiencePersonaId, setLocation]);

  const handleSelectPersona = (id: string) => {
    clearJourneyIndexBrowse();
    setPersonaId(id, { history: "none" });
    setLocation(`/journey/${id}`);
  };

  const showAllRoles = () => {
    markJourneyIndexBrowse();
    setLocation("/journey");
  };

  if (!personaId) {
    return (
      <BrandPage>
        <PageHero
          label="For Your Role"
          title="Choose your path"
          description="Pick a track that matches how you evaluate AI — then walk a focused five-step journey ending in a clear next action."
          displayTitle={false}
        />

        <div className="mb-6">
          <PathEntrance page="journey-index" />
        </div>
        <RoleTrackSelector
          personas={personas}
          selectedId={audiencePersonaId}
          onSelectPersona={handleSelectPersona}
        />
      </BrandPage>
    );
  }

  if (!selectedPersona || !personaJourney || !activeTabId) {
    return (
      <BrandPage>
        <div className="text-center">
          <h1 className="icdu-section-heading mb-4">Role not found</h1>
          <SecondaryCTA
            type="button"
            onClick={showAllRoles}
            data-testid="button-back-to-personas"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to roles
          </SecondaryCTA>
        </div>
      </BrandPage>
    );
  }

  return (
    <BrandPage>
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-8">
          <SecondaryCTA
            type="button"
            onClick={showAllRoles}
            data-testid="button-change-persona"
            className="!px-0 !border-0 !bg-transparent hover:!bg-transparent text-[color:var(--icdu-fg-muted)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            All roles
          </SecondaryCTA>

          <div className="flex items-center gap-2 text-xs text-[color:var(--icdu-fg-faint)]">
            <span className="hidden sm:inline" id="role-switcher-label">
              Switch role
            </span>
            <Select value={personaId} onValueChange={handleSelectPersona}>
              <SelectTrigger
                aria-labelledby="role-switcher-label"
                aria-label="Switch role"
                data-testid="role-switcher"
                className={cn(
                  "h-auto w-auto min-w-[10.5rem] rounded-md border-[color:var(--icdu-border)]",
                  "bg-[color:var(--icdu-surface-solid)] px-2.5 py-1.5 text-xs font-medium",
                  "text-[color:var(--icdu-fg)] shadow-none",
                  "focus:ring-2 focus:ring-[color:var(--icdu-blue)] focus:ring-offset-0",
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                align="end"
                className="z-50 border-[color:var(--icdu-border-hover)] bg-[color:var(--icdu-surface-solid)] text-[color:var(--icdu-fg)] shadow-lg"
              >
                {personas.map((p) => (
                  <SelectItem
                    key={p.id}
                    value={p.id}
                    className="text-xs text-[color:var(--icdu-fg)] focus:bg-[color:var(--icdu-surface-hover)] focus:text-[color:var(--icdu-fg)]"
                  >
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <header className="mb-6 sm:mb-8">
          <div className="icdu-section-label mb-2">
            {selectedPersona.track === "leadership"
              ? "Leadership"
              : selectedPersona.track === "governance"
                ? "Governance & Risk"
                : "Technical"}
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl tracking-tight text-[color:var(--icdu-fg)] m-0 mb-2">
            {selectedPersona.name}
          </h1>
          <p className="text-sm sm:text-base text-[color:var(--icdu-fg-muted)] leading-relaxed m-0 max-w-2xl">
            {selectedPersona.valueProposition}
          </p>
          <div className="mt-4" data-testid={scenario ? "journey-industry-banner" : undefined}>
            <PathEntrance page="journey" />
          </div>
        </header>

        <JourneyStepper
          journey={personaJourney}
          currentTabId={activeTabId}
          onTabChange={setCurrentTabId}
          personaId={personaId}
          endNote={
            <section
              className="rounded-md border-2 border-[color:var(--icdu-fg)] p-4"
              data-testid="journey-handoff"
            >
              <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--icdu-fg-faint)]">
                Continue with this workflow
              </p>
              <p className="m-0 mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--icdu-fg)]">
                Define · Check · Record
              </p>
              {scenario ? (
                <>
                  <h3 className="m-0 mt-2 font-display text-lg font-semibold tracking-tight text-[color:var(--icdu-fg)]">
                    {scenario.title}
                  </h3>
                  <p className="m-0 mt-1 text-sm leading-relaxed text-[color:var(--icdu-fg-muted)]">
                    {scenario.subtitle}
                  </p>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <PrimaryCTA asChild>
                      <Link href={`/demos?scenario=${scenario.id}`}>See this workflow</Link>
                    </PrimaryCTA>
                    <SecondaryCTA asChild>
                      <Link href={route?.businessCaseHref ?? "/business-case"}>
                        {route ? businessCaseLinkLabel(route) : "Business case"}
                      </Link>
                    </SecondaryCTA>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="m-0 mt-2 font-display text-lg font-semibold tracking-tight text-[color:var(--icdu-fg)]">
                    Choose a workflow
                  </h3>
                  <p className="m-0 mt-1 text-sm leading-relaxed text-[color:var(--icdu-fg-muted)]">
                    Pick a workflow to see this journey applied to a specific task. The pilot action above stays available.
                  </p>
                  <div className="mt-4">
                    <SecondaryCTA asChild>
                      <Link href="/#funnel">Choose a workflow</Link>
                    </SecondaryCTA>
                  </div>
                </>
              )}
            </section>
          }
        />
      </div>
    </BrandPage>
  );
}
