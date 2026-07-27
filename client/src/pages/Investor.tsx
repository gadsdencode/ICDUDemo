import { useEffect } from "react";
import { Link } from "wouter";
import { Mail, ArrowRight } from "lucide-react";
import { trackPageViewed } from "@/lib/analytics";
import { useSEO } from "@/lib/seo";
import {
  BrandPage,
  PageHero,
  ContentSection,
  PrimaryCTA,
  SecondaryCTA,
} from "@/components/brand";
import {
  investorPageIntro,
  investorStatus,
  investorMarketBars,
  investorRegulatoryTailwinds,
  investorMarketStat,
  investorStrainCards,
  investorDifferentiators,
  investorUseCaseCards,
} from "@/data/investorContent";
import { downloadCatalogItem, staticDownloads } from "@/data/siteResources";

export default function Investor() {
  useSEO({
    title: "Investor | ICDU",
    description:
      "Market opportunity, regulatory tailwinds, and investment status for ICDU diligence conversations.",
  });

  useEffect(() => {
    trackPageViewed("investor");
  }, []);

  const onePager = staticDownloads.find((d) => d.id === "overture-onepager");

  return (
    <BrandPage>
      <div className="mx-auto max-w-6xl space-y-12 sm:space-y-16">
        <PageHero
          label={investorPageIntro.label}
          title={investorPageIntro.title}
          description={investorPageIntro.description}
          displayTitle={false}
        />

        <ContentSection
          label="Status"
          heading={investorStatus.heading}
          description={investorStatus.body}
        >
          <ul className="space-y-2 m-0 p-0 list-none mb-6">
            {investorStatus.bullets.map((b) => (
              <li
                key={b}
                className="text-sm text-[color:var(--icdu-fg-muted)] pl-3 relative"
              >
                <span
                  className="absolute left-0 top-2 h-1.5 w-1.5 rounded-full"
                  style={{ background: "var(--icdu-blue)" }}
                />
                {b}
              </li>
            ))}
          </ul>
          <PrimaryCTA href={investorStatus.cta.href}>
            <Mail className="h-4 w-4" />
            {investorStatus.cta.label}
          </PrimaryCTA>
        </ContentSection>

        <ContentSection
          label="Market opportunity"
          heading="AI governance and efficiency TAM"
          description="Market sizing below is an estimate for diligence context. It does not prove ICDU revenue."
        >
          <div className="rounded-xl border border-[color:var(--icdu-border)] bg-[color:var(--icdu-surface)] p-5 sm:p-6 mb-6">
            <div
              className="font-editorial text-4xl tracking-tight"
              style={{ color: "var(--icdu-blue)" }}
            >
              {investorMarketStat.value}
            </div>
            <div className="text-sm text-[color:var(--icdu-fg)] mt-1">
              {investorMarketStat.label}
            </div>
            <div className="text-xs uppercase tracking-wide text-[color:var(--icdu-fg-faint)] mt-2">
              {investorMarketStat.sublabel} · Market estimate
            </div>
          </div>

          <div className="space-y-3">
            {investorMarketBars.map((bar) => (
              <div key={bar.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[color:var(--icdu-fg-muted)]">
                    {bar.label}
                  </span>
                  <span className="font-medium tabular-nums">{bar.value}</span>
                </div>
                <div className="h-2 rounded-full bg-[color:var(--icdu-border)] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(8, bar.width * 100)}%`,
                      background: "var(--icdu-blue)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-[color:var(--icdu-fg-faint)] mt-4 m-0">
            Bars are relative widths for illustration of published market
            estimates — confirm primary sources before investment decisions.
          </p>
        </ContentSection>

        <ContentSection
          label="Tailwinds"
          heading="Regulatory and operational pressure"
        >
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {investorRegulatoryTailwinds.map((item) => (
              <div
                key={item.tag}
                className="rounded-lg border border-[color:var(--icdu-border)] p-4"
              >
                <div
                  className="text-xs font-semibold uppercase tracking-wide mb-1"
                  style={{ color: "var(--icdu-blue)" }}
                >
                  {item.tag}
                </div>
                <p className="text-sm text-[color:var(--icdu-fg-muted)] m-0">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {investorStrainCards.map((card) => (
              <div key={card.title}>
                <h3 className="font-semibold text-sm m-0 mb-1">{card.title}</h3>
                <p className="text-sm text-[color:var(--icdu-fg-muted)] m-0">
                  {card.desc}
                </p>
                <p className="text-xs text-[color:var(--icdu-fg-faint)] mt-1 m-0">
                  Includes ICDU targets / projections — not external proof alone.
                </p>
              </div>
            ))}
          </div>
        </ContentSection>

        <ContentSection label="Positioning" heading="Differentiators">
          <div className="grid sm:grid-cols-2 gap-5">
            {investorDifferentiators.map((d) => (
              <div key={d.title}>
                <h3 className="font-semibold text-sm m-0 mb-1">{d.title}</h3>
                <p className="text-sm text-[color:var(--icdu-fg-muted)] m-0">
                  {d.desc}
                </p>
              </div>
            ))}
          </div>
        </ContentSection>

        <ContentSection label="Sectors" heading="Where governance demand concentrates">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {investorUseCaseCards.map((card) => (
              <div
                key={card.title}
                className="rounded-xl border border-[color:var(--icdu-border)] p-4"
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-[color:var(--icdu-fg-faint)] mb-1">
                  {card.category}
                </div>
                <h3 className="font-semibold text-sm m-0 mb-1">{card.title}</h3>
                <p className="text-xs text-[color:var(--icdu-fg-muted)] m-0">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </ContentSection>

        <div className="flex flex-wrap gap-3">
          {onePager && (
            <SecondaryCTA type="button" onClick={() => downloadCatalogItem(onePager)}>
              Download one-pager
            </SecondaryCTA>
          )}
          <SecondaryCTA asChild>
            <Link href="/resources">
              Resources <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </SecondaryCTA>
          <SecondaryCTA asChild>
            <Link href="/research">Evidence & Research</Link>
          </SecondaryCTA>
        </div>
      </div>
    </BrandPage>
  );
}
