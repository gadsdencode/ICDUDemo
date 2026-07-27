// script/transform-journeys.mjs — one-shot transform for role journeys
import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const old = require("../client/src/data/journeys.json");

function tab(id, title, sectionTag, h2, lead, blocks, cta) {
  return { id, title, sectionTag, h2, lead, blocks, ...(cta ? { cta } : {}) };
}

function from(persona, tabId) {
  const t = old[persona].tabs.find((x) => x.id === tabId);
  if (!t) throw new Error(`missing ${persona}.${tabId}`);
  return t;
}

function mergeBlocks(...tabs) {
  return tabs.flatMap((t) => t.blocks);
}

const STEP_META = [
  { id: "situation", title: "Your Situation" },
  { id: "changes", title: "What ICDU Changes" },
  { id: "how", title: "How It Works" },
  { id: "evidence", title: "Evidence and Value" },
  { id: "next", title: "Recommended Next Step" },
];

function buildPersona(key, picks, cta, sectionPrefix) {
  const steps = [
    { pick: picks[0], meta: STEP_META[0], cta: null },
    { pick: picks[1], meta: STEP_META[1], cta: null },
    { pick: picks[2], meta: STEP_META[2], cta: null },
    { pick: picks[3], meta: STEP_META[3], cta: null },
    { pick: picks[4], meta: STEP_META[4], cta },
  ];
  const tabs = steps.map(({ pick, meta, cta: stepCta }) => {
    const sources = Array.isArray(pick)
      ? pick.map((id) => from(key, id))
      : [from(key, pick)];
    const primary = sources[0];
    let blocks = mergeBlocks(...sources);
    if (blocks.length > 5) blocks = blocks.slice(0, 5);
    return tab(
      meta.id,
      meta.title,
      `${sectionPrefix} · ${meta.title.toUpperCase()}`,
      primary.h2,
      primary.lead,
      blocks,
      stepCta || undefined,
    );
  });
  return {
    groups: [{ label: "Journey", tabIds: STEP_META.map((s) => s.id) }],
    tabs,
  };
}

const WALKTHROUGH =
  "mailto:brian@osscontact.com?subject=ICDU%20Walkthrough";

const out = {
  cfo: buildPersona(
    "cfo",
    ["exposure", "cost", "pricing", "roi", "conversation"],
    { label: "Scope a Pilot", href: WALKTHROUGH },
    "CFO",
  ),
  cto: buildPersona(
    "cto",
    ["challenge", "architecture", "pipeline", "roi", "next"],
    { label: "Scope a Pilot", href: WALKTHROUGH },
    "CTO",
  ),
  ciso: buildPersona(
    "ciso",
    ["threat", "controls", ["audit", "zero-trust"], "compliance", "evaluation"],
    { label: "Review Evidence", href: "/faq" },
    "CISO",
  ),
  compliance: buildPersona(
    "compliance",
    ["mandate", "frameworks", "evidence", ["reporting", "risk"], "roadmap"],
    { label: "Review Evidence", href: "/faq" },
    "COMPLIANCE",
  ),
  developer: buildPersona(
    "developer",
    ["problem", "icdu", ["quickstart", "gates"], "testing", "sdk"],
    { label: "Explore Advanced Lab", href: "/demos?mode=lab" },
    "DEVELOPER",
  ),
};

