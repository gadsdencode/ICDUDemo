import type { ComponentType } from "react";
import { cn } from "@/lib/utils";
import { trackPersonaSelected } from "@/lib/analytics";
import {
  Briefcase,
  BarChart3,
  Cpu,
  Shield,
  Scale,
  Code2,
  ArrowRight,
  Clock,
} from "lucide-react";

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  Briefcase,
  BarChart3,
  Cpu,
  Shield,
  Scale,
  Code2,
};

export type Persona = {
  id: string;
  name: string;
  track: "leadership" | "governance" | "technical";
  tagline: string;
  valueProposition: string;
  learnings: string[];
  estimatedMinutes: number;
  icon: string;
  primaryConcerns: string[];
  successMetrics: string[];
  recommendedStartingSection: string;
  nextAction: { label: string; href: string };
};

const tracks: {
  id: Persona["track"];
  title: string;
  description: string;
}[] = [
  {
    id: "leadership",
    title: "Leadership",
    description: "Organizational performance, ROI, and architecture decisions.",
  },
  {
    id: "governance",
    title: "Governance & Risk",
    description: "Security controls, evidence, and regulatory readiness.",
  },
  {
    id: "technical",
    title: "Technical",
    description: "Contracts, gates, CI patterns, and hands-on lab controls.",
  },
];

type RoleTrackSelectorProps = {
  personas: Persona[];
  onSelectPersona: (personaId: string) => void;
};

export function RoleTrackSelector({
  personas,
  onSelectPersona,
}: RoleTrackSelectorProps) {
  const handleSelect = (persona: Persona) => {
    trackPersonaSelected(persona.id, persona.name);
    onSelectPersona(persona.id);
  };

  return (
    <div className="space-y-10 sm:space-y-12" data-testid="role-track-selector">
      {tracks.map((track) => {
        const roles = personas.filter((p) => p.track === track.id);
        if (!roles.length) return null;
        return (
          <section key={track.id}>
            <div className="mb-4 sm:mb-5 max-w-2xl">
              <div className="icdu-section-label">{track.title}</div>
              <p className="text-sm text-[color:var(--icdu-fg-muted)] leading-relaxed m-0">
                {track.description}
              </p>
            </div>

            <div
              className={cn(
                "grid gap-4",
                roles.length >= 3
                  ? "sm:grid-cols-2 lg:grid-cols-3"
                  : "sm:grid-cols-2",
              )}
            >
              {roles.map((persona) => {
                const Icon = iconMap[persona.icon] || Briefcase;
                return (
                  <button
                    key={persona.id}
                    type="button"
                    onClick={() => handleSelect(persona)}
                    className={cn(
                      "text-left rounded-xl border border-[color:var(--icdu-border)] bg-[color:var(--icdu-surface)] p-4 sm:p-5 cursor-pointer",
                      "shadow-sm transition-all hover:border-[color:var(--icdu-border-hover)] hover:bg-[color:var(--icdu-surface-hover)] hover:shadow-md hover:-translate-y-0.5",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--icdu-blue)]",
                      "active:translate-y-0",
                    )}
                    data-testid={`persona-card-${persona.id}`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-white"
                        style={{ background: "var(--icdu-blue)" }}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-editorial text-xl tracking-tight text-[color:var(--icdu-fg)] m-0">
                          {persona.name}
                        </h3>
                        <p className="text-sm text-[color:var(--icdu-fg-muted)] mt-1 leading-snug m-0">
                          {persona.valueProposition}
                        </p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--icdu-fg-faint)] mb-1.5">
                        You will learn
                      </div>
                      <ul className="space-y-1.5 m-0 p-0 list-none">
                        {persona.learnings.map((item) => (
                          <li
                            key={item}
                            className="text-sm text-[color:var(--icdu-fg-muted)] leading-snug pl-3 relative"
                          >
                            <span className="absolute left-0 top-2 h-1.5 w-1.5 rounded-full bg-[color:var(--icdu-blue)]" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[color:var(--icdu-border)]">
                      <span className="inline-flex items-center gap-1.5 text-sm text-[color:var(--icdu-fg-muted)]">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                        ~{persona.estimatedMinutes} min
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--icdu-blue)]">
                        Explore this path
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
