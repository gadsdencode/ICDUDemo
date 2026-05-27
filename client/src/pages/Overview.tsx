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
  executiveMessages,
  efficiencyStats,
  marketBars,
  regulatoryTailwinds,
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
const heroSupportingParagraph =
  "Unlike point solutions, ICDU works alongside existing AI environments without replacing them. The architecture is protected under U.S. provisional patent filings and ready for pilot validation.";

const pipelineStages = [
  {
    num: "01",
    name: "Define",
    color: "var(--accent-blue)",
    desc: "Encode your AI's purpose as a structured, versioned ICDU spec — not a freeform prompt. Intent is explicit, testable, and version-controlled like code.",
  },
  {
    num: "02",
    name: "Gate",
    color: "var(--accent-green)",
    desc: "Safety, scope, and sensitivity checks fire before the model call. Injection attacks blocked. Data access constrained to declared fields only.",
  },
  {
    num: "03",
    name: "Execute",
    color: "var(--accent-amber)",
    desc: "The AI runs within intent-bound, gate-verified parameters. Fewer unnecessary cycles. Higher first-pass accuracy. Lower compute and energy cost.",
  },
  {
    num: "04",
    name: "Audit",
    color: "var(--accent-red)",
    desc: "A full immutable trace written for every execution — inputs, outputs, gate results, model version, and timestamps. Regulator-ready out of the box.",
  },
];

const withoutIcduItems = [
  {
    title: "Prompt injection risk",
    desc: "No input validation before model invocation — malicious inputs can redirect AI behavior or exfiltrate data.",
  },
  {
    title: "No audit trail",
    desc: "Incident response is impossible without intent logs. You can't reconstruct what the AI was supposed to do when it fails.",
  },
  {
    title: "Silent model drift",
    desc: "Upstream model updates silently break AI behaviour. You find out from a customer, not your monitoring stack.",
  },
  {
    title: "Regulatory exposure",
    desc: "EU AI Act, GDPR Art. 22, and SEC AI disclosures are in force. Non-compliance: fines up to €35M or 7% of global turnover.",
  },
];

const withIcduItems = [
  {
    title: "Intent encoding",
    desc: "Every AI action is defined as a versioned, testable ICDU spec. Intent is explicit, auditable, and rollback-able like code.",
  },
  {
    title: "Pre-execution safety gates",
    desc: "Scope, sensitivity, and injection checks fire before the model call — catching failures before they happen.",
  },
  {
    title: "Immutable audit logs",
    desc: "Cryptographically signed execution traces for every AI decision — inputs, outputs, gates, model version, timestamps.",
  },
  {
    title: "Compliance-ready artifacts",
    desc: "ICDU artifacts map directly to EU AI Act Art. 9, 12, 13, NIST AI RMF, and ISO/IEC 42001 — no custom instrumentation.",
  },
];

const strainCards = [
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

const useCaseCards = [
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

const icduChecklist = [
  "Improved first-pass task accuracy",
  "Reduced iterative inference cycles",
  "More efficient compute & energy use",
  "Structured output governance & audit",
  "Works with any AI model provider",
  "SDK-first integration in hours, not months",
];

const icduDifferentiators = [
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
.lr-stat-sublabel {
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--accent-blue);
  margin-top: 0.5rem;
}
@media (max-width: 639px) {
  .lr-stat-item { min-width: 50%; }
  .lr-stat-item + .lr-stat-item { border-left: none; }
}

/* ── Compare columns ── */
.lr-compare-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-top: 2.5rem;
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
.lr-compare-col--without {
  border-color: rgba(220, 38, 38, 0.2);
}
.lr-compare-col--with {
  border-color: rgba(5, 150, 105, 0.2);
}
.lr-compare-heading {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 1.25rem;
}
.lr-compare-item + .lr-compare-item {
  margin-top: 1.25rem;
  padding-top: 1.25rem;
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

/* ── Two-column sections ── */
.lr-two-col {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
}
@media (min-width: 768px) {
  .lr-two-col {
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
  }
}

/* ── Market bars ── */
.lr-market-bars {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.lr-market-bar-row {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.lr-market-bar-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  font-size: 0.8125rem;
}
.lr-market-bar-track {
  height: 0.5rem;
  background: var(--lr-border);
  border-radius: 9999px;
  overflow: hidden;
}
.lr-market-bar-fill {
  height: 100%;
  background: var(--accent-blue);
  border-radius: 9999px;
  transition: width 1s cubic-bezier(.16,1,.3,1);
}

/* ── Regulatory tailwinds ── */
.lr-tailwind-list {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  margin-top: 1.5rem;
}
.lr-tailwind-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.875rem 1rem;
  border: 1px solid var(--lr-border);
  border-radius: 0.5rem;
  background: var(--lr-surface);
}
.lr-tailwind-tag {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--accent-blue);
}
.lr-tailwind-desc {
  font-size: 0.8125rem;
  color: var(--lr-fg-muted);
  line-height: 1.5;
}

/* ── Use case cards ── */
.lr-use-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}
.lr-use-card {
  background: var(--lr-surface);
  border: 1px solid var(--lr-border);
  border-radius: 0.75rem;
  padding: 1.75rem;
  transition: background 0.3s, border-color 0.3s, box-shadow 0.3s;
}
.lr-use-card:hover {
  background: var(--lr-surface-hover);
  border-color: var(--lr-border-hover);
  box-shadow: 0 0 24px var(--lr-glow-green);
}
.lr-use-category {
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: var(--accent-green);
  margin-bottom: 0.75rem;
}

/* ── Checklist ── */
.lr-checklist {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}
.lr-checklist li {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--lr-fg-muted);
}
.lr-checklist li::before {
  content: "✓";
  color: var(--accent-green);
  font-weight: 700;
  flex-shrink: 0;
}

