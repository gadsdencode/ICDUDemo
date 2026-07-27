// client/src/data/businessCase.ts
// Centralized source of truth for all financial, regulatory, and competitive data.

// === FINANCIAL IMPACT DATA ===
export const financialImpact = {
  hallucination_losses: {
    figure: "$67.4B",
    context: "global losses attributed to AI hallucinations in 2024",
    source: "AllAboutAI, 2025"
  },
  project_failure_rate: {
    figure: "70–85%",
    context: "of AI projects fail to meet expected outcomes",
    source: "MIT / RAND Corporation"
  },
  eu_ai_act_max_fine: {
    figure: "€35M",
    context: "or 7% of global annual turnover per violation",
    source: "EU AI Act, Art. 99"
  },
  remediation_costs: {
    figure: "$10B+",
    context: "projected remediation costs by mid-2026",
    source: "Gartner, 2025"
  },
  abandoned_initiatives: {
    figure: "42%",
    context: "of companies abandoned most AI initiatives in 2025, up from 17% prior year",
    source: "S&P Global, 2025"
  },
  per_employee_cost: {
    figure: "~$14,200",
    context: "per employee/year in hallucination verification and rework",
    source: "Forrester, 2025"
  },
  ai_roi_ratio: {
    figure: "$3.70 to earn $1",
    context: "current AI ROI ratio, with majority lost to failed initiatives and remediation",
    source: "McKinsey, 2025"
  }
};

// === EFFICIENCY & MARKET DATA ===
export const efficiencyStats = [
  {
    value: "75%",
    label: "Reduction in iterative inference cycles",
    sublabel: "COMPUTE EFFICIENCY",
  },
  {
    value: "80%",
    label: "Compute efficiency improvement potential",
    sublabel: "COST REDUCTION",
  },
  {
    value: "75%",
    label: "Decrease in AI errors and inaccuracies",
    sublabel: "OUTPUT RELIABILITY",
  },
  {
    value: "$134B",
    label: "AI governance & efficiency market by 2030",
    sublabel: "MARKET OPPORTUNITY",
  },
];

export const marketBars = [
  { label: "AI Governance TAM 2030", value: "$134B", width: 1.0 },
  { label: "AI Observability 2024", value: "$45B", width: 0.336 },
  { label: "Compliance Tech 2026", value: "$28B", width: 0.209 },
  { label: "AI Security 2025", value: "$18B", width: 0.134 },
];

export const regulatoryTailwinds = [
  {
    tag: "EU AI Act",
    desc: "Art. 9/12/13 — audit artifacts mandatory for high-risk AI",
  },
  {
    tag: "NIST AI RMF",
    desc: "Govern, Map, Measure, Manage — federal adoption accelerating",
  },
  {
    tag: "GDPR Art. 22",
    desc: "Automated decision transparency requirements in force",
  },
  {
    tag: "SEC Disclosures",
    desc: "Material AI risk disclosure required from 2025",
  },
];

// === REAL-WORLD FAILURE INCIDENTS ===
export const failureIncidents = [
  {
    incident: "Chatbot hallucination erases shareholder value",
    year: "2024",
    impact: "$100B market cap loss"
  },
  {
    incident: "AI copyright class action settlement",
    year: "2025",
    impact: "$1.5B settlement"
  },
  {
    incident: "GDPR fine for ChatGPT data breach",
    year: "2024",
    impact: "€15M fine"
  },
  {
    incident: "Biased tenant screening AI",
    year: "2024",
    impact: "$2.2M + mandatory audit"
  },
  {
    incident: "Lawyers cited AI-hallucinated legal authority",
    year: "2024–2025",
    impact: "600+ cases, sanctions + reputational loss"
  },
  {
    incident: "Robotaxi recall for object detection failure",
    year: "2025",
    impact: "1,200+ vehicles recalled"
  }
];

