import {
  icduSample,
  judgeReportSample,
  stressEngineSample,
  hitlRubricDimensions,
  glossaryTerms,
  faqItems,
} from "@/data/examples";
import personas from "@/data/personas.json";
import journeys from "@/data/journeys.json";

export type DocFormat = "MD" | "JSON" | "CSV";

export interface ResourceDoc {
  id: string;
  title: string;
  description: string;
  format: DocFormat;
  size: string;
  filename: string;
  build: () => { mime: string; content: string };
}

function buildWhitepaper(): { mime: string; content: string } {
  const lines: string[] = [];
  lines.push("# ICDU Whitepaper");
  lines.push("");
  lines.push("**Intent-Conscious Data Unit — A Governance Format for AI Safety Pipelines**");
  lines.push("");
  lines.push("## Executive Summary");
  lines.push("");
  lines.push(
    "ICDU (Intent-Conscious Data Unit) is a structured record format that encodes user intent, governing principles, persona requirements, and operational context for every AI interaction. Combined with the AI Judge, HITL Nuance Grader, and Scenario-Perturbation Stress Engine, it forms a complete evaluation pipeline that turns model output into auditable, gate-controlled decisions.",
  );
  lines.push("");
  lines.push("## Why ICDU");
  lines.push("");
  lines.push("- $67.4B in 2024 global losses attributed to AI hallucinations");
  lines.push("- 70–85% of AI projects fail to meet expected outcomes");
  lines.push("- EU AI Act fines up to €35M or 7% of global turnover per violation");
  lines.push("- Per-employee hallucination mitigation cost ≈ $14,200/year");
  lines.push("");
  lines.push("## The Four Components");
  lines.push("");
  lines.push("1. **ICDU** — Structured record encoding intent, principles, persona, and context.");
  lines.push("2. **AI Judge** — Quantitative scoring: IAS, PAS, AS with PROMOTE / ESCALATE / BLOCK gates.");
  lines.push("3. **HITL Nuance Grader** — Human-in-the-loop rubric across empathy, clarity, coaching, trust, safety.");
  lines.push("4. **Stress Engine** — Controlled perturbations measuring stability, fairness, refusal consistency, hallucination.");
  lines.push("");
  lines.push("## Sample ICDU");
  lines.push("");
  lines.push("```json");
  lines.push(JSON.stringify(icduSample, null, 2));
  lines.push("```");
  lines.push("");
  lines.push("## Sample Judge Report");
  lines.push("");
  lines.push("```json");
  lines.push(JSON.stringify(judgeReportSample, null, 2));
  lines.push("```");
  lines.push("");
  lines.push("## Licensing");
  lines.push("");
  lines.push(
    "ICDU is protected by one or more patent-pending applications in the United States (PCT planned). Commercial use requires a license; non-commercial evaluation, academic research, and benchmarking are permitted.",
  );
  lines.push("");
  return { mime: "text/markdown;charset=utf-8", content: lines.join("\n") };
}

function buildGlossary(): { mime: string; content: string } {
  const lines = ["# ICDU Glossary", ""];
  for (const t of glossaryTerms) {
    lines.push(`## ${t.term}`);
    lines.push("");
    lines.push(t.definition);
    lines.push("");
  }
  return { mime: "text/markdown;charset=utf-8", content: lines.join("\n") };
}

function buildFAQ(): { mime: string; content: string } {
  const lines = ["# ICDU FAQ", ""];
  for (const item of faqItems) {
    lines.push(`## ${item.question}`);
    lines.push("");
    lines.push(item.answer);
    lines.push("");
  }
  return { mime: "text/markdown;charset=utf-8", content: lines.join("\n") };
}

function buildSchemaBundle(): { mime: string; content: string } {
  const bundle = {
    icdu_sample: icduSample,
    judge_report_sample: judgeReportSample,
    stress_engine_sample: stressEngineSample,
  };
  return {
    mime: "application/json;charset=utf-8",
    content: JSON.stringify(bundle, null, 2),
  };
}

function buildPersonasJourneys(): { mime: string; content: string } {
  const bundle = { personas, journeys };
  return {
    mime: "application/json;charset=utf-8",
    content: JSON.stringify(bundle, null, 2),
  };
}

function csvEscape(s: string): string {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function buildRubricCSV(): { mime: string; content: string } {
  const rows = [["id", "label", "description"]];
  for (const r of hitlRubricDimensions) {
    rows.push([r.id, r.label, r.description]);
  }
  const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
  return { mime: "text/csv;charset=utf-8", content: csv };
}

function approxKB(s: string): string {
  const bytes = new Blob([s]).size;
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

const baseDocs: Omit<ResourceDoc, "size">[] = [
  {
    id: "whitepaper",
    title: "ICDU Whitepaper",
    description: "Overview of the ICDU format, pipeline components, and the business case for structured AI governance.",
    format: "MD",
    filename: "icdu-whitepaper.md",
    build: buildWhitepaper,
  },
  {
    id: "glossary",
    title: "Glossary of Terms",
    description: "Plain-language definitions for ICDU, IAS / PAS / AS, gates, perturbations, and other pipeline concepts.",
    format: "MD",
    filename: "icdu-glossary.md",
    build: buildGlossary,
  },
  {
    id: "faq",
    title: "FAQ Reference",
    description: "Answers to the most common questions about ICDU, licensing, regulation, and how the pipeline works.",
    format: "MD",
    filename: "icdu-faq.md",
    build: buildFAQ,
  },
  {
    id: "schema-bundle",
    title: "ICDU Sample Schema Bundle",
    description: "Example ICDU, Judge report, and Stress Engine payloads for integration testing.",
    format: "JSON",
    filename: "icdu-samples.json",
    build: buildSchemaBundle,
  },
  {
    id: "personas-journeys",
    title: "Personas & Journeys",
    description: "Every persona definition plus the grouped tab content (challenge, pipeline, ROI, next steps) shown in the Journey experience.",
    format: "JSON",
    filename: "icdu-personas-journeys.json",
    build: buildPersonasJourneys,
  },
  {
    id: "rubric",
    title: "HITL Rubric Sheet",
    description: "Five-dimension human-grader rubric (empathy, clarity, coaching, trust, safety) ready for import.",
    format: "CSV",
    filename: "icdu-hitl-rubric.csv",
    build: buildRubricCSV,
  },
];

export const resourceDocs: ResourceDoc[] = baseDocs.map((d) => {
  const { content } = d.build();
  return { ...d, size: approxKB(content) };
});

export function downloadDoc(doc: ResourceDoc): void {
  const { mime, content } = doc.build();
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = doc.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
