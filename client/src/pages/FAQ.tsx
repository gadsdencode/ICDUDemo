import { useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { HelpCircle, Book, AlertTriangle, Mail } from "lucide-react";
import { glossaryTerms, faqItems } from "@/data/examples";
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
    <div className="min-h-screen py-8">
      <div className="container px-4 mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            Reference
          </Badge>
          <h1 className="text-3xl font-bold mb-4">FAQ & Glossary</h1>
          <p className="text-muted-foreground">
            Frequently asked questions and key terminology
          </p>
        </div>

        <Alert className="mb-8 border-amber-500/50 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-700 dark:text-amber-300">Evaluation & Research Use Only</AlertTitle>
          <AlertDescription className="text-amber-600/90 dark:text-amber-400/90">
            This repository is published for evaluation and research purposes only. 
            Commercial use requires a license. ICDU is protected by patent-pending applications 
            in the United States. Publication of this repository does not grant a license 
            to practice any patented method.
          </AlertDescription>
        </Alert>

        <div className="space-y-12">
          <section>
            <div className="flex items-center gap-2 mb-6">
              <HelpCircle className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Frequently Asked Questions</h2>
            </div>
            
            <Accordion type="single" collapsible className="space-y-2">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`faq-${index}`} className="border rounded-md px-4">
                  <AccordionTrigger className="text-left hover:no-underline" data-testid={`faq-question-${index}`}>
                    <span className="font-medium text-sm">{item.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm pb-4">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-6">
              <Book className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Glossary</h2>
            </div>

            <div className="grid gap-4">
              {glossaryTerms.map((item, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start gap-4">
                    <Badge variant="secondary" className="flex-shrink-0 font-mono text-xs">
                      {item.term}
                    </Badge>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.definition}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <Card className="p-6 bg-muted/50">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Licensing & Contact</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    For licensing inquiries, collaboration opportunities, or due diligence packages, 
                    please contact the project team.
                  </p>
                  <div className="space-y-2 text-sm">
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
