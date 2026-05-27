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
export const businessCaseTabs = [
  { id: "financial-risk", label: "Financial Risk" },
  { id: "roi-calculator", label: "ROI Calculator" },
  { id: "stakeholder-arguments", label: "Stakeholder Arguments" },
  { id: "objection-handling", label: "Objection Handling" },
  { id: "next-steps", label: "Next Steps" },
] as const;

export const financialRiskPanel = {
  heading: "The financial case for structured AI governance",
  lead: "AI governance isn't a cost center — it's risk reduction with measurable ROI. Here's the financial exposure your organization carries today without structured AI intent governance.",
  stats: [
    { value: "€35M", label: "max EU AI Act fine or 7% global turnover" },
    { value: "$4.1M", label: "avg cost of public AI output incident (IBM 2024)" },
    { value: "3.2×", label: "cost of remediation vs. prevention" },
    { value: "38%", label: "CAGR AI governance spend — growing everywhere" },
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
};

export const roiCalculatorDefaults: RoiInputs = {
  workflows: 10,
  dayRate: 800,
  incidentProb: 15,
  incidentCost: 2_000_000,
  auditCycles: 4,
};

export const roiCalculatorRanges = {
  workflows: { min: 1, max: 50, step: 1, label: "AI workflows" },
  dayRate: { min: 400, max: 2000, step: 50, label: "Engineering day rate" },
  incidentProb: { min: 5, max: 40, step: 1, label: "Incident probability" },
  incidentCost: { min: 100_000, max: 10_000_000, step: 50_000, label: "Incident cost" },
  auditCycles: { min: 1, max: 12, step: 1, label: "Audit cycles / year" },
};

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
  const hrDay = dayRate / 8;
  const engSave = workflows * 4 * dayRate;
  const compSave = workflows * auditCycles * 30 * hrDay;
  const ravAnnual = Math.round((incidentProb / 100) * incidentCost * 0.7);
  const annualSub = 60_000;
  const yr1Cost = annualSub + 15_000 + engSave;
  const yr1Return = engSave + compSave + ravAnnual;
  const totalReturn = yr1Return + (compSave + ravAnnual) * 2;
  const totalCost = yr1Cost + annualSub * 2;
  const roi = Math.round(((totalReturn - totalCost) / totalCost) * 100);
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
  };
}

export const stakeholderArguments = [
  {
    role: "CTO",
    headline: "Bolt-on architecture, not rip-and-replace",
    argument:
      "ICDU is a stateless execution layer that wraps existing model calls — model-agnostic, API-first, and SDK-integrable in hours. It reduces inference cycles by up to 75% while adding pre-execution gates and immutable audit logs.",
    talkingPoints: [
      "Works with OpenAI, Anthropic, Mistral, and internal models",
      "Define → Gate → Execute → Audit pipeline on every call",
      "SDK-first integration — typical pilot in one sprint",
      "75% reduction in iterative inference cycles",
    ],
  },
  {
    role: "CISO",
    headline: "Close the largest unmanaged attack surface",
    argument:
      "Ungoverned AI endpoints are vectors for prompt injection, shadow AI, and undetectable policy violations. ICDU enforces six security controls before every model call and produces cryptographically signed audit traces.",
    talkingPoints: [
      "Pre-execution gates: injection, scope, sensitivity, redaction",
      "Immutable audit logs exportable to SIEM",
      "Maps to NIST AI RMF and EU AI Act Art. 9/12/13",
      "Zero-trust AI: verify before execute, log everything",
    ],
  },
  {
    role: "CFO",
    headline: "Risk reduction with quantifiable ROI",
    argument:
      "One AI incident averages $4.1M. EU AI Act fines reach €35M. ICDU converts ungoverned AI exposure into a measurable control — with execution-based pricing and a 3-year ROI that typically exceeds 200%.",
    talkingPoints: [
      "3.2× cheaper to prevent incidents than remediate them",
      "Execution-based pricing — pay for gated calls, not seats",
      "Compute savings from 75% fewer inference cycles",
      "Use the ROI calculator with your org's actual parameters",
    ],
  },
  {
    role: "General Counsel",
    headline: "Defensibility and regulatory readiness",
    argument:
      "Regulators and courts increasingly demand proof of what AI was intended to do and what safeguards were applied. ICDU produces audit-ready artifacts on every execution — reducing litigation exposure and accelerating regulatory inquiry response.",
    talkingPoints: [
      "Cryptographically signed execution traces for every AI decision",
      "GDPR Art. 22 automated decision transparency",
      "SEC AI risk disclosure documentation",
      "Complete defensibility for AI-assisted legal and compliance work",
    ],
  },
];

