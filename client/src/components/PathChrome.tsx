// client/src/components/PathChrome.tsx
import { Link } from "wouter";
import { useAudience } from "@/components/AudienceProvider";
import { formatAudienceChip, getPersonaAudience, getRoleLens } from "@/data/audience";
import { cn } from "@/lib/utils";

const chipClass =
  "icdu-focus inline-flex max-w-full items-center gap-2 px-0 py-1 text-xs text-[color:var(--icdu-fg-muted)] no-underline hover:text-[color:var(--icdu-fg)]";

export function PathChip({
  testId,
  onNavigate,
  className,
}: {
  testId: string;
  onNavigate?: () => void;
  className?: string;
}) {
  const { personaId, industryId } = useAudience();
  const label = formatAudienceChip(personaId, industryId);
  if (!label) return null;

  return (
    <Link
      href="/#chooser"
      onClick={onNavigate}
      data-testid={testId}
      className={cn(chipClass, className)}
    >
      <span className="min-w-0 truncate font-medium">{label}</span>
      <span className="shrink-0 text-[color:var(--icdu-fg-muted)] underline decoration-[color:var(--icdu-fg-whisper)] underline-offset-2">
        Change
      </span>
    </Link>
  );
}

function lensPhrase(focus: string): string {
  return focus.charAt(0).toLowerCase() + focus.slice(1);
}

export function PathEntrance({
  page,
  mode,
}: {
  page: "journey" | "demos" | "journey-index";
  mode?: "guided" | "lab";
}) {
  const { personaId, industryId, scenario } = useAudience();
  const lens = getRoleLens(personaId);
  const persona = getPersonaAudience(personaId);
  const chip = formatAudienceChip(personaId, industryId);

  let text = "";
  if (page === "journey-index") {
    if (scenario && persona) {
      text = `${chip} stays selected. Choose a role below to open that journey.`;
    } else if (scenario) {
      text = `${scenario.industryShort} stays selected. Choose a role below to open a journey for ${scenario.title}.`;
    } else if (chip) {
      text = `${chip} is selected. Choose a role below to open the matching journey.`;
    }
  } else if (page === "journey") {
    if (persona && lens && scenario) {
      text = `Opened for ${chip}. This journey follows ${lensPhrase(lens.focus)}. ${scenario.title} — ${scenario.subtitle} — is the workflow at the end.`;
    } else if (persona && lens) {
      text = `Opened for ${persona.chipLabel}. This journey follows ${lensPhrase(lens.focus)}. Choose a workflow when you want a specific handoff.`;
    } else if (scenario) {
      text = `Opened for ${scenario.industryShort}. ${scenario.title} — ${scenario.subtitle} — stays selected for the handoff at the end.`;
    }
  } else if (persona && lens && scenario) {
    text = `Opened for ${chip}. This guided demo walks ${scenario.title}: ${scenario.subtitle}. The lens is ${lensPhrase(lens.focus)}. Scores in this walkthrough are simulated.`;
  } else if (scenario) {
    text = `Opened for ${scenario.industryShort}. This guided demo walks ${scenario.title}: ${scenario.subtitle}. Scores in this walkthrough are simulated.`;
  } else if (persona && lens) {
    text = `Opened for ${persona.chipLabel}. Choose a workflow to walk it with this lens: ${lensPhrase(lens.focus)}.`;
  }

  if (page === "demos" && mode === "lab" && text) {
    text += " Advanced Lab is open on its own; the guided workflow stays selected.";
  }

  if (!text) return null;

  return (
    <p
      className="m-0 max-w-2xl text-sm leading-relaxed text-[color:var(--icdu-fg-muted)]"
      data-testid="path-entrance"
    >
      {text}
    </p>
  );
}

export function RecommendedFlag() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-sm border border-[color:var(--icdu-accent)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[color:var(--icdu-accent)]">
      <span
        className="h-1.5 w-1.5 border border-[color:var(--icdu-accent)] bg-[color:var(--icdu-accent)]"
        aria-hidden="true"
      />
      Recommended
    </span>
  );
}
