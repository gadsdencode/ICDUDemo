// client/src/data/investorContent.ts
// Market / TAM / regulatory material preserved for a future Investor page.
// Moved off the buyer homepage intentionally — do not delete.

export const investorMarketBars = [
  { label: "AI Governance TAM 2030", value: "$134B", width: 1.0 },
  { label: "AI Observability 2024", value: "$45B", width: 0.336 },
  { label: "Compliance Tech 2026", value: "$28B", width: 0.209 },
  { label: "AI Security 2025", value: "$18B", width: 0.134 },
];

export const investorRegulatoryTailwinds = [
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

export const investorStrainCards = [
  {
    title: "Data center capacity",
    desc: "Up to 75% fewer compute cycles means far less infrastructure required. ICDU reduces AI infrastructure overhead through improved cycle time efficiency.",
  },
  {
    title: "Energy demand",
    desc: "The US faces critical shortages in power generation for AI. Reduced inference overhead directly lowers power draw per workload.",
  },
  {
    title: "Compute cost",
    desc: "With up to 80% efficiency improvement, ICDU significantly lowers the cost of every AI job you run — at any scale.",
  },
  {
    title: "Reliability & governance",
    desc: "Errors and inaccuracies decreased by up to 75% — reducing rework, remediation, and the legal liability that follows AI failures.",
  },
];

export const investorMarketStat = {
  value: "$134B",
  label: "AI governance & efficiency market by 2030",
  sublabel: "MARKET OPPORTUNITY",
};

export const investorDifferentiators = [
  {
    title: "Structured intent, not prompt engineering",
    desc: "Versioned ICDU specs replace freeform prompts — testable, auditable, and rollback-able",
  },
  {
    title: "Pipeline-native architecture",
    desc: "Integrates into existing MLOps and CI/CD — not another tool engineers work around",
  },
  {
    title: "Measurable safety, not keyword filters",
    desc: "Quantitative thresholds with compliance artifacts — every gate is verifiable and auditable",
  },
  {
    title: "Compliance-ready from day one",
    desc: "Maps to EU AI Act, NIST AI RMF, and ISO/IEC 42001 — no custom instrumentation required",
  },
];

export const investorPageIntro = {
  label: "Investor",
  title: "Market context for diligence conversations",
  description:
    "TAM framing, regulatory tailwinds, and investment-status language for partners and diligence teams. This page is not part of the main buyer navigation.",
};

export const investorStatus = {
  heading: "Investment status",
  body: "ICDU is developed by Overture Systems Solutions and is positioned for real-world pilot validation. Architecture is protected under U.S. provisional patent filings. Commercial licensing and diligence packages are available on request.",
  bullets: [
    "Patent-pending architecture (U.S.; PCT planned)",
    "Buyer evaluation available via walkthrough and bounded pilot",
    "Investor and partner materials available under NDA when appropriate",
  ],
  cta: {
    label: "Request diligence conversation",
    href: "mailto:brian@osscontact.com?subject=ICDU%20Investor%20Diligence",
  },
};

export const investorUseCaseCards = [
  {
    category: "FINANCIAL SERVICES",
    title: "Auditable AI decisions",
    desc: "Loan approvals, fraud detection, and trading signals with full regulatory trace. Every model decision is defensible to regulators and customers.",
  },
  {
    category: "HEALTHCARE",
    title: "Clinical decision support",
    desc: "Intent-bound AI recommendations with clinician oversight gates built in. Patient safety and regulatory compliance by architecture, not policy.",
  },
  {
    category: "LEGAL & COMPLIANCE",
    title: "Contract & risk analysis",
    desc: "AI that operates within defined legal parameters and logs every reasoning step. Complete defensibility for any AI-assisted legal work.",
  },
  {
    category: "ENTERPRISE SAAS",
    title: "AI feature governance",
    desc: "Ship AI-powered product features with safety and compliance built into the release pipeline — not retrofitted after an incident.",
  },
  {
    category: "GOVERNMENT",
    title: "Accountable public AI",
    desc: "Transparent, auditable AI operations meeting public accountability standards. Every decision explainable to oversight bodies and citizens.",
  },
  {
    category: "INSURANCE",
    title: "Underwriting & claims AI",
    desc: "Structured intent ensures AI outputs are explainable to regulators and customers alike. Reduces dispute risk and litigation exposure.",
  },
];
