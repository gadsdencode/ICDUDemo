// client/src/data/siteResources.ts
// Curated content architecture for Resources, Research, Developers, and downloads.

import { resourceDocs, downloadDoc, type ResourceDoc } from "@/lib/downloads";

export type StaticFormat = "PDF" | "DOCX" | "MD" | "JSON" | "CSV";

export type ResourceAudience =
  | "Executive & Buyer"
  | "Evidence & Research"
  | "Technical";

export type CatalogItem = {
  id: string;
  title: string;
  purpose: string;
  audience: string;
  format: StaticFormat;
  group: "executive" | "research" | "technical";
  href?: string;
  generatedDocId?: string;
  featured?: boolean;
};

/** Polished documents already in client/public/downloads */
export const staticDownloads: CatalogItem[] = [
  {
    id: "exec-pitch",
    title: "ICDU Executive Pitch",
    purpose: "Board-ready narrative for why structured AI readiness matters and how ICDU fits.",
    audience: "Executives, buyers, sponsors",
    format: "DOCX",
    group: "executive",
    href: "/downloads/ICDU_Executive_Pitch.docx",
    featured: true,
  },
  {
    id: "exec-quick-hits",
    title: "ICDU Executive Quick Hits",
    purpose: "Short talking points for leadership briefings and internal alignment.",
    audience: "Executives, GTM, sales engineering",
    format: "DOCX",
    group: "executive",
    href: "/downloads/ICDU_Executive_Quick_Hits.docx",
    featured: true,
  },
  {
    id: "overture-onepager",
    title: "Why Overture One-Pager",
    purpose: "One-page company and product framing for partner and investor conversations.",
    audience: "Buyers, partners, investors",
    format: "DOCX",
    group: "executive",
    href: "/downloads/Why_Overture_OnePager.docx",
    featured: true,
  },
  {
    id: "financial-impact-doc",
    title: "ICDU vs Standard LLM Financial Impact",
    purpose: "Comparative framing of cost, risk, and governance burden versus unstructured LLM use.",
    audience: "CFO, risk, research reviewers",
    format: "DOCX",
    group: "research",
    href: "/downloads/ICDU_vs_Standard_LLM_Financial_Impact.docx",
    featured: true,
  },
  {
    id: "research-paper",
    title: "ICDU AI Research Paper",
    purpose: "Primary research document covering methodology, evaluation framing, and supporting evidence.",
    audience: "Research, architecture, diligence teams",
    format: "PDF",
    group: "research",
    href: "/downloads/ICDU_AI_Research_Paper.pdf",
    featured: true,
  },
];

/** Generated MD/JSON/CSV — available, but not the dominant buyer experience */
export const generatedTechnicalDocs: CatalogItem[] = [
  {
    id: "gen-schema",
    title: "ICDU Sample Schema Bundle",
    purpose: "Example ICDU, Judge report, and Stress Engine JSON for integration testing.",
    audience: "Engineers, integrators",
    format: "JSON",
    group: "technical",
    generatedDocId: "schema-bundle",
  },
  {
    id: "gen-rubric",
    title: "HITL Rubric Sheet",
    purpose: "Five-dimension human-grader rubric ready for import into evaluation workflows.",
    audience: "Engineers, evaluation leads",
    format: "CSV",
    group: "technical",
    generatedDocId: "rubric",
  },
  {
    id: "gen-personas",
    title: "Personas & Journeys (JSON)",
    purpose: "Machine-readable role journeys for local tooling and content review.",
    audience: "Engineers, content owners",
    format: "JSON",
    group: "technical",
    generatedDocId: "personas-journeys",
  },
  {
    id: "gen-glossary",
    title: "Glossary of Terms",
    purpose: "Plain-language definitions for pipeline concepts (IAS, PAS, gates, perturbations).",
    audience: "All technical readers",
    format: "MD",
    group: "technical",
    generatedDocId: "glossary",
  },
  {
    id: "gen-whitepaper",
    title: "ICDU Whitepaper (Markdown)",
    purpose: "Generated markdown overview of format and pipeline components.",
    audience: "Technical readers",
    format: "MD",
    group: "technical",
    generatedDocId: "whitepaper",
  },
  {
    id: "gen-faq",
    title: "FAQ Reference (Markdown)",
    purpose: "Generated FAQ export for offline review.",
    audience: "Technical readers",
    format: "MD",
    group: "technical",
    generatedDocId: "faq",
  },
];

export const resourceGroups = [
  {
    id: "executive" as const,
    title: "Executive & Buyer Resources",
    description:
      "Polished documents for leadership briefings, sponsorship conversations, and buyer diligence.",
  },
  {
    id: "research" as const,
    title: "Evidence & Research",
    description:
      "Research paper and comparative impact materials. Full methodology lives on the Research page.",
  },
  {
    id: "technical" as const,
    title: "Technical Resources",
    description:
      "Schema samples, rubrics, and generated exports for engineers — not the primary buyer path.",
  },
];

