// client/src/pages/Overview.tsx
import { useEffect } from "react";
import { AudienceFunnel } from "@/components/AudienceFunnel";
import { SiteFooter } from "@/components/SiteFooter";
import { trackPageViewed } from "@/lib/analytics";
import { useSEO } from "@/lib/seo";

export default function Overview() {
  useSEO({
    title: "ICDU — AI Guided by Intent",
    description:
      "ICDU turns a work request into a clear, guided AI process: it captures what the user intends, applies the relevant expertise and rules, checks the result against those requirements, and keeps a record of how the outcome was produced. This helps teams get more consistent, reviewable, and accountable results from AI.",
  });

  useEffect(() => {
    trackPageViewed("overview");
  }, []);

  useEffect(() => {
    if (window.location.hash !== "#funnel" && window.location.hash !== "#chooser") return;
    document.getElementById("chooser")?.scrollIntoView({ block: "start" });
  }, []);

  return (
    <div className="icdu-home" data-assistant-page="overview">
      <a className="icdu-focus sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-10 focus:bg-[color:var(--icdu-fg)] focus:px-4 focus:py-3 focus:text-[color:var(--icdu-bg)]" href="#chooser">
        Skip to the chooser
      </a>
      <section className="icdu-hero" aria-labelledby="home-title">
        <h1 id="home-title">AI Guided by Intent</h1>
        <p data-testid="funnel-sentence">
          ICDU turns a work request into a clear, guided AI process: it captures what the user intends, applies the relevant expertise and rules, checks the result against those requirements, and keeps a record of how the outcome was produced.
          <span className="icdu-hero-prompt">Get consistent, reviewable, and accountable results from AI.</span>
        </p>
      </section>
      <div id="funnel" className="icdu-home-paths">
        <AudienceFunnel />
      </div>
      <div className="icdu-home-footer">
        <SiteFooter compact />
      </div>
    </div>
  );
}
