// client/src/data/audience.ts
// Shared role and workflow choice. Role lenses compose with existing scenarios;
// links point at buyer material already on the site.

import { getGuidedScenario, guidedScenarios, type GuidedScenario } from "@/data/guidedScenarios";
import {
  generatedTechnicalDocs,
  staticDownloads,
  type CatalogItem,
} from "@/data/siteResources";

export type ResourceGroupId = "executive" | "research" | "technical";
export type DemoMode = "guided" | "lab";

export type PersonaAudience = {
  id: string;
  chipLabel: string;
  alias?: string;
  stakeholderRole: string | null;
  businessCaseHref: string;
  resourceGroup: ResourceGroupId;
  downloadId: string;
  demoMode: DemoMode;
};

const BROWSE_ROLES_KEY = "icdu-browse-roles";

export const personaAudiences: PersonaAudience[] = [
  {
    id: "executive",
    chipLabel: "Executive",
    alias: "CEO, COO, AI sponsor",
    stakeholderRole: null,
    businessCaseHref: "/business-case#value-model",
    resourceGroup: "executive",
    downloadId: "exec-pitch",
    demoMode: "guided",
  },
  {
    id: "cfo",
    chipLabel: "CFO",
    stakeholderRole: "CFO",
    businessCaseHref: "/business-case#stakeholder-cfo",
    resourceGroup: "research",
    downloadId: "financial-impact-doc",
    demoMode: "guided",
  },
  {
    id: "cto",
    chipLabel: "CTO",
    stakeholderRole: "CTO",
    businessCaseHref: "/business-case#stakeholder-cto",
    resourceGroup: "research",
    downloadId: "research-paper",
    demoMode: "guided",
  },
  {
    id: "ciso",
    chipLabel: "CISO",
    stakeholderRole: "CISO",
    businessCaseHref: "/business-case#stakeholder-ciso",
    resourceGroup: "research",
    downloadId: "research-paper",
    demoMode: "guided",
  },
  {
    id: "compliance",
    chipLabel: "Compliance",
    stakeholderRole: "Legal / Compliance",
    businessCaseHref: "/business-case#stakeholder-legal-compliance",
    resourceGroup: "research",
    downloadId: "research-paper",
    demoMode: "guided",
  },
  {
    id: "developer",
    chipLabel: "Developer",
    stakeholderRole: null,
    businessCaseHref: "/business-case",
    resourceGroup: "technical",
    downloadId: "gen-schema",
    demoMode: "lab",
  },
];

export function isPersonaId(id: string | null | undefined): id is string {
  return !!id && personaAudiences.some((persona) => persona.id === id);
}

export function isIndustryId(id: string | null | undefined): id is string {
  return !!id && guidedScenarios.some((scenario) => scenario.id === id);
}

export function getPersonaAudience(id: string | null | undefined): PersonaAudience | undefined {
  if (!isPersonaId(id)) return undefined;
  return personaAudiences.find((persona) => persona.id === id);
}

export function industryChipLabel(industry: string, industryShort?: string): string {
  if (industryShort) return industryShort;
  const normalized = industry.toLowerCase();
  if (normalized.startsWith("health")) return "Healthcare";
  if (normalized.startsWith("legal")) return "Legal";
  if (normalized.startsWith("enterprise")) return "Enterprise";
  return industry.split(" ")[0] || industry;
}

export function formatAudienceChip(
  personaId: string | null,
  industryId: string | null,
): string | null {
  const persona = getPersonaAudience(personaId);
  const scenario = industryId ? getGuidedScenario(industryId) : undefined;
  const parts = [
    persona?.chipLabel,
    scenario ? industryChipLabel(scenario.industry, scenario.industryShort) : null,
  ].filter((part): part is string => !!part);
  return parts.length ? parts.join(" · ") : null;
}

export function getCatalogItem(id: string): CatalogItem | undefined {
  return [...staticDownloads, ...generatedTechnicalDocs].find((item) => item.id === id);
}

export function businessCaseLinkLabel(route: PersonaAudience): string {
  if (route.stakeholderRole) return `Value for ${route.stakeholderRole}`;
  if (route.id === "executive") return "Value model";
  return "Business case";
}

export function stakeholderAnchor(role: string): string {
  const slug = role
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `stakeholder-${slug}`;
}

export function markJourneyIndexBrowse(): void {
  try {
    sessionStorage.setItem(BROWSE_ROLES_KEY, "1");
  } catch {
    // Session storage can be unavailable in private browsing.
  }
}