/* ── Status card ── */
.lr-status-card {
  border: 1px solid var(--lr-border);
  border-radius: 0.75rem;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.lr-status-notice {
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--lr-fg-muted);
  padding: 1rem;
  border-radius: 0.5rem;
  background: var(--lr-glow-blue);
  border: 1px solid var(--lr-border);
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
    title: "ICDU — AI That Executes With Intent",
    description:
      "ICDU is a bolt-on structured execution layer that aligns model behavior with human intent while reducing compute, energy, and operational overhead.",
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
            PATENT-PENDING AI EVALUATION PIPELINE
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
            AI that executes with intent,
            <br />
            <span
              style={{
                fontWeight: 600,
                color: "var(--accent-blue)",
              }}
            >
              not guesswork.
            </span>
          </h1>
        </Reveal>

        <Reveal delay={0.2}>
          <p
            style={{
              fontSize: "clamp(1rem, 1.5vw, 1.25rem)",
              lineHeight: 1.7,
              color: "var(--lr-fg-muted)",
              maxWidth: "42rem",
              margin: "0 auto 1.25rem",
            }}
          >
            {executiveMessages.gapStatement}
          </p>
          <p
            style={{
              fontSize: "clamp(0.875rem, 1.1vw, 1rem)",
              lineHeight: 1.7,
              color: "var(--lr-fg-faint)",
              maxWidth: "42rem",
              margin: "0 auto 2.5rem",
            }}
          >
            {heroSupportingParagraph}
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
            <a href="/journey" className="lr-btn-primary">
              Explore the Pipeline{" "}
              <span aria-hidden="true">→</span>
            </a>
            <a href="/business-case" className="lr-btn-ghost">
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
          {efficiencyStats.map((stat) => (
            <div key={stat.sublabel} className="lr-stat-item">
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
                  lineHeight: 1.4,
                }}
              >
                {stat.label}
              </div>
              <div className="lr-stat-sublabel">{stat.sublabel}</div>
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
            Prompting is not governance.
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
            {executiveMessages.costOfInaction}
          </p>
        </Reveal>

        <div className="lr-compare-grid">
          <Reveal delay={0.25}>
            <div className="lr-compare-col lr-compare-col--without">
              <div
                className="lr-compare-heading"
                style={{ color: "var(--accent-red)" }}
              >
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
          <Reveal delay={0.35}>
            <div className="lr-compare-col lr-compare-col--with">
              <div
                className="lr-compare-heading"
                style={{ color: "var(--accent-green)" }}
              >
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
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <GlowDivider />

      {/* ════════════════════════════════════════════════════════════
          WHY THIS MATTERS
          ════════════════════════════════════════════════════════════ */}
      <section className="lr-section">
        <Reveal>
          <div
            style={{
              fontSize: "0.6875rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--accent-amber)",
              marginBottom: "1rem",
            }}
          >
            Why This Matters
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              marginBottom: "1rem",
            }}
          >
            AI infrastructure is under serious strain.
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
            Data center capacity, power delivery, and compute costs are all under
            mounting pressure as AI adoption accelerates. ICDU directly addresses
            each constraint.
          </p>
        </Reveal>

        <div className="lr-two-col">
          <div>
            {strainCards.map((card, i) => (
              <Reveal key={card.title} delay={0.08 * i}>
                <div className="lr-cap-card" style={{ marginBottom: "1rem" }}>
                  <h3
                    style={{
                      fontFamily: "'Instrument Serif', serif",
                      fontSize: "1.125rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {card.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      lineHeight: 1.6,
                      color: "var(--lr-fg-muted)",
                      margin: 0,
                    }}
                  >
                    {card.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2}>
            <div>
              <div
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--lr-fg-ghost)",
                  marginBottom: "1rem",
                }}
              >
                Market Opportunity
              </div>
              <div className="lr-market-bars">
                {marketBars.map((bar) => (
                  <div key={bar.label} className="lr-market-bar-row">
                    <div className="lr-market-bar-header">
                      <span>{bar.label}</span>
                      <span style={{ fontWeight: 600 }}>{bar.value}</span>
                    </div>
                    <div className="lr-market-bar-track">
                      <div
                        className="lr-market-bar-fill"
                        style={{ width: `${bar.width * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--lr-fg-ghost)",
                  marginTop: "2rem",
                  marginBottom: "0.5rem",
                }}
              >
                Regulatory Tailwinds
              </div>
              <div className="lr-tailwind-list">
                {regulatoryTailwinds.map((item) => (
                  <div key={item.tag} className="lr-tailwind-item">
                    <span className="lr-tailwind-tag">{item.tag}</span>
                    <span className="lr-tailwind-desc">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <GlowDivider />

      {/* ════════════════════════════════════════════════════════════
          USE CASES
          ════════════════════════════════════════════════════════════ */}
      <section className="lr-section" id="use-cases">
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
            Use Cases
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
            Built for High-Stakes AI
          </h2>
        </Reveal>

        <div className="lr-use-grid">
          {useCaseCards.map((card, i) => (
            <Reveal key={card.category} delay={0.06 * i}>
              <div className="lr-use-card">
                <div className="lr-use-category">{card.category}</div>
                <h3
                  style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontSize: "1.25rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  {card.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.875rem",
                    lineHeight: 1.6,
                    color: "var(--lr-fg-muted)",
                    margin: 0,
                  }}
                >
                  {card.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <GlowDivider />

      {/* ════════════════════════════════════════════════════════════
          WHAT ICDU DOES
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
            What ICDU Does
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              marginBottom: "1rem",
            }}
          >
            A bolt-on layer. No rip-and-replace.
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
            ICDU operates alongside existing AI systems — improving how they
            execute without replacing the models already in use. Integration is
            fast, non-disruptive, and model-agnostic.
          </p>
        </Reveal>

        <div className="lr-two-col">
          <Reveal delay={0.2}>
            <ul className="lr-checklist">
              {icduChecklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="lr-status-card">
              <div
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--lr-fg-ghost)",
                }}
              >
                Protection &amp; Status
              </div>
              <div className="lr-status-notice">
                Architecture developed and protected under U.S. provisional patent
                filings. Positioned for real-world pilot validation.
              </div>
              {icduDifferentiators.map((item) => (
                <div key={item.title}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "0.9375rem",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--lr-fg-faint)",
                      lineHeight: 1.5,
                    }}
                  >
                    {item.desc}
                  </div>
                </div>
              ))}
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
            Ready to see the opportunity?
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p
            style={{
              fontSize: "clamp(0.975rem, 1.2vw, 1.125rem)",
              lineHeight: 1.7,
              color: "var(--lr-fg-muted)",
              maxWidth: "36rem",
              margin: "0 auto 1.25rem",
            }}
          >
            Request the investor deck, schedule a live walkthrough, or explore
            the pipeline interactively.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <p
            style={{
              fontSize: "clamp(0.975rem, 1.2vw, 1.125rem)",
              lineHeight: 1.7,
              fontWeight: 600,
              maxWidth: "36rem",
              margin: "0 auto 2.5rem",
            }}
          >
            If you are going to use AI, you cannot afford not to have ICDU as
            part of your solution.
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
          style={{ fontSize: "0.6875rem", color: "var(--lr-fg-ghost)", textAlign: "right", maxWidth: "28rem" }}
        >
          Architecture developed and protected under U.S. provisional patent
          filings. Positioned for real-world pilot validation. By Overture
          Systems Solutions.
        </div>
      </footer>
    </div>
  );
}
