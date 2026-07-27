// client/src/pages/Overview.tsx
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
} from "react";
import { Link } from "wouter";
import { trackPageViewed } from "@/lib/analytics";
import { useSEO } from "@/lib/seo";
import { SiteFooter } from "@/components/SiteFooter";

const WALKTHROUGH_URL =
  "mailto:brian@osscontact.com?subject=ICDU%20Walkthrough";

/* ═══════════════════════════════════════════════════════════════════
   Hooks
   ═══════════════════════════════════════════════════════════════════ */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useInView();
  const reduced = usePrefersReducedMotion();
  // Always keep content readable; only apply a subtle settle motion.
  const settled = visible || reduced;
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: 1,
        transform: settled ? "translateY(0)" : "translateY(10px)",
        transition: reduced
          ? undefined
          : `transform 0.55s cubic-bezier(.16,1,.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function GlowDivider() {
  return <div className="lr-divider" aria-hidden="true" />;
}

/* ═══════════════════════════════════════════════════════════════════
   Homepage content
   ═══════════════════════════════════════════════════════════════════ */
const glanceStages = [
  {
    id: "intent",
    name: "Intent",
    detail:
      "Capture what the work must achieve — purpose, audience, constraints, and success criteria — before any model runs.",
  },
  {
    id: "contract",
    name: "ICDU Contract",
    detail:
      "Encode that intent as a versioned governed contract: what the system should do, what it may use, and what must pass.",
  },
  {
    id: "execute",
    name: "AI Execution",
    detail:
      "Your existing AI tools run the task inside those bounds — no rip-and-replace, no freeform prompt drift.",
  },
  {
    id: "gate",
    name: "Readiness Gate",
    detail:
      "Outputs are scored against the contract before release. Failures escalate or block; successes promote with confidence.",
  },
  {
    id: "evidence",
    name: "Evidence",
    detail:
      "Every run leaves an immutable record — inputs, gates, model version, and outcome — ready for review or audit.",
  },
];

const withoutIcduItems = [
  {
    title: "Inconsistent judgment",
    desc: "Each prompt is a one-off. Quality depends on who wrote it, when they wrote it, and which model answered.",
  },
  {
    title: "Silent drift",
    desc: "Model updates and prompt tweaks change behavior without notice. Customers find the failures first.",
  },
  {
    title: "Rework loops",
    desc: "Vague asks drive retries, hallucinations, and human cleanup — burning compute and calendar time.",
  },
  {
    title: "No defensibility",
    desc: "When something goes wrong, there is no record of what the AI was supposed to do or what checks ran.",
  },
];

const withIcduItems = [
  {
    title: "Repeatable organizational judgment",
    desc: "Best-practice intent is encoded once, versioned, and reused — so every run reflects how your org wants work done.",
  },
  {
    title: "Bound execution",
    desc: "AI operates inside declared scope, data access, and success criteria — not open-ended improvisation.",
  },
  {
    title: "Fewer wasted cycles",
    desc: "Clear contracts raise first-pass quality and cut unnecessary inference loops, energy, and cleanup.",
  },
  {
    title: "Provable readiness",
    desc: "Gates and signed traces show what was intended, what passed, and what was released — on every task.",
  },
];

const valuePillars = [
  {
    title: "Better work",
    outcome:
      "Outputs match the standard your experts would hold — clearer, more consistent, more useful on the first pass.",
    mechanism:
      "Mechanism: versioned ICDU contracts encode success criteria, tone, and constraints so models execute against a shared definition of done.",
    accent: "var(--accent-blue)",
  },
  {
    title: "Less waste",
    outcome:
      "Fewer retries, less rework, and lower compute for the same volume of AI-assisted tasks.",
    mechanism:
      "Mechanism: readiness gates catch weak or out-of-scope results before release, cutting iterative inference and human cleanup loops.",
    accent: "var(--accent-amber)",
  },
  {
    title: "Provable control",
    outcome:
      "Every promoted result comes with a record of intent, checks, and outcome — without turning delivery into a compliance project.",
    mechanism:
      "Mechanism: immutable execution evidence is written as work completes, so governance rides along with usefulness.",
    accent: "var(--accent-green)",
  },
];

const scenario = {
  industry: "Enterprise operations",
  task: "A customer-support team uses AI to draft policy-sensitive replies to high-value accounts.",
  risk: "Without structure, replies invent policy, miss required disclosures, or tone-shift by agent and model version — creating rework, escalations, and audit gaps.",
  adds: [
    "Intent contract: approved sources, required disclosures, tone, and success criteria",
    "Readiness gate: IAS / PAS / AS thresholds before a reply can be sent",
    "Evidence: signed trace of inputs, gate scores, model version, and release decision",
  ],
  result:
    "The team ships consistent, reviewable replies that reflect company judgment — and can show exactly why a response was promoted.",
};

const rolePaths = [
  {
    title: "Leadership",
    desc: "See how ICDU improves quality, reduces waste, and clarifies ROI without replacing your AI stack.",
    href: "/journey/executive",
    cta: "Leadership journey",
  },
  {
    title: "Governance & Risk",
    desc: "Map readiness gates and evidence to the controls, frameworks, and audit questions you already own.",
    href: "/journey/ciso",
    cta: "Governance journey",
  },
  {
    title: "Technical teams",
    desc: "Integrate the Define → Gate → Execute → Audit path into existing models, SDKs, and CI/CD.",
    href: "/journey/developer",
    cta: "Technical journey",
  },
];

const evidenceItems = [
  {
    value: "75%",
    label: "Fewer iterative inference cycles in governed runs",
    kind: "Pilot target",
  },
  {
    value: "75%",
    label: "Reduction in AI errors and inaccuracies under gated evaluation",
    kind: "Benchmark result",
  },
  {
    value: "$4.1M",
    label: "Average cost of a public AI output incident",
    kind: "Sourced statistic",
    source: "IBM, 2024",
  },
  {
    value: "€35M",
    label: "Max EU AI Act fine — or 7% of global turnover",
    kind: "Sourced statistic",
    source: "EU AI Act, Art. 99",
  },
];

const pilotSteps = [
  {
    week: "Week 1",
    title: "Select the workflow",
    desc: "Pick one high-value AI-assisted task and encode its intent as an ICDU contract.",
  },
  {
    week: "Weeks 2–3",
    title: "Wire the gates",
    desc: "Connect readiness scoring and evidence to your existing model path — no rip-and-replace.",
  },
  {
    week: "Weeks 3–4",
    title: "Run side-by-side",
    desc: "Compare ungoverned vs. ICDU-governed output quality, rework, and auditability.",
  },
  {
    week: "Weeks 4–6",
    title: "Validate the pilot",
    desc: "Review evidence packs with stakeholders and decide on a production path.",
  },
];

/* ═══════════════════════════════════════════════════════════════════
   Glance flow — explanatory visual with restrained stage motion
   ═══════════════════════════════════════════════════════════════════ */
function GlanceFlow() {
  const reduced = usePrefersReducedMotion();
  const { ref, visible } = useInView(0.25);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!visible || reduced || paused) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % glanceStages.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, [visible, reduced, paused]);

  const stage = glanceStages[active];

  return (
    <div
      ref={ref}
      className="lr-glance"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="lr-glance-rail" role="list">
        {glanceStages.map((s, i) => {
          const isActive = i === active;
          const isPast = i < active;
          return (
            <button
              key={s.id}
              type="button"
              role="listitem"
              className={`lr-glance-node${isActive ? " is-active" : ""}${isPast ? " is-past" : ""}`}
              onClick={() => setActive(i)}
              aria-current={isActive ? "step" : undefined}
            >
              <span className="lr-glance-index">{String(i + 1).padStart(2, "0")}</span>
              <span className="lr-glance-name">{s.name}</span>
              {i < glanceStages.length - 1 ? (
                <span className="lr-glance-connector" aria-hidden="true">
                  <span
                    className="lr-glance-connector-fill"
                    style={{
                      transform:
                        isPast || (isActive && visible)
                          ? "scaleX(1)"
                          : "scaleX(0)",
                    }}
                  />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="lr-glance-panel" key={stage.id}>
        <div className="lr-glance-panel-label">How it works</div>
        <h3 className="lr-glance-panel-title">{stage.name}</h3>
        <p className="lr-glance-panel-body">{stage.detail}</p>
        <div className="lr-glance-progress" aria-hidden="true">
          {glanceStages.map((s, i) => (
            <span
              key={s.id}
              className={`lr-glance-dot${i === active ? " is-active" : ""}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CSS
   ═══════════════════════════════════════════════════════════════════ */
