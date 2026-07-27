import { cn } from "@/lib/utils";
import { Check, ArrowRight, ArrowLeft, ChevronRight } from "lucide-react";
import { trackJourneyStepViewed } from "@/lib/analytics";
import { useEffect } from "react";
import { Link } from "wouter";
import { PrimaryCTA, SecondaryCTA } from "@/components/brand";

export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "stats"; items: { value: string; label: string }[] }
  | { type: "flow"; steps: { label: string }[] }
  | { type: "checklist"; items: string[] }
  | { type: "code"; language: string; code: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "callout"; title: string; body: string; variant?: "info" | "warning" }
  | { type: "list"; items: { title: string; desc: string }[] }
  | { type: "timeline"; steps: { title: string; desc: string }[] };

export type JourneyTab = {
  id: string;
  title: string;
  sectionTag: string;
  h2: string;
  lead: string;
  blocks: ContentBlock[];
  cta?: { label: string; href: string };
};

export type TabGroup = {
  label: string;
  tabIds: string[];
};

export type PersonaJourney = {
  groups?: TabGroup[];
  tabs: JourneyTab[];
};

type JourneyStepperProps = {
  journey: PersonaJourney;
  currentTabId: string;
  onTabChange: (tabId: string) => void;
  personaId: string;
};

function isExternalHref(href: string) {
  return href.startsWith("mailto:") || href.startsWith("http");
}

