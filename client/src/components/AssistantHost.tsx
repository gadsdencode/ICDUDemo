import { Component, lazy, Suspense, type ReactNode } from "react";

const AssistantLive = lazy(() =>
  import("@/components/assistant/AssistantSurface").then((mod) => ({ default: mod.AssistantLive })),
);

class AssistantBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="icdu-assistant-fallback" role="alert" data-testid="assistant-fallback">
          <p>The assistant couldn&apos;t load. You can keep browsing the site.</p>
          <button type="button" onClick={() => this.setState({ failed: false })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AssistantSkeleton() {
  return (
    <div className="icdu-assistant-fallback" role="status" data-testid="assistant-loading">
      <p>Checking whether ICDU can answer.</p>
    </div>
  );
}

export function AssistantHost() {
  return (
    <AssistantBoundary>
      <Suspense fallback={<AssistantSkeleton />}>
        <AssistantLive />
      </Suspense>
    </AssistantBoundary>
  );
}
