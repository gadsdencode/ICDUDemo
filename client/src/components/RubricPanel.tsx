import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import { Slider } from "@/components/ui/slider";
import { hitlRubricDimensions } from "@/data/examples";
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

export function RubricPanel({ embedded = false }: { embedded?: boolean }) {
  const workspace = useWorkspace();
  const scores = workspace.task.review.scores;
  const notes = workspace.task.review.notes;
  const saved = workspace.task.review.saved;
  const setScores = (next: RubricScores) => workspace.setReview({ ...workspace.task.review, scores: next, notes });
  const setNotes = (value: string) => workspace.setReview({ ...workspace.task.review, scores, notes: value });
  const { toast } = useToast();

  const averageScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length;

  const handleScoreChange = (dimension: string, value: number[]) => {
    setScores({ ...scores, [dimension]: value[0] });
  };

  const reset = () => {
    workspace.setReview({ ...workspace.task.review, scores: defaultScores, notes: "" });
    trackDemoInteraction("rubric_panel", "reset");
  };

  const save = () => {
    workspace.saveReview(workspace.contract.icdu_id, workspace.contract.revision);
    trackDemoInteraction("rubric_panel", "save_assessment");
    toast({
      title: "Assessment Saved",
      description: `Average score: ${averageScore.toFixed(1)}/5`,
    });
  };

  const stale = saved && workspace.task.review.sourceRevision !== workspace.contract.revision;
  const status = !saved
    ? "Ratings are unsaved until you save the assessment."
    : stale
      ? `Saved for ${workspace.task.review.sourceId} revision ${workspace.task.review.sourceRevision}. The draft has changed since this review.`
      : `Saved for ${workspace.task.review.sourceId} revision ${workspace.task.review.sourceRevision}.`;

  return (
    <div className="icdu-rubric">
      <div className="icdu-lab-toolbar">
        {embedded ? <p className="icdu-work-meta" data-testid="rubric-status">{status}</p> : (
        <div>
          <h3>Human ratings</h3>
          <p className="icdu-work-meta">Published 1 to 5 rubric. These ratings are not averaged with scripted 0 to 1 Judge scores.</p>
          <p className="icdu-work-meta" data-testid="rubric-status">{status}</p>
        </div>
        )}
        <div className="icdu-actions">
          <button type="button" className="icdu-quiet icdu-focus" onClick={reset} data-testid="button-reset-rubric">Reset</button>
          <button type="button" className="icdu-primary icdu-focus" onClick={save} disabled={saved} data-testid="button-save-rubric">
            {saved ? "Saved" : "Save assessment"}
          </button>
        </div>
      </div>
      {hitlRubricDimensions.map((dimension) => (
        <div key={dimension.id} className="icdu-rubric-row">
          <div className="icdu-assumption-top">
            <div>
              <p className="icdu-label" id={`rubric-label-${dimension.id}`}>{dimension.label}</p>
              <p className="icdu-assumption-help">{dimension.description}</p>
            </div>
            <p className="icdu-assumption-value">{scores[dimension.id]}/5 · {scoreLabels[scores[dimension.id] - 1]}</p>
          </div>
          <Slider
            value={[scores[dimension.id]]}
            onValueChange={(value) => handleScoreChange(dimension.id, value)}
            min={1}
            max={5}
            step={1}
            aria-labelledby={`rubric-label-${dimension.id}`}
            data-testid={`slider-${dimension.id}`}
          />
          <div className="icdu-slider-ends" aria-hidden="true">
            {scoreLabels.map((label, index) => (
              <span key={label} className={scores[dimension.id] === index + 1 ? "is-current" : undefined}>{index + 1}</span>
            ))}
          </div>
        </div>
      ))}
      <label className="icdu-field" htmlFor="input-reviewer-notes">
        <span className="icdu-label">Reviewer notes</span>
        <textarea
          id="input-reviewer-notes"
          className="icdu-control"
          placeholder="Unset"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          data-testid="input-reviewer-notes"
        />
      </label>
      <p className="icdu-scoreline">
        Average across {hitlRubricDimensions.length} dimensions
        <strong className="icdu-num">{averageScore.toFixed(1)} / 5</strong>
      </p>
      <p className="icdu-work-meta">Escalate if content appears unsafe or misleading. Keep comments specific and behavior-based.</p>
    </div>
  );
}
