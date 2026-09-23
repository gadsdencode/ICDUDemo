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
      "Define the task. Check the work. Keep the record. See what that means for your work.",
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
