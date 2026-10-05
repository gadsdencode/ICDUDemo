import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react";
import type { AssistantAvailability } from "@/lib/assistantComposer";
import type { ActivitySignal } from "@/lib/activityPhase";
import { USER_MESSAGES_PER_HOUR } from "@shared/aiPublic";

export type AssistantPane = "page" | "conversation";

type SessionValue = {
  availability: AssistantAvailability;
  remaining: number;
  limit: number;
  notice: string | null;
  setNotice: (value: string | null) => void;
  publishStatus: (status: { availability: AssistantAvailability; remaining: number; limit: number }) => void;
  refresh: () => void;
  refreshRef: MutableRefObject<() => void>;
  hasThread: boolean;
  setHasThread: (value: boolean) => void;
  pane: AssistantPane;
  setPane: (value: AssistantPane) => void;
  revealPage: () => void;
  approvalCount: number;
  retainApproval: () => () => void;
  sendRef: MutableRefObject<(text: string) => void>;
  resetRef: MutableRefObject<() => void>;
  afterResetRef: MutableRefObject<() => void>;
  dismissRef: MutableRefObject<() => void>;
  focusComposerRef: MutableRefObject<boolean>;
  runSignal: ActivitySignal;
  runSignalRef: MutableRefObject<ActivitySignal>;
  setRunSignal: (value: ActivitySignal) => void;
};

const SessionContext = createContext<SessionValue | null>(null);

export function AssistantSessionProvider({ children }: { children: ReactNode }) {
  const [availability, setAvailability] = useState<AssistantAvailability>("loading");
  const [remaining, setRemaining] = useState(USER_MESSAGES_PER_HOUR);
  const [limit, setLimit] = useState(USER_MESSAGES_PER_HOUR);
  const [notice, setNotice] = useState<string | null>(null);
  const [hasThread, setHasThread] = useState(false);
  const [pane, setPane] = useState<AssistantPane>("page");
  const [approvalCount, setApprovalCount] = useState(0);
  const [runSignal, setRunSignalState] = useState<ActivitySignal>("idle");
  const runSignalRef = useRef<ActivitySignal>("idle");
  const refreshRef = useRef<() => void>(() => {});
  const sendRef = useRef<(text: string) => void>(() => {});
  const resetRef = useRef<() => void>(() => {});
  const afterResetRef = useRef<() => void>(() => {});
  const dismissRef = useRef<() => void>(() => {});
  const focusComposerRef = useRef(false);

  const publishStatus = useCallback((status: { availability: AssistantAvailability; remaining: number; limit: number }) => {
    setAvailability(status.availability);
    setRemaining(status.remaining);
    setLimit(status.limit);
  }, []);
  const refresh = useCallback(() => refreshRef.current(), []);
  const revealPage = useCallback(() => setPane("page"), []);
  const retainApproval = useCallback(() => {
    setApprovalCount((count) => count + 1);
    return () => setApprovalCount((count) => Math.max(0, count - 1));
  }, []);
  const setRunSignal = useCallback((value: ActivitySignal) => {
    runSignalRef.current = value;
    setRunSignalState(value);
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      availability,
      remaining,
      limit,
      notice,
      setNotice,
      publishStatus,
      refresh,
      refreshRef,
      hasThread,
      setHasThread,
      pane,
      setPane,
      revealPage,
      approvalCount,
      retainApproval,
      sendRef,
      resetRef,
      afterResetRef,
      dismissRef,
      focusComposerRef,
      runSignal,
      runSignalRef,
      setRunSignal,
    }),
    [approvalCount, availability, hasThread, limit, notice, pane, publishStatus, refresh, remaining, retainApproval, revealPage, runSignal, setRunSignal],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useAssistantSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error("Assistant session is missing.");
  return value;
}