// === REGULATORY LANDSCAPE ===
export const regulations = [
  {
    name: "EU AI Act",
    requirement: "Risk assessments, audit trails, and human oversight for high-risk AI systems",
    penalty: "€35M or 7% of global annual turnover"
  },
  {
    name: "GDPR (AI Impact)",
    requirement: "Lawful data processing, breach notification, transparency in algorithmic decisions",
    penalty: "€20M or 4% of global turnover"
  },
  {
    name: "US State Laws",
    requirement: "Colorado AI Act: risk management + impact assessments; Texas AI law effective Jan 2026",
    penalty: "Varies; enforcement ramping"
  },
  {
    name: "US Federal (Proposed)",
    requirement: "AI LEAD Act: classifies AI as products, creates federal products liability cause of action",
    penalty: "Unlimited tort liability"
  }
];

// === COMPETITIVE BENCHMARKS (what ICDU replaces) ===
export const standardBenchmarks = [
  {
    name: "MMLU",
    measures: "Knowledge across 57 subjects",
    topScore: ">90% (saturating)",
    blindSpot: "No intent or context testing"
  },
  {
    name: "HumanEval",
    measures: "Code generation correctness",
    topScore: ">90% pass@1",
    blindSpot: "No safety or principle gates"
  },
  {
    name: "TruthfulQA",
    measures: "Factual accuracy under pressure",
    topScore: "~70–80% truthful",
    blindSpot: "Single-dimension, no rubric"
  },
  {
    name: "MT-Bench",
    measures: "Multi-turn conversation quality",
    topScore: "9.0+ / 10 (GPT-4 class)",
    blindSpot: "No perturbation or audit trail"
  },
  {
    name: "HellaSwag",
    measures: "Commonsense reasoning",
    topScore: ">95% (saturating)",
    blindSpot: "Static; no domain governance"
  }
];

// === COMPONENT-LEVEL "WHAT IT REPLACES" ===
export const componentReplacements = {
  icduRecord: {
    component: "ICDU Record",
    replaces: "Ad-hoc prompts with no embedded success criteria",
    outcome: "Every evaluation anchored to explicit requirements"
  },
  aiJudge: {
    component: "AI Judge",
    replaces: "Post-hoc red-teaming with no formal thresholds",
    outcome: "Hard gate before deployment; unsafe outputs never reach production"
  },
  hitlGrader: {
    component: "HITL Nuance Grader",
    replaces: "Unstructured preference rankings (e.g., Chatbot Arena)",
    outcome: "Qualitative dimensions captured consistently; scores feed back into calibration"
  },
  stressEngine: {
    component: "Stress Engine",
    replaces: "Limited jailbreak testing with no systematic coverage",
    outcome: "Surfaces instability, bias, and failure modes before deployment"
  }
};

// === KEY EXECUTIVE QUOTES / TAGLINES ===
export const executiveMessages = {
  bottomLine: "Standard evaluation asks: \"Is this model capable?\" ICDU asks: \"Is it safe, aligned, and stable enough to deploy?\"",
  deployability:
    "ICDU bolts onto your existing stack — no model replacement required. Let's talk about aligning AI behavior with intent while reducing compute, energy, and operational overhead.",
  costOfInaction:
    "Every enterprise is deploying AI. Almost none can prove it's doing what they intend. One opaque AI decision in finance, healthcare, or law can cost millions — with no audit trail.",
  gapStatement:
    "ICDU is a bolt-on structured execution layer that improves how AI systems are used — aligning model behavior with human intent while reducing unnecessary compute, energy, and operational overhead.",
  heroLine: "ICDU turns best-effort prompting into measurable, auditable execution.",
};

// === USE-CASE QUALIFICATION ===
export const useCaseGuidance = {
  useIcdu: [
    "Deploying AI in regulated industries (healthcare, finance, legal, education)",
    "Outputs carry liability, reputational, or safety risk",
    "Clients or regulators require audit trails and traceability",
    "AI interacts with customers, patients, or end users at scale"
  ],
  standardEvalIsFine: [
    "Running internal research or experimentation with no production exposure",
    "Low-stakes content generation (brainstorming, summaries, drafts)",
    "No compliance, audit, or governance requirements apply",
    "Outputs are always human-reviewed before external use"
  ]
};

