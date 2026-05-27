import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { trackJourneyStepViewed } from "@/lib/analytics";
import { useEffect } from "react";
import { Link } from "wouter";

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
  groups: TabGroup[];
  tabs: JourneyTab[];
};

type JourneyStepperProps = {
  journey: PersonaJourney;
  currentTabId: string;
  onTabChange: (tabId: string) => void;
  personaId: string;
};

function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "paragraph":
            return (
              <p key={i} className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {block.text}
              </p>
            );
          case "stats":
            return (
              <div key={i} className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {block.items.map((stat) => (
                  <Card key={stat.label} className="p-2.5 sm:p-4 text-center">
                    <div className="text-lg sm:text-2xl font-bold text-primary">{stat.value}</div>
                    <div className="text-[9px] sm:text-xs text-muted-foreground mt-1 leading-snug">
                      {stat.label}
                    </div>
                  </Card>
                ))}
              </div>
            );
          case "flow":
            return (
              <div key={i} className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {block.steps.map((step, j) => (
                  <div key={step.label} className="flex items-center gap-1.5 sm:gap-2">
                    <Badge variant="secondary" className="text-[9px] sm:text-xs whitespace-nowrap">
                      {step.label}
                    </Badge>
                    {j < block.steps.length - 1 && (
                      <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            );
          case "checklist":
            return (
              <ul key={i} className="space-y-1.5 sm:space-y-2">
                {block.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                    <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            );
          case "code":
            return (
              <pre
                key={i}
                className="overflow-x-auto rounded-md border bg-muted/50 p-3 sm:p-4 text-[10px] sm:text-xs leading-relaxed"
              >
                <code>{block.code}</code>
              </pre>
            );
          case "table":
            return (
              <div key={i} className="overflow-x-auto rounded-md border">
                <table className="w-full text-[10px] sm:text-xs">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      {block.headers.map((h) => (
                        <th key={h} className="px-2 sm:px-3 py-2 text-left font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, ri) => (
                      <tr key={ri} className="border-b last:border-0">
                        {row.map((cell, ci) => (
                          <td key={ci} className="px-2 sm:px-3 py-2 text-muted-foreground align-top">
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
              <Card
                key={i}
                className={cn(
                  "p-3 sm:p-4",
                  block.variant === "warning"
                    ? "border-amber-500/30 bg-amber-500/5"
                    : "border-primary/30 bg-primary/5",
                )}
              >
                <h4 className="font-semibold text-xs sm:text-sm mb-1">{block.title}</h4>
                <p className="text-[10px] sm:text-sm text-muted-foreground leading-relaxed">
                  {block.body}
                </p>
              </Card>
            );
          case "list":
            return (
              <div key={i} className="space-y-2 sm:space-y-3">
                {block.items.map((item) => (
                  <div key={item.title}>
                    <div className="font-semibold text-xs sm:text-sm">{item.title}</div>
                    <p className="text-[10px] sm:text-sm text-muted-foreground leading-relaxed mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            );
          case "timeline":
            return (
              <div key={i} className="space-y-2 sm:space-y-3">
                {block.steps.map((step, j) => (
                  <div key={step.title} className="flex gap-2 sm:gap-3">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-[9px] sm:text-xs font-semibold">
                        {j + 1}
                      </div>
                      {j < block.steps.length - 1 && (
                        <div className="w-px flex-1 bg-border mt-1 min-h-[1rem]" />
                      )}
                    </div>
                    <div className="pb-2 sm:pb-3 min-w-0">
                      <div className="font-semibold text-xs sm:text-sm">{step.title}</div>
                      <p className="text-[10px] sm:text-sm text-muted-foreground leading-relaxed mt-0.5">
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

export function JourneyStepper({
  journey,
  currentTabId,
  onTabChange,
  personaId,
}: JourneyStepperProps) {
  const tab = journey.tabs.find((t) => t.id === currentTabId) ?? journey.tabs[0];

  useEffect(() => {
    if (tab) {
      trackJourneyStepViewed(personaId, tab.id, tab.title);
    }
  }, [tab, personaId]);

  if (!tab) return null;

  return (
    <div className="grid lg:grid-cols-[220px,1fr] gap-4 sm:gap-6">
      {/* Left sidebar — tab groups */}
      <nav className="space-y-3 sm:space-y-4">
        {journey.groups.map((group) => (
          <div key={group.label}>
            <div className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 px-1">
              {group.label}
            </div>
            <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
              {group.tabIds.map((tabId) => {
                const groupTab = journey.tabs.find((t) => t.id === tabId);
                if (!groupTab) return null;
                const isActive = tabId === currentTabId;
                return (
                  <button
                    key={tabId}
                    onClick={() => onTabChange(tabId)}
                    className={cn(
                      "whitespace-nowrap lg:w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded-md border text-[10px] sm:text-xs font-medium transition-all shrink-0",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border hover-elevate text-muted-foreground",
                    )}
                    data-testid={`journey-tab-${tabId}`}
                  >
                    {groupTab.title}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Right content panel */}
      <Card className="p-3 sm:p-6">
        <Badge variant="secondary" className="text-[9px] sm:text-xs mb-2 sm:mb-3">
          {tab.sectionTag}
        </Badge>
        <h2 className="text-base sm:text-2xl font-bold mb-1 sm:mb-2">{tab.h2}</h2>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4 sm:mb-6">
          {tab.lead}
        </p>

        <ContentBlocks blocks={tab.blocks} />

        {tab.cta && (
          <div className="mt-5 sm:mt-8 pt-4 sm:pt-6 border-t">
            <Link href={tab.cta.href}>
              <Button size="sm" className="gap-2 text-xs sm:text-sm" data-testid="journey-tab-cta">
                {tab.cta.label}
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}

export function KeyTakeawaysPanel({ takeaways }: { takeaways: string[] }) {
  return (
    <Card className="p-2.5 sm:p-5 sticky top-20">
      <h3 className="font-semibold text-[10px] sm:text-sm mb-1.5 sm:mb-3">Key Takeaways</h3>
      <ul className="space-y-1 sm:space-y-2">
        {takeaways.map((takeaway, index) => (
          <li key={index} className="flex items-start gap-1.5 sm:gap-2 text-[10px] sm:text-sm">
            <Check className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <span className="text-muted-foreground">{takeaway}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
