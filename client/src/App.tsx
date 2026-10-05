import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navigation } from "@/components/Navigation";
import { AudienceProvider } from "@/components/AudienceProvider";
import { AssistantProvider } from "@/components/assistant/AssistantProvider";
import { WorkspaceProvider } from "@/components/workspace/WorkspaceProvider";
import { AssistantWorkspace } from "@/components/assistant/AssistantWorkspace";
import NotFound from "@/pages/not-found";
import Overview from "@/pages/Overview";
import Journey from "@/pages/Journey";
import Demos from "@/pages/Demos";
import FAQ from "@/pages/FAQ";
import BusinessCase from "@/pages/BusinessCase";
import FineTune from "@/pages/FineTune";
import Resources from "@/pages/Resources";
import Research from "@/pages/Research";
import Licensing from "@/pages/Licensing";
import Investor from "@/pages/Investor";
import Developers from "@/pages/Developers";

function RedirectHome() {
  const [, navigate] = useLocation();
  useEffect(() => {
    navigate("/", { replace: true });
  }, [navigate]);
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Overview} />
      <Route path="/journey" component={Journey} />
      <Route path="/journey/:personaId" component={Journey} />
      <Route path="/demos" component={Demos} />
      <Route path="/ask" component={RedirectHome} />
      <Route path="/fine-tune" component={FineTune} />
      <Route path="/business-case" component={BusinessCase} />
      <Route path="/faq" component={FAQ} />
      <Route path="/resources" component={Resources} />
      <Route path="/research" component={Research} />
      <Route path="/licensing" component={Licensing} />
      <Route path="/investor" component={Investor} />
      <Route path="/developers" component={Developers} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppShell() {
  const [location] = useLocation();
  const privateRoute = (location.split("?")[0] || "/") === "/fine-tune";
  return (
    <div className="icdu-shell">
      <Navigation />
      <AssistantWorkspace privateRoute={privateRoute}>
        <Router />
      </AssistantWorkspace>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="icdu-theme">
        <TooltipProvider>
          <AudienceProvider>
            <AssistantProvider>
              <WorkspaceProvider>
                <AppShell />
                <Toaster />
              </WorkspaceProvider>
            </AssistantProvider>
          </AudienceProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
