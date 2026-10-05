import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ICDUBuilder } from "@/components/ICDUBuilder";
import { JudgePanel } from "@/components/JudgePanel";
import { RubricPanel } from "@/components/RubricPanel";
import { StressPanel } from "@/components/StressPanel";
import { FileText, Scale, Users, FlaskConical } from "lucide-react";
import { componentReplacements } from "@/data/businessCase";

const labTabs = [
  { id: "icdu", label: "ICDU Builder", shortLabel: "Builder", icon: FileText },
  { id: "judge", label: "AI Judge", shortLabel: "Judge", icon: Scale },
  { id: "hitl", label: "HITL Rubric", shortLabel: "HITL", icon: Users },
  { id: "stress", label: "Stress Engine", shortLabel: "Stress", icon: FlaskConical },
];

const labTakeaways: Record<
  string,
  {
    title: string;
    points: string[];
    pipelineLocation: string;
    nextAction: string;
    replaces?: string;
  }
> = {
  icdu: {
    title: "ICDU Builder",
    points: [
      "Define explicit intent with success criteria",
      "Encode governing principles for safety",
      "Specify persona and tone requirements",
      "Set context constraints and boundaries",
      "Generate structured, versioned JSON",
    ],
    pipelineLocation: "ICDU Creation",
    nextAction: "Submit ICDU for AI Judge evaluation",
    replaces: componentReplacements.icduRecord.replaces,
  },
  judge: {
    title: "AI Judge",
    points: [
      "Quantitative scoring across three dimensions",
      "IAS: Intent-Alignment Score",
      "PAS: Principle-Adherence Score",
      "AS: Application Score",
      "Automatic gate decisions: PROMOTE, ESCALATE, BLOCK",
    ],
    pipelineLocation: "AI Judge Gate",
    nextAction: "Review score drivers and to_promote checklist",
    replaces: componentReplacements.aiJudge.replaces,
  },
  hitl: {
    title: "HITL Nuance Grader",
    points: [
      "Structured rubric for qualitative assessment",
      "Rate empathy, clarity, coaching quality",
      "Evaluate trustworthiness and safety judgment",
      "Aggregate scores across dimensions",
      "Document reviewer notes for governance",
    ],
    pipelineLocation: "HITL Nuance Grading",
    nextAction: "Aggregate scores and provide feedback",
    replaces: componentReplacements.hitlGrader.replaces,
  },
  stress: {
    title: "Stress Engine",
    points: [
      "Test AI behavior under controlled variations",
      "Perturbations: role, tone, constraint, channel",
      "Measure stability and fairness",
      "Track refusal consistency",
      "Detect hallucination patterns",
    ],
    pipelineLocation: "Stress Testing",
    nextAction: "Review insights and address warnings",
    replaces: componentReplacements.stressEngine.replaces,
  },
};

export function labSummaryFor(tab: string): string {
  const takeaways = labTakeaways[tab];
  if (!takeaways) return "Deterministic mock lab, not a live model run.";
  return `${takeaways.title}. ${takeaways.points.join(" ")} Deterministic mock lab, not a live model run.`;
}

export function AdvancedLab() {
  const workspace = useWorkspace();
  const activeTab = workspace.labTab;
  const setActiveTab = (tab: string) => {
    if (tab === "icdu" || tab === "judge" || tab === "hitl" || tab === "stress") workspace.selectLab(tab);
  };
  const currentTakeaways = labTakeaways[activeTab];

  return (
    <section className="icdu-work icdu-lab" data-testid="advanced-lab" aria-label="Advanced Lab">
      <header className="icdu-work-head">
        <p className="icdu-work-meta">Illustrative lab. Deterministic mock behavior, not a live model run.</p>
        <h2 className="icdu-work-title">Advanced Lab</h2>
        <p className="icdu-work-lead">
          Builder, Judge, human review, and Stress keep the same drafts and results when you change tabs.
          Scores and stress rows here are simulated.
        </p>
      </header>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="icdu-tab-strip icdu-lab-tabs">
          {labTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="icdu-lab-tab"
                data-testid={`tab-${tab.id}`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="icdu-lab-tab-full">{tab.label}</span>
                <span className="icdu-lab-tab-short">{tab.shortLabel}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        <TabsContent value="icdu" className="icdu-lab-pane">
          <ICDUBuilder />
        </TabsContent>
        <TabsContent value="judge" className="icdu-lab-pane">
          <JudgePanel />
        </TabsContent>
        <TabsContent value="hitl" className="icdu-lab-pane">
          <RubricPanel />
        </TabsContent>
        <TabsContent value="stress" className="icdu-lab-pane">
          <StressPanel />
        </TabsContent>
      </Tabs>
      <aside className="icdu-lab-aside" aria-label={`${currentTakeaways.title} notes`}>
        <h3>{currentTakeaways.title}</h3>
        <ul>
          {currentTakeaways.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <p>Pipeline stage: {currentTakeaways.pipelineLocation}</p>
        <p>{currentTakeaways.nextAction}</p>
        {currentTakeaways.replaces ? <p>Replaces {currentTakeaways.replaces}</p> : null}
      </aside>
    </section>
  );
}