export function isJourneyIndexBrowse(): boolean {
  try {
    return sessionStorage.getItem(BROWSE_ROLES_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearJourneyIndexBrowse(): void {
  try {
    sessionStorage.removeItem(BROWSE_ROLES_KEY);
  } catch {
    // Ignore storage failures; the journey index still renders.
  }
}

export const AUDIENCE_STORAGE_KEY = "icdu-audience";

export type AudienceChoice = {
  personaId: string | null;
  industryId: string | null;
};

export type RoleLens = {
  id: string;
  focus: string;
};

/**
 * Decision lens applied to whatever workflow is selected.
 * Executive links to the Value Model; that section is not a stakeholder accordion.
 */
export const roleLenses: RoleLens[] = [
  {
    id: "executive",
    focus: "Quality, adoption, and a bounded pilot decision",
  },
  {
    id: "cfo",
    focus: "Assumptions, rework, and the investment case",
  },
  {
    id: "cto",
    focus: "Integration and architecture",
  },
  {
    id: "ciso",
    focus: "Controls and reviewable evidence",
  },
  {
    id: "compliance",
    focus: "Policy boundaries and evidence",
  },
  {
    id: "developer",
    focus: "Implementation and testing",
  },
];

export function getRoleLens(id: string | null | undefined): RoleLens | undefined {
  if (!id) return undefined;
  return roleLenses.find((lens) => lens.id === id);
}

export type MaterialLink = {
  label: string;
  href: string;
};

export function materialsForRole(personaId: string): MaterialLink[] {
  switch (personaId) {
    case "executive":
      return [
        { label: "Value Model", href: "/business-case#value-model" },
        { label: "ICDU Executive Pitch", href: "/downloads/ICDU_Executive_Pitch.docx" },
      ];
    case "cfo":
      return [
        { label: "Value Model", href: "/business-case#value-model" },
        {
          label: "ICDU vs Standard LLM Financial Impact",
          href: "/downloads/ICDU_vs_Standard_LLM_Financial_Impact.docx",
        },
      ];
    case "cto":
      return [
        {
          label: "CTO: middleware beside the stack you already run",
          href: "/business-case#stakeholder-cto",
        },
        { label: "Developers", href: "/developers" },
      ];
    case "ciso":
      return [
        {
          label: "CISO: controls before the model call, evidence after",
          href: "/business-case#stakeholder-ciso",
        },
        { label: "ICDU AI Research Paper", href: "/downloads/ICDU_AI_Research_Paper.pdf" },
      ];
    case "compliance":
      return [
        {
          label: "Legal / Compliance: defensibility when intent must be proven",
          href: "/business-case#stakeholder-legal-compliance",
        },
        { label: "ICDU AI Research Paper", href: "/downloads/ICDU_AI_Research_Paper.pdf" },
      ];
    case "developer":
      return [
        { label: "Developers", href: "/developers" },
        { label: "ICDU Sample Schema Bundle", href: "/resources" },
      ];
    default:
      return [];
  }
}

export function applyRoleLens(personaId: string, scenario: GuidedScenario): string {
  const name = scenario.title;
  const outcome = scenario.intendedOutcome;
  const boundary = scenario.principles[0] ?? scenario.intendedOutcome;

  switch (personaId) {
    case "executive":
      return `For “${name},” quality and adoption depend on this outcome: ${outcome} A bounded pilot asks whether teams will use that standard on this workflow.`;
    case "cfo":
      return `For “${name},” rework shows up when that outcome is missed. The investment case is whether enforcing “${boundary}” costs less than the cleanup — using your assumptions, not a preset savings claim.`;
    case "cto":
      return `For “${name},” integration is the contract around this outcome: ${outcome} The architecture has to carry “${boundary}” on the model path you already run.`;
    case "ciso":
      return `For “${name},” the control is “${boundary}.” Reviewable evidence has to show whether this outcome held: ${outcome}`;
    case "compliance":
      return `For “${name},” the policy boundary is “${boundary}.” The outcome that has to stay inside it: ${outcome}`;
    case "developer":
      return `For “${name},” implementation is an ICDU whose success criteria match this outcome: ${outcome} Test that “${boundary}” fails the run when it is violated.`;
    default:
      return outcome;
  }
}

export type AudienceView =
  | { status: "empty" }
  | {
      status: "role";
      title: string;
      lens: string;
      detail: string;
    }
  | {
      status: "workflow";
      title: string;
      industry: string;
      detail: string;
    }
  | {
      status: "result";
      title: string;
      lens: string;
      detail: string;
      materials: MaterialLink[];
    };

export function describeAudience(personaId: string | null, industryId: string | null): AudienceView {
  const persona = getPersonaAudience(personaId);
  const lens = getRoleLens(personaId);
  const scenario = industryId ? getGuidedScenario(industryId) : undefined;

  if (persona && lens && scenario) {
    return {
      status: "result",
      title: `${persona.chipLabel} · ${scenario.title}`,
      lens: lens.focus,
      detail: applyRoleLens(persona.id, scenario),
      materials: materialsForRole(persona.id),
    };
  }

  if (persona && lens) {
    return {
      status: "role",
      title: persona.chipLabel,
      lens: lens.focus,
      detail: persona.alias
        ? `${persona.alias}. Choose where you would apply ICDU to put this lens on a specific workflow.`
        : "Choose where you would apply ICDU to put this lens on a specific workflow.",
    };
  }

  if (scenario) {
    return {
      status: "workflow",
      title: scenario.title,
      industry: scenario.industry,
      detail: `${scenario.businessTask} Choose a role to apply a decision lens, or open this simulated workflow now.`,
    };
  }

  return { status: "empty" };
}

/** Known role on /journey/:personaId. Invalid ids do not count. */
export function personaIdFromPath(pathname: string): string | null {
  const match = /^\/journey\/([^/]+)\/?$/.exec(pathname);
  if (!match) return null;
  let id = match[1];
  try {
    id = decodeURIComponent(id);
  } catch {
    return null;
  }
  return isPersonaId(id) ? id : null;
}

function validWorkflowParam(value: string | null): string | null {
  return isIndustryId(value) ? value : null;
}

/**
 * Precedence, highest first:
 * 1. Explicit role route (/journey/:id when the id is a known persona)
 * 2. Valid query params (persona, and industry / scenario)
 * 3. sessionStorage
 * Invalid params are ignored. On /demos, a valid scenario param wins over industry
 * when both are present. Elsewhere, industry wins over scenario.
 * Demo mode is not part of this choice.
 */
export function resolveAudienceChoice(input: {
  pathname: string;
  search: string;
  stored: AudienceChoice;
}): AudienceChoice {
  const params = new URLSearchParams(input.search.startsWith("?") ? input.search.slice(1) : input.search);
  const routePersona = personaIdFromPath(input.pathname);
  const personaParam = params.get("persona");
  const queryPersona = isPersonaId(personaParam) ? personaParam : null;

  const scenarioParam = validWorkflowParam(params.get("scenario"));
  const industryParam = validWorkflowParam(params.get("industry"));
  const onDemos = input.pathname === "/demos";
  const queryWorkflow = onDemos
    ? scenarioParam ?? industryParam
    : industryParam ?? scenarioParam;

  return {
    personaId: routePersona ?? queryPersona ?? (isPersonaId(input.stored.personaId) ? input.stored.personaId : null),
    industryId: queryWorkflow ?? (isIndustryId(input.stored.industryId) ? input.stored.industryId : null),
  };
}

/** URL-only read used for back/forward. A missing param clears that field. Route still wins. */
export function audienceFromUrl(pathname: string, search: string): AudienceChoice {
  return resolveAudienceChoice({
    pathname,
    search,
    stored: { personaId: null, industryId: null },
  });
}

export function buildAudienceUrl(href: string, choice: AudienceChoice): string {
  const url = new URL(href, "http://localhost");
  if (choice.personaId) url.searchParams.set("persona", choice.personaId);
  else url.searchParams.delete("persona");
  if (choice.industryId) url.searchParams.set("industry", choice.industryId);
  else url.searchParams.delete("industry");

  if (url.pathname === "/demos") {
    if (choice.industryId) url.searchParams.set("scenario", choice.industryId);
    else url.searchParams.delete("scenario");
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

export function sameAudience(a: AudienceChoice, b: AudienceChoice): boolean {
  return a.personaId === b.personaId && a.industryId === b.industryId;
}

export function choiceCompletesSelection(prev: AudienceChoice, next: AudienceChoice): boolean {
  if (!next.personaId || !next.industryId) return false;
  return prev.personaId !== next.personaId || prev.industryId !== next.industryId;
}
