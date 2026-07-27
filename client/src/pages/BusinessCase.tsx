import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Slider } from "@/components/ui/slider";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  businessCaseIntro,
  exposurePanel,
  roiCalculatorDefaults,
  roiCalculatorRanges,
  roiModelAssumptionCopy,
  calculateRoi,
  formatBusinessCurrency,
  buildRoiSummary,
  roiResultSummarySentence,
  stakeholderArguments,
  commonConcerns,
  pilotPathPanel,
  type RoiInputs,
} from "@/data/businessCase";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import {
  ArrowRight,
  Calculator,
  Check,
  Copy,
  HelpCircle,
  Mail,
  RotateCcw,
} from "lucide-react";
import { trackPageViewed } from "@/lib/analytics";
import { useSEO } from "@/lib/seo";
import {
  BrandPage,
  PageHero,
  ContentSection,
  PrimaryCTA,
  SecondaryCTA,
} from "@/components/brand";
import { cn } from "@/lib/utils";

const inputKeys = [
  "workflows",
  "dayRate",
  "incidentProb",
  "incidentCost",
  "auditCycles",
] as const;

function displayFor(key: (typeof inputKeys)[number], value: number): string {
  switch (key) {
    case "dayRate":
      return `${formatBusinessCurrency(value)}/day`;
    case "incidentProb":
      return `${value}%`;
    case "incidentCost":
      return formatBusinessCurrency(value);
    default:
      return String(value);
  }
}

function RoiSlider({
  label,
  help,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  help: string;
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
        <label className="text-sm font-medium text-[color:var(--icdu-fg)] inline-flex items-center gap-1.5">
          {label}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="text-[color:var(--icdu-fg-faint)] hover:text-[color:var(--icdu-fg-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--icdu-blue)] rounded-sm"
                aria-label={`About ${label}`}
              >
                <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-sm leading-relaxed">
              {help}
            </TooltipContent>
          </Tooltip>
        </label>
        <span
          className="text-sm font-semibold tabular-nums"
          style={{ color: "var(--icdu-blue)" }}
        >
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
      <p className="text-sm text-[color:var(--icdu-fg-faint)] leading-snug sm:hidden m-0">
        {help}
      </p>
    </div>
  );
}

