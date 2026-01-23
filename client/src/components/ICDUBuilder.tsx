import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Check, Plus, X, FileText, RefreshCw, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { trackDemoInteraction } from "@/lib/analytics";

function generateUUID(): string {
  return 'icdu-' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

type ICDUData = {
  icdu_id: string;
  icdu_version: string;
  version: string;
  created_at: string;
  owner_team: string;
  policy_set_id: string;
  evaluation_profile_id: string;
  trace: {
    parent_icdu_id: string;
    change_note: string;
  };
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

const createDefaultICDU = (): ICDUData => ({
  icdu_id: generateUUID(),
  icdu_version: "0.1",
  version: "1.0.0",
  created_at: new Date().toISOString(),
  owner_team: "Platform",
  policy_set_id: "baseline-v1",
  evaluation_profile_id: "standard-gates-v1",
  trace: {
    parent_icdu_id: "",
    change_note: "",
  },
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
});

export function ICDUBuilder() {
  const [icdu, setIcdu] = useState<ICDUData>(createDefaultICDU);
  const [newCriteria, setNewCriteria] = useState("");
  const [newPrinciple, setNewPrinciple] = useState("");
  const [newConstraint, setNewConstraint] = useState("");
  const [copied, setCopied] = useState(false);
  const [showJson, setShowJson] = useState(false);
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

  const regenerateId = () => {
    setIcdu({
      ...icdu,
      icdu_id: generateUUID(),
      created_at: new Date().toISOString(),
    });
    trackDemoInteraction("icdu_builder", "regenerate_id");
    toast({
      title: "ID Regenerated",
      description: "New ICDU ID and timestamp created",
    });
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
    <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
      <Card className="p-3 sm:p-6">
        <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <h3 className="font-semibold text-sm sm:text-base">Build an ICDU</h3>
          </div>
          <div className="flex gap-1.5 sm:gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={regenerateId}
              className="gap-1 h-7 sm:h-8 text-[10px] sm:text-xs px-2 sm:px-3"
              data-testid="button-regenerate-id"
            >
              <RefreshCw className="h-3 w-3" />
              <span className="hidden sm:inline">New ID</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="gap-1 h-7 sm:h-8 text-[10px] sm:text-xs px-2 sm:px-3"
              data-testid="button-copy-json"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              <span className="hidden sm:inline">Copy</span>
            </Button>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-5">
          <div className="p-2.5 sm:p-3 rounded-md bg-muted/50 border">
            <div className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-2">Governance</div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 text-[10px] sm:text-xs">
              <div>
                <span className="text-muted-foreground">ID:</span>
                <span className="ml-1 font-mono text-[9px] sm:text-[10px] break-all">{icdu.icdu_id.slice(0, 20)}...</span>
              </div>
              <div>
                <span className="text-muted-foreground">Version:</span>
                <span className="ml-1">{icdu.version}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Team:</span>
                <span className="ml-1">{icdu.owner_team}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Policy:</span>
                <span className="ml-1">{icdu.policy_set_id}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] sm:text-xs">Owner Team</Label>
              <Select
                value={icdu.owner_team}
                onValueChange={(v) => setIcdu({ ...icdu, owner_team: v })}
              >
                <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Platform">Platform</SelectItem>
                  <SelectItem value="Product">Product</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Compliance">Compliance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] sm:text-xs">Policy Set</Label>
              <Select
                value={icdu.policy_set_id}
                onValueChange={(v) => setIcdu({ ...icdu, policy_set_id: v })}
              >
                <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baseline-v1">baseline-v1</SelectItem>
                  <SelectItem value="strict-v1">strict-v1</SelectItem>
                  <SelectItem value="regulated-v1">regulated-v1</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] sm:text-xs">Evaluation Profile</Label>
            <Select
              value={icdu.evaluation_profile_id}
              onValueChange={(v) => setIcdu({ ...icdu, evaluation_profile_id: v })}
            >
              <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard-gates-v1">standard-gates-v1</SelectItem>
                <SelectItem value="strict-gates-v1">strict-gates-v1</SelectItem>
                <SelectItem value="relaxed-gates-v1">relaxed-gates-v1</SelectItem>
                <SelectItem value="custom">custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 p-2.5 sm:p-3 rounded-md bg-muted/30 border">
            <div className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-2">Trace (Lineage)</div>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label className="text-[9px] sm:text-[10px]">Parent ICDU ID</Label>
                <Input
                  placeholder="e.g., icdu-abc123... (leave empty if new)"
                  value={icdu.trace.parent_icdu_id}
                  onChange={(e) =>
                    setIcdu({
                      ...icdu,
                      trace: { ...icdu.trace, parent_icdu_id: e.target.value },
                    })
                  }
                  className="h-7 sm:h-8 text-[10px] sm:text-xs"
                  data-testid="input-parent-icdu-id"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[9px] sm:text-[10px]">Change Note</Label>
                <Input
                  placeholder="e.g., Updated principles for Q2 compliance"
                  value={icdu.trace.change_note}
                  onChange={(e) =>
                    setIcdu({
                      ...icdu,
                      trace: { ...icdu.trace, change_note: e.target.value },
                    })
                  }
                  className="h-7 sm:h-8 text-[10px] sm:text-xs"
                  data-testid="input-trace-change-note"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="primary-goal" className="text-xs sm:text-sm">Intent: Primary Goal</Label>
            <Input
              id="primary-goal"
              placeholder="e.g., Reduce customer response time by 40%"
              value={icdu.intent.primary_goal}
              onChange={(e) =>
                setIcdu({
                  ...icdu,
                  intent: { ...icdu.intent, primary_goal: e.target.value },
                })
              }
              className="h-8 sm:h-9 text-xs sm:text-sm"
              data-testid="input-primary-goal"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs sm:text-sm">Success Criteria</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Accuracy above 95%"
                value={newCriteria}
                onChange={(e) => setNewCriteria(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  addItem("success_criteria", newCriteria, setNewCriteria)
                }
                className="h-8 sm:h-9 text-xs sm:text-sm"
                data-testid="input-success-criteria"
              />
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 sm:h-9 sm:w-9"
                onClick={() =>
                  addItem("success_criteria", newCriteria, setNewCriteria)
                }
                data-testid="button-add-criteria"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {icdu.intent.success_criteria.map((criteria, i) => (
                <Badge key={i} variant="secondary" className="gap-1 text-[10px] sm:text-xs">
                  {criteria}
                  <button
                    onClick={() => removeItem("success_criteria", i)}
                    className="ml-0.5"
                    data-testid={`remove-criteria-${i}`}
                  >
                    <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs sm:text-sm">Governing Principles</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., No PII disclosure"
                value={newPrinciple}
                onChange={(e) => setNewPrinciple(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  addItem("principles", newPrinciple, setNewPrinciple)
                }
                className="h-8 sm:h-9 text-xs sm:text-sm"
                data-testid="input-principle"
              />
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 sm:h-9 sm:w-9"
                onClick={() =>
                  addItem("principles", newPrinciple, setNewPrinciple)
                }
                data-testid="button-add-principle"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {icdu.principles.map((principle, i) => (
                <Badge key={i} variant="secondary" className="gap-1 text-[10px] sm:text-xs">
                  {principle}
                  <button
                    onClick={() => removeItem("principles", i)}
                    className="ml-0.5"
                    data-testid={`remove-principle-${i}`}
                  >
                    <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">Persona: Role</Label>
              <Input
                placeholder="e.g., Staff engineer"
                value={icdu.persona.role}
                onChange={(e) =>
                  setIcdu({
                    ...icdu,
                    persona: { ...icdu.persona, role: e.target.value },
                  })
                }
                className="h-8 sm:h-9 text-xs sm:text-sm"
                data-testid="input-persona-role"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">Persona: Tone</Label>
              <Input
                placeholder="e.g., Professional"
                value={icdu.persona.tone}
                onChange={(e) =>
                  setIcdu({
                    ...icdu,
                    persona: { ...icdu.persona, tone: e.target.value },
                  })
                }
                className="h-8 sm:h-9 text-xs sm:text-sm"
                data-testid="input-persona-tone"
              />
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs sm:text-sm">Context: Domain</Label>
            <Input
              placeholder="e.g., Healthcare compliance"
              value={icdu.context.domain}
              onChange={(e) =>
                setIcdu({
                  ...icdu,
                  context: { ...icdu.context, domain: e.target.value },
                })
              }
              className="h-8 sm:h-9 text-xs sm:text-sm"
              data-testid="input-domain"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs sm:text-sm">Constraints</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Max 500 tokens"
                value={newConstraint}
                onChange={(e) => setNewConstraint(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  addItem("constraints", newConstraint, setNewConstraint)
                }
                className="h-8 sm:h-9 text-xs sm:text-sm"
                data-testid="input-constraint"
              />
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 sm:h-9 sm:w-9"
                onClick={() =>
                  addItem("constraints", newConstraint, setNewConstraint)
                }
                data-testid="button-add-constraint"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {icdu.context.constraints.map((constraint, i) => (
                <Badge key={i} variant="secondary" className="gap-1 text-[10px] sm:text-xs">
                  {constraint}
                  <button
                    onClick={() => removeItem("constraints", i)}
                    className="ml-0.5"
                    data-testid={`remove-constraint-${i}`}
                  >
                    <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-3 sm:p-6 bg-muted/30">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <h3 className="font-semibold text-sm sm:text-base">JSON Output</h3>
          </div>
          <Badge variant="outline" className="text-[10px] sm:text-xs">Contract Record</Badge>
        </div>
        <div className="relative">
          <pre className="p-3 sm:p-4 rounded-md bg-background border text-[9px] sm:text-xs font-mono overflow-auto max-h-[500px] sm:max-h-[600px]">
            {JSON.stringify(icdu, null, 2)}
          </pre>
        </div>
        <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 rounded-md bg-blue-500/10 border border-blue-500/20">
          <div className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Governance Fields</div>
          <ul className="text-[9px] sm:text-xs text-muted-foreground space-y-0.5">
            <li>icdu_id: Unique identifier for this record</li>
            <li>version: Semantic versioning for changes</li>
            <li>policy_set_id: Links to organizational policies</li>
            <li>trace: Parent ID and change notes for lineage</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
