import { useState } from "react";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const workspace = useWorkspace();
  const icdu: ICDUData = {
    icdu_id: workspace.contract.icdu_id,
    icdu_version: "0.1",
    version: "1.0.0",
    created_at: workspace.contract.created_at,
    owner_team: workspace.contract.owner_team,
    policy_set_id: workspace.contract.policy_set_id,
    evaluation_profile_id: workspace.contract.evaluation_profile_id,
    trace: workspace.contract.trace,
    intent: workspace.contract.intent,
    principles: workspace.contract.principles,
    persona: workspace.contract.persona,
    context: workspace.contract.context,
    prompt: workspace.contract.prompt,
  };
  const setIcdu = (next: ICDUData) => {
    if (next.icdu_id !== workspace.contract.icdu_id) {
      workspace.newContractIdentity();
      return;
    }
    workspace.editContract({
      owner_team: next.owner_team,
      policy_set_id: next.policy_set_id,
      evaluation_profile_id: next.evaluation_profile_id,
      trace: next.trace,
      intent: next.intent,
      principles: next.principles,
      persona: next.persona,
      context: next.context,
      prompt: next.prompt,
    });
  };
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

  const withCurrent = (current: string, presets: string[]) =>
    current && !presets.includes(current) ? [current, ...presets] : presets;

  const listField = (
    field: "success_criteria" | "principles" | "constraints",
    label: string,
    placeholder: string,
    draft: string,
    setDraft: (value: string) => void,
    items: string[],
    inputId: string,
    addId: string,
    removePrefix: string,
  ) => (
    <div className="icdu-list">
      <p className="icdu-label">{label}</p>
      {items.length === 0 ? <p className="icdu-empty">None yet. Add the first item below.</p> : null}
      <ul>
        {items.map((item, i) => (
          <li key={i}>
            <span>{item}</span>
            <button type="button" className="icdu-focus" onClick={() => removeItem(field, i)} data-testid={`${removePrefix}-${i}`}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      <div className="icdu-inline">
        <input
          id={inputId}
          className="icdu-control"
          placeholder={placeholder}
          value={draft}
          aria-label={label}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && addItem(field, draft, setDraft)}
          data-testid={inputId}
        />
        <button type="button" className="icdu-quiet icdu-focus" onClick={() => addItem(field, draft, setDraft)} data-testid={addId}>
          Add
        </button>
      </div>
    </div>
  );

  return (
    <div className="icdu-builder">
      <div className="icdu-lab-toolbar">
        <div>
          <h3>Contract draft</h3>
          <p className="icdu-work-meta">Visitor draft {icdu.icdu_id} · version {icdu.version}. Naming a policy does not ingest it.</p>
        </div>
        <div className="icdu-actions">
          <button type="button" className="icdu-quiet icdu-focus" onClick={regenerateId} data-testid="button-regenerate-id">
            New ID
          </button>
          <button type="button" className="icdu-quiet icdu-focus" onClick={handleCopy} data-testid="button-copy-json">
            {copied ? "Copied" : "Copy JSON"}
          </button>
        </div>
      </div>

      <div className="icdu-group">
        <h3>Governance</h3>
        <dl className="icdu-meta-grid">
          <div><dt>ID</dt><dd>{icdu.icdu_id}</dd></div>
          <div><dt>Version</dt><dd>{icdu.version}</dd></div>
          <div><dt>Team</dt><dd>{icdu.owner_team || "Unset"}</dd></div>
          <div><dt>Policy</dt><dd>{icdu.policy_set_id || "Unset"}</dd></div>
        </dl>
        <div className="icdu-field-row">
          <label className="icdu-field">
            <span className="icdu-label">Owner team</span>
            <Select value={icdu.owner_team} onValueChange={(v) => setIcdu({ ...icdu, owner_team: v })}>
              <SelectTrigger className="icdu-control"><SelectValue /></SelectTrigger>
              <SelectContent>
                {withCurrent(icdu.owner_team, ["Platform", "Product", "Engineering", "Compliance"]).map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="icdu-field">
            <span className="icdu-label">Policy set</span>
            <Select value={icdu.policy_set_id} onValueChange={(v) => setIcdu({ ...icdu, policy_set_id: v })}>
              <SelectTrigger className="icdu-control"><SelectValue /></SelectTrigger>
              <SelectContent>
                {withCurrent(icdu.policy_set_id, ["baseline-v1", "strict-v1", "regulated-v1"]).map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </div>
        <label className="icdu-field">
          <span className="icdu-label">Evaluation profile</span>
          <Select value={icdu.evaluation_profile_id} onValueChange={(v) => setIcdu({ ...icdu, evaluation_profile_id: v })}>
            <SelectTrigger className="icdu-control"><SelectValue /></SelectTrigger>
            <SelectContent>
              {withCurrent(icdu.evaluation_profile_id, ["standard-gates-v1", "strict-gates-v1", "relaxed-gates-v1", "custom"]).map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </div>

      <div className="icdu-group">
        <h3>Trace</h3>
        <p className="icdu-work-meta">Lineage for this draft. Leave the parent blank when the record is new.</p>
        <label className="icdu-field" htmlFor="input-parent-icdu-id">
          <span className="icdu-label">Parent ICDU ID</span>
          <input
            id="input-parent-icdu-id"
            className="icdu-control"
            placeholder="Unset"
            value={icdu.trace.parent_icdu_id}
            onChange={(e) => setIcdu({ ...icdu, trace: { ...icdu.trace, parent_icdu_id: e.target.value } })}
            data-testid="input-parent-icdu-id"
          />
        </label>
        <label className="icdu-field" htmlFor="input-trace-change-note">
          <span className="icdu-label">Change note</span>
          <input
            id="input-trace-change-note"
            className="icdu-control"
            placeholder="Unset"
            value={icdu.trace.change_note}
            onChange={(e) => setIcdu({ ...icdu, trace: { ...icdu.trace, change_note: e.target.value } })}
            data-testid="input-trace-change-note"
          />
        </label>
      </div>

      <div className="icdu-group">
        <h3>Intent</h3>
        <label className="icdu-field" htmlFor="input-primary-goal">
          <span className="icdu-label">Primary goal</span>
          <input
            id="input-primary-goal"
            className="icdu-control"
            placeholder="Unset"
            value={icdu.intent.primary_goal}
            onChange={(e) => setIcdu({ ...icdu, intent: { ...icdu.intent, primary_goal: e.target.value } })}
            data-testid="input-primary-goal"
          />
        </label>
        {listField("success_criteria", "Success criteria", "Add a criterion", newCriteria, setNewCriteria, icdu.intent.success_criteria, "input-success-criteria", "button-add-criteria", "remove-criteria")}
      </div>

      <div className="icdu-group">
        <h3>Principles and persona</h3>
        {listField("principles", "Governing principles", "Add a principle", newPrinciple, setNewPrinciple, icdu.principles, "input-principle", "button-add-principle", "remove-principle")}
        <div className="icdu-field-row">
          <label className="icdu-field" htmlFor="input-persona-role">
            <span className="icdu-label">Persona role</span>
            <input id="input-persona-role" className="icdu-control" placeholder="Unset" value={icdu.persona.role} onChange={(e) => setIcdu({ ...icdu, persona: { ...icdu.persona, role: e.target.value } })} data-testid="input-persona-role" />
          </label>
          <label className="icdu-field" htmlFor="input-persona-tone">
            <span className="icdu-label">Persona tone</span>
            <input id="input-persona-tone" className="icdu-control" placeholder="Unset" value={icdu.persona.tone} onChange={(e) => setIcdu({ ...icdu, persona: { ...icdu.persona, tone: e.target.value } })} data-testid="input-persona-tone" />
          </label>
        </div>
      </div>

      <div className="icdu-group">
        <h3>Context</h3>
        <label className="icdu-field" htmlFor="input-domain">
          <span className="icdu-label">Domain</span>
          <input id="input-domain" className="icdu-control" placeholder="Unset" value={icdu.context.domain} onChange={(e) => setIcdu({ ...icdu, context: { ...icdu.context, domain: e.target.value } })} data-testid="input-domain" />
        </label>
        {listField("constraints", "Constraints", "Add a constraint", newConstraint, setNewConstraint, icdu.context.constraints, "input-constraint", "button-add-constraint", "remove-constraint")}
      </div>

      <div className="icdu-group">
        <h3>Technical representation</h3>
        <p className="icdu-work-meta">Contract record JSON. Scroll this block when a line is wider than the page.</p>
        <pre className="icdu-code-panel">{JSON.stringify(icdu, null, 2)}</pre>
      </div>
    </div>
  );
}