function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="space-y-5 sm:space-y-6">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "paragraph":
            return (
              <p
                key={i}
                className="text-sm sm:text-base text-[color:var(--icdu-fg-muted)] leading-relaxed m-0"
              >
                {block.text}
              </p>
            );
          case "stats":
            return (
              <div
                key={i}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3"
              >
                {block.items.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg border border-[color:var(--icdu-border)] bg-[color:var(--icdu-surface)] p-3 sm:p-4 text-center"
                  >
                    <div className="font-editorial text-2xl sm:text-3xl tracking-tight text-[color:var(--icdu-fg)]">
                      {stat.value}
                    </div>
                    <div className="text-sm text-[color:var(--icdu-fg-muted)] mt-1.5 leading-snug">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            );
          case "flow":
            return (
              <div key={i} className="flex flex-wrap items-center gap-2">
                {block.steps.map((step, j) => (
                  <div key={step.label} className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-md border border-[color:var(--icdu-border)] bg-[color:var(--icdu-surface)] px-2.5 py-1.5 text-sm font-medium text-[color:var(--icdu-fg)]">
                      {step.label}
                    </span>
                    {j < block.steps.length - 1 && (
                      <ChevronRight
                        className="h-3.5 w-3.5 text-[color:var(--icdu-fg-faint)] shrink-0"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                ))}
              </div>
            );
          case "checklist":
            return (
              <ul key={i} className="space-y-2 m-0 p-0 list-none">
                {block.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-[color:var(--icdu-fg-muted)]"
                  >
                    <Check
                      className="h-4 w-4 text-[color:var(--icdu-green)] mt-0.5 shrink-0"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            );
          case "code":
            return (
              <pre
                key={i}
                className="overflow-x-auto rounded-lg border border-[color:var(--icdu-border)] bg-[color:var(--icdu-surface)] p-3 sm:p-4 text-sm leading-relaxed text-[color:var(--icdu-fg-muted)]"
              >
                <code>{block.code}</code>
              </pre>
            );
          case "table":
            return (
              <div
                key={i}
                className="overflow-x-auto rounded-lg border border-[color:var(--icdu-border)]"
              >
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[color:var(--icdu-border)] bg-[color:var(--icdu-surface)]">
                      {block.headers.map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2.5 text-left font-semibold text-[color:var(--icdu-fg)]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, ri) => (
                      <tr
                        key={ri}
                        className="border-b border-[color:var(--icdu-border)] last:border-0"
                      >
                        {row.map((cell, ci) => (
                          <td
                            key={ci}
                            className="px-3 py-2.5 text-[color:var(--icdu-fg-muted)] align-top"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "callout":
            return (
              <div
                key={i}
                className={cn(
                  "rounded-lg border p-4",
                    block.variant === "warning"
                    ? "border-[color:var(--icdu-amber)]/30 bg-[color:var(--icdu-amber)]/5"
                    : "border-[color:var(--icdu-blue)]/30 bg-[color:var(--icdu-blue)]/5",
                )}
              >
                <h4 className="font-semibold text-sm text-[color:var(--icdu-fg)] mb-1 m-0">
                  {block.title}
                </h4>
                <p className="text-sm text-[color:var(--icdu-fg-muted)] leading-relaxed m-0">
                  {block.body}
                </p>
              </div>
            );
          case "list":
            return (
              <div key={i} className="space-y-4">
                {block.items.map((item) => (
                  <div key={item.title}>
                    <div className="font-semibold text-sm text-[color:var(--icdu-fg)]">
                      {item.title}
                    </div>
                    <p className="text-sm text-[color:var(--icdu-fg-muted)] leading-relaxed mt-1 m-0">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            );
          case "timeline":
            return (
              <div key={i} className="space-y-3">
                {block.steps.map((step, j) => (
                  <div key={step.title} className="flex gap-3">
                    <div className="flex flex-col items-center shrink-0">
                      <div
                        className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-white"
                        style={{ background: "var(--icdu-blue)" }}
                      >
                        {j + 1}
                      </div>
                      {j < block.steps.length - 1 && (
                        <div className="w-px flex-1 bg-[color:var(--icdu-border)] mt-1 min-h-[1rem]" />
                      )}
                    </div>
                    <div className="pb-3 min-w-0">
                      <div className="font-semibold text-sm text-[color:var(--icdu-fg)]">
                        {step.title}
                      </div>
                      <p className="text-sm text-[color:var(--icdu-fg-muted)] leading-relaxed mt-1 m-0">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

function StepCta({ cta }: { cta: { label: string; href: string } }) {
  if (isExternalHref(cta.href)) {
    return (
      <PrimaryCTA href={cta.href} data-testid="journey-tab-cta">
        {cta.label}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </PrimaryCTA>
    );
  }

  return (
    <PrimaryCTA asChild>
      <Link href={cta.href} data-testid="journey-tab-cta">
        {cta.label}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </PrimaryCTA>
  );
}

export function JourneyStepper({
  journey,
  currentTabId,
  onTabChange,
  personaId,
}: JourneyStepperProps) {
  const tabs = journey.tabs;
  const currentIndex = Math.max(
    0,
    tabs.findIndex((t) => t.id === currentTabId),
  );
  const tab = tabs[currentIndex] ?? tabs[0];
  const stepNumber = currentIndex + 1;
  const total = tabs.length;
  const isFirst = currentIndex <= 0;
  const isLast = currentIndex >= total - 1;

  useEffect(() => {
    if (tab) {
      trackJourneyStepViewed(personaId, tab.id, tab.title);
    }
  }, [tab, personaId]);

  if (!tab) return null;

  const goPrev = () => {
    if (!isFirst) onTabChange(tabs[currentIndex - 1].id);
  };

  const goNext = () => {
    if (!isLast) onTabChange(tabs[currentIndex + 1].id);
  };

  return (
    <div className="space-y-6 sm:space-y-8" data-testid="journey-stepper">
      {/* Progress stepper */}
      <nav aria-label="Journey progress" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-[color:var(--icdu-fg-muted)] m-0">
            Step{" "}
            <span className="text-[color:var(--icdu-fg)]">
              {stepNumber} of {total}
            </span>
            <span className="sm:hidden text-[color:var(--icdu-fg-faint)]">
              {" "}
              · {tab.title}
            </span>
          </p>
          <p className="text-sm text-[color:var(--icdu-fg-faint)] m-0 hidden sm:block">
            {tab.title}
          </p>
        </div>

        <ol className="flex items-stretch gap-1 sm:gap-2 m-0 p-0 list-none overflow-x-auto pb-1">
          {tabs.map((step, index) => {
            const isActive = index === currentIndex;
            const isComplete = index < currentIndex;
            return (
              <li key={step.id} className="flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => onTabChange(step.id)}
                  className={cn(
                    "w-full flex items-center justify-center sm:justify-start rounded-lg border px-2 sm:px-3 py-2.5 transition-colors cursor-pointer",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--icdu-blue)]",
                    isActive
                      ? "border-[color:var(--icdu-blue)] bg-[color:var(--icdu-blue)]/5"
                      : isComplete
                        ? "border-[color:var(--icdu-border)] bg-[color:var(--icdu-surface)] hover:border-[color:var(--icdu-border-hover)]"
                        : "border-[color:var(--icdu-border)] bg-transparent hover:border-[color:var(--icdu-border-hover)]",
                  )}
                  aria-current={isActive ? "step" : undefined}
                  aria-label={`Step ${index + 1}: ${step.title}`}
                  data-testid={`journey-tab-${step.id}`}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <span
                      className={cn(
                        "flex h-7 w-7 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                        isActive || isComplete
                          ? "text-white"
                          : "bg-[color:var(--icdu-surface)] text-[color:var(--icdu-fg-faint)] border border-[color:var(--icdu-border)]",
                      )}
                      style={
                        isActive || isComplete
                          ? { background: "var(--icdu-blue)" }
                          : undefined
                      }
                    >
                      {isComplete ? (
                        <Check className="h-3 w-3" aria-hidden="true" />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span
                      className={cn(
                        "hidden sm:inline text-sm font-medium leading-tight truncate",
                        isActive
                          ? "text-[color:var(--icdu-fg)]"
                          : "text-[color:var(--icdu-fg-muted)]",
                      )}
                    >
                      {step.title}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Step content */}
      <article className="rounded-xl border border-[color:var(--icdu-border)] bg-[color:var(--icdu-surface)] p-4 sm:p-8">
        <div className="icdu-section-label mb-3">{tab.sectionTag}</div>
        <h2 className="font-editorial text-2xl sm:text-3xl tracking-tight text-[color:var(--icdu-fg)] m-0 mb-2 sm:mb-3">
          {tab.h2}
        </h2>
        <p className="text-sm sm:text-base text-[color:var(--icdu-fg-muted)] leading-relaxed m-0 mb-5 sm:mb-7 max-w-3xl">
          {tab.lead}
        </p>

        <ContentBlocks blocks={tab.blocks} />

        {tab.cta && (
          <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-[color:var(--icdu-border)]">
            <StepCta cta={tab.cta} />
          </div>
        )}
      </article>

      {/* Previous / Next */}
      <div className="sticky bottom-3 z-10 flex items-center justify-between gap-3 rounded-xl border border-[color:var(--icdu-border)] bg-[color:var(--icdu-surface-solid)]/95 backdrop-blur-sm p-3 sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <SecondaryCTA
          type="button"
          onClick={goPrev}
          disabled={isFirst}
          className={cn(isFirst && "opacity-40 pointer-events-none")}
          data-testid="journey-prev"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Previous
        </SecondaryCTA>

        {!isLast ? (
          <PrimaryCTA
            type="button"
            onClick={goNext}
            data-testid="journey-next"
          >
            Next
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </PrimaryCTA>
        ) : tab.cta ? (
          <StepCta cta={tab.cta} />
        ) : (
          <span className="text-xs text-[color:var(--icdu-fg-faint)]">
            End of path
          </span>
        )}
      </div>
    </div>
  );
}
