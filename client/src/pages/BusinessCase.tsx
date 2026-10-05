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
  businessCaseIntro,
  workComparison,
  outcomePillars,
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
  Mail,
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
import { useAudience } from "@/components/AudienceProvider";
import { RecommendedFlag } from "@/components/PathChrome";
import { businessCaseLinkLabel, formatAudienceChip, stakeholderAnchor } from "@/data/audience";
import { getGuidedScenario } from "@/data/guidedScenarios";
import { pendingGuidedReturn } from "@/lib/guidedProgress";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";

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
  minLabel,
  maxLabel,
  onChange,
}: {
  label: string;
  help: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  minLabel: string;
  maxLabel: string;
  onChange: (v: number) => void;
}) {
  const fieldId = `roi-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className="icdu-assumption">
      <div className="icdu-assumption-top">
        <label className="icdu-label" htmlFor={fieldId}>{label}</label>
        <span className="icdu-assumption-value">{display}</span>
      </div>
      <Slider
        id={fieldId}
        min={min}
        max={max}
        step={step}
        value={[value]}
        aria-valuetext={display}
        onValueChange={([v]) => onChange(v)}
      />
      <div className="icdu-slider-ends">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
      <p className="icdu-assumption-help">{help}</p>
    </div>
  );
}

export function RoiCalculatorPanel() {
  const workspace = useWorkspace();
  const inputs = workspace.roiInputs;
  const [copied, setCopied] = useState(false);
  const results = useMemo(() => calculateRoi(inputs), [inputs]);
  const summarySentence = useMemo(
    () => roiResultSummarySentence(inputs, results),
    [inputs, results],
  );

  const chartData = [
    {
      name: "Savings",
      fullName: "Modeled 3-year savings",
      amount: results.totalReturn,
      kind: "savings" as const,
    },
    {
      name: "Cost",
      fullName: "Modeled 3-year cost",
      amount: results.totalCost,
      kind: "costs" as const,
    },
  ];

  const chartConfig = {
    amount: { label: "USD" },
    savings: { label: "Modeled 3-year savings", color: "var(--icdu-accent)" },
    costs: { label: "Modeled 3-year cost", color: "var(--icdu-series-cost)" },
  };

  const set = (key: keyof RoiInputs) => (value: number) => {
    workspace.setRoiInputs({ [key]: value });
  };

  const reset = () => {
    workspace.requestResetRoi("reset-roi");
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

  const outcomes = [
    { value: `${results.roi}%`, label: "Illustrative 3-year ROI" },
    { value: results.payMonths >= 99 ? "—" : `${results.payMonths} mo`, label: "Illustrative payback" },
    { value: formatBusinessCurrency(results.netBenefit), label: "3-year net benefit" },
    { value: formatBusinessCurrency(results.totalReturn), label: "3-year modeled savings" },
    { value: formatBusinessCurrency(results.totalCost), label: "3-year modeled cost" },
    { value: formatBusinessCurrency(results.ravAnnual), label: "Risk avoidance / year" },
    { value: formatBusinessCurrency(results.engSave), label: "Engineering savings / year" },
    { value: formatBusinessCurrency(results.compSave), label: "Compliance labor saved / year" },
  ];

  return (
    <div className="icdu-value" data-testid="roi-calculator">
      <header className="icdu-work-head">
        <h2 className="icdu-work-title">Interactive value model</h2>
        <p className="icdu-work-lead">
          Adjust the assumptions you control. ICDU model constants stay fixed and visible.
          Every output is an illustrative estimate for planning — not a forecast, guarantee, or commercial quote.
        </p>
      </header>
      <div className="icdu-actions">
        <button type="button" className="icdu-quiet icdu-focus" onClick={reset} data-testid="roi-reset">
          Reset to example
        </button>
        <button type="button" className="icdu-quiet icdu-focus" onClick={copySummary} data-testid="roi-copy-summary">
          {copied ? "Copied" : "Copy summary"}
        </button>
      </div>

      <section className="icdu-group" aria-label="Modeled outcomes">
        <h3>Modeled outcomes</h3>
        <p className="icdu-work-meta">Illustrative estimate. Subscription and setup figures in the model are not a quote.</p>
        <p className="icdu-value-summary" data-testid="roi-summary-sentence">{summarySentence}</p>
        <dl className="icdu-metrics">
          {outcomes.map((metric) => (
            <div key={metric.label}>
              <dt>{metric.label}</dt>
              <dd>{metric.value}</dd>
            </div>
          ))}
        </dl>
        <div className="icdu-chart-panel">
          <div className="icdu-chart-head">
            <h3>Savings versus cost</h3>
            <p>Three-year modeled totals, in US dollars. Illustrative.</p>
          </div>
          <ChartContainer config={chartConfig} className="icdu-chart-plot aspect-auto">
            <BarChart data={chartData} margin={{ top: 12, right: 12, left: 4, bottom: 4 }}>
              <CartesianGrid stroke="var(--icdu-border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--icdu-fg-muted)", fontSize: 13 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={64}
                tick={{ fill: "var(--icdu-fg-muted)", fontSize: 13 }}
                tickFormatter={(v) => formatBusinessCurrency(v as number)}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, _name, item) => (
                      <span>
                        {item?.payload?.fullName ?? "Amount"}: {formatBusinessCurrency(value as number)}
                      </span>
                    )}
                  />
                }
              />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={56} maxBarSize={72}>
                {chartData.map((entry) => (
                  <Cell
                    key={entry.kind}
                    fill={entry.kind === "savings" ? "var(--icdu-accent)" : "var(--icdu-series-cost)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
          <ul className="icdu-legend">
            <li>
              <span className="icdu-swatch" style={{ background: "var(--icdu-accent)" }} />
              Modeled 3-year savings ({formatBusinessCurrency(results.totalReturn)})
            </li>
            <li>
              <span className="icdu-swatch" style={{ background: "var(--icdu-series-cost)" }} />
              Modeled 3-year cost ({formatBusinessCurrency(results.totalCost)})
            </li>
          </ul>
        </div>
      </section>

      <section className="icdu-group" aria-label="Your assumptions">
        <h3>Your assumptions</h3>
        <p className="icdu-work-meta">These are the values you can change. Units sit with the current value.</p>
        <div className="icdu-assumptions">
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
              minLabel={displayFor(key, roiCalculatorRanges[key].min)}
              maxLabel={displayFor(key, roiCalculatorRanges[key].max)}
              onChange={set(key)}
            />
          ))}
        </div>
      </section>

      <section className="icdu-group" aria-label="ICDU model assumptions">
        <h3>ICDU model assumptions</h3>
        <p className="icdu-work-meta">Fixed in this calculator. They are not slider inputs and not a price list.</p>
        <ul className="icdu-constant-list">
          {roiModelAssumptionCopy.map((item) => (
            <li key={item.label}>
              <strong>{item.label}</strong>
              <span>{item.detail}</span>
            </li>
          ))}
        </ul>
        <details className="icdu-formula">
          <summary>How the estimate is calculated</summary>
          <p>
            Annual engineering savings = workflows × days saved × day rate.
            Compliance labor saved = workflows × audit cycles × hours × hourly rate.
            Risk avoidance = incident probability × incident cost × risk-capture factor.
            Three-year savings combine year-one returns with two additional years of compliance and risk avoidance.
            Three-year cost combines year-one subscription, setup, and the engineering investment proxy with two more subscription years.
            ROI = (savings − cost) ÷ cost.
          </p>
        </details>
      </section>
    </div>
  );
}

export default function BusinessCase() {
  useSEO({
    title: "Business Case | ICDU",
    description:
      "Decision-ready business case for ICDU — current exposure, interactive value model, stakeholder value, common questions, and an estimated 4–6 week pilot path.",
  });

  const { personaId, industryId, route } = useAudience();
  const audienceChip = formatAudienceChip(personaId, industryId);
  const demoReturn = pendingGuidedReturn(industryId);
  const demoScenario = demoReturn ? getGuidedScenario(demoReturn.scenarioId) : undefined;
  const matchedRole = route?.stakeholderRole ?? null;
  const recommendedHash = route?.businessCaseHref.includes("#")
    ? route.businessCaseHref.split("#")[1]
    : null;
  const recommendValueModel = recommendedHash === "value-model";
  const orderedStakeholders = useMemo(() => {
    if (!matchedRole) return stakeholderArguments;
    const match = stakeholderArguments.filter((item) => item.role === matchedRole);
    const rest = stakeholderArguments.filter((item) => item.role !== matchedRole);
    return [...match, ...rest];
  }, [matchedRole]);
  const openStakeholders = matchedRole
    ? [matchedRole]
    : orderedStakeholders.map((item) => item.role);

  useEffect(() => {
    trackPageViewed("business-case");
  }, []);

  useEffect(() => {
    const explicit = window.location.hash.replace(/^#/, "");
    const fallback = route?.businessCaseHref.split("#")[1];
    const hash = explicit || fallback;
    if (!hash) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [route?.businessCaseHref]);

  return (
    <BrandPage data-assistant-page="business-case">
      <div className="mx-auto max-w-6xl space-y-14 sm:space-y-20">
        <PageHero
          label={businessCaseIntro.label}
          title={businessCaseIntro.title}
          description={businessCaseIntro.description}
          displayTitle={false}
        />

        {audienceChip ? (
          <p className="m-0 -mt-6 text-sm leading-relaxed text-[color:var(--icdu-fg-muted)] sm:-mt-8" data-testid="business-case-path">
            {recommendedHash
              ? `Recommended for ${audienceChip}: ${route ? businessCaseLinkLabel(route) : "this section"}. The rest of the case is on this page.`
              : `Your path is ${audienceChip}. The full case is on this page.`}
          </p>
        ) : null}

        {demoReturn && demoScenario ? (
          <div
            className="-mt-4 rounded-xl border-2 border-[color:var(--icdu-accent)] p-4 sm:p-5"
            data-testid="return-to-demo"
          >
            <p className="m-0 text-sm font-semibold text-[color:var(--icdu-fg)]">
              You opened this case from your guided demo.
            </p>
            <p className="m-0 mt-1 text-sm leading-relaxed text-[color:var(--icdu-fg-muted)]">
              {demoScenario.title}
              {audienceChip ? ` · ${audienceChip}` : ""}. Your place in that walkthrough is saved.
            </p>
            <PrimaryCTA asChild className="mt-4">
              <Link href="/demos">Return to your demo</Link>
            </PrimaryCTA>
          </div>
        ) : null}

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

        <ContentSection
          id="comparison"
          className={cn(
            "scroll-mt-24",
            recommendedHash === "comparison" && "border-l-2 border-l-[color:var(--icdu-accent)] pl-4",
          )}
          label="How the work changes"
          heading={workComparison.heading}
          description={workComparison.lead}
        >
          {recommendedHash === "comparison" ? (
            <div className="mb-4" data-testid="business-case-recommended">
              <RecommendedFlag />
            </div>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-[color:var(--icdu-border)] bg-[color:var(--icdu-surface)] p-4 sm:p-5">
              <h3 className="m-0 text-sm font-semibold text-[color:var(--icdu-fg)]">Without an intent contract</h3>
              <ul className="mt-3 space-y-3 m-0 p-0 list-none">
                {workComparison.without.map((item) => (
                  <li key={item.title}>
                    <p className="m-0 text-sm font-medium text-[color:var(--icdu-fg)]">{item.title}</p>
                    <p className="m-0 mt-1 text-sm leading-relaxed text-[color:var(--icdu-fg-muted)]">{item.desc}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-[color:var(--icdu-border)] bg-[color:var(--icdu-surface)] p-4 sm:p-5">
              <h3 className="m-0 text-sm font-semibold text-[color:var(--icdu-fg)]">With ICDU</h3>
              <ul className="mt-3 space-y-3 m-0 p-0 list-none">
                {workComparison.with.map((item) => (
                  <li key={item.title}>
                    <p className="m-0 text-sm font-medium text-[color:var(--icdu-fg)]">{item.title}</p>
                    <p className="m-0 mt-1 text-sm leading-relaxed text-[color:var(--icdu-fg-muted)]">{item.desc}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div id="outcomes" className="mt-6 scroll-mt-24 grid gap-4 sm:grid-cols-3">
            {outcomePillars.map((pillar) => (
              <div key={pillar.title}>
                <h3 className="m-0 text-sm font-semibold text-[color:var(--icdu-fg)]">{pillar.title}</h3>
                <p className="m-0 mt-1 text-sm leading-relaxed text-[color:var(--icdu-fg-muted)]">{pillar.body}</p>
              </div>
            ))}
          </div>
        </ContentSection>

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
                  <h3 className="font-display text-xl font-medium tracking-tight text-[color:var(--icdu-fg)] m-0">
                    {item.title}
                  </h3>
                  <span
                    className="text-xs font-semibold tabular-nums shrink-0"
                    style={{ color: "var(--icdu-accent)" }}
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
          className={cn(
            "scroll-mt-24",
            recommendValueModel && "border-l-2 border-l-[color:var(--icdu-accent)] pl-4",
          )}
        >
          {recommendValueModel ? (
            <div className="mb-4" data-testid="business-case-recommended">
              <RecommendedFlag />
            </div>
          ) : null}
          <RoiCalculatorPanel />
        </ContentSection>

        {/* 3. Value by Stakeholder */}
        <ContentSection
          id="value-by-stakeholder"
          className="scroll-mt-24"
          label="03 · Value by Stakeholder"
          heading="What each decision owner needs to hear"
          description="One point of view per audience — architecture, security, finance, and legal/compliance — without repeating the same metric strip."
        >
          <Accordion
            key={matchedRole ?? "all"}
            type="multiple"
            defaultValue={openStakeholders}
            className="border-y border-[color:var(--icdu-border)]"
          >
            {orderedStakeholders.map((persona) => {
              const isMatch = persona.role === matchedRole;
              return (
                <AccordionItem
                  key={persona.role}
                  value={persona.role}
                  id={stakeholderAnchor(persona.role)}
                  data-testid={isMatch ? "business-case-recommended" : undefined}
                  className={cn(
                    "scroll-mt-24 border-[color:var(--icdu-border)]",
                    isMatch && "border-l-2 border-l-[color:var(--icdu-accent)] bg-[color:var(--icdu-surface)] pl-3",
                  )}
                >
                  <AccordionTrigger className="py-5 hover:no-underline">
                    <span className="text-left">
                      <span className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[color:var(--icdu-fg)]">
                        {persona.role}
                        {isMatch ? <RecommendedFlag /> : null}
                      </span>
                      <span className="mt-1 block font-semibold text-sm sm:text-base text-[color:var(--icdu-fg)]">
                        {persona.headline}
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
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
                            style={{ background: "var(--icdu-accent)" }}
                          />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
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
          id="pilot-path"
          className={cn(
            "scroll-mt-24",
            recommendedHash === "pilot-path" && "border-l-2 border-l-[color:var(--icdu-accent)] pl-4",
          )}
          label="05 · Pilot Path"
          heading={pilotPathPanel.heading}
          description={pilotPathPanel.lead}
        >
          {recommendedHash === "pilot-path" ? (
            <div className="mb-4" data-testid="business-case-recommended">
              <RecommendedFlag />
            </div>
          ) : null}
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
