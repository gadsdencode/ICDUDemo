import { useEffect } from "react";
import { Link } from "wouter";
import { Download, ArrowRight, ExternalLink } from "lucide-react";
import { trackPageViewed } from "@/lib/analytics";
import { useSEO } from "@/lib/seo";
import {
  BrandPage,
  PageHero,
  ContentSection,
  SecondaryCTA,
} from "@/components/brand";
import {
  resourceGroups,
  staticDownloads,
  generatedTechnicalDocs,
  downloadCatalogItem,
  type CatalogItem,
} from "@/data/siteResources";
import { cn } from "@/lib/utils";

function FormatBadge({ format }: { format: string }) {
  return (
    <span className="inline-flex items-center rounded border border-[color:var(--icdu-border)] px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-[color:var(--icdu-fg-muted)]">
      {format}
    </span>
  );
}

function ResourceCard({ item }: { item: CatalogItem }) {
  return (
    <div className="rounded-xl border border-[color:var(--icdu-border)] bg-[color:var(--icdu-surface)] p-4 sm:p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-sm sm:text-base text-[color:var(--icdu-fg)] m-0">
          {item.title}
        </h3>
        <FormatBadge format={item.format} />
      </div>
      <p className="text-sm text-[color:var(--icdu-fg-muted)] leading-relaxed m-0 flex-1">
        {item.purpose}
      </p>
      <p className="text-sm text-[color:var(--icdu-fg-faint)] m-0">
        Audience: {item.audience}
      </p>
      <SecondaryCTA
        type="button"
        className="!text-xs sm:!text-sm self-start"
        onClick={() => downloadCatalogItem(item)}
        data-testid={`download-${item.id}`}
      >
        <Download className="h-3.5 w-3.5" aria-hidden="true" />
        Download
      </SecondaryCTA>
    </div>
  );
}

export default function Resources() {
  useSEO({
    title: "Resources | ICDU",
    description:
      "Executive briefing documents, evidence and research downloads, and technical schema samples for ICDU evaluation.",
  });

  useEffect(() => {
    trackPageViewed("resources");
  }, []);

  const byGroup = {
    executive: staticDownloads.filter((d) => d.group === "executive"),
    research: staticDownloads.filter((d) => d.group === "research"),
    technical: generatedTechnicalDocs,
  };

  return (
    <BrandPage>
      <div className="mx-auto max-w-6xl space-y-12 sm:space-y-16">
        <PageHero
          label="Resources"
          title="Materials by audience"
          description="Start with executive and research documents. Technical exports are available when you need schemas and rubrics — they are not the primary buyer path."
          displayTitle={false}
        />

        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            href="/research"
            className="inline-flex items-center gap-1.5 text-[color:var(--icdu-blue)] hover:underline"
          >
            Evidence & Research <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/developers"
            className="inline-flex items-center gap-1.5 text-[color:var(--icdu-blue)] hover:underline"
          >
            Developers <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/investor"
            className="inline-flex items-center gap-1.5 text-[color:var(--icdu-fg-muted)] hover:text-[color:var(--icdu-fg)] hover:underline"
          >
            Investor materials <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/licensing"
            className="inline-flex items-center gap-1.5 text-[color:var(--icdu-fg-muted)] hover:text-[color:var(--icdu-fg)] hover:underline"
          >
            Licensing
          </Link>
        </div>

        {resourceGroups.map((group) => {
          const items = byGroup[group.id];
          const isTechnical = group.id === "technical";
          return (
            <ContentSection
              key={group.id}
              label={group.title}
              heading={group.title}
              description={group.description}
            >
              <div
                className={cn(
                  "grid gap-4",
                  isTechnical
                    ? "sm:grid-cols-2 lg:grid-cols-3"
                    : "sm:grid-cols-2 lg:grid-cols-3",
                )}
              >
                {items.map((item) => (
                  <ResourceCard key={item.id} item={item} />
                ))}
              </div>
              {isTechnical && (
                <p className="text-xs text-[color:var(--icdu-fg-faint)] mt-4 m-0">
                  Generated MD, JSON, and CSV files support integration work.
                  Prefer the DOCX and PDF materials above for executive
                  briefings.
                </p>
              )}
            </ContentSection>
          );
        })}
      </div>
    </BrandPage>
  );
}