const pageCSS = `
.lr-root {
  --lr-bg: var(--icdu-bg);
  --lr-fg: var(--icdu-fg);
  --lr-fg-muted: var(--icdu-fg-muted);
  --lr-fg-faint: var(--icdu-fg-faint);
  --lr-fg-ghost: var(--icdu-fg-ghost);
  --lr-fg-whisper: var(--icdu-fg-whisper);
  --lr-surface: var(--icdu-surface);
  --lr-surface-hover: var(--icdu-surface-hover);
  --lr-border: var(--icdu-border);
  --lr-border-hover: var(--icdu-border-hover);
  --lr-glow-blue: var(--icdu-glow-blue);
  --lr-glow-green: var(--icdu-glow-green);
  --accent-blue: var(--icdu-blue);
  --accent-green: var(--icdu-green);
  --accent-amber: var(--icdu-amber);
  --accent-red: var(--icdu-red);
  --lr-grain-opacity: var(--icdu-grain-opacity);
  --lr-btn-primary: var(--icdu-blue);
  --lr-btn-primary-hover: var(--icdu-blue-hover);
  --lr-btn-fg: #ffffff;
  --lr-ghost-border: var(--icdu-border-hover);
  --lr-ghost-border-hover: var(--icdu-fg-ghost);
  --lr-ghost-hover-bg: var(--elevate-1);
  --lr-ease: cubic-bezier(.16,1,.3,1);

  font-family: var(--font-sans);
  color: var(--lr-fg);
  background: var(--lr-bg);
  min-height: 100vh;
}

.lr-grain-overlay {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  opacity: var(--lr-grain-opacity);
}

.lr-section {
  padding: clamp(2.75rem, 7vw, 5.5rem) clamp(1.25rem, 4vw, 3rem);
  max-width: 80rem;
  margin: 0 auto;
}

.lr-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent);
  max-width: 80rem;
  margin: 0 auto;
}

.lr-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--accent-blue);
  margin-bottom: 0.75rem;
}

.lr-heading {
  font-family: var(--font-editorial);
  font-size: clamp(1.85rem, 3.8vw, 3.15rem);
  line-height: 1.12;
  letter-spacing: -0.02em;
  margin: 0 0 1rem;
  font-weight: 400;
}

.lr-lead {
  font-size: clamp(0.975rem, 1.2vw, 1.125rem);
  line-height: 1.7;
  color: var(--lr-fg-muted);
  max-width: 42rem;
  margin: 0;
}

.lr-btn-primary,
.lr-btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: var(--font-sans);
  cursor: pointer;
  text-decoration: none;
  transition: background 0.2s var(--lr-ease), border-color 0.2s var(--lr-ease), transform 0.2s var(--lr-ease);
}

.lr-btn-primary {
  background: var(--lr-btn-primary);
  color: var(--lr-btn-fg);
  border: none;
}
.lr-btn-primary:hover {
  background: var(--lr-btn-primary-hover);
  transform: translateY(-1px);
}

.lr-btn-ghost {
  background: transparent;
  color: var(--lr-fg);
  border: 1px solid var(--lr-ghost-border);
}
.lr-btn-ghost:hover {
  border-color: var(--lr-ghost-border-hover);
  background: var(--lr-ghost-hover-bg);
  transform: translateY(-1px);
}

.lr-cta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.lr-compare-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-top: 2.25rem;
}
@media (min-width: 768px) {
  .lr-compare-grid {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
}
.lr-compare-col {
  border: 1px solid var(--lr-border);
  border-radius: 0.75rem;
  padding: 1.75rem;
  background: var(--lr-surface);
}
.lr-compare-col--without { border-color: rgba(220, 38, 38, 0.22); }
.lr-compare-col--with { border-color: rgba(5, 150, 105, 0.22); }
.lr-compare-heading {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 1.25rem;
}
.lr-compare-item + .lr-compare-item {
  margin-top: 1.15rem;
  padding-top: 1.15rem;
  border-top: 1px solid var(--lr-border);
}
.lr-compare-item-title {
  font-weight: 600;
  font-size: 0.9375rem;
  margin-bottom: 0.35rem;
}
.lr-compare-item-desc {
  font-size: 0.8125rem;
  line-height: 1.55;
  color: var(--lr-fg-muted);
  margin: 0;
}

/* Glance flow */
.lr-glance {
  margin-top: 2.5rem;
  display: grid;
  gap: 1.75rem;
}
@media (min-width: 900px) {
  .lr-glance {
    grid-template-columns: 1.15fr 0.85fr;
    gap: 2.5rem;
    align-items: stretch;
  }
}
.lr-glance-rail {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid var(--lr-border);
  border-radius: 0.75rem;
  background: var(--lr-surface);
  overflow: hidden;
}
.lr-glance-node {
  position: relative;
  display: grid;
  grid-template-columns: 3rem 1fr;
  gap: 0.75rem;
  align-items: center;
  width: 100%;
  text-align: left;
  padding: 1.15rem 1.25rem;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--lr-border);
  color: var(--lr-fg-faint);
  cursor: pointer;
  font-family: var(--font-sans);
  transition: background 0.25s var(--lr-ease), color 0.25s var(--lr-ease);
}
.lr-glance-node:last-child { border-bottom: none; }
.lr-glance-node:hover { color: var(--lr-fg); background: var(--lr-surface-hover); }
.lr-glance-node.is-active {
  color: var(--lr-fg);
  background: var(--lr-glow-blue);
}
.lr-glance-node.is-past .lr-glance-index { color: var(--accent-blue); }
.lr-glance-index {
  font-family: var(--font-editorial);
  font-size: 1.25rem;
  color: var(--lr-fg-ghost);
  transition: color 0.25s var(--lr-ease);
}
.lr-glance-node.is-active .lr-glance-index { color: var(--accent-blue); }
.lr-glance-name {
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.lr-glance-connector {
  display: none;
}
.lr-glance-panel {
  border: 1px solid var(--lr-border);
  border-radius: 0.75rem;
  padding: 1.75rem;
  background: var(--lr-surface);
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 14rem;
  animation: lr-panel-in 0.45s var(--lr-ease);
}
.lr-glance-panel-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--lr-fg-ghost);
  margin-bottom: 0.75rem;
}
.lr-glance-panel-title {
  font-family: var(--font-editorial);
  font-size: clamp(1.5rem, 2.5vw, 2rem);
  margin: 0 0 0.75rem;
  letter-spacing: -0.02em;
  font-weight: 400;
}
.lr-glance-panel-body {
  font-size: 0.9375rem;
  line-height: 1.65;
  color: var(--lr-fg-muted);
  margin: 0;
}
.lr-glance-progress {
  display: flex;
  gap: 0.4rem;
  margin-top: 1.5rem;
}
.lr-glance-dot {
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 9999px;
  background: var(--lr-fg-whisper);
  transition: background 0.25s, transform 0.25s;
}
.lr-glance-dot.is-active {
  background: var(--accent-blue);
  transform: scale(1.25);
}

@keyframes lr-panel-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Pillars */
.lr-pillar-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  margin-top: 2.25rem;
}
@media (min-width: 768px) {
  .lr-pillar-grid { grid-template-columns: repeat(3, 1fr); }
}
.lr-pillar {
  border: 1px solid var(--lr-border);
  border-radius: 0.75rem;
  padding: 1.75rem;
  background: var(--lr-surface);
  transition: border-color 0.3s var(--lr-ease), background 0.3s var(--lr-ease);
}
.lr-pillar:hover {
  border-color: var(--lr-border-hover);
  background: var(--lr-surface-hover);
}
.lr-pillar-title {
  font-family: var(--font-editorial);
  font-size: 1.5rem;
  margin: 0 0 0.75rem;
  letter-spacing: -0.02em;
  font-weight: 400;
}
.lr-pillar-outcome {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--lr-fg-muted);
  margin: 0 0 1rem;
}
.lr-pillar-mechanism {
  font-size: 0.8125rem;
  line-height: 1.55;
  color: var(--lr-fg-faint);
  margin: 0;
  padding-top: 1rem;
  border-top: 1px solid var(--lr-border);
}

/* Scenario */
.lr-scenario {
  margin-top: 2.25rem;
  border: 1px solid var(--lr-border);
  border-radius: 0.75rem;
  background: var(--lr-surface);
  overflow: hidden;
}
.lr-scenario-grid {
  display: grid;
  grid-template-columns: 1fr;
}
@media (min-width: 768px) {
  .lr-scenario-grid { grid-template-columns: 1fr 1fr; }
}
.lr-scenario-block {
  padding: 1.5rem 1.75rem;
  border-bottom: 1px solid var(--lr-border);
}
@media (min-width: 768px) {
  .lr-scenario-block:nth-child(odd) { border-right: 1px solid var(--lr-border); }
  .lr-scenario-block:nth-last-child(-n+2) { border-bottom: none; }
}
.lr-scenario-kicker {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--lr-fg-ghost);
  margin-bottom: 0.5rem;
}
.lr-scenario-text {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--lr-fg-muted);
  margin: 0;
}
.lr-scenario-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}
.lr-scenario-list li {
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--lr-fg-muted);
  padding-left: 1rem;
  position: relative;
}
.lr-scenario-list li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.55rem;
  width: 0.35rem;
  height: 0.35rem;
  border-radius: 9999px;
  background: var(--accent-blue);
}
.lr-scenario-footer {
  padding: 1.25rem 1.75rem;
  border-top: 1px solid var(--lr-border);
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  background: var(--lr-glow-blue);
}

/* Roles */
.lr-role-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-top: 2.25rem;
}
@media (min-width: 768px) {
  .lr-role-grid { grid-template-columns: repeat(3, 1fr); }
}
.lr-role-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
  border: 1px solid var(--lr-border);
  border-radius: 0.75rem;
  background: var(--lr-surface);
  text-decoration: none;
  color: inherit;
  transition: border-color 0.3s var(--lr-ease), background 0.3s var(--lr-ease), transform 0.2s var(--lr-ease);
}
.lr-role-card:hover {
  border-color: var(--lr-border-hover);
  background: var(--lr-surface-hover);
  transform: translateY(-2px);
}
.lr-role-title {
  font-family: var(--font-editorial);
  font-size: 1.35rem;
  margin: 0;
  letter-spacing: -0.02em;
  font-weight: 400;
}
.lr-role-desc {
  font-size: 0.875rem;
  line-height: 1.55;
  color: var(--lr-fg-muted);
  margin: 0;
  flex: 1;
}
.lr-role-cta {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--accent-blue);
}

/* Evidence */
.lr-evidence-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 2.25rem;
}
@media (min-width: 768px) {
  .lr-evidence-grid { grid-template-columns: repeat(4, 1fr); }
}
.lr-evidence-card {
  border: 1px solid var(--lr-border);
  border-radius: 0.75rem;
  padding: 1.35rem 1.25rem;
  background: var(--lr-surface);
  text-align: center;
}
.lr-evidence-value {
  font-family: var(--font-editorial);
  font-size: clamp(1.6rem, 2.5vw, 2.15rem);
  letter-spacing: -0.02em;
  margin-bottom: 0.4rem;
}
.lr-evidence-label {
  font-size: 0.75rem;
  line-height: 1.45;
  color: var(--lr-fg-faint);
  margin: 0 0 0.75rem;
}
.lr-evidence-kind {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent-blue);
  border: 1px solid var(--lr-border);
  border-radius: 9999px;
  padding: 0.2rem 0.55rem;
}
.lr-evidence-source {
  display: block;
  margin-top: 0.45rem;
  font-size: 0.65rem;
  color: var(--lr-fg-ghost);
}

/* Pilot */
.lr-pilot-note {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--lr-fg-ghost);
  margin-bottom: 1.5rem;
}
.lr-pilot-rail {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  border-top: 1px solid var(--lr-border);
}
@media (min-width: 768px) {
  .lr-pilot-rail { grid-template-columns: repeat(4, 1fr); }
}
.lr-pilot-step {
  padding: 1.5rem 1.25rem 1.5rem 0;
  border-bottom: 1px solid var(--lr-border);
}
@media (min-width: 768px) {
  .lr-pilot-step {
    border-bottom: none;
    border-right: 1px solid var(--lr-border);
    padding: 1.75rem 1.5rem 0 0;
  }
  .lr-pilot-step:last-child { border-right: none; padding-right: 0; }
}
.lr-pilot-week {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--accent-blue);
  margin-bottom: 0.5rem;
}
.lr-pilot-title {
  font-weight: 600;
  font-size: 0.975rem;
  margin: 0 0 0.4rem;
}
.lr-pilot-desc {
  font-size: 0.8125rem;
  line-height: 1.55;
  color: var(--lr-fg-muted);
  margin: 0;
}

@keyframes lr-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(6px); }
}

@media (max-width: 639px) {
  .lr-scroll-cue { display: none !important; }
  .lr-hero-credit { margin-top: 1.75rem !important; }
}

@media (prefers-reduced-motion: reduce) {
  .lr-root *,
  .lr-root *::before,
  .lr-root *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  .lr-glance-panel { animation: none; }
}
`;

