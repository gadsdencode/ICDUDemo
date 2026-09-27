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

  return (
    <>
      <AudienceFunnel />
      <SiteFooter compact />
    </>
  );
}
