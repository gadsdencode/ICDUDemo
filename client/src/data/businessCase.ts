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
  deployability: "ICDU doesn't replace your model. It makes your model deployable.",
  costOfInaction: "One question measures benchmarks. The other prevents the $67B problem.",
  gapStatement: "Standard benchmarks tell you a model is capable. They don't tell you it's safe, aligned to intent, or stable under real-world variation. That's the gap where failures — and fines — happen.",
  heroLine: "ICDU turns best-effort prompting into measurable, auditable execution."
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
