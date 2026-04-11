// client/src/pages/Overview.tsx
import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { trackPageViewed } from "@/lib/analytics";
import { useSEO } from "@/lib/seo";
import {
  financialImpact,
  executiveMessages,
  standardBenchmarks,
} from "@/data/businessCase";

/* ═══════════════════════════════════════════════════════════════════
   Hook: useInView — observe once, fire on threshold
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

/* ═══════════════════════════════════════════════════════════════════
   Reveal — scroll-triggered fade-up wrapper
   ═══════════════════════════════════════════════════════════════════ */
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
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.8s cubic-bezier(.16,1,.3,1) ${delay}s, transform 0.8s cubic-bezier(.16,1,.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   GlowDivider — 1px gradient section separator
   ═══════════════════════════════════════════════════════════════════ */
function GlowDivider() {
  return (
    <div
      style={{
        height: 1,
        background:
          "linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent)",
        maxWidth: "80rem",
        margin: "0 auto",
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Static data derived from businessCase.ts
   ═══════════════════════════════════════════════════════════════════ */
const heroStats = [
  {
    value: financialImpact.hallucination_losses.figure,
    label: "in AI hallucination losses",
  },
  {
    value: financialImpact.project_failure_rate.figure,
    label: "of AI projects fail",
  },
  {
    value: financialImpact.eu_ai_act_max_fine.figure,
    label: "max fine per violation",
  },
  {
    value: financialImpact.remediation_costs.figure,
    label: "projected remediation costs",
  },
];

const pipelineStages = [
  {
    num: "01",
    name: "Intent Encoding",
    color: "var(--accent-blue)",
    desc: "Define what success looks like before the AI ever responds.",
    tags: ["Explicit Intent", "Governing Principles", "Persona & Tone"],
  },
  {
    num: "02",
    name: "AI Judge",
    color: "var(--accent-green)",
    desc: "Score every output against clear thresholds — block what doesn't pass.",
    tags: ["IAS", "PAS", "Alignment Score"],
  },
  {
    num: "03",
    name: "HITL Grader",
    color: "var(--accent-amber)",
    desc: "Humans score what machines miss — empathy, tone, and real-world clarity.",
    tags: ["Empathy", "Clarity", "Domain Accuracy"],
  },
  {
    num: "04",
    name: "Stress Engine",
    color: "var(--accent-red)",
    desc: "Find where your AI breaks before your users do.",
    tags: ["Role Variation", "Tone Shifts", "Constraint Pressure"],
  },
];

const capabilityCards = [
  {
    title: "Measurable Evaluation",
    desc: "From 'best-effort prompting' to quantifiable, gateable scores that close the deployment gap.",
  },
  {
    title: "Complete Traceability",
    desc: "Governance IDs link every output to its intent, constraints, and evaluation lineage.",
  },
  {
    title: "Repeatability",
    desc: "Same ICDU + same model = comparable, reproducible results across evaluations.",
  },
  {
    title: "Safety Gates",
    desc: "Automatic escalation and blocking based on configurable score thresholds.",
  },
  {
    title: "Regulatory Alignment",
    desc: "Built for EU AI Act, GDPR, and emerging US state-level compliance requirements.",
  },
  {
    title: "Domain Agnostic",
    desc: "Healthcare, legal, finance, education — one evaluation framework fits all verticals.",
  },
];

const domains = [
  { name: "Healthcare", detail: "Patient safety, clinical AI, diagnostic support" },
  { name: "Legal", detail: "Contract review, compliance, case research" },
  { name: "Finance", detail: "Risk scoring, fraud detection, advisory AI" },
  { name: "Education", detail: "Student-facing AI, assessment, content generation" },
  { name: "Insurance", detail: "Claims processing, underwriting, customer service" },
  { name: "Government", detail: "Public services, benefits administration, policy AI" },
  { name: "Customer Service", detail: "Chatbots, ticket routing, response generation" },
  { name: "HR & Recruiting", detail: "Candidate screening, employee-facing AI, onboarding" },
];

const teamMembers = [
  { name: "Brian Frerichs", initials: "BF", color: "var(--accent-blue)" },
  { name: "Jordan Martens", initials: "JM", color: "var(--accent-green)" },
  { name: "Samuel Conrad", initials: "SC", color: "var(--accent-amber)" },
];

/* ═══════════════════════════════════════════════════════════════════
   CSS — theme tokens + component classes
   ═══════════════════════════════════════════════════════════════════ */
const pageCSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400;1,9..40,500&family=Instrument+Serif:ital@0;1&family=Sora:wght@300;400;500;600;700&display=swap');

html { scroll-behavior: smooth; }

/* ── Light theme tokens (default) ── */
.lr-root {
  --lr-bg: #fafaf9;
  --lr-fg: #1a1a1a;
  --lr-fg-muted: #525252;
  --lr-fg-faint: #737373;
  --lr-fg-ghost: #a3a3a3;
  --lr-fg-whisper: #d4d4d4;
  --lr-surface: rgba(255,255,255,0.6);
  --lr-surface-hover: rgba(255,255,255,0.9);
  --lr-border: rgba(0,0,0,0.06);
  --lr-border-hover: rgba(0,0,0,0.12);
  --lr-glow-blue: rgba(37,99,235,0.08);
  --lr-glow-green: rgba(5,150,105,0.08);
  --lr-nav-bg: rgba(250,250,249,0.8);
  --accent-blue: #2563eb;
  --accent-green: #059669;
  --accent-amber: #d97706;
  --accent-red: #dc2626;
  --lr-tag-border: rgba(0,0,0,0.08);
  --lr-tag-fg: #525252;
  --lr-red-muted: rgba(220,38,38,0.1);
  --lr-grain-opacity: 0.02;
  --lr-btn-primary: #2563eb;
  --lr-btn-primary-hover: #1d4ed8;
  --lr-btn-fg: #ffffff;
  --lr-ghost-border: rgba(0,0,0,0.12);
  --lr-ghost-border-hover: rgba(0,0,0,0.2);
  --lr-ghost-hover-bg: rgba(0,0,0,0.04);

  font-family: 'DM Sans', sans-serif;
  color: var(--lr-fg);
  background: var(--lr-bg);
  min-height: 100vh;
}

/* ── Dark theme overrides ── */
.dark .lr-root {
  --lr-bg: #0a0a0a;
  --lr-fg: #fafafa;
  --lr-fg-muted: #a3a3a3;
  --lr-fg-faint: #737373;
  --lr-fg-ghost: #525252;
  --lr-fg-whisper: #2a2a2a;
  --lr-surface: rgba(255,255,255,0.04);
  --lr-surface-hover: rgba(255,255,255,0.08);
  --lr-border: rgba(255,255,255,0.06);
  --lr-border-hover: rgba(255,255,255,0.12);
  --lr-glow-blue: rgba(59,130,246,0.1);
  --lr-glow-green: rgba(16,185,129,0.1);
  --lr-nav-bg: rgba(10,10,10,0.8);
  --accent-blue: #3b82f6;
  --accent-green: #10b981;
  --accent-amber: #f59e0b;
  --accent-red: #ef4444;
  --lr-tag-border: rgba(255,255,255,0.08);
  --lr-tag-fg: #a3a3a3;
  --lr-red-muted: rgba(239,68,68,0.1);
  --lr-grain-opacity: 0.03;
  --lr-btn-primary: #3b82f6;
  --lr-btn-primary-hover: #2563eb;
  --lr-btn-fg: #ffffff;
  --lr-ghost-border: rgba(255,255,255,0.12);
  --lr-ghost-border-hover: rgba(255,255,255,0.25);
  --lr-ghost-hover-bg: rgba(255,255,255,0.06);
}

/* ── Grain overlay ── */
.lr-grain-overlay {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  opacity: var(--lr-grain-opacity);
}

/* ── Section wrapper ── */
.lr-section {
  padding: clamp(3rem, 8vw, 7rem) clamp(1.25rem, 4vw, 3rem);
  max-width: 80rem;
  margin: 0 auto;
}

/* ── Buttons ── */
.lr-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.75rem;
  background: var(--lr-btn-primary);
  color: var(--lr-btn-fg);
  border: none;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
  text-decoration: none;
}
.lr-btn-primary:hover {
  background: var(--lr-btn-primary-hover);
  transform: translateY(-1px);
}

.lr-btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.75rem;
  background: transparent;
  color: var(--lr-fg);
  border: 1px solid var(--lr-ghost-border);
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, transform 0.2s;
  text-decoration: none;
}
.lr-btn-ghost:hover {
  border-color: var(--lr-ghost-border-hover);
  background: var(--lr-ghost-hover-bg);
  transform: translateY(-1px);
}

/* ── Stat bar ── */
.lr-stat-bar {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 80rem;
  margin: 0 auto;
  padding: 2.5rem clamp(1.25rem, 4vw, 3rem);
}
.lr-stat-item {
  flex: 1 1 auto;
  min-width: 140px;
  text-align: center;
  padding: 1rem 1.5rem;
}
.lr-stat-item + .lr-stat-item {
  border-left: 1px solid var(--lr-border);
}
@media (max-width: 639px) {
  .lr-stat-item { min-width: 50%; }
  .lr-stat-item + .lr-stat-item { border-left: none; }
}

/* ── Pipeline rows ── */
.lr-pipeline-row {
  display: grid;
  grid-template-columns: 3rem 1fr;
  gap: 1rem 1.5rem;
  padding: 1.5rem 0.5rem;
  border-top: 1px solid var(--lr-border);
  transition: background 0.3s;
  border-radius: 0.5rem;
}
.lr-pipeline-row:hover {
  background: var(--lr-surface);
}
@media (min-width: 768px) {
  .lr-pipeline-row {
    grid-template-columns: 4rem 1fr;
    gap: 0 2rem;
    padding: 2rem 0.75rem;
  }
}

/* ── Capability cards ── */
.lr-cap-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}
.lr-cap-card {
  background: var(--lr-surface);
  border: 1px solid var(--lr-border);
  border-radius: 0.75rem;
  padding: 1.75rem;
  transition: background 0.3s, border-color 0.3s, box-shadow 0.3s;
}
.lr-cap-card:hover {
  background: var(--lr-surface-hover);
  border-color: var(--lr-border-hover);
  box-shadow: 0 0 24px var(--lr-glow-blue);
}

/* ── Domain rows ── */
.lr-domain-row {
  display: flex;
  align-items: baseline;
  gap: 1.5rem;
  padding: 1.25rem 0.5rem;
  border-top: 1px solid var(--lr-border);
  transition: background 0.3s, padding-left 0.3s;
  cursor: default;
}
.lr-domain-row:last-child {
  border-bottom: 1px solid var(--lr-border);
}
.lr-domain-row:hover {
  background: var(--lr-surface);
  padding-left: 1rem;
}
.lr-domain-name {
  font-family: 'Instrument Serif', serif;
  font-size: clamp(1.25rem, 2.5vw, 1.75rem);
  letter-spacing: -0.01em;
  color: var(--lr-fg);
  flex-shrink: 0;
  min-width: 10rem;
}
.lr-domain-detail {
  font-size: 0.875rem;
  color: var(--lr-fg-faint);
  transition: color 0.3s;
}
.lr-domain-row:hover .lr-domain-detail {
  color: var(--lr-fg-muted);
}
@media (max-width: 639px) {
  .lr-domain-row {
    flex-direction: column;
    gap: 0.25rem;
  }
  .lr-domain-name {
    min-width: unset;
  }
}

/* ── Benchmark cards ── */
.lr-bench-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}
.lr-bench-card {
  background: var(--lr-red-muted);
  border: 1px solid var(--lr-border);
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: border-color 0.3s;
}
.lr-bench-card:hover {
  border-color: var(--accent-red);
}

/* ── About grid ── */
.lr-about-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}
@media (min-width: 768px) {
  .lr-about-grid {
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
  }
}

