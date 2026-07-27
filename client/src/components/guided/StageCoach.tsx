import type { GuidedScenario, GuidedStepId } from "@/data/guidedScenarios";

type StageCoachProps = {
  scenario: GuidedScenario;
  step: GuidedStepId;
};

const labels = {
  happened: "What happened",
  matters: "Why it matters",
  changed: "What ICDU changed",
  notice: "What to notice",
} as const;

export function StageCoach({ scenario, step }: StageCoachProps) {
  const copy = scenario.noticePoints[step];

  return (
    <aside
      className="rounded-xl border border-[color:var(--icdu-border)] bg-[color:var(--icdu-surface)] p-4 sm:p-5"
      data-testid="guided-stage-coach"
    >
      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--icdu-blue)] mb-3">
        Stage guide
      </div>
      <dl className="space-y-3.5">
        {(Object.keys(labels) as Array<keyof typeof labels>).map((key) => (
          <div key={key}>
            <dt className="text-sm font-semibold text-[color:var(--icdu-fg)] mb-0.5">
              {labels[key]}
            </dt>
            <dd className="text-xs sm:text-sm leading-relaxed text-[color:var(--icdu-fg-muted)] m-0">
              {copy[key]}
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
