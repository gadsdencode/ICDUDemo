import { useEffect, useState } from "react";
import { trackPageViewed } from "@/lib/analytics";
import { useSEO } from "@/lib/seo";
import { BrandPage, PageHero } from "@/components/brand";
import { GuidedDemo, AdvancedLab } from "@/components/guided";
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

  useSEO({
    title: "Interactive Demos | ICDU",
    description:
      "Take a guided ICDU path from intent to evidence, or open the Advanced Lab for Builder, Judge, HITL, and Stress tools.",
  });

  useEffect(() => {
    trackPageViewed("demos");
  }, []);

  useEffect(() => {
    setMode(modeFromSearch());
  }, []);

  const selectMode = (next: DemoMode) => {
    setMode(next);
    const url = new URL(window.location.href);
    if (next === "lab") {
      url.searchParams.set("mode", "lab");
    } else {
      url.searchParams.delete("mode");
    }
    window.history.replaceState({}, "", url.pathname + url.search);
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

        <div
          className="mb-6 sm:mb-8 inline-flex max-w-full rounded-full border border-[color:var(--icdu-border)] bg-[color:var(--icdu-surface)] p-1"
          role="tablist"
          aria-label="Demo mode"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "guided"}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3.5 sm:px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--icdu-blue)]",
              mode === "guided"
                ? "bg-[color:var(--icdu-blue)] text-white"
                : "text-[color:var(--icdu-fg-muted)] hover:text-[color:var(--icdu-fg)]",
            )}
            onClick={() => selectMode("guided")}
            data-testid="mode-guided"
          >
            <Compass className="h-4 w-4" />
            Guided Demo
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "lab"}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3.5 sm:px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--icdu-blue)]",
              mode === "lab"
                ? "bg-[color:var(--icdu-blue)] text-white"
                : "text-[color:var(--icdu-fg-muted)] hover:text-[color:var(--icdu-fg)]",
            )}
            onClick={() => selectMode("lab")}
            data-testid="mode-lab"
          >
            <FlaskConical className="h-4 w-4" />
            Advanced Lab
          </button>
        </div>

        {mode === "guided" ? (
          <GuidedDemo onOpenAdvancedLab={() => selectMode("lab")} />
        ) : (
          <AdvancedLab />
        )}
      </div>
    </BrandPage>
  );
}
