import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ICDUBuilder } from "@/components/ICDUBuilder";
import { JudgePanel } from "@/components/JudgePanel";
import { RubricPanel } from "@/components/RubricPanel";
import { StressPanel } from "@/components/StressPanel";
import { PipelineDiagram } from "@/components/PipelineDiagram";
import { BeforeAfter } from "@/components/BeforeAfter";
import { KeyTakeaways } from "@/components/KeyTakeaways";
import { FileText, Scale, Users, FlaskConical } from "lucide-react";
import { trackPageViewed } from "@/lib/analytics";
import { useSEO } from "@/lib/seo";

const demoTabs = [
  { id: "icdu", label: "ICDU Builder", icon: FileText },
  { id: "judge", label: "AI Judge", icon: Scale },
  { id: "hitl", label: "HITL Rubric", icon: Users },
  { id: "stress", label: "Stress Engine", icon: FlaskConical },
];

const demoTakeaways: Record<string, { title: string; points: string[]; pipelineLocation: string; nextAction: string }> = {
  icdu: {
    title: "ICDU Builder",
    points: [
      "Define explicit intent with success criteria",
      "Encode governing principles for safety",
      "Specify persona and tone requirements",
      "Set context constraints and boundaries",
      "Generate structured, versioned JSON"
    ],
    pipelineLocation: "ICDU Creation",
    nextAction: "Submit ICDU for AI Judge evaluation"
  },
  judge: {
    title: "AI Judge",
    points: [
      "Quantitative scoring across three dimensions",
      "IAS: Intent Alignment Score",
      "PAS: Principle Adherence Score",
      "AS: Application Score",
      "Automatic gate decisions: PROMOTE, ESCALATE, BLOCK"
    ],
    pipelineLocation: "AI Judge Gate",
    nextAction: "Review score drivers and to_promote checklist"
  },
  hitl: {
    title: "HITL Nuance Grader",
    points: [
      "Structured rubric for qualitative assessment",
      "Rate empathy, clarity, coaching quality",
      "Evaluate trustworthiness and safety judgment",
      "Aggregate scores across dimensions",
      "Document reviewer notes for governance"
    ],
    pipelineLocation: "HITL Nuance Grading",
    nextAction: "Aggregate scores and provide feedback"
  },
  stress: {
    title: "Stress Engine",
    points: [
      "Test AI behavior under controlled variations",
      "Perturbations: role, tone, constraint, channel",
      "Measure stability and fairness",
      "Track refusal consistency",
      "Detect hallucination patterns"
    ],
    pipelineLocation: "Stress Testing",
    nextAction: "Review insights and address warnings"
  }
};

export default function Demos() {
  const [activeTab, setActiveTab] = useState("icdu");
  
  useSEO({
    title: "Interactive Demos | ICDU",
    description: "Try interactive ICDU demos: build structured AI records, run mock AI Judge evaluations, grade with HITL rubrics, and stress test with scenario perturbations.",
  });

  useEffect(() => {
    trackPageViewed("demos");
  }, []);

  const currentTakeaways = demoTakeaways[activeTab];

  return (
    <div className="min-h-screen py-6 sm:py-8">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="text-center mb-6 sm:mb-8">
          <Badge variant="secondary" className="mb-3 sm:mb-4 text-xs sm:text-sm">
            Interactive Demos
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Explore the Pipeline</h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Build an ICDU record, run mock evaluations, grade with the HITL rubric, 
            and stress test with scenario perturbations.
          </p>
        </div>

        <div className="mb-4 sm:mb-6">
          <BeforeAfter compact />
        </div>

        <div className="mb-6 sm:mb-8">
          <PipelineDiagram compact />
        </div>

        <div className="grid lg:grid-cols-[1fr,280px] gap-4 sm:gap-6">
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start h-auto flex-wrap gap-1 bg-transparent p-0 mb-4 sm:mb-6">
                {demoTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      data-testid={`tab-${tab.id}`}
                    >
                      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden xs:inline sm:inline">{tab.label}</span>
                      <span className="xs:hidden sm:hidden">{tab.id.toUpperCase()}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <TabsContent value="icdu" className="mt-0">
                <ICDUBuilder />
              </TabsContent>

              <TabsContent value="judge" className="mt-0">
                <JudgePanel />
              </TabsContent>

              <TabsContent value="hitl" className="mt-0">
                <RubricPanel />
              </TabsContent>

              <TabsContent value="stress" className="mt-0">
                <StressPanel />
              </TabsContent>
            </Tabs>
          </div>

          <div className="hidden lg:block">
            <KeyTakeaways
              title={currentTakeaways.title}
              takeaways={currentTakeaways.points}
              pipelineLocation={currentTakeaways.pipelineLocation}
              nextAction={currentTakeaways.nextAction}
            />
          </div>
        </div>

        <div className="lg:hidden mt-4 sm:mt-6">
          <KeyTakeaways
            title={currentTakeaways.title}
            takeaways={currentTakeaways.points}
            pipelineLocation={currentTakeaways.pipelineLocation}
            nextAction={currentTakeaways.nextAction}
            compact
          />
        </div>
      </div>
    </div>
  );
}