// === SOURCES CITATION ===
export const sourcesLine = "Sources: AllAboutAI 2025, Forrester 2025, S&P Global 2025, MIT/RAND, Gartner 2025, EU AI Act Art. 99, IBM AI Adoption Index 2025, McKinsey 2025, Customer Experience Association 2024";

// === BUSINESS CASE PAGE ===

export const businessCaseIntro = {
  label: "Business Case",
  title: "Decide with a bounded model — not a slide of statistics",
  description:
    "ICDU improves the quality and repeatability of AI-assisted work, reduces exposure from ungoverned prompts and opaque decisions, and can be evaluated through an estimated 4–6 week pilot on one high-value workflow.",
  outcomes: [
    {
      title: "What ICDU improves",
      body: "Consistent, reviewable AI outputs tied to explicit intent — so teams promote work against a shared definition of done instead of prompt improvisation.",
    },
    {
      title: "What exposure it reduces",
      body: "Ungoverned endpoints, silent model drift, missing audit evidence, and the remediation cost of decisions you cannot defend.",
    },
    {
      title: "How to evaluate it",
      body: "Run one workflow through Define → Gate → Execute → Audit, compare quality and rework to your current path, and leave with an evidence pack — not a multi-year platform program.",
    },
  ],
};

export const exposurePanel = {
  heading: "Current exposure without structured intent",
  lead: "This page focuses on decision inputs for finance and leadership — not the same headline statistics used on the homepage. Use sourced ceilings where they exist, then size your own exposure in the calculator.",
  items: [
    {
      title: "Regulatory penalty ceiling",
      body: "High-risk AI systems under the EU AI Act face material administrative fines when required risk, transparency, and logging obligations are not met.",
      figure: "€35M or 7% turnover",
      claimKind: "sourced" as const,
      source: "EU AI Act, Art. 99",
    },
    {
      title: "Incident and remediation cost",
      body: "Public AI failures drive legal, PR, engineering rework, and customer remediation. Treat published averages as reference points — your calculator input should reflect your workflows.",
      figure: "Org-specific",
      claimKind: "estimate" as const,
      source: "Sized in the Value Model below (user-entered)",
    },
    {
      title: "Evidence and inquiry burden",
      body: "Without intent contracts and execution traces, responding to regulators, customers, or counsel becomes a reconstruction exercise after the fact.",
      figure: "Audit labor",
      claimKind: "estimate" as const,
      source: "Modeled via audit-cycle inputs",
    },
    {
      title: "Engineering rework",
      body: "Fragile prompts and retry loops consume senior time whenever models, context, or policy change. Governance reduces that churn when intent is versioned and testable.",
      figure: "Day-rate × days",
      claimKind: "estimate" as const,
      source: "Modeled via workflow and day-rate inputs",
    },
  ],
};

export type RoiInputs = {
  workflows: number;
  dayRate: number;
  incidentProb: number;
  incidentCost: number;
  auditCycles: number;
};

export type RoiResults = {
  roi: number;
  ravAnnual: number;
  engSave: number;
  compSave: number;
  payMonths: number;
  totalReturn: number;
  totalCost: number;
  yr1Return: number;
  yr1Cost: number;
  netBenefit: number;
};

/** ICDU-specific constants baked into calculateRoi — not user sliders. */
export const roiModelAssumptions = {
  annualSubscriptionUsd: 60_000,
  yearOneSetupUsd: 15_000,
  engineeringDaysSavedPerWorkflow: 4,
  hoursPerAuditCyclePerWorkflow: 30,
  riskCaptureFactor: 0.7,
  horizonYears: 3,
} as const;

export const roiCalculatorDefaults: RoiInputs = {
  workflows: 10,
  dayRate: 800,
  incidentProb: 15,
  incidentCost: 2_000_000,
  auditCycles: 4,
};

