import type { ComponentType } from "react";
import { cn } from "@/lib/utils";
import { trackPersonaSelected } from "@/lib/analytics";
import { getPersonaAudience } from "@/data/audience";
import {
  Briefcase,
  BarChart3,
  Cpu,
  Shield,
  Scale,
  Code2,
  ClipboardList,
  Users,
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
  ClipboardList,
  Users,
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
  selectedId?: string | null;
  actionLabel?: string;
};

export function RoleTrackSelector({
  personas,
  onSelectPersona,
  selectedId = null,
  actionLabel = "Explore this path",
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
          <section key={track.id} id={`track-${track.id}`} className="scroll-mt-24">
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
                const alias = getPersonaAudience(persona.id)?.alias;
                const selected = selectedId === persona.id;
                return (
                  <button
                    key={persona.id}
                    type="button"
                    onClick={() => handleSelect(persona)}
                    aria-pressed={selected}
                    className={cn(
                      "icdu-focus text-left rounded-xl border-2 border-[color:var(--icdu-fg-whisper)] bg-[color:var(--icdu-surface)] p-4 sm:p-5 cursor-pointer",
                      "transition-colors hover:border-[color:var(--icdu-accent)]",
                      selected && "border-[color:var(--icdu-accent)] bg-[color:var(--icdu-surface-solid)]",
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
                        <h3
                          className={cn(
                            "font-display font-medium text-xl tracking-tight text-[color:var(--icdu-fg)] m-0",
                            selected && "font-semibold",
                          )}
                        >
                          {persona.name}
                        </h3>
                        {alias ? (
                          <p className="text-xs font-medium text-[color:var(--icdu-accent)] mt-1 m-0">
                            {alias}
                          </p>
                        ) : null}
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
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--icdu-accent)]">
                        {selected ? "Selected" : actionLabel}
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
