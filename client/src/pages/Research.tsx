import { useEffect } from "react";
import { Link } from "wouter";
import { Download, ArrowRight } from "lucide-react";
import { trackPageViewed } from "@/lib/analytics";
import { useSEO } from "@/lib/seo";
import {
  BrandPage,
  PageHero,
  ContentSection,
  SecondaryCTA,
} from "@/components/brand";
import { FinancialImpact } from "@/components/FinancialImpact";
import { CompetitiveBenchmarks } from "@/components/CompetitiveBenchmarks";
import {
  researchClaimTypes,
  staticDownloads,
  downloadCatalogItem,
} from "@/data/siteResources";
import {
  efficiencyStats,
  regulations,
  sourcesLine,
} from "@/data/businessCase";

export default function Research() {
  useSEO({
    title: "Evidence & Research | ICDU",
    description:
      "Supporting evidence, benchmark comparisons, methodology framing, regulatory context, and research document downloads for ICDU.",
  });

  useEffect(() => {
    trackPageViewed("research");
  }, []);

  const researchDocs = staticDownloads.filter((d) => d.group === "research");

  return (
    <BrandPage>
      <div className="mx-auto max-w-6xl space-y-12 sm:space-y-16">
        <PageHero
          label="Evidence & Research"
          title="Evidence with clear labels"
          description="This page holds supporting evidence, benchmark comparisons, methodology, and regulatory context. Market statistics describe industry conditions — they do not prove an ICDU product result by themselves."
          displayTitle={false}
        />

        <ContentSection
          label="How to read claims"
          heading="Distinguish evidence types"
          description="Use these labels when sharing materials with diligence or research reviewers."
        >
          <div className="grid sm:grid-cols-2 gap-4">
            {researchClaimTypes.map((type) => (
              <div
                key={type.id}
                className="rounded-xl border border-[color:var(--icdu-border)] bg-[color:var(--icdu-surface)] p-4"
              >
                <h3 className="font-semibold text-sm text-[color:var(--icdu-fg)] m-0 mb-1.5">
                  {type.title}
                </h3>
                <p className="text-sm text-[color:var(--icdu-fg-muted)] leading-relaxed m-0">
                  {type.description}
                </p>
              </div>
            ))}
          </div>
        </ContentSection>

        <ContentSection
          label="External evidence"
          heading="Industry and financial context"
          description="Third-party figures and incident examples. Sources appear on each statistic where available."
        >
          <FinancialImpact />
          <p className="text-sm text-[color:var(--icdu-fg-faint)] mt-4 m-0">
            {sourcesLine}
          </p>
        </ContentSection>

        <ContentSection
          label="Targets & projections"
          heading="ICDU efficiency targets"
          description="These figures are pilot targets or benchmark-oriented projections used in product materials — not independent market proof of ICDU outcomes."
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {efficiencyStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-[color:var(--icdu-border)] bg-[color:var(--icdu-surface)] p-3 sm:p-4 text-center"
              >
                <div
                  className="text-xl sm:text-2xl font-semibold"
                  style={{ color: "var(--icdu-blue)" }}
                >
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-[color:var(--icdu-fg-muted)] mt-1 leading-snug">
                  {stat.label}
                </div>
                <div className="text-xs text-[color:var(--icdu-fg-faint)] mt-2 uppercase tracking-wide">
                  {stat.sublabel} · Target / projection
                </div>
              </div>
            ))}
          </div>
        </ContentSection>

        <ContentSection
          label="Methodology"
          heading="How ICDU compares to standard benchmarks"
          description="Capability benchmarks answer different questions than readiness gates. The comparison below is methodological — not a claim that ICDU replaces MMLU scores."
        >
          <CompetitiveBenchmarks />
        </ContentSection>

        <ContentSection
          label="Regulatory context"
          heading="Frameworks that shape evidence needs"
          description="High-level mapping of common requirements. Your counsel determines applicability."
        >
          <div className="overflow-x-auto rounded-xl border border-[color:var(--icdu-border)]">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[color:var(--icdu-border)] bg-[color:var(--icdu-surface)]">
                  <th className="px-3 py-2.5 text-left font-semibold">
                    Framework
                  </th>
                  <th className="px-3 py-2.5 text-left font-semibold">
                    Requirement focus
                  </th>
                  <th className="px-3 py-2.5 text-left font-semibold">
                    Penalty / consequence
                  </th>
                </tr>
              </thead>
              <tbody>
                {regulations.map((row) => (
                  <tr
                    key={row.name}
                    className="border-b border-[color:var(--icdu-border)] last:border-0"
                  >
                    <td className="px-3 py-2.5 font-medium align-top whitespace-nowrap">
                      {row.name}
                    </td>
                    <td className="px-3 py-2.5 text-[color:var(--icdu-fg-muted)] align-top">
                      {row.requirement}
                    </td>
                    <td className="px-3 py-2.5 text-[color:var(--icdu-fg-muted)] align-top">
                      {row.penalty}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ContentSection>

        <ContentSection
          label="Downloads"
          heading="Research documents"
          description="Primary research PDF and comparative financial-impact DOCX."
        >
          <div className="grid sm:grid-cols-2 gap-4">
            {researchDocs.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-[color:var(--icdu-border)] bg-[color:var(--icdu-surface)] p-4 sm:p-5"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-sm m-0">{item.title}</h3>
                  <span className="text-xs font-semibold uppercase text-[color:var(--icdu-fg-faint)]">
                    {item.format}
                  </span>
                </div>
                <p className="text-sm text-[color:var(--icdu-fg-muted)] m-0 mb-3">
                  {item.purpose}
                </p>
                <SecondaryCTA
                  type="button"
                  className="!text-xs"
                  onClick={() => downloadCatalogItem(item)}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </SecondaryCTA>
              </div>
            ))}
          </div>
          <p className="mt-6 m-0">
            <Link
              href="/resources"
              className="inline-flex items-center gap-1.5 text-sm text-[color:var(--icdu-blue)] hover:underline"
            >
              All resources <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </p>
        </ContentSection>
      </div>
    </BrandPage>
  );
}
