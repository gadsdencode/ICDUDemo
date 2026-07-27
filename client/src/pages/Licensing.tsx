import { useEffect } from "react";
import { Link } from "wouter";
import { Mail } from "lucide-react";
import { trackPageViewed } from "@/lib/analytics";
import { useSEO } from "@/lib/seo";
import {
  BrandPage,
  PageHero,
  ContentSection,
  PrimaryCTA,
  SecondaryCTA,
} from "@/components/brand";

export default function Licensing() {
  useSEO({
    title: "Licensing | ICDU",
    description:
      "Patent-pending status, evaluation permissions, and commercial licensing information for ICDU.",
  });

  useEffect(() => {
    trackPageViewed("licensing");
  }, []);

  return (
    <BrandPage>
      <div className="mx-auto max-w-3xl space-y-12 sm:space-y-14">
        <PageHero
          label="Licensing"
          title="Evaluation and commercial use"
          description="ICDU is patent-pending. Public materials support evaluation and research; commercial use requires a license."
          displayTitle={false}
        />

        <ContentSection
          heading="Patent status"
          description="ICDU is protected by one or more patent-pending applications in the United States. PCT filing is planned."
        >
          <p className="text-sm text-[color:var(--icdu-fg-muted)] leading-relaxed m-0">
            Publication of product materials, demos, and documentation on this
            website does not grant a license to practice any patented method.
            Contact the team for commercial terms or diligence packages.
          </p>
        </ContentSection>

        <ContentSection heading="Permitted evaluation uses">
          <ul className="space-y-2 m-0 p-0 list-none">
            {[
              "Academic research and teaching",
              "Internal testing without revenue impact",
              "Benchmarking and technical comparison",
              "Due diligence and architectural review",
            ].map((item) => (
              <li
                key={item}
                className="text-sm text-[color:var(--icdu-fg-muted)] pl-3 relative"
              >
                <span
                  className="absolute left-0 top-2 h-1.5 w-1.5 rounded-full"
                  style={{ background: "var(--icdu-blue)" }}
                />
                {item}
              </li>
            ))}
          </ul>
        </ContentSection>

        <ContentSection
          heading="Commercial use"
          description="A separate license agreement is required before production deployment or monetized use."
        >
          <ul className="space-y-2 m-0 p-0 list-none mb-6">
            {[
              "Deployment in a production system",
              "Use in a paid or monetized product or service",
              "Internal use that supports revenue-generating operations",
              "Model training or fine-tuning for commercial delivery",
              "Offering ICDU-based evaluation as a service",
            ].map((item) => (
              <li
                key={item}
                className="text-sm text-[color:var(--icdu-fg-muted)] pl-3 relative"
              >
                <span
                  className="absolute left-0 top-2 h-1.5 w-1.5 rounded-full"
                  style={{ background: "var(--icdu-blue)" }}
                />
                {item}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3">
            <PrimaryCTA href="mailto:brian@osscontact.com?subject=ICDU%20Licensing">
              <Mail className="h-4 w-4" aria-hidden="true" />
              Contact about licensing
            </PrimaryCTA>
            <SecondaryCTA asChild>
              <Link href="/faq">Read related FAQ</Link>
            </SecondaryCTA>
          </div>
        </ContentSection>
      </div>
    </BrandPage>
  );
}
