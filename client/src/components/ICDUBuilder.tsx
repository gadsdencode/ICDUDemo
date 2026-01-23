import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Plus, X, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { trackDemoInteraction } from "@/lib/analytics";

type ICDUData = {
  icdu_version: string;
  intent: {
    primary_goal: string;
    success_criteria: string[];
  };
  principles: string[];
  persona: {
    role: string;
    tone: string;
  };
  context: {
    domain: string;
    constraints: string[];
  };
  prompt: string;
};

const defaultICDU: ICDUData = {
  icdu_version: "0.1",
  intent: {
    primary_goal: "",
    success_criteria: [],
  },
  principles: [],
  persona: {
    role: "",
    tone: "",
  },
  context: {
    domain: "",
    constraints: [],
  },
  prompt: "",
};

export function ICDUBuilder() {
  const [icdu, setIcdu] = useState<ICDUData>(defaultICDU);
  const [newCriteria, setNewCriteria] = useState("");
  const [newPrinciple, setNewPrinciple] = useState("");
  const [newConstraint, setNewConstraint] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    const jsonString = JSON.stringify(icdu, null, 2);
    await navigator.clipboard.writeText(jsonString);
    setCopied(true);
    trackDemoInteraction("icdu_builder", "copy_json");
    toast({
      title: "Copied!",
      description: "ICDU JSON copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const addItem = (
    field: "success_criteria" | "principles" | "constraints",
    value: string,
    setter: (v: string) => void
  ) => {
    if (!value.trim()) return;
    trackDemoInteraction("icdu_builder", `add_${field}`);
    
    if (field === "success_criteria") {
      setIcdu({
        ...icdu,
        intent: {
          ...icdu.intent,
          success_criteria: [...icdu.intent.success_criteria, value.trim()],
        },
      });
    } else if (field === "principles") {
      setIcdu({
        ...icdu,
        principles: [...icdu.principles, value.trim()],
      });
    } else if (field === "constraints") {
      setIcdu({
        ...icdu,
        context: {
          ...icdu.context,
          constraints: [...icdu.context.constraints, value.trim()],
        },
      });
    }
    setter("");
  };

  const removeItem = (
    field: "success_criteria" | "principles" | "constraints",
    index: number
  ) => {
    if (field === "success_criteria") {
      setIcdu({
        ...icdu,
        intent: {
          ...icdu.intent,
          success_criteria: icdu.intent.success_criteria.filter((_, i) => i !== index),
        },
      });
    } else if (field === "principles") {
      setIcdu({
        ...icdu,
        principles: icdu.principles.filter((_, i) => i !== index),
      });
    } else if (field === "constraints") {
      setIcdu({
        ...icdu,
        context: {
          ...icdu.context,
          constraints: icdu.context.constraints.filter((_, i) => i !== index),
        },
      });
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Build an ICDU</h3>
        </div>

        <div className="space-y-5">
          <div className="space-y-3">
            <Label htmlFor="primary-goal">Intent: Primary Goal</Label>
            <Input
              id="primary-goal"
              placeholder="e.g., Explain a concept clearly to a non-expert"
              value={icdu.intent.primary_goal}
              onChange={(e) =>
                setIcdu({
                  ...icdu,
                  intent: { ...icdu.intent, primary_goal: e.target.value },
                })
              }
              data-testid="input-primary-goal"
            />
          </div>

          <div className="space-y-3">
            <Label>Success Criteria</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Accurate"
                value={newCriteria}
                onChange={(e) => setNewCriteria(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  addItem("success_criteria", newCriteria, setNewCriteria)
                }
                data-testid="input-success-criteria"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() =>
                  addItem("success_criteria", newCriteria, setNewCriteria)
                }
                data-testid="button-add-criteria"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {icdu.intent.success_criteria.map((criteria, i) => (
                <Badge key={i} variant="secondary" className="gap-1">
                  {criteria}
                  <button
                    onClick={() => removeItem("success_criteria", i)}
                    className="ml-1"
                    data-testid={`remove-criteria-${i}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Governing Principles</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Be truthful and cite uncertainty"
                value={newPrinciple}
                onChange={(e) => setNewPrinciple(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  addItem("principles", newPrinciple, setNewPrinciple)
                }
                data-testid="input-principle"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() =>
                  addItem("principles", newPrinciple, setNewPrinciple)
                }
                data-testid="button-add-principle"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {icdu.principles.map((principle, i) => (
                <Badge key={i} variant="secondary" className="gap-1">
                  {principle}
                  <button
                    onClick={() => removeItem("principles", i)}
                    className="ml-1"
                    data-testid={`remove-principle-${i}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="persona-role">Persona: Role</Label>
              <Input
                id="persona-role"
                placeholder="e.g., Staff engineer"
                value={icdu.persona.role}
                onChange={(e) =>
                  setIcdu({
                    ...icdu,
                    persona: { ...icdu.persona, role: e.target.value },
                  })
                }
                data-testid="input-persona-role"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="persona-tone">Persona: Tone</Label>
              <Input
                id="persona-tone"
                placeholder="e.g., Calm, direct"
                value={icdu.persona.tone}
                onChange={(e) =>
                  setIcdu({
                    ...icdu,
                    persona: { ...icdu.persona, tone: e.target.value },
                  })
                }
                data-testid="input-persona-tone"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="context-domain">Context: Domain</Label>
            <Input
              id="context-domain"
              placeholder="e.g., AI safety"
              value={icdu.context.domain}
              onChange={(e) =>
                setIcdu({
                  ...icdu,
                  context: { ...icdu.context, domain: e.target.value },
                })
              }
              data-testid="input-context-domain"
            />
          </div>

          <div className="space-y-3">
            <Label>Context: Constraints</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., No proprietary data"
                value={newConstraint}
                onChange={(e) => setNewConstraint(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  addItem("constraints", newConstraint, setNewConstraint)
                }
                data-testid="input-constraint"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() =>
                  addItem("constraints", newConstraint, setNewConstraint)
                }
                data-testid="button-add-constraint"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {icdu.context.constraints.map((constraint, i) => (
                <Badge key={i} variant="secondary" className="gap-1">
                  {constraint}
                  <button
                    onClick={() => removeItem("constraints", i)}
                    className="ml-1"
                    data-testid={`remove-constraint-${i}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="prompt">Prompt / Input</Label>
            <Textarea
              id="prompt"
              placeholder="e.g., Explain how evaluation gates improve deployment safety."
              value={icdu.prompt}
              onChange={(e) => setIcdu({ ...icdu, prompt: e.target.value })}
              rows={3}
              data-testid="input-prompt"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-muted/30">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h3 className="font-semibold">Live JSON Preview</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
            data-testid="button-copy-json"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </Button>
        </div>
        <pre className="text-xs font-mono bg-card p-4 rounded-md overflow-auto max-h-[500px] border">
          {JSON.stringify(icdu, null, 2)}
        </pre>
      </Card>
    </div>
  );
}