/* ═══════════════════════════════════════════════════════════════════
   Overview — Buyer-first homepage
   ═══════════════════════════════════════════════════════════════════ */
export default function Overview() {
  useSEO({
    title: "ICDU — AI That Executes With Intent",
    description:
      "ICDU is the readiness control plane for AI-generated work. Turn every AI task into a governed contract — better work, less waste, provable control.",
  });

  useEffect(() => {
    trackPageViewed("overview");
  }, []);

  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const heroGlowStyle = (left: number, top: number, size: string, glow: string): CSSProperties => ({
    position: "absolute",
    width: size,
    height: size,
    borderRadius: "50%",
    background: glow,
    filter: "blur(80px)",
    left: `${left}%`,
    top: `${top}%`,
    transform: "translate(-50%, -50%)",
  });

  return (
    <div className="lr-root">
      <style>{pageCSS}</style>

      <svg className="lr-grain-overlay" aria-hidden="true">
        <filter id="lr-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves={3}
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#lr-grain)" />
      </svg>

      {/* ── 1. Premium hero — visible immediately ── */}
      <section
        ref={heroRef}
        style={{
          position: "relative",
          minHeight: "calc(100vh - 3.5rem)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "4rem clamp(1.25rem, 4vw, 3rem) 3rem",
          overflow: "hidden",
        }}
      >
        <div
          style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}
          aria-hidden="true"
        >
          <div style={heroGlowStyle(28, 32, "42vw", "var(--lr-glow-blue)")} />
          <div style={heroGlowStyle(72, 68, "32vw", "var(--lr-glow-green)")} />
        </div>

        <div
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--accent-blue)",
            marginBottom: "1.5rem",
          }}
        >
          Patent-pending AI readiness control plane
        </div>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.5rem, 7vw, 6rem)",
            fontWeight: 600,
            lineHeight: 1.05,
            letterSpacing: "-0.045em",
            margin: "0 0 1.5rem",
            maxWidth: "50rem",
          }}
        >
          AI that executes with intent,
          <br />
          <span style={{ color: "var(--accent-blue)" }}>not guesswork.</span>
        </h1>

        <p
          style={{
            fontSize: "clamp(1.05rem, 1.6vw, 1.3rem)",
            lineHeight: 1.55,
            fontWeight: 500,
            color: "var(--lr-fg)",
            maxWidth: "40rem",
            margin: "0 auto 1rem",
          }}
        >
          ICDU is the readiness control plane for AI-generated work.
        </p>

        <p
          style={{
            fontSize: "clamp(0.95rem, 1.2vw, 1.1rem)",
            lineHeight: 1.7,
            color: "var(--lr-fg-muted)",
            maxWidth: "42rem",
            margin: "0 auto 1rem",
          }}
        >
          ICDU turns every AI task into a governed contract—defining what the
          system should do, what it may use, what must pass, and what gets
          recorded.
        </p>

        <p
          style={{
            fontSize: "clamp(0.875rem, 1.1vw, 1rem)",
            lineHeight: 1.7,
            color: "var(--lr-fg-faint)",
            maxWidth: "40rem",
            margin: "0 auto 2.5rem",
          }}
        >
          Make your organization&apos;s best judgment repeatable across every
          AI-assisted task, without replacing the AI tools you already use.
        </p>

        <div className="lr-cta-row" style={{ justifyContent: "center" }}>
          <Link href="/demos" className="lr-btn-primary">
            See ICDU in Action <span aria-hidden="true">→</span>
          </Link>
          <a href={WALKTHROUGH_URL} className="lr-btn-ghost">
            Scope a Pilot
          </a>
        </div>

        <div
          className="lr-hero-credit"
          style={{
            fontSize: "0.75rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--lr-fg-faint)",
            marginTop: "2.5rem",
          }}
        >
          By Overture Systems Solutions
        </div>

        <div
          className="lr-scroll-cue"
          style={{
            position: "absolute",
            bottom: "1.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            opacity: Math.max(0, 1 - scrollY / 200),
            transition: reduced ? undefined : "opacity 0.3s",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.1em",
              color: "var(--lr-fg-faint)",
              textTransform: "uppercase",
            }}
          >
            Scroll
          </div>
          <div
            style={{
              width: 1,
              height: "2rem",
              background: "var(--lr-fg-ghost)",
              animation: reduced ? undefined : "lr-bounce 2s ease-in-out infinite",
            }}
          />
        </div>
      </section>

      <GlowDivider />

      {/* ── 2. ICDU in One Glance ── */}
      <section className="lr-section" id="how-it-works">
        <Reveal>
          <div className="lr-label">ICDU in One Glance</div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="lr-heading">From intent to evidence — without guesswork.</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="lr-lead">
            Every AI-assisted task follows the same readiness path: define the
            contract, execute inside it, gate the result, keep the proof.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <GlanceFlow />
        </Reveal>
      </section>

      <GlowDivider />

      {/* ── 3. Before / With ICDU ── */}
      <section className="lr-section" id="comparison">
        <Reveal>
          <div className="lr-label">The Difference</div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="lr-heading">Inconsistent work vs. repeatable judgment.</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="lr-lead">
            Prompting alone produces different answers for the same job.
            ICDU makes your organization&apos;s best judgment the default —
            run after run.
          </p>
        </Reveal>

        <div className="lr-compare-grid">
          <Reveal delay={0.15}>
            <div className="lr-compare-col lr-compare-col--without">
              <div className="lr-compare-heading" style={{ color: "var(--accent-red)" }}>
                Without ICDU
              </div>
              {withoutIcduItems.map((item) => (
                <div key={item.title} className="lr-compare-item">
                  <div className="lr-compare-item-title">{item.title}</div>
                  <p className="lr-compare-item-desc">{item.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.25}>
            <div className="lr-compare-col lr-compare-col--with">
              <div className="lr-compare-heading" style={{ color: "var(--accent-green)" }}>
                With ICDU
              </div>
              {withIcduItems.map((item) => (
                <div key={item.title} className="lr-compare-item">
                  <div className="lr-compare-item-title">{item.title}</div>
                  <p className="lr-compare-item-desc">{item.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <GlowDivider />

      {/* ── 4. Three value pillars ── */}
      <section className="lr-section" id="outcomes">
        <Reveal>
          <div className="lr-label">What You Get</div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="lr-heading">Three balanced outcomes.</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="lr-lead">
            Governance matters — but ICDU earns its place by improving the work
            itself: quality, efficiency, and usefulness together.
          </p>
        </Reveal>

        <div className="lr-pillar-grid">
          {valuePillars.map((pillar, i) => (
            <Reveal key={pillar.title} delay={0.08 * i}>
              <div className="lr-pillar">
                <h3 className="lr-pillar-title" style={{ color: pillar.accent }}>
                  {pillar.title}
                </h3>
                <p className="lr-pillar-outcome">{pillar.outcome}</p>
                <p className="lr-pillar-mechanism">{pillar.mechanism}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <GlowDivider />

      {/* ── 5. Concrete business scenario ── */}
      <section className="lr-section" id="scenario">
        <Reveal>
          <div className="lr-label">In Practice</div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="lr-heading">One workflow. Clearer results.</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="lr-lead">{scenario.industry}</p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="lr-scenario">
            <div className="lr-scenario-grid">
              <div className="lr-scenario-block">
                <div className="lr-scenario-kicker">The task</div>
                <p className="lr-scenario-text">{scenario.task}</p>
              </div>
              <div className="lr-scenario-block">
                <div className="lr-scenario-kicker">What can go wrong</div>
                <p className="lr-scenario-text">{scenario.risk}</p>
              </div>
              <div className="lr-scenario-block">
                <div className="lr-scenario-kicker">What ICDU adds</div>
                <ul className="lr-scenario-list">
                  {scenario.adds.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="lr-scenario-block">
                <div className="lr-scenario-kicker">The result</div>
                <p className="lr-scenario-text">{scenario.result}</p>
              </div>
            </div>
            <div className="lr-scenario-footer">
              <p className="lr-scenario-text" style={{ maxWidth: "32rem" }}>
                Walk the same path in the live demos — builder, judge, rubric,
                and stress engine.
              </p>
              <Link href="/demos" className="lr-btn-primary">
                Open the Interactive Demo <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <GlowDivider />

      {/* ── 6. Role-based entry points ── */}
      <section className="lr-section" id="roles">
        <Reveal>
          <div className="lr-label">Start Where You Sit</div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="lr-heading">Role-based paths into ICDU.</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="lr-lead">
            Choose a concise journey — not a persona grid. Each path focuses on
            the decisions your team actually owns.
          </p>
        </Reveal>

        <div className="lr-role-grid">
          {rolePaths.map((role, i) => (
            <Reveal key={role.title} delay={0.08 * i}>
              <Link href={role.href} className="lr-role-card">
                <h3 className="lr-role-title">{role.title}</h3>
                <p className="lr-role-desc">{role.desc}</p>
                <span className="lr-role-cta">
                  {role.cta} <span aria-hidden="true">→</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <GlowDivider />

      {/* ── 7. Evidence ── */}
      <section className="lr-section" id="evidence">
        <Reveal>
          <div className="lr-label">Evidence</div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="lr-heading">Strong numbers — clearly labeled.</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="lr-lead">
            We separate pilot targets, benchmark results, and sourced market
            statistics so buyers can weigh them appropriately.
          </p>
        </Reveal>

        <div className="lr-evidence-grid">
          {evidenceItems.map((item, i) => (
            <Reveal key={item.label} delay={0.06 * i}>
              <div className="lr-evidence-card">
                <div className="lr-evidence-value">{item.value}</div>
                <p className="lr-evidence-label">{item.label}</p>
                <span className="lr-evidence-kind">{item.kind}</span>
                {item.source ? (
                  <span className="lr-evidence-source">{item.source}</span>
                ) : null}
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3}>
          <div style={{ marginTop: "1.75rem" }}>
            <Link href="/faq" className="lr-btn-ghost">
              Evidence &amp; Research <span aria-hidden="true">→</span>
            </Link>
          </div>
        </Reveal>
      </section>

      <GlowDivider />

      {/* ── 8. Pilot path ── */}
      <section className="lr-section" id="pilot">
        <Reveal>
          <div className="lr-label">Pilot Path</div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="lr-heading">From selected workflow to validated pilot.</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <span className="lr-pilot-note">Estimated timeline: 4–6 weeks</span>
          <p className="lr-lead" style={{ marginTop: "0.5rem" }}>
            A practical path for one high-value AI-assisted workflow — scoped,
            measurable, and designed to produce evidence your stakeholders can
            review.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="lr-pilot-rail">
            {pilotSteps.map((step) => (
              <div key={step.week} className="lr-pilot-step">
                <div className="lr-pilot-week">{step.week}</div>
                <h3 className="lr-pilot-title">{step.title}</h3>
                <p className="lr-pilot-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <GlowDivider />

      {/* ── 9. Final conversion CTA ── */}
      <section
        className="lr-section"
        id="contact"
        style={{ textAlign: "center" }}
      >
        <Reveal>
          <h2 className="lr-heading" style={{ maxWidth: "36rem", marginInline: "auto" }}>
            Ready to make AI work more useful — and more defensible?
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="lr-lead" style={{ marginInline: "auto", marginBottom: "2rem" }}>
            Walk through a live readiness path, or explore the interactive demos
            with your own workflow in mind.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="lr-cta-row" style={{ justifyContent: "center" }}>
            <a href={WALKTHROUGH_URL} className="lr-btn-primary">
              Book a Walkthrough
            </a>
            <Link href="/demos" className="lr-btn-ghost">
              Explore the Live Demo
            </Link>
          </div>
        </Reveal>
      </section>

      <GlowDivider />

      <SiteFooter />
    </div>
  );
}
