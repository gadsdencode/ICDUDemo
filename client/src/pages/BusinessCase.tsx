// client/src/pages/BusinessCase.tsx
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  businessCaseTabs,
  financialRiskPanel,
  roiCalculatorDefaults,
  roiCalculatorRanges,
  calculateRoi,
  formatBusinessCurrency,
  stakeholderArguments,
  commonConcerns,
  nextStepsPanel,
} from "@/data/businessCase";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ArrowRight, Calculator, Mail } from "lucide-react";
import { trackPageViewed } from "@/lib/analytics";
import { useSEO } from "@/lib/seo";

function RoiSlider({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs sm:text-sm font-medium">{label}</label>
        <span className="text-xs sm:text-sm font-semibold text-primary tabular-nums">
          {display}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
      />
    </div>
  );
}

function RoiCalculatorPanel() {
  const [inputs, setInputs] = useState(roiCalculatorDefaults);
  const results = useMemo(() => calculateRoi(inputs), [inputs]);

  const chartData = [
    {
      name: "3-Year Value",
      savings: results.totalReturn,
      costs: results.totalCost,
    },
  ];

  const chartConfig = {
    savings: { label: "Total savings", color: "hsl(var(--primary))" },
    costs: { label: "Total cost", color: "hsl(var(--muted-foreground))" },
  };

  const set = (key: keyof typeof inputs) => (value: number) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-lg sm:text-xl font-bold mb-2">ROI Calculator</h2>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
          Model ICDU value using your organization&apos;s AI workflow count, engineering
          rates, incident exposure, and audit cadence. All figures are illustrative —
          adjust sliders to match your environment.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
        <Card className="p-4 sm:p-6 space-y-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Calculator className="h-4 w-4 text-primary" />
            Inputs
          </div>
          <RoiSlider
            label={roiCalculatorRanges.workflows.label}
            value={inputs.workflows}
            min={roiCalculatorRanges.workflows.min}
            max={roiCalculatorRanges.workflows.max}
            step={roiCalculatorRanges.workflows.step}
            display={String(inputs.workflows)}
            onChange={set("workflows")}
          />
          <RoiSlider
            label={roiCalculatorRanges.dayRate.label}
            value={inputs.dayRate}
            min={roiCalculatorRanges.dayRate.min}
            max={roiCalculatorRanges.dayRate.max}
            step={roiCalculatorRanges.dayRate.step}
            display={formatBusinessCurrency(inputs.dayRate) + "/day"}
            onChange={set("dayRate")}
          />
          <RoiSlider
            label={roiCalculatorRanges.incidentProb.label}
            value={inputs.incidentProb}
            min={roiCalculatorRanges.incidentProb.min}
            max={roiCalculatorRanges.incidentProb.max}
            step={roiCalculatorRanges.incidentProb.step}
            display={`${inputs.incidentProb}%`}
            onChange={set("incidentProb")}
          />
          <RoiSlider
            label={roiCalculatorRanges.incidentCost.label}
            value={inputs.incidentCost}
            min={roiCalculatorRanges.incidentCost.min}
            max={roiCalculatorRanges.incidentCost.max}
            step={roiCalculatorRanges.incidentCost.step}
            display={formatBusinessCurrency(inputs.incidentCost)}
            onChange={set("incidentCost")}
          />
          <RoiSlider
            label={roiCalculatorRanges.auditCycles.label}
            value={inputs.auditCycles}
            min={roiCalculatorRanges.auditCycles.min}
            max={roiCalculatorRanges.auditCycles.max}
            step={roiCalculatorRanges.auditCycles.step}
            display={String(inputs.auditCycles)}
            onChange={set("auditCycles")}
          />
        </Card>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Card className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-3xl font-bold text-primary">{results.roi}%</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">3-year ROI</div>
            </Card>
            <Card className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-3xl font-bold text-primary">
                {results.payMonths >= 99 ? "—" : `${results.payMonths} mo`}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">Payback period</div>
            </Card>
            <Card className="p-3 sm:p-4 text-center">
              <div className="text-base sm:text-xl font-bold text-primary">
                {formatBusinessCurrency(results.ravAnnual)}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">Risk avoidance / yr</div>
            </Card>
            <Card className="p-3 sm:p-4 text-center">
              <div className="text-base sm:text-xl font-bold text-primary">
                {formatBusinessCurrency(results.engSave)}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">Engineering savings</div>
            </Card>
            <Card className="p-3 sm:p-4 text-center col-span-2">
              <div className="text-base sm:text-xl font-bold text-primary">
                {formatBusinessCurrency(results.compSave)}/yr
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">Compliance labor saved</div>
            </Card>
          </div>

          <Card className="p-4 sm:p-6">
            <h3 className="text-sm font-semibold mb-4">3-Year Savings vs. Cost</h3>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  tickFormatter={(v) => formatBusinessCurrency(v as number)}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatBusinessCurrency(value as number)}
                    />
                  }
                />
                <Bar dataKey="savings" fill="var(--color-savings)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="costs" fill="var(--color-costs)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
            <div className="flex flex-wrap gap-4 mt-3 text-[10px] sm:text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-primary" />
                Total savings ({formatBusinessCurrency(results.totalReturn)})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-muted-foreground" />
                Total cost ({formatBusinessCurrency(results.totalCost)})
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function BusinessCase() {
  useSEO({
    title: "Business Case | ICDU",
    description:
      "The financial case for structured AI governance — risk exposure, ROI modeling, value by role, and a 4–6 week path to deployment.",
  });

  useEffect(() => {
    trackPageViewed("business-case");
  }, []);

  return (
    <div className="min-h-screen py-6 sm:py-8">
      <div className="container px-4 mx-auto max-w-6xl">
        <div className="text-center mb-6 sm:mb-10">
          <Badge variant="secondary" className="mb-3 sm:mb-4 text-xs sm:text-sm">
            Business Case
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
            The Case for Structured AI Governance
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-3xl mx-auto">
            Financial risk, ROI modeling, value by role, and a clear path from
            evaluation to deployment.
          </p>
        </div>

        <Tabs defaultValue="financial-risk" className="w-full">
          <TabsList className="w-full h-auto flex flex-wrap justify-start gap-1 p-1 mb-6 sm:mb-8">
            {businessCaseTabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 flex-1 sm:flex-none min-w-0"
                data-testid={`business-case-tab-${tab.id}`}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Panel 1: Financial Risk */}
          <TabsContent value="financial-risk" className="mt-0">
            <section className="space-y-6">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold mb-2">
                  {financialRiskPanel.heading}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
                  {financialRiskPanel.lead}
                </p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {financialRiskPanel.stats.map((stat) => (
                  <Card key={stat.label} className="p-4 sm:p-6 text-center">
                    <div className="text-xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">
                      {stat.value}
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground leading-snug">
                      {stat.label}
                    </p>
                  </Card>
                ))}
              </div>
            </section>
          </TabsContent>

          {/* Panel 2: ROI Calculator */}
          <TabsContent value="roi-calculator" className="mt-0">
            <RoiCalculatorPanel />
          </TabsContent>

          {/* Panel 3: Value by Role */}
          <TabsContent value="value-by-role" className="mt-0">
            <section className="space-y-6">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold mb-2">
                  Value by Role
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl">
                  What structured AI governance delivers for each executive who owns
                  architecture, security, cost, or legal exposure.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                {stakeholderArguments.map((persona) => (
                  <Card key={persona.role} className="p-4 sm:p-6">
                    <Badge variant="secondary" className="mb-2 text-[10px] sm:text-xs">
                      {persona.role}
                    </Badge>
                    <h3 className="font-semibold text-sm sm:text-base mb-2">
                      {persona.headline}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                      {persona.argument}
                    </p>
                    <ul className="space-y-1.5">
                      {persona.talkingPoints.map((point) => (
                        <li
                          key={point}
                          className="text-[10px] sm:text-xs text-muted-foreground flex items-start gap-2"
                        >
                          <span className="text-primary mt-0.5">•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </div>
            </section>
          </TabsContent>

          {/* Panel 4: Common Concerns */}
          <TabsContent value="common-concerns" className="mt-0">
            <section className="space-y-6">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold mb-2">Common Concerns</h2>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl">
                  Direct answers to the questions that typically come up when evaluating
                  structured AI governance — monitoring, latency, build-vs-buy, and budget.
                </p>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {commonConcerns.map((item, i) => (
                  <AccordionItem key={item.question} value={`concern-${i}`}>
                    <AccordionTrigger className="text-left text-xs sm:text-sm">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          </TabsContent>

          {/* Panel 5: Next Steps */}
          <TabsContent value="next-steps" className="mt-0">
            <section className="space-y-6 sm:space-y-8">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold mb-2">
                  {nextStepsPanel.heading}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
                  {nextStepsPanel.lead}
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {nextStepsPanel.stats.map((stat) => (
                  <Card key={stat.label} className="p-3 sm:p-4 text-center">
                    <div className="text-base sm:text-xl font-bold text-primary">
                      {stat.value}
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                      {stat.label}
                    </p>
                  </Card>
                ))}
              </div>

              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-[10px] sm:text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-3 py-2 text-left font-semibold w-24">Stage</th>
                      <th className="px-3 py-2 text-left font-semibold">Action</th>
                      <th className="px-3 py-2 text-left font-semibold w-32">Who</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nextStepsPanel.timeline.map((row) => (
                      <tr key={row.stage} className="border-b last:border-0">
                        <td className="px-3 py-2 font-medium align-top whitespace-nowrap">
                          {row.stage}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground align-top">
                          {row.action}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground align-top whitespace-nowrap">
                          {row.who}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2">
                {nextStepsPanel.ctas.map((cta) => (
                  <a key={cta.label} href={cta.href}>
                    <Button className="w-full sm:w-auto gap-2 text-xs sm:text-sm">
                      {cta.label === "Book intro call" ? (
                        <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      ) : (
                        <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      )}
                      {cta.label}
                    </Button>
                  </a>
                ))}
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