export const roiCalculatorRanges = {
  workflows: {
    min: 1,
    max: 50,
    step: 1,
    label: "AI workflows in scope",
    help: "Number of production AI-assisted workflows you would place under ICDU in the first three years.",
  },
  dayRate: {
    min: 400,
    max: 2000,
    step: 50,
    label: "Engineering day rate",
    help: "Fully loaded daily cost for the engineers who currently fix prompts, retries, and governance gaps.",
  },
  incidentProb: {
    min: 5,
    max: 40,
    step: 1,
    label: "Annual incident probability",
    help: "Your estimate that a material AI output or process incident occurs this year without stronger pre-execution controls.",
  },
  incidentCost: {
    min: 100_000,
    max: 10_000_000,
    step: 50_000,
    label: "Cost of one material incident",
    help: "Legal, remediation, customer, and operational cost if a significant AI failure reaches production or the public.",
  },
  auditCycles: {
    min: 1,
    max: 12,
    step: 1,
    label: "Audit / evidence cycles per year",
    help: "How often compliance, security, or legal currently collects AI evidence manually across these workflows.",
  },
} as const;

export const roiModelAssumptionCopy = [
  {
    label: `Annual subscription $${(roiModelAssumptions.annualSubscriptionUsd / 1000).toFixed(0)}K`,
    detail: "Illustrative ICDU commercial assumption used for modeled cost.",
  },
  {
    label: `Year-1 setup $${(roiModelAssumptions.yearOneSetupUsd / 1000).toFixed(0)}K`,
    detail: "One-time illustrative onboarding / integration allowance in year one.",
  },
  {
    label: `${roiModelAssumptions.engineeringDaysSavedPerWorkflow} eng. days saved / workflow / year`,
    detail: "ICDU model assumption for reduced prompt rework and retry loops.",
  },
  {
    label: `${roiModelAssumptions.hoursPerAuditCyclePerWorkflow} hours / audit cycle / workflow`,
    detail: "ICDU model assumption for evidence collection effort avoided when traces are automatic.",
  },
  {
    label: `${Math.round(roiModelAssumptions.riskCaptureFactor * 100)}% risk-capture factor`,
    detail: "Share of expected annual incident cost treated as avoidable under gated execution — illustrative, not a guarantee.",
  },
];

