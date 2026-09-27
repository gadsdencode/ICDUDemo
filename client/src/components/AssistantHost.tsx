import { Component, lazy, Suspense, type ReactNode } from "react";
import { useLocation } from "wouter";

const AssistantLive = lazy(() => import("@/components/assistant/AssistantSurface").then((mod) => ({ default: mod.AssistantLive })));

class AssistantBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

export function AssistantHost() {
  const [location] = useLocation();
  if (location.split("?")[0] === "/fine-tune") return null;

  return (
    <AssistantBoundary>
      <Suspense fallback={null}>
        <AssistantLive />
      </Suspense>
    </AssistantBoundary>
  );
}