out.executive = {
  groups: [{ label: "Journey", tabIds: STEP_META.map((s) => s.id) }],
  tabs: [
    tab(
      "situation",
      "Your Situation",
      "EXECUTIVE · YOUR SITUATION",
      "AI is deployed. Organizational judgment is not.",
      "Teams ship AI features quickly, but quality, tone, and risk posture vary by prompt, model, and person. Leadership cannot see which workflows are ready — only which ones are loud.",
      [
        {
          type: "stats",
          items: [
            { value: "70–85%", label: "of AI projects miss expected outcomes" },
            {
              value: "42%",
              label: "of companies abandoned most AI initiatives in 2025",
            },
            { value: "3.2×", label: "cost of remediation vs. prevention" },
          ],
        },
        {
          type: "list",
          items: [
            {
              title: "Inconsistent work product",
              desc: "The same customer, legal, or ops task produces different answers depending on who prompted and which model answered.",
            },
            {
              title: "Opaque readiness",
              desc: "Leaders lack a shared definition of “good enough to promote” — so adoption stalls or risk accumulates quietly.",
            },
            {
              title: "Pilot sprawl",
              desc: "Experiments multiply without a repeatable path from promising demo to governed production workflow.",
            },
          ],
        },
        {
          type: "paragraph",
          text: "ICDU exists so your organization’s best judgment becomes the default for AI-assisted work — measurable, reusable, and reviewable — without replacing the AI tools already in use.",
        },
      ],
    ),
    tab(
      "changes",
      "What ICDU Changes",
      "EXECUTIVE · WHAT ICDU CHANGES",
      "From improvisation to repeatable organizational performance",
      "ICDU turns each AI-assisted task into a governed contract: what the system should do, what it may use, what must pass, and what gets recorded.",
      [
        {
          type: "list",
          items: [
            {
              title: "Better work",
              desc: "Outputs match the standard your experts would hold — clearer, more consistent, more useful on the first pass.",
            },
            {
              title: "Less waste",
              desc: "Fewer retries, less rework, and lower compute for the same volume of AI-assisted tasks.",
            },
            {
              title: "Provable control",
              desc: "Every promoted result comes with intent, checks, and outcome evidence — without turning delivery into a compliance project.",
            },
          ],
        },
        {
          type: "callout",
          variant: "info",
          title: "What does not change",
          body: "You keep your models, agents, and channels. ICDU is a readiness control plane that sits alongside them — so adoption improves because the work gets better, not because teams learn a new chat UI.",
        },
        {
          type: "checklist",
          items: [
            "Shared definition of done per workflow",
            "Promotion decisions with thresholds, not gut feel",
            "Evidence packs leaders can review in a pilot readout",
          ],
        },
      ],
    ),
    tab(
      "how",
      "How It Works",
      "EXECUTIVE · HOW IT WORKS",
      "A simple operating rhythm for AI-assisted work",
      "Every priority workflow follows the same path: encode intent, execute inside it, gate the result, keep the proof.",
      [
        {
          type: "flow",
          steps: [
            { label: "Select workflow" },
            { label: "Encode intent" },
            { label: "Run AI" },
            { label: "Readiness gate" },
            { label: "Evidence readout" },
          ],
        },
        {
          type: "list",
          items: [
            {
              title: "Intent as operating standard",
              desc: "Capture purpose, principles, allowed context, and success criteria once — then reuse across teams and model updates.",
            },
            {
              title: "Readiness before release",
              desc: "Scoring turns “looks good” into a promote / escalate / block decision tied to your contract.",
            },
            {
              title: "Pilot-sized change",
              desc: "Start with one high-value workflow. Validate quality, waste reduction, and evidence in an estimated 4–6 weeks — then scale what works.",
            },
          ],
        },
        {
          type: "paragraph",
          text: "This is how leadership drives adoption: pick the workflow that matters, make judgment explicit, and measure readiness the same way every time.",
        },
      ],
    ),
    tab(
      "evidence",
      "Evidence and Value",
      "EXECUTIVE · EVIDENCE AND VALUE",
      "What a successful pilot proves",
      "A strong ICDU pilot does not invent a new AI stack — it proves that governed execution improves work quality, reduces waste, and produces defensibility on a workflow you already care about.",
      [
        {
          type: "stats",
          items: [
            {
              value: "75%",
              label: "fewer iterative inference cycles (pilot target)",
            },
            {
              value: "75%",
              label: "fewer errors under gated evaluation (benchmark target)",
            },
            { value: "4–6 wks", label: "estimated path to validated pilot" },
          ],
        },
        {
          type: "table",
          headers: ["Leadership question", "What the pilot shows"],
          rows: [
            [
              "Is the work better?",
              "Side-by-side quality vs. unstructured prompting on one workflow",
            ],
            ["Is waste down?", "Fewer retries, escalations, and cleanup loops"],
            [
              "Can we defend it?",
              "Contract + gate decision + execution evidence pack",
            ],
            [
              "Can we scale it?",
              "Reusable intent pattern for the next 2–3 workflows",
            ],
          ],
        },
        {
          type: "callout",
          variant: "info",
          title: "How to read the numbers",
          body: "Treat efficiency figures as pilot targets or benchmark results unless labeled as sourced market statistics. The executive decision should rest on observed workflow outcomes in your environment.",
        },
      ],
    ),
    tab(
      "next",
      "Recommended Next Step",
      "EXECUTIVE · RECOMMENDED NEXT STEP",
      "Scope one pilot that leadership can actually run",
      "Pick a high-visibility AI-assisted workflow, name the owner, and walk through readiness with a concrete success readout.",
      [
        {
          type: "timeline",
          steps: [
            {
              title: "This week",
              desc: "Choose one workflow where inconsistent AI output already costs trust, time, or risk.",
            },
            {
              title: "Week 1–2",
              desc: "Encode intent with the operating owner; agree success criteria and promotion thresholds.",
            },
            {
              title: "Weeks 2–4",
              desc: "Run side-by-side: unstructured vs. ICDU-governed. Capture quality, rework, and evidence.",
            },
            {
              title: "Weeks 4–6",
              desc: "Executive readout: keep, expand, or redesign — with proof, not slides alone.",
            },
          ],
        },
        {
          type: "checklist",
          items: [
            "Named workflow owner and executive sponsor",
            "Success criteria written as observable outcomes",
            "Pilot readout date on the calendar",
          ],
        },
        {
          type: "callout",
          title: "Leadership CTA",
          body: "Scope a pilot walkthrough with the ICDU team — bring one workflow and leave with a readiness plan.",
        },
      ],
      { label: "Scope a Pilot", href: WALKTHROUGH },
    ),
  ],
};

{
  const d = out.developer.tabs.find((t) => t.id === "next");
  d.h2 = "Move from guided path to hands-on controls";
  d.lead =
    "When you are ready to inspect fields, thresholds, and JSON directly, open the Advanced Lab — Builder, Judge, HITL, and Stress with the same mock behavior.";
}

fs.writeFileSync(
  new URL("../client/src/data/journeys.json", import.meta.url),
  JSON.stringify(out, null, 2) + "\n",
);
console.log("Wrote journeys for", Object.keys(out).join(", "));