function RoiCalculatorPanel() {
  const [inputs, setInputs] = useState<RoiInputs>(roiCalculatorDefaults);
  const [copied, setCopied] = useState(false);
  const results = useMemo(() => calculateRoi(inputs), [inputs]);
  const summarySentence = useMemo(
    () => roiResultSummarySentence(inputs, results),
    [inputs, results],
  );

  const chartData = [
    {
      name: "Modeled 3-yr savings",
      amount: results.totalReturn,
      kind: "savings" as const,
    },
    {
      name: "Modeled 3-yr cost",
      amount: results.totalCost,
      kind: "costs" as const,
    },
  ];

  const chartConfig = {
    amount: { label: "USD" },
    savings: { label: "Savings", color: "var(--icdu-blue)" },
    costs: { label: "Cost", color: "var(--icdu-fg-faint)" },
  };

  const set = (key: keyof RoiInputs) => (value: number) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  const reset = () => {
    setInputs({ ...roiCalculatorDefaults });
    setCopied(false);
  };

  const copySummary = async () => {
    const text = buildRoiSummary(inputs, results);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for restricted clipboard environments
      const area = document.createElement("textarea");
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      document.body.removeChild(area);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8" data-testid="roi-calculator">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--icdu-fg)] mb-2">
            <Calculator
              className="h-4 w-4"
              style={{ color: "var(--icdu-blue)" }}
              aria-hidden="true"
            />
            Interactive value model
          </div>
          <p className="text-sm text-[color:var(--icdu-fg-muted)] leading-relaxed m-0">
            Adjust your organization&apos;s inputs. ICDU model assumptions stay
            fixed and visible. All outputs are{" "}
            <strong className="font-semibold text-[color:var(--icdu-fg)]">
              illustrative estimates
            </strong>{" "}
            for planning conversations — not forecasts or guarantees.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <SecondaryCTA
            type="button"
            onClick={reset}
            data-testid="roi-reset"
            className="!text-xs sm:!text-sm"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset to Example
          </SecondaryCTA>
          <SecondaryCTA
            type="button"
            onClick={copySummary}
            data-testid="roi-copy-summary"
            className="!text-xs sm:!text-sm"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {copied ? "Copied" : "Copy Summary"}
          </SecondaryCTA>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="rounded-xl border border-[color:var(--icdu-border)] bg-[color:var(--icdu-surface)] p-4 sm:p-6 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-[color:var(--icdu-fg)] m-0 mb-1">
              Your assumptions
            </h3>
            <p className="text-xs text-[color:var(--icdu-fg-faint)] m-0">
              User-entered values — change these to match your environment.
            </p>
          </div>
          <TooltipProvider delayDuration={200}>
            {inputKeys.map((key) => (
              <RoiSlider
                key={key}
                label={roiCalculatorRanges[key].label}
                help={roiCalculatorRanges[key].help}
                value={inputs[key]}
                min={roiCalculatorRanges[key].min}
                max={roiCalculatorRanges[key].max}
                step={roiCalculatorRanges[key].step}
                display={displayFor(key, inputs[key])}
                onChange={set(key)}
              />
            ))}
          </TooltipProvider>

          <div className="pt-4 border-t border-[color:var(--icdu-border)] space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-[color:var(--icdu-fg)] m-0 mb-1">
                ICDU model assumptions
              </h3>
              <p className="text-sm text-[color:var(--icdu-fg-faint)] m-0 mb-3">
                Fixed in this calculator — not slider inputs.
              </p>
            </div>
            <ul className="space-y-2.5 m-0 p-0 list-none">
              {roiModelAssumptionCopy.map((item) => (
                <li key={item.label} className="text-sm leading-snug">
                  <div className="font-medium text-[color:var(--icdu-fg)]">
                    {item.label}
                  </div>
                  <div className="text-[color:var(--icdu-fg-faint)]">
                    {item.detail}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-[color:var(--icdu-border)] bg-[color:var(--icdu-bg)]/40 p-3 sm:p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--icdu-fg-faint)] mb-1.5">
              How the estimate is calculated
            </div>
            <p className="text-sm text-[color:var(--icdu-fg-muted)] leading-relaxed m-0">
              Annual engineering savings = workflows × days saved × day rate.
              Compliance labor saved = workflows × audit cycles × hours × hourly
              rate. Risk avoidance = incident probability × incident cost ×
              risk-capture factor. Three-year savings combine year-one returns
              with two additional years of compliance and risk avoidance.
              Three-year cost combines year-one subscription, setup, and the
              engineering investment proxy with two more subscription years.
              ROI = (savings − cost) ÷ cost.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <p
            className="text-sm text-[color:var(--icdu-fg-muted)] leading-relaxed m-0 rounded-xl border border-[color:var(--icdu-blue)]/25 bg-[color:var(--icdu-blue)]/5 p-4"
            data-testid="roi-summary-sentence"
          >
            {summarySentence}
          </p>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {[
              {
                value: `${results.roi}%`,
                label: "Illustrative 3-year ROI",
              },
              {
                value:
                  results.payMonths >= 99 ? "—" : `${results.payMonths} mo`,
                label: "Illustrative payback",
              },
              {
                value: formatBusinessCurrency(results.ravAnnual),
                label: "Risk avoidance / year",
              },
              {
                value: formatBusinessCurrency(results.engSave),
                label: "Engineering savings / year",
              },
              {
                value: `${formatBusinessCurrency(results.compSave)}/yr`,
                label: "Compliance labor saved",
              },
              {
                value: formatBusinessCurrency(results.netBenefit),
                label: "3-year net benefit",
              },
            ].map((metric) => (
              <div
                key={metric.label}
                className="rounded-lg border border-[color:var(--icdu-border)] bg-[color:var(--icdu-surface)] p-3 sm:p-4 text-center"
              >
                <div
                  className="text-base sm:text-xl font-semibold tabular-nums leading-tight"
                  style={{ color: "var(--icdu-blue)" }}
                >
                  {metric.value}
                </div>
                <div className="text-sm text-[color:var(--icdu-fg-muted)] mt-1.5 leading-snug">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-[color:var(--icdu-border)] bg-[color:var(--icdu-surface)] p-4 sm:p-6">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="text-sm font-semibold text-[color:var(--icdu-fg)] m-0">
                Savings versus cost (3 years)
              </h3>
              <span className="text-xs text-[color:var(--icdu-fg-faint)] shrink-0">
                Illustrative
              </span>
            </div>
            <ChartContainer config={chartConfig} className="h-[220px] w-full">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickFormatter={(v) => formatBusinessCurrency(v as number)}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={128}
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) =>
                        formatBusinessCurrency(value as number)
                      }
                    />
                  }
                />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={28}>
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.kind}
                      fill={
                        entry.kind === "savings"
                          ? "var(--icdu-blue)"
                          : "var(--icdu-fg-faint)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
            <div className="flex flex-wrap gap-4 mt-3 text-xs sm:text-sm text-[color:var(--icdu-fg-muted)]">
              <span className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ background: "var(--icdu-blue)" }}
                />
                Savings ({formatBusinessCurrency(results.totalReturn)})
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ background: "var(--icdu-fg-faint)" }}
                />
                Cost ({formatBusinessCurrency(results.totalCost)})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BusinessCase() {
  useSEO({
    title: "Business Case | ICDU",
    description:
      "Decision-ready business case for ICDU — current exposure, interactive value model, stakeholder value, common questions, and an estimated 4–6 week pilot path.",
  });

  useEffect(() => {
    trackPageViewed("business-case");
  }, []);

  return (
    <BrandPage>
      <div className="mx-auto max-w-6xl space-y-14 sm:space-y-20">
        <PageHero
          label={businessCaseIntro.label}
          title={businessCaseIntro.title}
          description={businessCaseIntro.description}
          displayTitle={false}
        />

        <div className="grid gap-6 sm:gap-8 md:grid-cols-3 -mt-6 sm:-mt-10">
          {businessCaseIntro.outcomes.map((item) => (
            <div key={item.title} className="min-w-0">
              <div className="icdu-section-label mb-2">{item.title}</div>
              <p className="text-sm text-[color:var(--icdu-fg-muted)] leading-relaxed m-0">
                {item.body}
              </p>
            </div>
          ))}
        </div>

        {/* 1. Current Exposure */}
        <ContentSection
          label="01 · Current Exposure"
          heading={exposurePanel.heading}
          description={exposurePanel.lead}
        >
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
            {exposurePanel.items.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-[color:var(--icdu-border)] bg-[color:var(--icdu-surface)] p-4 sm:p-5"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-editorial text-xl tracking-tight text-[color:var(--icdu-fg)] m-0">
                    {item.title}
                  </h3>
                  <span
                    className="text-xs font-semibold tabular-nums shrink-0"
                    style={{ color: "var(--icdu-blue)" }}
                  >
                    {item.figure}
                  </span>
                </div>
                <p className="text-sm text-[color:var(--icdu-fg-muted)] leading-relaxed m-0 mb-3">
                  {item.body}
                </p>
                <div className="text-sm text-[color:var(--icdu-fg-faint)]">
                  <span className="font-medium text-[color:var(--icdu-fg-muted)]">
                    {item.claimKind === "sourced" ? "Source: " : "Basis: "}
                  </span>
                  {item.source}
                </div>
              </div>
            ))}
          </div>
        </ContentSection>

        {/* 2. Value Model */}
        <ContentSection
          label="02 · Value Model"
          heading="Size the case with your numbers"
          description="Keep the calculator central. Enter assumptions you control, read ICDU model constants separately, and treat every output as an illustrative estimate."
          id="value-model"
        >
          <RoiCalculatorPanel />
        </ContentSection>

        {/* 3. Value by Stakeholder */}
        <ContentSection
          label="03 · Value by Stakeholder"
          heading="What each decision owner needs to hear"
          description="One point of view per audience — architecture, security, finance, and legal/compliance — without repeating the same metric strip."
        >
          <div className="space-y-0 divide-y divide-[color:var(--icdu-border)] border-y border-[color:var(--icdu-border)]">
            {stakeholderArguments.map((persona) => (
              <div
                key={persona.role}
                className="grid sm:grid-cols-[8rem,1fr] gap-3 sm:gap-6 py-5 sm:py-6"
              >
                <div
                  className="text-xs font-semibold uppercase tracking-[0.08em]"
                  style={{ color: "var(--icdu-blue)" }}
                >
                  {persona.role}
                </div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base text-[color:var(--icdu-fg)] m-0 mb-1.5">
                    {persona.headline}
                  </h3>
                  <p className="text-sm text-[color:var(--icdu-fg-muted)] leading-relaxed m-0 mb-3">
                    {persona.argument}
                  </p>
                  <ul className="space-y-1.5 m-0 p-0 list-none">
                    {persona.talkingPoints.map((point) => (
                      <li
                        key={point}
                        className="text-xs sm:text-sm text-[color:var(--icdu-fg-muted)] flex items-start gap-2"
                      >
                        <span
                          className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0"
                          style={{ background: "var(--icdu-blue)" }}
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </ContentSection>

        {/* 4. Common Questions */}
        <ContentSection
          label="04 · Common Questions"
          heading="Questions that usually decide the next meeting"
          description="Short answers for monitoring overlap, latency, build-versus-buy, timing, and budget sequencing."
        >
          <Accordion type="single" collapsible className="w-full">
            {commonConcerns.map((item, i) => (
              <AccordionItem key={item.question} value={`concern-${i}`}>
                <AccordionTrigger className="text-left text-sm">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-[color:var(--icdu-fg-muted)] leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ContentSection>

        {/* 5. Pilot Path */}
        <ContentSection
          label="05 · Pilot Path"
          heading={pilotPathPanel.heading}
          description={pilotPathPanel.lead}
        >
          <p
            className={cn(
              "text-xs sm:text-sm mb-5 sm:mb-6 inline-flex items-center rounded-md border px-2.5 py-1.5 m-0",
              "border-[color:var(--icdu-amber)]/30 bg-[color:var(--icdu-amber)]/5 text-[color:var(--icdu-fg-muted)]",
            )}
          >
            {pilotPathPanel.estimateNote}
          </p>

          <ol className="space-y-4 m-0 p-0 list-none mb-8 sm:mb-10">
            {pilotPathPanel.phases.map((phase, index) => (
              <li key={phase.stage} className="flex gap-3 sm:gap-4">
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white"
                    style={{ background: "var(--icdu-blue)" }}
                  >
                    {index + 1}
                  </div>
                  {index < pilotPathPanel.phases.length - 1 && (
                    <div className="w-px flex-1 bg-[color:var(--icdu-border)] mt-1 min-h-[1.25rem]" />
                  )}
                </div>
                <div className="pb-2 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[color:var(--icdu-fg-faint)]">
                      {phase.stage}
                    </span>
                    <span className="font-semibold text-sm text-[color:var(--icdu-fg)]">
                      {phase.title}
                    </span>
                  </div>
                  <p className="text-sm text-[color:var(--icdu-fg-muted)] leading-relaxed m-0 mb-1">
                    {phase.action}
                  </p>
                  <p className="text-xs text-[color:var(--icdu-fg-faint)] m-0">
                    {phase.who}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2">
            <PrimaryCTA href={pilotPathPanel.ctas[0].href}>
              <Mail className="h-4 w-4" aria-hidden="true" />
              {pilotPathPanel.ctas[0].label}
            </PrimaryCTA>
            <SecondaryCTA asChild>
              <Link href={pilotPathPanel.ctas[1].href}>
                {pilotPathPanel.ctas[1].label}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </SecondaryCTA>
          </div>
        </ContentSection>
      </div>
    </BrandPage>
  );
}