export function resolveGeneratedDoc(id: string): ResourceDoc | undefined {
  return resourceDocs.find((d) => d.id === id);
}

export function downloadCatalogItem(item: CatalogItem): void {
  if (item.href) {
    const a = document.createElement("a");
    a.href = item.href;
    a.download = item.href.split("/").pop() || item.title;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }
  if (item.generatedDocId) {
    const doc = resolveGeneratedDoc(item.generatedDocId);
    if (doc) downloadDoc(doc);
  }
}

export type FaqCategory = "product" | "licensing" | "security" | "getting-started";

export const faqCategories: { id: FaqCategory; label: string }[] = [
  { id: "product", label: "Product" },
  { id: "licensing", label: "Licensing" },
  { id: "security", label: "Security & compliance" },
  { id: "getting-started", label: "Getting started" },
];

export const categorizedFaqItems: {
  category: FaqCategory;
  question: string;
  answer: string;
}[] = [
  {
    category: "product",
    question: "What is ICDU?",
    answer:
      "ICDU (Intent-Conscious Data Unit) is a structured record format that encodes user intent, governing principles, persona, and context for AI-assisted work. It sits inside a readiness path — Define → Gate → Execute → Audit — so outputs can be reviewed against explicit criteria.",
  },
  {
    category: "product",
    question: "What components are included?",
    answer:
      "Four main pieces: (1) the ICDU record format, (2) AI Judge scoring with promote / escalate / block gates, (3) HITL Nuance Grader for qualitative dimensions, and (4) a Scenario-Perturbation Stress Engine for stability and consistency checks.",
  },
  {
    category: "product",
    question: "How does the AI Judge work?",
    answer:
      "The Judge scores outputs on Intent-Alignment (IAS), Principle-Adherence (PAS), and Application (AS). Configurable thresholds drive gate decisions: PROMOTE, ESCALATE for human review, or BLOCK when critical thresholds fail.",
  },
  {
    category: "product",
    question: "What is the Stress Engine for?",
    answer:
      "It applies controlled scenario variations (role, tone, constraints, channel) to test whether behavior stays stable and policy-aligned under realistic change — not just on a single happy-path prompt.",
  },
  {
    category: "product",
    question: "How is this different from MMLU or HumanEval?",
    answer:
      "Capability benchmarks measure whether a model can answer knowledge or coding tasks. They do not verify that a production workflow followed your intent, principles, or promotion rules. ICDU answers readiness for a specific governed use — not raw model capability in isolation.",
  },
  {
    category: "licensing",
    question: "Can I use ICDU commercially?",
    answer:
      "Commercial use requires a license. Non-commercial evaluation — academic research, internal testing without revenue impact, benchmarking, and diligence — is permitted. See the Licensing page for the full framing.",
  },
  {
    category: "licensing",
    question: "What counts as commercial use?",
    answer:
      "Examples include production deployment, use in a paid product or service, internal use that supports revenue-generating operations, model training or fine-tuning for commercial delivery, and offering ICDU-based evaluation as a service.",
  },
  {
    category: "licensing",
    question: "Is ICDU patented?",
    answer:
      "ICDU is protected by one or more patent-pending applications in the United States, with PCT planned. Public materials on this site do not grant a license to practice any patented method.",
  },
  {
    category: "security",
    question: "What regulatory requirements does ICDU help address?",
    answer:
      "Intent contracts, gate decisions, and execution traces support evidence needs associated with frameworks such as the EU AI Act (risk, transparency, logging), GDPR automated-decision transparency expectations, and NIST AI RMF-style govern/measure loops. Mapping depth depends on your workflow and counsel.",
  },
  {
    category: "getting-started",
    question: "Where should a buyer start?",
    answer:
      "Most teams start with the Overview, a role journey, the Business Case value model, and a Guided Demo on one workflow. Download executive materials from Resources when you need briefing docs.",
  },
  {
    category: "getting-started",
    question: "Where should an engineer start?",
    answer:
      "Use the Developers page for schema samples, Advanced Lab, and the local Fine-Tune utility. Fine-Tune requires a local training API and is not a public production service.",
  },
];

export const researchClaimTypes = [
  {
    id: "external",
    title: "External evidence",
    description:
      "Third-party market, academic, or regulatory figures. They describe industry conditions — they do not prove an ICDU product result.",
  },
  {
    id: "market",
    title: "Market estimates",
    description:
      "TAM and opportunity sizing used for context. Treat as estimates unless a primary source is cited on the figure.",
  },
  {
    id: "icdu",
    title: "ICDU benchmark or pilot results",
    description:
      "Results observed in ICDU evaluation or pilot settings. Labeled separately from external statistics.",
  },
  {
    id: "targets",
    title: "Targets and projections",
    description:
      "Pilot targets, model assumptions, and forward-looking figures. Not historical product performance unless stated.",
  },
];
