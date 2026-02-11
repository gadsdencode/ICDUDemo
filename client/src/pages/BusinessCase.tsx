// client/src/pages/BusinessCase.tsx
import { useEffect } from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FinancialImpact } from "@/components/FinancialImpact";
import { CompetitiveBenchmarks } from "@/components/CompetitiveBenchmarks";
import { UseCaseGuide } from "@/components/UseCaseGuide";
import { executiveMessages } from "@/data/businessCase";
import { ArrowRight } from "lucide-react";
import { trackPageViewed } from "@/lib/analytics";
import { useSEO } from "@/lib/seo";

export default function BusinessCase() {
  useSEO({
    title: "Business Case | ICDU",
    description: "The financial, regulatory, and competitive case for structured AI evaluation with ICDU. Understand the cost of inaction and how ICDU compares to standard benchmarks.",
  });

  useEffect(() => {
    trackPageViewed("business-case");
  }, []);

  return (
    <div className="min-h-screen py-6 sm:py-8">
      <div className="container px-4 mx-auto max-w-5xl">
        {/* Hero */}
        <div className="text-center mb-8 sm:mb-12">
          <Badge variant="secondary" className="mb-3 sm:mb-4 text-xs sm:text-sm">
            Executive Summary
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
            The Case for Structured AI Evaluation
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-3xl mx-auto">
            {executiveMessages.gapStatement}
          </p>
        </div>

        <div className="space-y-10 sm:space-y-16">
          {/* Financial Impact */}
          <section>
            <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">The Cost of Inaction</h2>
            <FinancialImpact />
          </section>

          {/* Competitive Benchmarks */}
          <section>
            <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">
              How ICDU Compares to Standard Benchmarks
            </h2>
            <CompetitiveBenchmarks />
          </section>

          {/* Use Case Guide */}
          <section>
            <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Is ICDU Right for You?</h2>
            <UseCaseGuide />
          </section>

          {/* CTA */}
          <section className="text-center py-6 sm:py-10 rounded-lg bg-primary text-primary-foreground px-4">
            <h2 className="text-base sm:text-2xl font-bold mb-2 sm:mb-4">See It in Action</h2>
            <p className="text-[10px] sm:text-sm text-primary-foreground/60 italic mb-4 sm:mb-6 max-w-2xl mx-auto">
              {executiveMessages.bottomLine}
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-4">
              <Link href="/journey" className="w-full sm:w-auto">
                <Button size="sm" variant="secondary" className="gap-1.5 sm:gap-2 w-full h-8 sm:h-10 text-xs sm:text-sm">
                  Start Journey
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </Link>
              <Link href="/demos" className="w-full sm:w-auto">
                <Button size="sm" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground w-full h-8 sm:h-10 text-xs sm:text-sm">
                  Try Demos
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
