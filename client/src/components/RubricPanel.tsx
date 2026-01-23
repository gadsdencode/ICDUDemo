import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Users, RotateCcw, Save, CheckCircle2 } from "lucide-react";
import { hitlRubricDimensions } from "@/data/examples";
import { cn } from "@/lib/utils";
import { trackDemoInteraction } from "@/lib/analytics";
import { useToast } from "@/hooks/use-toast";

type RubricScores = Record<string, number>;

const defaultScores: RubricScores = {
  empathy: 3,
  clarity: 3,
  coaching: 3,
  trust: 3,
  safety: 3,
};

const scoreLabels = ["Poor", "Fair", "Good", "Very Good", "Excellent"];

function getScoreColor(score: number): string {
  if (score <= 1) return "bg-destructive";
  if (score <= 2) return "bg-amber-500";
  if (score <= 3) return "bg-yellow-500";
  if (score <= 4) return "bg-emerald-400";
  return "bg-emerald-500";
}

export function RubricPanel() {
  const [scores, setScores] = useState<RubricScores>(defaultScores);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

  const averageScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length;

  const handleScoreChange = (dimension: string, value: number[]) => {
    setScores({ ...scores, [dimension]: value[0] });
    setSaved(false);
  };

  const reset = () => {
    setScores(defaultScores);
    setNotes("");
    setSaved(false);
    trackDemoInteraction("rubric_panel", "reset");
  };

  const save = () => {
    setSaved(true);
    trackDemoInteraction("rubric_panel", "save_assessment");
    toast({
      title: "Assessment Saved",
      description: `Average score: ${averageScore.toFixed(1)}/5`,
    });
  };

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-sm sm:text-base">HITL Nuance Grader</h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={reset}
            className="gap-1 sm:gap-2 flex-1 sm:flex-none"
            data-testid="button-reset-rubric"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </Button>
          <Button
            size="sm"
            onClick={save}
            className="gap-1 sm:gap-2 flex-1 sm:flex-none"
            disabled={saved}
            data-testid="button-save-rubric"
          >
            {saved ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span className="hidden sm:inline">Saved</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {hitlRubricDimensions.map((dimension) => (
          <div key={dimension.id} className="space-y-2 sm:space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
              <div className="min-w-0">
                <span className="font-medium text-xs sm:text-sm">{dimension.label}</span>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate sm:whitespace-normal">{dimension.description}</p>
              </div>
              <Badge 
                className={cn(
                  "text-white min-w-[70px] sm:min-w-[90px] justify-center text-[10px] sm:text-xs flex-shrink-0 self-start sm:self-center",
                  getScoreColor(scores[dimension.id])
                )}
              >
                {scores[dimension.id]}/5 - {scoreLabels[scores[dimension.id] - 1]}
              </Badge>
            </div>
            <div className="px-1">
              <Slider
                value={[scores[dimension.id]]}
                onValueChange={(value) => handleScoreChange(dimension.id, value)}
                min={1}
                max={5}
                step={1}
                className="cursor-pointer"
                data-testid={`slider-${dimension.id}`}
              />
              <div className="flex justify-between mt-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span 
                    key={n} 
                    className={cn(
                      "text-[10px] sm:text-xs",
                      scores[dimension.id] === n 
                        ? "text-foreground font-medium" 
                        : "text-muted-foreground"
                    )}
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}

        <div className="pt-3 sm:pt-4 border-t space-y-2 sm:space-y-3">
          <label className="font-medium text-xs sm:text-sm">Reviewer Notes</label>
          <Textarea
            placeholder="Add specific, behavior-based comments..."
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              setSaved(false);
            }}
            rows={3}
            className="text-sm"
            data-testid="input-reviewer-notes"
          />
        </div>

        <div className="p-3 sm:p-4 bg-muted/50 rounded-md">
          <div className="flex items-center justify-between">
            <span className="font-medium text-xs sm:text-sm">Overall Score</span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className={cn(
                "h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full",
                getScoreColor(Math.round(averageScore))
              )} />
              <span className="font-mono font-semibold text-base sm:text-lg">{averageScore.toFixed(1)}</span>
              <span className="text-muted-foreground text-xs sm:text-sm">/ 5</span>
            </div>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
            Average across all {hitlRubricDimensions.length} dimensions
          </p>
        </div>

        <p className="text-[10px] sm:text-xs text-muted-foreground">
          Escalate if content appears unsafe or misleading. Keep comments specific and behavior-based.
        </p>
      </div>
    </Card>
  );
}
