import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ICDUBuilder } from "@/components/ICDUBuilder";
import { JudgePanel } from "@/components/JudgePanel";
import { RubricPanel } from "@/components/RubricPanel";
import { StressPanel } from "@/components/StressPanel";
import { KeyTakeaways } from "@/components/KeyTakeaways";
import { FileText, Scale, Users, FlaskConical, FlaskRound } from "lucide-react";
import { componentReplacements } from "@/data/businessCase";
import { cn } from "@/lib/utils";

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

export function AdvancedLab() {
  const [activeTab, setActiveTab] = useState("icdu");
  const currentTakeaways = labTakeaways[activeTab];

  return (
    <div data-testid="advanced-lab">
      <div className="mb-6 sm:mb-8 rounded-xl border border-[color:var(--icdu-border)] bg-[color:var(--icdu-surface)] p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white"
            style={{ background: "var(--icdu-blue)" }}
          >
            <FlaskRound className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--icdu-blue)] mb-1">
              Advanced Lab
            </div>
            <h2 className="text-base sm:text-lg font-semibold tracking-tight mb-1">
              Technical exploration area
            </h2>
            <p className="text-sm text-[color:var(--icdu-fg-muted)] leading-relaxed m-0 max-w-3xl">
              Full Builder, Judge, HITL, and Stress controls with the same
              deterministic mock behavior as before. Use this when you want to
              inspect fields, thresholds, and JSON directly.
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr,280px] gap-4 sm:gap-6">
        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="icdu-tab-strip w-full justify-start h-auto bg-transparent p-0 mb-4 sm:mb-6">
              {labTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={cn(
                      "shrink-0 gap-1.5 sm:gap-2 text-sm px-3 py-2 rounded-full border border-transparent",
                      "data-[state=active]:bg-[color:var(--icdu-blue)] data-[state=active]:text-white data-[state=active]:border-[color:var(--icdu-blue)]",
                      "data-[state=inactive]:bg-[color:var(--icdu-surface)] data-[state=inactive]:border-[color:var(--icdu-border)] data-[state=inactive]:text-[color:var(--icdu-fg-muted)]",
                    )}
                    data-testid={`tab-${tab.id}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>
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
            replaces={currentTakeaways.replaces}
          />
        </div>
      </div>

      <div className="lg:hidden mt-4 sm:mt-6">
        <KeyTakeaways
          title={currentTakeaways.title}
          takeaways={currentTakeaways.points}
          pipelineLocation={currentTakeaways.pipelineLocation}
          nextAction={currentTakeaways.nextAction}
          replaces={currentTakeaways.replaces}
          compact
        />
      </div>
    </div>
  );
}
