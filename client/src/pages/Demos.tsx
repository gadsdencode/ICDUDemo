import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ICDUBuilder } from "@/components/ICDUBuilder";
import { JudgePanel } from "@/components/JudgePanel";
import { RubricPanel } from "@/components/RubricPanel";
import { StressPanel } from "@/components/StressPanel";
import { PipelineDiagram } from "@/components/PipelineDiagram";
import { FileText, Scale, Users, FlaskConical, Lightbulb } from "lucide-react";
import { trackPageViewed } from "@/lib/analytics";
import { useSEO } from "@/lib/seo";

const demoTabs = [
  { id: "icdu", label: "ICDU Builder", icon: FileText },
  { id: "judge", label: "AI Judge", icon: Scale },
  { id: "hitl", label: "HITL Rubric", icon: Users },
  { id: "stress", label: "Stress Engine", icon: FlaskConical },
];

const demoTakeaways: Record<string, { title: string; points: string[] }> = {
  icdu: {
    title: "ICDU Builder",
    points: [
      "Define explicit intent with success criteria",
      "Encode governing principles for safety",
      "Specify persona and tone requirements",
      "Set context constraints and boundaries",
      "Generate structured, versioned JSON"
    ]
  },
  judge: {
    title: "AI Judge",
    points: [
      "Quantitative scoring across three dimensions",
      "IAS: Intent Alignment Score",
      "PAS: Principle Adherence Score",
      "AS: Application Score",
      "Automatic gate decisions: PROMOTE, ESCALATE, BLOCK"
    ]
  },
  hitl: {
    title: "HITL Nuance Grader",
    points: [
      "Structured rubric for qualitative assessment",
      "Rate empathy, clarity, coaching quality",
      "Evaluate trustworthiness and safety judgment",
      "Aggregate scores across dimensions",
      "Document reviewer notes for governance"
    ]
  },
  stress: {
    title: "Stress Engine",
    points: [
      "Test AI behavior under controlled variations",
      "Perturbations: role, tone, constraint, channel",
      "Measure stability and fairness",
      "Track refusal consistency",
      "Detect hallucination patterns"
    ]
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
            <Card className="p-4 sm:p-5 sticky top-20">
              <h3 className="font-semibold text-xs sm:text-sm mb-2 sm:mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                {currentTakeaways.title}
              </h3>
              <ul className="space-y-1.5 sm:space-y-2">
                {currentTakeaways.points.map((point, index) => (
                  <li key={index} className="flex items-start gap-2 text-xs sm:text-sm">
                    <span className="text-primary mt-0.5 font-bold">•</span>
                    <span className="text-muted-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        <div className="lg:hidden mt-4 sm:mt-6">
          <Card className="p-4 sm:p-5">
            <h3 className="font-semibold text-xs sm:text-sm mb-2 sm:mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              {currentTakeaways.title}
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {currentTakeaways.points.map((point, index) => (
                <li key={index} className="flex items-start gap-2 text-xs sm:text-sm">
                  <span className="text-primary mt-0.5 font-bold">•</span>
                  <span className="text-muted-foreground">{point}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
