import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import {
  RoleTrackSelector,
  type Persona,
} from "@/components/RoleTrackSelector";
import { JourneyStepper, type PersonaJourney } from "@/components/JourneyStepper";
import { ArrowLeft } from "lucide-react";
import { trackPageViewed } from "@/lib/analytics";
import { useSEO } from "@/lib/seo";
import { BrandPage, PageHero, SecondaryCTA } from "@/components/brand";
import personasData from "@/data/personas.json";
import journeysData from "@/data/journeys.json";
import { cn } from "@/lib/utils";

type JourneysData = Record<string, PersonaJourney>;

const personas = personasData as Persona[];
const journeys = journeysData as JourneysData;

export default function Journey() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/journey/:personaId");
  const personaId = params?.personaId || null;

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

  const handleSelectPersona = (id: string) => {
    setLocation(`/journey/${id}`);
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

        <RoleTrackSelector
          personas={personas}
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
            onClick={() => setLocation("/journey")}
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
            onClick={() => setLocation("/journey")}
            data-testid="button-change-persona"
            className="!px-0 !border-0 !bg-transparent hover:!bg-transparent text-[color:var(--icdu-fg-muted)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            All roles
          </SecondaryCTA>

          <label className="flex items-center gap-2 text-xs text-[color:var(--icdu-fg-faint)]">
            <span className="hidden sm:inline">Switch role</span>
            <select
              value={personaId}
              onChange={(e) => handleSelectPersona(e.target.value)}
              className={cn(
                "rounded-md border border-[color:var(--icdu-border)] bg-[color:var(--icdu-surface)]",
                "px-2.5 py-1.5 text-xs font-medium text-[color:var(--icdu-fg)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--icdu-blue)]",
              )}
              aria-label="Switch role"
              data-testid="role-switcher"
            >
              {personas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
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
        </header>

        <JourneyStepper
          journey={personaJourney}
          currentTabId={activeTabId}
          onTabChange={setCurrentTabId}
          personaId={personaId}
        />
      </div>
    </BrandPage>
  );
}
