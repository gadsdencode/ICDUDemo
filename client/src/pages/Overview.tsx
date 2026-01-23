import { useEffect } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PipelineDiagram } from "@/components/PipelineDiagram";
import { 
  ArrowRight, 
  Target, 
  Shield, 
  Users, 
  FlaskConical, 
  CheckCircle2,
  FileText,
  BarChart3,
  Repeat,
  Eye
} from "lucide-react";
import { trackPageViewed } from "@/lib/analytics";
import { useSEO } from "@/lib/seo";

const features = [
  {
    icon: Target,
    title: "Explicit Intent",
    description: "Define exactly what success looks like with structured goals and criteria",
    color: "bg-blue-500",
  },
  {
    icon: Shield,
    title: "Governing Principles",
    description: "Encode safety, ethics, and policy constraints directly into every interaction",
    color: "bg-emerald-500",
  },
  {
    icon: Users,
    title: "Persona & Tone",
    description: "Specify how the AI should communicate and what role it should assume",
    color: "bg-purple-500",
  },
  {
    icon: FileText,
    title: "Context & Constraints",
    description: "Provide domain knowledge and operational boundaries",
    color: "bg-amber-500",
  },
];

const benefits = [
  {
    icon: BarChart3,
    title: "Measurable Evaluation",
    description: "From 'best-effort prompting' to quantifiable, gateable scores",
  },
  {
    icon: Eye,
    title: "Complete Traceability",
    description: "Governance IDs link every output to its intent and constraints",
  },
  {
    icon: Repeat,
    title: "Repeatability",
    description: "Same ICDU + same model = comparable, reproducible results",
  },
  {
    icon: CheckCircle2,
    title: "Safety Gates",
    description: "Automatic escalation and blocking based on score thresholds",
  },
];

export default function Overview() {
  useSEO({
    title: "ICDU - Intent-Conscious Data Unit | AI Safety Pipeline",
    description: "Explore ICDU, a structured approach to AI safety that moves from best-effort prompting to measurable, auditable execution. Learn through persona-based journeys and interactive demos.",
  });
  
  useEffect(() => {
    trackPageViewed("overview");
  }, []);

  return (
    <div className="min-h-screen">
      <section className="py-16 md:py-24">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              AI Safety & Evaluation Pipeline
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              ICDU: Intent-Conscious Data Unit
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              A structured approach to AI safety that moves from "best-effort prompting" to 
              <span className="font-medium text-foreground"> measurable, auditable execution</span>. 
              Every AI interaction is encoded with explicit intent, governed by principles, 
              and verified through quantitative gates.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/journey">
                <Button size="lg" className="gap-2" data-testid="button-start-journey">
                  Choose Your Role
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/demos">
                <Button size="lg" variant="outline" data-testid="button-try-demos">
                  Try Interactive Demos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-muted/30">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">The Pipeline at a Glance</h2>
            <p className="text-muted-foreground">
              From structured input to safe, audited deployment
            </p>
          </div>
          <PipelineDiagram />
        </div>
      </section>

      <section className="py-16">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-2">What's Inside an ICDU</h2>
            <p className="text-muted-foreground">
              Every AI interaction is encoded as a structured record
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="p-5">
                  <div className={`w-10 h-10 rounded-md ${feature.color} text-white flex items-center justify-center mb-4`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-2">Why ICDU Matters</h2>
            <p className="text-muted-foreground">
              Particularly valuable in regulated and high-trust domains
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.title} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-2">Pipeline Components</h2>
            <p className="text-muted-foreground">
              Four integrated systems for comprehensive AI evaluation
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-md bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">AI Judge (Quantitative Evaluator)</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Scores outputs using gateable metrics with clear thresholds and automatic decisions.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Intent Alignment Score (IAS)</Badge>
                    <Badge variant="outline">Principle Adherence Score (PAS)</Badge>
                    <Badge variant="outline">Application Score (AS)</Badge>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-md bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">HITL Nuance Grader</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Human rubric scoring for qualitative dimensions that require judgment.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Empathy</Badge>
                    <Badge variant="outline">Clarity</Badge>
                    <Badge variant="outline">Coaching Quality</Badge>
                    <Badge variant="outline">Trust</Badge>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 md:col-span-2">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-md bg-rose-500 text-white flex items-center justify-center flex-shrink-0">
                  <FlaskConical className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Scenario-Perturbation Stress Engine</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Generates controlled variations to test AI behavior under different conditions. 
                    Measures stability, fairness, and failure modes before deployment.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Role Variations</Badge>
                    <Badge variant="outline">Tone Variations</Badge>
                    <Badge variant="outline">Constraint Variations</Badge>
                    <Badge variant="outline">Channel Variations</Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container px-4 mx-auto max-w-7xl text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Explore?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Choose your role to see a personalized journey through the ICDU pipeline, 
            or dive into the interactive demos to build your own ICDU.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/journey">
              <Button size="lg" variant="secondary" className="gap-2" data-testid="button-cta-journey">
                Start Your Journey
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/faq">
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground" data-testid="button-cta-faq">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
