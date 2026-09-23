import { useEffect, useState } from "react";
import { Link } from "wouter";
import { trackPageViewed } from "@/lib/analytics";
import { useSEO } from "@/lib/seo";
import { BrandPage, PageHero } from "@/components/brand";
import { GuidedDemo, AdvancedLab } from "@/components/guided";
import { useAudience } from "@/components/AudienceProvider";
import { PathEntrance } from "@/components/PathChrome";
import { businessCaseLinkLabel } from "@/data/audience";
import { cn } from "@/lib/utils";
import { Compass, FlaskConical } from "lucide-react";

type DemoMode = "guided" | "lab";

function modeFromSearch(): DemoMode {
  if (typeof window === "undefined") return "guided";
  const params = new URLSearchParams(window.location.search);
  return params.get("mode") === "lab" ? "lab" : "guided";
}

export default function Demos() {
  const [mode, setMode] = useState<DemoMode>(modeFromSearch);
  const { personaId, industryId, route, setIndustryId } = useAudience();
  const scenarioId = industryId;
  const handoff =
    personaId === "developer"
      ? { href: "/developers", label: "Developers" }
      : route
        ? { href: route.businessCaseHref, label: businessCaseLinkLabel(route) }
        : { href: "/business-case", label: "Business case" };

  useSEO({
    title: "Interactive Demos | ICDU",
    description:
      "Take a guided ICDU path from intent to evidence, or open the Advanced Lab for Builder, Judge, HITL, and Stress tools.",
  });

  useEffect(() => {
    trackPageViewed("demos");
  }, []);

  useEffect(() => {
    const onPop = () => setMode(modeFromSearch());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const selectMode = (next: DemoMode) => {
    setMode(next);
    const url = new URL(window.location.href);
    if (next === "lab") {
      url.searchParams.set("mode", "lab");
    } else {
      url.searchParams.delete("mode");
    }
    const nextHref = `${url.pathname}${url.search}${url.hash}`;
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (nextHref !== current) {
      window.history.pushState(window.history.state, "", nextHref);
    }
  };

  return (
    <BrandPage>
      <div className="mx-auto max-w-7xl">
        <PageHero
          label="Interactive Experience"
          title="See ICDU in action"
          description="Start with a guided scenario that carries one workflow from intent to evidence — or open the Advanced Lab for full technical controls."
          displayTitle={false}
        />

        <div className="mb-5 flex flex-col gap-2">
          <PathEntrance page="demos" mode={mode} />
          {personaId ? (
            <Link
              href={`/journey/${personaId}`}
              className="icdu-focus w-fit text-sm text-[color:var(--icdu-fg-muted)] underline-offset-4 hover:text-[color:var(--icdu-fg)] hover:underline"
              data-testid="demos-back-journey"
            >
              Back to your journey
            </Link>
          ) : industryId ? (
            <Link
              href="/#funnel"
              className="icdu-focus w-fit text-sm text-[color:var(--icdu-fg-muted)] underline-offset-4 hover:text-[color:var(--icdu-fg)] hover:underline"
            >
              Change path
            </Link>
          ) : null}
        </div>

        <div
          className="mb-6 sm:mb-8 inline-flex max-w-full flex-wrap gap-2"
          role="tablist"
          aria-label="Demo mode"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "guided"}
            className={cn(
              "icdu-focus inline-flex items-center gap-2 rounded-md border-2 px-3 py-2 text-sm cursor-pointer",
              mode === "guided"
                ? "border-[color:var(--icdu-accent)] font-semibold text-[color:var(--icdu-accent)]"
                : "border-[color:var(--icdu-fg-whisper)] font-medium text-[color:var(--icdu-fg-muted)]",
            )}
            onClick={() => selectMode("guided")}
            data-testid="mode-guided"
          >
            <span
              className={cn(
                "h-2 w-2 rounded-full border-2",
                mode === "guided"
                  ? "border-[color:var(--icdu-accent)] bg-[color:var(--icdu-accent)]"
                  : "border-[color:var(--icdu-fg-whisper)]",
              )}
              aria-hidden="true"
            />
            <Compass className="h-4 w-4" />
            Guided Demo
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "lab"}
            className={cn(
              "icdu-focus inline-flex items-center gap-2 rounded-md border-2 px-3 py-2 text-sm cursor-pointer",
              mode === "lab"
                ? "border-[color:var(--icdu-accent)] font-semibold text-[color:var(--icdu-accent)]"
                : "border-[color:var(--icdu-fg-whisper)] font-medium text-[color:var(--icdu-fg-muted)]",
            )}
            onClick={() => selectMode("lab")}
            data-testid="mode-lab"
          >
            <span
              className={cn(
                "h-2 w-2 rounded-full border-2",
                mode === "lab"
                  ? "border-[color:var(--icdu-accent)] bg-[color:var(--icdu-accent)]"
                  : "border-[color:var(--icdu-fg-whisper)]",
              )}
              aria-hidden="true"
            />
            <FlaskConical className="h-4 w-4" />
            Advanced Lab
          </button>
        </div>

        {mode === "guided" ? (
          <GuidedDemo
            scenarioId={scenarioId}
            onScenarioChange={setIndustryId}
            onOpenAdvancedLab={() => selectMode("lab")}
            handoffHref={handoff.href}
            handoffLabel={handoff.label}
          />
        ) : (
          <AdvancedLab />
        )}
      </div>
    </BrandPage>
  );
}
