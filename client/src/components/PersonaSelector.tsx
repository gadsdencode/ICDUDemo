import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Building2, Users, ClipboardList, Code2, Shield, Search } from "lucide-react";
import { trackPersonaSelected } from "@/lib/analytics";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  Users,
  ClipboardList,
  Code2,
  Shield,
  Search,
};

type Persona = {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  primaryConcerns: string[];
  successMetrics: string[];
};

type PersonaSelectorProps = {
  personas: Persona[];
  selectedPersona: string | null;
  onSelectPersona: (personaId: string) => void;
  compact?: boolean;
};

export function PersonaSelector({
  personas,
  selectedPersona,
  onSelectPersona,
  compact = false,
}: PersonaSelectorProps) {
  const handleSelect = (persona: Persona) => {
    trackPersonaSelected(persona.id, persona.name);
    onSelectPersona(persona.id);
  };

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {personas.map((persona) => {
          const Icon = iconMap[persona.icon] || Building2;
          const isSelected = selectedPersona === persona.id;

          return (
            <button
              key={persona.id}
              onClick={() => handleSelect(persona)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md border transition-all",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border hover-elevate"
              )}
              data-testid={`persona-compact-${persona.id}`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{persona.name}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {personas.map((persona) => {
        const Icon = iconMap[persona.icon] || Building2;
        const isSelected = selectedPersona === persona.id;

        return (
          <Card
            key={persona.id}
            className={cn(
              "p-4 cursor-pointer transition-all hover-elevate",
              isSelected && "ring-2 ring-primary"
            )}
            onClick={() => handleSelect(persona)}
            data-testid={`persona-card-${persona.id}`}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-md flex-shrink-0",
                isSelected 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm">{persona.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{persona.tagline}</p>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Primary Concerns</p>
                <div className="flex flex-wrap gap-1">
                  {persona.primaryConcerns.slice(0, 2).map((concern) => (
                    <Badge key={concern} variant="secondary" className="text-xs">
                      {concern}
                    </Badge>
                  ))}
                  {persona.primaryConcerns.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{persona.primaryConcerns.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
