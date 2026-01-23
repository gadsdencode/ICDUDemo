import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { PersonaSelector } from "@/components/PersonaSelector";
import { JourneyStepper, KeyTakeawaysPanel } from "@/components/JourneyStepper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Map } from "lucide-react";
import { trackPageViewed } from "@/lib/analytics";
import { useSEO } from "@/lib/seo";
import personasData from "@/data/personas.json";
import journeysData from "@/data/journeys.json";

type JourneyStep = {
  stepId: string;
  title: string;
  problem: string;
  withIcdu: string;
  proofMetrics: string;
  example: string;
  whereInPipeline: string;
  keyTakeaways: string[];
};

type JourneysData = Record<string, JourneyStep[]>;

const journeys = journeysData as JourneysData;

export default function Journey() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/journey/:personaId");
  const personaId = params?.personaId || null;
  
  const [currentStep, setCurrentStep] = useState(0);

  const selectedPersona = personasData.find((p) => p.id === personaId);
  
  useSEO({
    title: selectedPersona 
      ? `${selectedPersona.name} Journey | ICDU` 
      : "Choose Your Role | ICDU Journey",
    description: selectedPersona
      ? `Explore the ICDU journey for ${selectedPersona.name}s. Learn how ICDU addresses ${selectedPersona.tagline.toLowerCase()} challenges with measurable, auditable AI safety.`
      : "Select your role to see a personalized journey through the ICDU AI safety pipeline, highlighting challenges and benefits most relevant to you.",
  });

  useEffect(() => {
    trackPageViewed("journey");
  }, []);

  useEffect(() => {
    setCurrentStep(0);
  }, [personaId]);

  const handleSelectPersona = (id: string) => {
    setLocation(`/journey/${id}`);
  };

  const journeySteps = personaId ? journeys[personaId] : null;
  const currentStepData = journeySteps?.[currentStep];

  if (!personaId) {
    return (
      <div className="min-h-screen py-12">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              Persona-Based Journey
            </Badge>
            <h1 className="text-3xl font-bold mb-4">Choose Your Role</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Select the role that best matches your perspective to see a personalized journey 
              through the ICDU pipeline, highlighting the challenges and benefits most relevant to you.
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

  if (!selectedPersona || !journeySteps) {
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
    <div className="min-h-screen py-8">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/journey")}
            className="gap-2"
            data-testid="button-change-persona"
          >
            <ArrowLeft className="h-4 w-4" />
            Change Role
          </Button>
          
          <div className="flex items-center gap-2">
            <Map className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Journey for</span>
            <Badge variant="secondary">{selectedPersona.name}</Badge>
          </div>
        </div>

        <div className="mb-8">
          <PersonaSelector
            personas={personasData}
            selectedPersona={personaId}
            onSelectPersona={handleSelectPersona}
            compact
          />
        </div>

        <div className="grid lg:grid-cols-[1fr,300px] gap-6">
          <div>
            <JourneyStepper
              steps={journeySteps}
              currentStep={currentStep}
              onStepChange={setCurrentStep}
              personaId={personaId}
            />
          </div>

          <div className="hidden lg:block">
            {currentStepData && (
              <KeyTakeawaysPanel takeaways={currentStepData.keyTakeaways} />
            )}
          </div>
        </div>

        <div className="lg:hidden mt-6">
          {currentStepData && (
            <KeyTakeawaysPanel takeaways={currentStepData.keyTakeaways} />
          )}
        </div>
      </div>
    </div>
  );
}
