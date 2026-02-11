import { useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { HelpCircle, Book, AlertTriangle, Mail, DollarSign, GitCompare } from "lucide-react";
import { glossaryTerms, faqItems } from "@/data/examples";
import { FinancialImpact } from "@/components/FinancialImpact";
import { CompetitiveBenchmarks } from "@/components/CompetitiveBenchmarks";
import { trackPageViewed } from "@/lib/analytics";
import { useSEO } from "@/lib/seo";

export default function FAQ() {
  useSEO({
    title: "FAQ & Glossary | ICDU",
    description: "Frequently asked questions about ICDU, glossary of AI safety terms, and licensing information. Learn about intent-conscious data units, AI Judge, HITL graders, and stress testing.",
  });
  
  useEffect(() => {
    trackPageViewed("faq");
  }, []);

  return (
    <div className="min-h-screen py-6 sm:py-8">
      <div className="container px-4 mx-auto max-w-4xl">
        <div className="text-center mb-8 sm:mb-12">
          <Badge variant="secondary" className="mb-3 sm:mb-4 text-xs sm:text-sm">
            Reference
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">FAQ & Glossary</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Frequently asked questions and key terminology
          </p>
        </div>

        <Alert className="mb-6 sm:mb-8 border-amber-500/50 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-700 dark:text-amber-300 text-sm sm:text-base">Evaluation & Research Use Only</AlertTitle>
          <AlertDescription className="text-amber-600/90 dark:text-amber-400/90 text-xs sm:text-sm">
            This repository is published for evaluation and research purposes only. 
            Commercial use requires a license. ICDU is protected by patent-pending applications 
            in the United States. PCT filing planned. Publication of this repository does not grant a license 
            to practice any patented method.
          </AlertDescription>
        </Alert>

        <div className="space-y-8 sm:space-y-12">
          <section>
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h2 className="text-lg sm:text-xl font-bold">Frequently Asked Questions</h2>
            </div>
            
            <Accordion type="single" collapsible className="space-y-2">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`faq-${index}`} className="border rounded-md px-3 sm:px-4">
                  <AccordionTrigger className="text-left hover:no-underline py-3 sm:py-4" data-testid={`faq-question-${index}`}>
                    <span className="font-medium text-xs sm:text-sm pr-2">{item.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-xs sm:text-sm pb-3 sm:pb-4">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h2 className="text-lg sm:text-xl font-bold">The Financial Case</h2>
            </div>
            <FinancialImpact />
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <GitCompare className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h2 className="text-lg sm:text-xl font-bold">How ICDU Compares to Standard Benchmarks</h2>
            </div>
            <CompetitiveBenchmarks />
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <Book className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h2 className="text-lg sm:text-xl font-bold">Glossary</h2>
            </div>

            <div className="grid gap-3 sm:gap-4">
              {glossaryTerms.map((item, index) => (
                <Card key={index} className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                    <Badge variant="secondary" className="flex-shrink-0 font-mono text-[10px] sm:text-xs self-start">
                      {item.term}
                    </Badge>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {item.definition}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <Card className="p-4 sm:p-6 bg-muted/50">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2">Licensing & Contact</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                    For licensing inquiries, collaboration opportunities, or due diligence packages, 
                    please contact the project team.
                  </p>
                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                    <p>
                      <span className="text-muted-foreground">Permitted uses:</span>{" "}
                      <span>Academic research, internal testing, benchmarking, due diligence</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Commercial use:</span>{" "}
                      <span>Requires a separate license agreement</span>
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