export const objectionHandling = [
  {
    question: "We already have monitoring tools",
    answer:
      "Monitoring observes outputs after the fact. ICDU gates inputs before the model is called and produces intent-bound audit artifacts regulators expect. Observability tells you something went wrong; ICDU prevents it and proves what you intended.",
  },
  {
    question: "Our models are fine — we haven't had an incident",
    answer:
      "Absence of evidence isn't evidence of absence. 67% of AI incidents trace to ungoverned prompts, and upstream model updates silently change behavior. ICDU makes intent explicit and testable so you detect drift before customers or regulators do.",
  },
  {
    question: "This adds latency to our AI calls",
    answer:
      "Pre-execution gates add single-digit milliseconds — far less than the latency of an unnecessary retry loop caused by an ungoverned prompt failure. Net effect: fewer total calls and lower p99 latency under production load.",
  },
  {
    question: "We can build this internally",
    answer:
      "Building intent encoding, six gate types, immutable audit logging, and compliance framework mapping is 12–18 months of platform engineering — plus ongoing maintenance as regulations evolve. ICDU is patent-pending, production-ready, and integrates in one sprint.",
  },
  {
    question: "We're not in a regulated industry",
    answer:
      "SEC AI disclosures, state-level AI laws, and customer contractual requirements are expanding beyond traditional regulated sectors. Any enterprise deploying customer-facing AI carries reputational and legal exposure — governance is becoming table stakes, not optional.",
  },
  {
    question: "The budget isn't there this quarter",
    answer:
      "The sandbox tier is free for 5,000 executions. A single prevented incident ($4.1M average) pays for years of ICDU. Frame this as risk mitigation infrastructure — comparable to cybersecurity spend — with measurable ROI and a payback period measurable in months.",
  },
];

export const nextStepsPanel = {
  heading: "How most organizations move forward",
  lead: "The path from internal business case to live deployment typically takes 4–6 weeks. Here's what that looks like, and what to request at each stage.",
  stats: [
    { value: "3–5 days", label: "to first deployment" },
    { value: "4–6 wks", label: "sign-off to compliance-ready" },
    { value: "Free", label: "sandbox tier up to 5K executions" },
    { value: "1 sprint", label: "typical integration" },
  ],
  timeline: [
    { stage: "Now", action: "Share this business case with your buying committee", who: "Champion" },
    { stage: "Week 1", action: "Request sandbox access and run first ICDU", who: "Engineering" },
    { stage: "Week 1–2", action: "CTO/CISO architecture and security review", who: "CTO / CSO" },
    { stage: "Week 2", action: "Run ROI model with your org's actual parameters", who: "CFO / Finance" },
    { stage: "Week 2–3", action: "Compliance framework mapping review", who: "Compliance" },
    { stage: "Week 3–4", action: "POC against one critical AI workflow", who: "Engineering" },
    { stage: "Week 4–5", action: "Commercial proposal and procurement review", who: "Legal / Finance" },
    { stage: "Week 5–6", action: "Deployment to staging and production", who: "Engineering" },
  ],
  ctas: [
    { label: "Request sandbox access", href: "mailto:brian@osscontact.com?subject=ICDU%20Sandbox%20Access" },
    { label: "Book intro call", href: "mailto:brian@osscontact.com?subject=ICDU%20Intro%20Call" },
  ],
};