/* ── Tags ── */
.lr-tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border: 1px solid var(--lr-tag-border);
  border-radius: 9999px;
  font-size: 0.75rem;
  color: var(--lr-tag-fg);
  white-space: nowrap;
}

/* ── Keyframes ── */
@keyframes lr-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(6px); }
}
`;

/* ═══════════════════════════════════════════════════════════════════
   Overview — Living Resume Landing Page
   ═══════════════════════════════════════════════════════════════════ */
export default function Overview() {
  useSEO({
    title: "ICDU — Intent-Conscious Data Unit | AI Evaluation Pipeline",
    description:
      "Patent-pending AI evaluation pipeline. From best-effort prompting to measurable, auditable, deployment-ready AI execution.",
  });

  useEffect(() => {
    trackPageViewed("overview");
  }, []);

  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleHeroMouse = useCallback((e: React.MouseEvent) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  return (
    <div className="lr-root">
      <style>{pageCSS}</style>

      {/* ── Grain texture overlay ── */}
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

      {/* ════════════════════════════════════════════════════════════
          HERO — full viewport, mouse-reactive ambient glow
          ════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        onMouseMove={handleHeroMouse}
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
        {/* Ambient glow orbs */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "40vw",
              height: "40vw",
              borderRadius: "50%",
              background: "var(--lr-glow-blue)",
              filter: "blur(80px)",
              left: `${mousePos.x}%`,
              top: `${mousePos.y}%`,
              transform: "translate(-50%, -50%)",
              transition: "left 1.2s ease-out, top 1.2s ease-out",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "30vw",
              height: "30vw",
              borderRadius: "50%",
              background: "var(--lr-glow-green)",
              filter: "blur(60px)",
              left: `${100 - mousePos.x}%`,
              top: `${100 - mousePos.y}%`,
              transform: "translate(-50%, -50%)",
              transition: "left 1.5s ease-out, top 1.5s ease-out",
            }}
          />
        </div>

        <Reveal>
          <div
            style={{
              fontSize: "0.6875rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--accent-blue)",
              marginBottom: "1.5rem",
            }}
          >
            Patent-Pending AI Evaluation Pipeline
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <h1
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "clamp(2.5rem, 7vw, 6rem)",
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: "-0.045em",
              margin: "0 0 1.5rem",
              maxWidth: "50rem",
            }}
          >
            Intent-Conscious
            <br />
            <span
              style={{
                fontWeight: 300,
                color: "var(--accent-blue)",
              }}
            >
              Data Unit
            </span>
          </h1>
        </Reveal>

        <Reveal delay={0.2}>
          <p
            style={{
              fontSize: "clamp(1rem, 1.5vw, 1.25rem)",
              lineHeight: 1.7,
              color: "var(--lr-fg-muted)",
              maxWidth: "38rem",
              margin: "0 0 2.5rem",
            }}
          >
            {executiveMessages.gapStatement}
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              justifyContent: "center",
            }}
          >
            <a href="#pipeline" className="lr-btn-primary">
              Explore the Pipeline{" "}
              <span aria-hidden="true">→</span>
            </a>
            <a href="#contact" className="lr-btn-ghost">
              Start a Conversation
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.4}>
          <div
            style={{
              fontSize: "0.625rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--lr-fg-ghost)",
              marginTop: "3rem",
            }}
          >
            By Overture Systems Solutions
          </div>
        </Reveal>

        {/* Scroll indicator — fades on scroll */}
        <div
          style={{
            position: "absolute",
            bottom: "2rem",
            left: "50%",
            transform: "translateX(-50%)",
            opacity: Math.max(0, 1 - scrollY / 200),
            transition: "opacity 0.3s",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <div
            style={{
              fontSize: "0.625rem",
              letterSpacing: "0.1em",
              color: "var(--lr-fg-ghost)",
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
              animation: "lr-bounce 2s ease-in-out infinite",
            }}
          />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          STAT BAR — 4 key metrics with vertical dividers
          ════════════════════════════════════════════════════════════ */}
      <Reveal>
        <div className="lr-stat-bar">
          {heroStats.map((stat) => (
            <div key={stat.label} className="lr-stat-item">
              <div
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                  letterSpacing: "-0.02em",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--lr-fg-faint)",
                  marginTop: "0.25rem",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      <GlowDivider />

      {/* ════════════════════════════════════════════════════════════
          THE PROBLEM
          ════════════════════════════════════════════════════════════ */}
      <section className="lr-section">
        <Reveal>
          <div
            style={{
              fontSize: "0.6875rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--accent-blue)",
              marginBottom: "1rem",
            }}
          >
            The Problem
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              marginBottom: "1.5rem",
            }}
          >
            Capability ≠ Deployability
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p
            style={{
              fontSize: "clamp(0.975rem, 1.2vw, 1.125rem)",
              lineHeight: 1.7,
              color: "var(--lr-fg-muted)",
              maxWidth: "44rem",
            }}
          >
            {executiveMessages.costOfInaction} Enterprise AI sits on a fault
            line: models score higher every quarter on standard benchmarks, yet
            hallucination losses reached{" "}
            {financialImpact.hallucination_losses.figure} in 2024 and{" "}
            {financialImpact.project_failure_rate.figure} of AI projects still
            fail to meet expected outcomes. The gap isn't capability — it's the
            absence of structured, intent-aware evaluation before deployment.
          </p>
        </Reveal>
      </section>

      <GlowDivider />

      {/* ════════════════════════════════════════════════════════════
          PIPELINE — 4 numbered stages
          ════════════════════════════════════════════════════════════ */}
      <section className="lr-section" id="pipeline">
        <Reveal>
          <div
            style={{
              fontSize: "0.6875rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--accent-green)",
              marginBottom: "1rem",
            }}
          >
            The Pipeline
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              marginBottom: "2.5rem",
            }}
          >
            How It Works
          </h2>
        </Reveal>

        <div>
          {pipelineStages.map((stage, i) => (
            <Reveal key={stage.num} delay={0.1 * i}>
              <div className="lr-pipeline-row">
                <div
                  style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontSize: "1.5rem",
                    color: stage.color,
                    fontWeight: 400,
                    paddingTop: "0.125rem",
                  }}
                >
                  {stage.num}
                </div>
                <div>
                  <div style={{ marginBottom: "0.75rem" }}>
                    <span style={{ fontWeight: 600, fontSize: "1.0625rem" }}>
                      {stage.name}
                    </span>
                    <span
                      style={{
                        color: "var(--lr-fg-ghost)",
                        margin: "0 0.625rem",
                      }}
                    >
                      ·
                    </span>
                    <span style={{ color: "var(--lr-fg-muted)" }}>
                      {stage.desc}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                    }}
                  >
                    {stage.tags.map((tag) => (
                      <span key={tag} className="lr-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <GlowDivider />

      {/* ════════════════════════════════════════════════════════════
          CAPABILITIES — 6-card grid
          ════════════════════════════════════════════════════════════ */}
      <section className="lr-section" id="capabilities">
        <Reveal>
          <div
            style={{
              fontSize: "0.6875rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--accent-blue)",
              marginBottom: "1rem",
            }}
          >
            Capabilities
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              marginBottom: "2.5rem",
            }}
          >
            ICDU Delivers
          </h2>
        </Reveal>

        <div className="lr-cap-grid">
          {capabilityCards.map((cap, i) => (
            <Reveal key={cap.title} delay={0.08 * i}>
              <div className="lr-cap-card">
                <h3
                  style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontSize: "1.25rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  {cap.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.875rem",
                    lineHeight: 1.6,
                    color: "var(--lr-fg-muted)",
                    margin: 0,
                  }}
                >
                  {cap.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <GlowDivider />

      {/* ════════════════════════════════════════════════════════════
          DOMAINS — stacked typographic list
          ════════════════════════════════════════════════════════════ */}
      <section className="lr-section">
        <Reveal>
          <div
            style={{
              fontSize: "0.6875rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--accent-green)",
              marginBottom: "1rem",
            }}
          >
            Verticals
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              marginBottom: "3rem",
            }}
          >
            One Framework. Every Industry.
          </h2>
        </Reveal>

        <div>
          {domains.map((d, i) => (
            <Reveal key={d.name} delay={0.06 * i}>
              <div className="lr-domain-row">
                <span className="lr-domain-name">{d.name}</span>
                <span className="lr-domain-detail">{d.detail}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <GlowDivider />

      {/* ════════════════════════════════════════════════════════════
          WHAT ICDU REPLACES — benchmark blind spots
          ════════════════════════════════════════════════════════════ */}
      <section className="lr-section">
        <Reveal>
          <div
            style={{
              fontSize: "0.6875rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--accent-red)",
              marginBottom: "1rem",
            }}
          >
            What ICDU Replaces
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              marginBottom: "1.5rem",
            }}
          >
            Standard Benchmarks Pass the Test. They Miss the Point.
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p
            style={{
              fontSize: "clamp(0.975rem, 1.2vw, 1.125rem)",
              lineHeight: 1.7,
              color: "var(--lr-fg-muted)",
              maxWidth: "44rem",
              marginBottom: "2.5rem",
            }}
          >
            Industry-standard benchmarks prove capability — but every one of
            them has a critical blind spot that ICDU addresses.
          </p>
        </Reveal>

        <div className="lr-bench-grid">
          {standardBenchmarks.map((bench, i) => (
            <Reveal key={bench.name} delay={0.08 * i}>
              <div className="lr-bench-card">
                <h3
                  style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontSize: "1.25rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  {bench.name}
                </h3>
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--lr-fg-muted)",
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  <span
                    style={{
                      color: "var(--accent-red)",
                      fontWeight: 500,
                    }}
                  >
                    Blind spot:
                  </span>{" "}
                  {bench.blindSpot}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <GlowDivider />

      {/* ════════════════════════════════════════════════════════════
          PULL QUOTE — contrast pair
          ════════════════════════════════════════════════════════════ */}
      <section
        className="lr-section"
        style={{ textAlign: "center", maxWidth: "56rem" }}
      >
        {/* Old-world framing */}
        <Reveal>
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--lr-fg-ghost)",
              marginBottom: "0.75rem",
            }}
          >
            Standard evaluation asks
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)",
              fontWeight: 300,
              letterSpacing: "-0.01em",
              lineHeight: 1.3,
              color: "var(--lr-fg-faint)",
            }}
          >
            &ldquo;Is this model capable?&rdquo;
          </div>
        </Reveal>

        {/* Divider — visual pivot */}
        <Reveal delay={0.16}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
              margin: "2rem auto",
              maxWidth: "12rem",
            }}
          >
            <div
              style={{
                flex: 1,
                height: 1,
                background:
                  "linear-gradient(90deg, transparent, var(--lr-fg-whisper))",
              }}
            />
            <div
              style={{
                fontSize: "0.625rem",
                fontWeight: 600,
                letterSpacing: "0.15em",
                color: "var(--accent-blue)",
                textTransform: "uppercase",
              }}
            >
              ICDU asks
            </div>
            <div
              style={{
                flex: 1,
                height: 1,
                background:
                  "linear-gradient(90deg, var(--lr-fg-whisper), transparent)",
              }}
            />
          </div>
        </Reveal>

        {/* New-world framing — the punchline */}
        <Reveal delay={0.24}>
          <div
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              fontWeight: 600,
              letterSpacing: "-0.035em",
              lineHeight: 1.2,
              color: "var(--lr-fg)",
              maxWidth: "40rem",
              margin: "0 auto",
            }}
          >
            &ldquo;Is it{" "}
            <span style={{ color: "var(--accent-blue)" }}>safe</span>,{" "}
            <span style={{ color: "var(--accent-green)" }}>aligned</span>,
            and{" "}
            <span style={{ color: "var(--accent-amber)" }}>stable enough</span>{" "}
            to deploy?&rdquo;
          </div>
        </Reveal>
      </section>

      <GlowDivider />

      {/* ════════════════════════════════════════════════════════════
          ABOUT / TEAM
          ════════════════════════════════════════════════════════════ */}
      <section className="lr-section">
        <div className="lr-about-grid">
          {/* Left — company info */}
          <div>
            <Reveal>
              <div
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--accent-blue)",
                  marginBottom: "1rem",
                }}
              >
                About
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <h2
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                  marginBottom: "1.5rem",
                }}
              >
                Overture Systems Solutions
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p
                style={{
                  fontSize: "clamp(0.975rem, 1.2vw, 1.125rem)",
                  lineHeight: 1.7,
                  color: "var(--lr-fg-muted)",
                  marginBottom: "2rem",
                }}
              >
                We build the infrastructure for trustworthy AI deployment. The
                ICDU pipeline is our patent-pending evaluation framework that
                bridges the gap between AI capability and production safety —
                giving enterprises the confidence to deploy AI in regulated,
                high-stakes environments.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                {[
                  "AI Safety",
                  "Evaluation Pipelines",
                  "Deployment Readiness",
                  "Compliance",
                ].map((svc) => (
                  <span key={svc} className="lr-tag">
                    {svc}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Right — team card */}
          <Reveal delay={0.2}>
            <div
              style={{
                border: "1px solid var(--lr-border)",
                borderRadius: "0.75rem",
                padding: "2rem",
              }}
            >
              <div
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--lr-fg-ghost)",
                  marginBottom: "1.5rem",
                }}
              >
                Inventors
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                }}
              >
                {teamMembers.map((m) => (
                  <div
                    key={m.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <div
                      style={{
                        width: "2.5rem",
                        height: "2.5rem",
                        borderRadius: "50%",
                        background: m.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {m.initials}
                    </div>
                    <span
                      style={{ fontSize: "0.9375rem", fontWeight: 500 }}
                    >
                      {m.name}
                    </span>
                  </div>
                ))}
              </div>
              <div
                style={{
                  marginTop: "1.5rem",
                  fontStyle: "italic",
                  fontSize: "0.8125rem",
                  color: "var(--lr-fg-faint)",
                }}
              >
                Patent Pending
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <GlowDivider />

      {/* ════════════════════════════════════════════════════════════
          CTA
          ════════════════════════════════════════════════════════════ */}
      <section
        className="lr-section"
        id="contact"
        style={{ textAlign: "center" }}
      >
        <Reveal>
          <h2
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              marginBottom: "1rem",
            }}
          >
            Let's Talk Deployment
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p
            style={{
              fontSize: "clamp(0.975rem, 1.2vw, 1.125rem)",
              lineHeight: 1.7,
              color: "var(--lr-fg-muted)",
              maxWidth: "32rem",
              margin: "0 auto 2.5rem",
            }}
          >
            {executiveMessages.deployability}
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              justifyContent: "center",
            }}
          >
            <a href="mailto:brian@osscontact.com" className="lr-btn-primary">
              Get in Touch
            </a>
            <a
              href="https://icdu.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="lr-btn-ghost"
            >
              icdu.ai
            </a>
          </div>
        </Reveal>
      </section>

      <GlowDivider />

      {/* ════════════════════════════════════════════════════════════
          FOOTER
          ════════════════════════════════════════════════════════════ */}
      <footer
        style={{
          padding: "2rem clamp(1.25rem, 4vw, 3rem)",
          maxWidth: "80rem",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <div
            style={{
              width: "1.5rem",
              height: "1.5rem",
              background: "var(--accent-blue)",
              borderRadius: "0.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "0.5rem",
              fontWeight: 700,
            }}
          >
            IC
          </div>
          <span
            style={{ fontSize: "0.8125rem", color: "var(--lr-fg-muted)" }}
          >
            ICDU — Overture Systems Solutions
          </span>
        </div>
        <div
          style={{ fontSize: "0.6875rem", color: "var(--lr-fg-ghost)" }}
        >
          Pre-NDA · For Discussion Only · Patent Pending · © 2026
        </div>
      </footer>
    </div>
  );
}
