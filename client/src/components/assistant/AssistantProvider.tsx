import type { ReactNode } from "react";
import { CopilotKitProvider } from "@copilotkit/react-core/v2";
import "@copilotkit/react-core/v2/styles.css";
import { AssistantBridgeProvider } from "@/components/assistant/bridge";

export function AssistantProvider({ children }: { children: ReactNode }) {
  return (
    <AssistantBridgeProvider>
      <CopilotKitProvider
        runtimeUrl="/api/copilotkit"
        agentId="default"
        useSingleEndpoint={false}
        credentials="include"
        enableInspector={false}
      >
        {children}
      </CopilotKitProvider>
    </AssistantBridgeProvider>
  );
}
