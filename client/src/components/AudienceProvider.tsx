// client/src/components/AudienceProvider.tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "wouter";
import {
  AUDIENCE_STORAGE_KEY,
  audienceFromUrl,
  buildAudienceUrl,
  choiceCompletesSelection,
  getPersonaAudience,
  isIndustryId,
  isPersonaId,
  resolveAudienceChoice,
  sameAudience,
  type AudienceChoice,
  type PersonaAudience,
} from "@/data/audience";
import { getGuidedScenario, type GuidedScenario } from "@/data/guidedScenarios";
import { trackAudienceSelected } from "@/lib/analytics";

type CommitOptions = {
  /** push adds a history entry so back/forward restores the choice. none leaves the URL to navigation. */
  history?: "push" | "replace" | "none";
};

type AudienceContextValue = AudienceChoice & {
  route: PersonaAudience | null;
  scenario: GuidedScenario | null;
  setPersonaId: (id: string | null, options?: CommitOptions) => void;
  setIndustryId: (id: string | null, options?: CommitOptions) => void;
};

const AudienceContext = createContext<AudienceContextValue | undefined>(undefined);

function readStorage(): AudienceChoice {
  try {
    const raw = sessionStorage.getItem(AUDIENCE_STORAGE_KEY);
    if (!raw) return { personaId: null, industryId: null };
    const parsed = JSON.parse(raw) as { personaId?: string | null; industryId?: string | null };
    return {
      personaId: isPersonaId(parsed.personaId) ? parsed.personaId : null,
      industryId: isIndustryId(parsed.industryId) ? parsed.industryId : null,
    };
  } catch {
    return { personaId: null, industryId: null };
  }
}

function writeStorage(state: AudienceChoice) {
  try {
    sessionStorage.setItem(AUDIENCE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Persistence is best-effort; the in-memory choice still drives the page.
  }
}

function currentHref(): string {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function loadInitial(): AudienceChoice {
  if (typeof window === "undefined") {
    return { personaId: null, industryId: null };
  }
  return resolveAudienceChoice({
    pathname: window.location.pathname,
    search: window.location.search,
    stored: readStorage(),
  });
}

export function AudienceProvider({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [state, setState] = useState<AudienceChoice>(loadInitial);
  const stateRef = useRef(state);
  stateRef.current = state;
  const popped = useRef(false);

  const commit = useCallback((next: AudienceChoice, history: CommitOptions["history"]) => {
    const prev = stateRef.current;
    if (sameAudience(prev, next)) return;
    if (choiceCompletesSelection(prev, next) && next.personaId && next.industryId) {
      trackAudienceSelected(next.personaId, next.industryId);
    }
    stateRef.current = next;
    writeStorage(next);
    if (history !== "none") {
      const target = buildAudienceUrl(window.location.href, next);
      if (target !== currentHref()) {
        const method = history === "replace" ? "replaceState" : "pushState";
        window.history[method](window.history.state, "", target);
      }
    }
    setState(next);
  }, []);

  const setPersonaId = useCallback(
    (id: string | null, options?: CommitOptions) => {
      const personaId = isPersonaId(id) ? id : null;
      commit({ ...stateRef.current, personaId }, options?.history ?? "push");
    },
    [commit],
  );

  const setIndustryId = useCallback(
    (id: string | null, options?: CommitOptions) => {
      const industryId = isIndustryId(id) ? id : null;
      commit({ ...stateRef.current, industryId }, options?.history ?? "push");
    },
    [commit],
  );

  const adopt = useCallback((next: AudienceChoice, stampUrl: boolean) => {
    if (!sameAudience(stateRef.current, next)) {
      stateRef.current = next;
      setState(next);
    }
    writeStorage(next);
    if (!stampUrl) return;
    const target = buildAudienceUrl(window.location.href, next);
    if (target !== currentHref()) {
      window.history.replaceState(window.history.state, "", target);
    }
  }, []);

  useEffect(() => {
    const onPop = () => {
      popped.current = true;
      const next = audienceFromUrl(window.location.pathname, window.location.search);
      adopt(next, false);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [adopt]);

  useEffect(() => {
    if (popped.current) {
      popped.current = false;
      return;
    }
    const next = resolveAudienceChoice({
      pathname: window.location.pathname,
      search: window.location.search,
      stored: readStorage(),
    });
    adopt(next, true);
  }, [location, adopt]);

  const value = useMemo<AudienceContextValue>(() => {
    return {
      personaId: state.personaId,
      industryId: state.industryId,
      route: getPersonaAudience(state.personaId) ?? null,
      scenario: state.industryId ? getGuidedScenario(state.industryId) ?? null : null,
      setPersonaId,
      setIndustryId,
    };
  }, [state.personaId, state.industryId, setPersonaId, setIndustryId]);

  return <AudienceContext.Provider value={value}>{children}</AudienceContext.Provider>;
}

export function useAudience(): AudienceContextValue {
  const context = useContext(AudienceContext);
  if (!context) {
    throw new Error("useAudience must be used within AudienceProvider");
  }
  return context;
}
