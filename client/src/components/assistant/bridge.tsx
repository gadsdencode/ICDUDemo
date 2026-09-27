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
import type { RoiInputs } from "@/data/businessCase";

export type ToolResult = { ok: boolean; error?: string; needsConfirmation?: boolean } & Record<string, unknown>;

export type GuidedSlot = {
  scenarioId: string | null;
  title: string | null;
  step: string | null;
  ranAi: boolean;
  evaluated: boolean;
  scores?: { IAS: number; PAS: number; AS: number; decision: "PROMOTE" | "ESCALATE" | "BLOCK" };
};

export type AssistantSlots = {
  demo: { mode: "guided" | "lab" } | null;
  guided: GuidedSlot | null;
  lab: { tab: "icdu" | "judge" | "hitl" | "stress"; summary: string } | null;
  faq: { category: string; openId: string | null } | null;
  roi: { inputs: RoiInputs; summary: string } | null;
};

export type AssistantHandlers = {
  demo?: {
    setMode: (mode: "guided" | "lab") => ToolResult;
  };
  guided?: {
    selectScenario: (scenarioId: string, confirmed: boolean) => ToolResult;
    setStage: (action: "continue" | "back" | "revisit", stepId?: string) => ToolResult;
    resetProgress: () => ToolResult;
  };
  lab?: {
    selectTab: (tab: "icdu" | "judge" | "hitl" | "stress") => ToolResult;
  };
  faq?: {
    open: (input: { id?: string; category?: string }) => ToolResult;
  };
  roi?: {
    setInputs: (patch: Partial<RoiInputs>) => ToolResult;
    resetInputs: () => ToolResult;
  };
};

type BridgeValue = {
  slots: AssistantSlots;
  epoch: number;
  handlersRef: React.MutableRefObject<AssistantHandlers>;
  setSlot: <K extends keyof AssistantSlots>(key: K, value: AssistantSlots[K]) => void;
  bump: () => void;
};

const emptySlots: AssistantSlots = {
  demo: null,
  guided: null,
  lab: null,
  faq: null,
  roi: null,
};

const BridgeContext = createContext<BridgeValue | null>(null);

export function AssistantBridgeProvider({ children }: { children: ReactNode }) {
  const [slots, setSlots] = useState<AssistantSlots>(emptySlots);
  const [epoch, setEpoch] = useState(0);
  const handlersRef = useRef<AssistantHandlers>({});
  const setSlot = useCallback(<K extends keyof AssistantSlots>(key: K, value: AssistantSlots[K]) => {
    setSlots((current) => ({ ...current, [key]: value }));
  }, []);
  const bump = useCallback(() => setEpoch((value) => value + 1), []);
  const value = useMemo(
    () => ({ slots, epoch, handlersRef, setSlot, bump }),
    [slots, epoch, setSlot, bump],
  );
  return <BridgeContext.Provider value={value}>{children}</BridgeContext.Provider>;
}

export function useAssistantBridge(): BridgeValue {
  const value = useContext(BridgeContext);
  if (!value) throw new Error("Assistant bridge is missing.");
  return value;
}

export function useAssistantSlot<K extends keyof AssistantSlots>(key: K, value: AssistantSlots[K]) {
  const { setSlot } = useAssistantBridge();
  const serialized = JSON.stringify(value);
  useEffect(() => {
    setSlot(key, JSON.parse(serialized) as AssistantSlots[K]);
    return () => setSlot(key, null);
  }, [key, serialized, setSlot]);
}

export function useAssistantHandlers(register: (handlers: AssistantHandlers) => void, clear: (handlers: AssistantHandlers) => void) {
  const { handlersRef, bump } = useAssistantBridge();
  const registerRef = useRef(register);
  const clearRef = useRef(clear);
  registerRef.current = register;
  clearRef.current = clear;
  useEffect(() => {
    registerRef.current(handlersRef.current);
    bump();
    return () => {
      clearRef.current(handlersRef.current);
      bump();
    };
  }, [bump, handlersRef]);
}