export function formatBusinessCurrency(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000) {
    return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}$${Math.round(abs / 1_000)}K`;
  }
  return `${sign}$${Math.round(abs)}`;
}

export function calculateRoi(inputs: RoiInputs): RoiResults {
  const { workflows, dayRate, incidentProb, incidentCost, auditCycles } = inputs;
  const {
    annualSubscriptionUsd,
    yearOneSetupUsd,
    engineeringDaysSavedPerWorkflow,
    hoursPerAuditCyclePerWorkflow,
    riskCaptureFactor,
  } = roiModelAssumptions;

  const hrDay = dayRate / 8;
  const engSave = workflows * engineeringDaysSavedPerWorkflow * dayRate;
  const compSave = workflows * auditCycles * hoursPerAuditCyclePerWorkflow * hrDay;
  const ravAnnual = Math.round((incidentProb / 100) * incidentCost * riskCaptureFactor);
  const yr1Cost = annualSubscriptionUsd + yearOneSetupUsd + engSave;
  const yr1Return = engSave + compSave + ravAnnual;
  const totalReturn = yr1Return + (compSave + ravAnnual) * 2;
  const totalCost = yr1Cost + annualSubscriptionUsd * 2;
  const netBenefit = totalReturn - totalCost;
  const roi = Math.round((netBenefit / totalCost) * 100);
  const payMonths = yr1Return > 0 ? Math.ceil(yr1Cost / (yr1Return / 12)) : 99;

  return {
    roi,
    ravAnnual,
    engSave,
    compSave,
    payMonths,
    totalReturn,
    totalCost,
    yr1Return,
    yr1Cost,
    netBenefit,
  };
}

export function buildRoiSummary(inputs: RoiInputs, results: RoiResults): string {
  const lines = [
    "ICDU Value Model — illustrative estimate",
    "",
    "Your inputs",
    `• AI workflows in scope: ${inputs.workflows}`,
    `• Engineering day rate: ${formatBusinessCurrency(inputs.dayRate)}/day`,
    `• Annual incident probability: ${inputs.incidentProb}%`,
    `• Cost of one material incident: ${formatBusinessCurrency(inputs.incidentCost)}`,
    `• Audit / evidence cycles per year: ${inputs.auditCycles}`,
    "",
    "ICDU model assumptions",
    `• Annual subscription: ${formatBusinessCurrency(roiModelAssumptions.annualSubscriptionUsd)}`,
    `• Year-1 setup: ${formatBusinessCurrency(roiModelAssumptions.yearOneSetupUsd)}`,
    `• Engineering days saved per workflow / year: ${roiModelAssumptions.engineeringDaysSavedPerWorkflow}`,
    `• Hours per audit cycle per workflow: ${roiModelAssumptions.hoursPerAuditCyclePerWorkflow}`,
    `• Risk-capture factor: ${Math.round(roiModelAssumptions.riskCaptureFactor * 100)}%`,
    `• Horizon: ${roiModelAssumptions.horizonYears} years`,
    "",
    "Modeled outputs (illustrative)",
    `• 3-year ROI: ${results.roi}%`,
    `• Payback: ${results.payMonths >= 99 ? "n/a" : `${results.payMonths} months`}`,
    `• Annual risk avoidance: ${formatBusinessCurrency(results.ravAnnual)}`,
    `• Annual engineering savings: ${formatBusinessCurrency(results.engSave)}`,
    `• Annual compliance labor saved: ${formatBusinessCurrency(results.compSave)}`,
    `• 3-year modeled savings: ${formatBusinessCurrency(results.totalReturn)}`,
    `• 3-year modeled cost: ${formatBusinessCurrency(results.totalCost)}`,
    `• 3-year net benefit: ${formatBusinessCurrency(results.netBenefit)}`,
    "",
    "These figures are illustrative estimates for planning discussions, not forecasts or guarantees.",
  ];
  return lines.join("\n");
}

export function roiResultSummarySentence(inputs: RoiInputs, results: RoiResults): string {
  const payback =
    results.payMonths >= 99 ? "an indeterminate payback" : `about ${results.payMonths}-month payback`;
  return `With ${inputs.workflows} workflows at ${formatBusinessCurrency(inputs.dayRate)}/day and a ${inputs.incidentProb}% chance of a ${formatBusinessCurrency(inputs.incidentCost)} incident, this illustrative model shows roughly ${results.roi}% 3-year ROI, ${payback}, and ${formatBusinessCurrency(results.netBenefit)} net benefit versus ${formatBusinessCurrency(results.totalCost)} modeled cost.`;
}

export const stakeholderArguments = [
  {
    role: "CTO",
    headline: "Middleware beside the stack you already run",
    argument:
      "ICDU wraps existing model calls as a readiness control plane — model-agnostic and API-first — so architecture gains gates and evidence without a platform rip-and-replace.",
    talkingPoints: [
      "Define → Gate → Execute → Audit on the call path",
      "Works with major hosted and internal models",
      "Pilot integration sized for a single sprint on one workflow",
    ],
  },
  {
    role: "CISO",
    headline: "Controls before the model call, evidence after",
    argument:
      "Shadow AI and prompt injection thrive where intent is informal. ICDU applies pre-execution gates and produces exportable traces security teams can review beside existing SIEM practice.",
    talkingPoints: [
      "Injection, scope, sensitivity, and redaction-style gates",
      "Immutable execution traces for inquiry response",
      "Maps cleanly to NIST AI RMF-style govern/measure loops",
    ],
  },
  {
    role: "CFO",
    headline: "A unit-economic case you can stress-test",
    argument:
      "Use the Value Model to replace anecdote with adjustable assumptions: workflow count, day rates, incident exposure, and audit labor — then compare modeled savings to illustrative subscription cost.",
    talkingPoints: [
      "Execution-oriented commercial framing (gated work, not seats)",
      "Separate your assumptions from ICDU model constants",
      "Copy a plain-text summary into the investment memo",
    ],
  },
  {
    role: "Legal / Compliance",
    headline: "Defensibility when intent must be proven",
    argument:
      "Counsel and compliance need artifacts that show what the system was supposed to do and what checks ran. ICDU produces intent-bound evidence packs suited to inquiry and disclosure workflows.",
    talkingPoints: [
      "Signed traces tied to the governing contract",
      "Supports transparency expectations for automated decisions",
      "Shortens reconstruction time during reviews",
    ],
  },
];

export const commonConcerns = [
  {
    question: "How is this different from monitoring we already have?",
    answer:
      "Monitoring observes outputs after the fact. ICDU encodes intent, gates inputs before the model is called, and produces artifacts that show what was allowed to run — prevention plus proof, not only post-hoc observation.",
  },
  {
    question: "We haven't had an incident — why act now?",
    answer:
      "Model updates, prompt drift, and informal shadow tools can change behavior without a ticket. A bounded pilot surfaces whether your critical workflows already need stronger readiness gates before a public failure forces the issue.",
  },
  {
    question: "Will this add latency to AI calls?",
    answer:
      "Pre-execution checks are designed to be lightweight relative to model inference. The decision question is whether fewer retries and clearer promotion criteria offset any gate overhead — measure that on your pilot workflow.",
  },
  {
    question: "Could we build equivalent controls internally?",
    answer:
      "You can. Intent encoding, multiple gate types, durable audit logging, and ongoing regulatory mapping is multi-quarter platform work. ICDU is offered as a ready control plane for teams that want a pilot-sized path instead of a greenfield build.",
  },
  {
    question: "Does this matter if we aren't in a regulated industry?",
    answer:
      "Customer contracts, disclosure expectations, and state AI rules increasingly reach beyond classic regulated verticals. If AI touches customers or material decisions, defensibility and consistency still matter.",
  },
  {
    question: "What if budget isn't available this quarter?",
    answer:
      "Start with the interactive demos and a scoped walkthrough. Use the Value Model to document assumptions for the next planning cycle — the calculator is for decision prep, not a purchase commitment.",
  },
];

export const pilotPathPanel = {
  heading: "Estimated 4–6 week pilot path",
  lead: "Timeline below is an estimate for a single high-value workflow. Actual duration depends on access, stakeholder availability, and how quickly success criteria are agreed.",
  estimateNote: "Estimate only — not a contractual delivery schedule.",
  phases: [
    {
      stage: "Week 1",
      title: "Scope and encode",
      action: "Pick one workflow, name an owner, and encode intent with success criteria.",
      who: "Ops owner + Engineering",
    },
    {
      stage: "Weeks 2–3",
      title: "Governed runs",
      action: "Run side-by-side unstructured vs. ICDU-gated executions; capture quality, rework, and traces.",
      who: "Engineering + Security",
    },
    {
      stage: "Weeks 3–4",
      title: "Evidence review",
      action: "Review gate decisions and evidence packs with security and compliance stakeholders.",
      who: "CISO / Compliance",
    },
    {
      stage: "Weeks 4–6",
      title: "Readout",
      action: "Executive readout: keep, expand, or redesign — with modeled value and observed pilot outcomes.",
      who: "Leadership + Finance",
    },
  ],
  ctas: [
    {
      label: "Book a Walkthrough",
      href: "mailto:brian@osscontact.com?subject=ICDU%20Walkthrough",
    },
    {
      label: "Try the Live Demo",
      href: "/demos",
    },
  ],
};

/** @deprecated Prefer exposurePanel — retained for any residual imports. */
export const financialRiskPanel = {
  heading: exposurePanel.heading,
  lead: exposurePanel.lead,
  stats: [] as { value: string; label: string }[],
};

/** @deprecated Prefer pilotPathPanel */
export const nextStepsPanel = pilotPathPanel;

/** @deprecated Tabs removed from Business Case UI */
export const businessCaseTabs = [
  { id: "current-exposure", label: "Current Exposure" },
  { id: "value-model", label: "Value Model" },
  { id: "value-by-stakeholder", label: "Value by Stakeholder" },
  { id: "common-questions", label: "Common Questions" },
  { id: "pilot-path", label: "Pilot Path" },
] as const;
