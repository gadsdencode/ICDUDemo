import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { PersonaSelector } from "@/components/PersonaSelector";
import { JourneyStepper, type PersonaJourney } from "@/components/JourneyStepper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Map } from "lucide-react";
import { trackPageViewed } from "@/lib/analytics";
import { useSEO } from "@/lib/seo";
import personasData from "@/data/personas.json";
import journeysData from "@/data/journeys.json";

type JourneysData = Record<string, PersonaJourney>;

const journeys = journeysData as JourneysData;

export default function Journey() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/journey/:personaId");
  const personaId = params?.personaId || null;

  const selectedPersona = personasData.find((p) => p.id === personaId);
  const personaJourney = personaId ? journeys[personaId] : null;
  const defaultTabId =
    personaJourney?.tabs[0]?.id ??
    selectedPersona?.recommendedStartingSection ??
    null;

  const [currentTabId, setCurrentTabId] = useState<string | null>(defaultTabId);

  useSEO({
    title: selectedPersona
      ? `${selectedPersona.name} Journey | ICDU`
      : "Choose Your Role | ICDU Journey",
    description: selectedPersona
      ? `Explore the ICDU journey for ${selectedPersona.name}s — architecture, security, compliance, and ROI tailored to your role.`
      : "Select your role to explore ICDU through a personalized tabbed journey — CTO, CISO, Developer, Compliance Officer, or CFO.",
  });

  useEffect(() => {
    trackPageViewed("journey");
  }, []);

  useEffect(() => {
    if (personaJourney?.tabs[0]) {
      setCurrentTabId(personaJourney.tabs[0].id);
    }
  }, [personaId, personaJourney]);

  const handleSelectPersona = (id: string) => {
    setLocation(`/journey/${id}`);
  };

  if (!personaId) {
    return (
      <div className="min-h-screen py-4 sm:py-12">
        <div className="container px-3 sm:px-4 mx-auto max-w-7xl">
          <div className="text-center mb-4 sm:mb-12">
            <Badge variant="secondary" className="mb-2 sm:mb-4 text-[10px] sm:text-sm">
              <Map className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
              Role-Based Journey
            </Badge>
            <h1 className="text-lg sm:text-3xl font-bold mb-2 sm:mb-4">Choose Your Role</h1>
            <p className="text-[11px] sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Select a persona to explore ICDU through tabbed content tailored to your
              priorities — from technical architecture to financial ROI.
            </p>
          </div>

          <PersonaSelector
            personas={personasData}
            selectedPersona={null}
            onSelectPersona={handleSelectPersona}
          />
        </div>
      </div>
    );
  }

  if (!selectedPersona || !personaJourney || !currentTabId) {
    return (
      <div className="min-h-screen py-12">
        <div className="container px-4 mx-auto max-w-7xl text-center">
          <h1 className="text-2xl font-bold mb-4">Persona not found</h1>
          <Button onClick={() => setLocation("/journey")} data-testid="button-back-to-personas">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Personas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-3 sm:py-8">
      <div className="container px-3 sm:px-4 mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-2 sm:gap-4 mb-2 sm:mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/journey")}
            className="gap-1 sm:gap-2 h-7 sm:h-9 px-2 sm:px-3"
            data-testid="button-change-persona"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-[10px] sm:text-sm">All roles</span>
          </Button>

          <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 sm:px-2">
            {selectedPersona.name}
          </Badge>
        </div>

        <div className="mb-3 sm:mb-6">
          <PersonaSelector
            personas={personasData}
            selectedPersona={personaId}
            onSelectPersona={handleSelectPersona}
            compact
          />
        </div>

        <JourneyStepper
          journey={personaJourney}
          currentTabId={currentTabId}
          onTabChange={setCurrentTabId}
          personaId={personaId}
        />
      </div>
    </div>
  );
}
