import { lazy, Suspense, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { USER_MESSAGES_PER_HOUR, reasonMessage, type PublicAiReason } from "@shared/aiPublic";

const AssistantChat = lazy(() => import("@/components/AssistantChat"));

type ChatStatus = {
  enabled: boolean;
  reason: PublicAiReason | null;
  limit: number;
  remaining: number;
  message: string | null;
};

export function AssistantHost() {
  const [location] = useLocation();
  const [status, setStatus] = useState<ChatStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/chat/status", { credentials: "include" });
        const body = (await response.json()) as ChatStatus;
        if (!cancelled) setStatus(body);
      } catch {
        if (!cancelled) {
          setStatus({
            enabled: false,
            reason: "offline",
            limit: USER_MESSAGES_PER_HOUR,
            remaining: 0,
            message: reasonMessage("offline"),
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (location === "/fine-tune") return null;

  const limit = status?.limit ?? USER_MESSAGES_PER_HOUR;
  const remaining = status?.remaining ?? limit;

  return (
    <Suspense fallback={null}>
      <AssistantChat
        remaining={remaining}
        limit={limit}
        unavailableMessage={status && !status.enabled ? status.message : null}
      />
    </Suspense>
  );
}
