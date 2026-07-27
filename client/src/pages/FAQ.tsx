import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { trackPageViewed } from "@/lib/analytics";
import { useSEO } from "@/lib/seo";
import { BrandPage, PageHero, ContentSection } from "@/components/brand";
import {
  categorizedFaqItems,
  faqCategories,
  type FaqCategory,
} from "@/data/siteResources";
import { cn } from "@/lib/utils";

export default function FAQ() {
  const [filter, setFilter] = useState<FaqCategory | "all">("all");

  useSEO({
    title: "FAQ | ICDU",
    description:
      "Frequently asked questions about ICDU product, licensing, security, and getting started.",
  });

  useEffect(() => {
    trackPageViewed("faq");
  }, []);

  const items = useMemo(
    () =>
      filter === "all"
        ? categorizedFaqItems
        : categorizedFaqItems.filter((i) => i.category === filter),
    [filter],
  );

  return (
    <BrandPage>
      <div className="mx-auto max-w-3xl space-y-10 sm:space-y-12">
        <PageHero
          label="FAQ"
          title="Frequently asked questions"
          description="Short answers about the product, licensing, security, and where to start. Evidence tables and research downloads live on Research; license terms on Licensing."
          displayTitle={false}
        />

        <p className="text-sm text-[color:var(--icdu-fg-muted)] leading-relaxed m-0 -mt-4 sm:-mt-6">
          ICDU is patent-pending. Evaluation and research use are permitted;
          commercial use requires a license.{" "}
          <Link
            href="/licensing"
            className="text-[color:var(--icdu-blue)] hover:underline font-medium"
          >
            View licensing details
          </Link>
          .
        </p>

        <div
          className="icdu-tab-strip"
          role="tablist"
          aria-label="FAQ categories"
        >
          <button
            type="button"
            role="tab"
            aria-selected={filter === "all"}
            onClick={() => setFilter("all")}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--icdu-blue)]",
              filter === "all"
                ? "border-[color:var(--icdu-blue)] bg-[color:var(--icdu-blue)] text-white"
                : "border-[color:var(--icdu-border)] text-[color:var(--icdu-fg-muted)] hover:border-[color:var(--icdu-border-hover)] hover:text-[color:var(--icdu-fg)]",
            )}
          >
            All
          </button>
          {faqCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={filter === cat.id}
              onClick={() => setFilter(cat.id)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--icdu-blue)]",
                filter === cat.id
                  ? "border-[color:var(--icdu-blue)] bg-[color:var(--icdu-blue)] text-white"
                  : "border-[color:var(--icdu-border)] text-[color:var(--icdu-fg-muted)] hover:border-[color:var(--icdu-border-hover)] hover:text-[color:var(--icdu-fg)]",
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <ContentSection>
          <Accordion type="single" collapsible className="w-full space-y-2">
            {items.map((item, index) => (
              <AccordionItem
                key={item.question}
                value={`faq-${index}`}
                className="border border-[color:var(--icdu-border)] rounded-lg px-3 sm:px-4"
              >
                <AccordionTrigger
                  className="text-left hover:no-underline py-3 sm:py-4 text-[color:var(--icdu-fg)]"
                  data-testid={`faq-question-${index}`}
                >
                  <span className="font-medium text-sm sm:text-base pr-2 text-[color:var(--icdu-fg)]">
                    {item.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-[color:var(--icdu-fg-muted)] pb-4 leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ContentSection>

        <p className="text-sm text-[color:var(--icdu-fg-muted)] m-0">
          Looking for evidence tables or the research PDF?{" "}
          <Link
            href="/research"
            className="text-[color:var(--icdu-blue)] hover:underline"
          >
            Go to Evidence & Research
          </Link>
          . Need schemas or labs?{" "}
          <Link
            href="/developers"
            className="text-[color:var(--icdu-blue)] hover:underline"
          >
            Developers
          </Link>
          .
        </p>
      </div>
    </BrandPage>
  );
}
