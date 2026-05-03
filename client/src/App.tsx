import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navigation } from "@/components/Navigation";
import NotFound from "@/pages/not-found";
import Overview from "@/pages/Overview";
import Journey from "@/pages/Journey";
import Demos from "@/pages/Demos";
import FAQ from "@/pages/FAQ";
import BusinessCase from "@/pages/BusinessCase";
import FineTune from "@/pages/FineTune";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Overview} />
      <Route path="/journey" component={Journey} />
      <Route path="/journey/:personaId" component={Journey} />
      <Route path="/demos" component={Demos} />
      <Route path="/fine-tune" component={FineTune} />
      <Route path="/business-case" component={BusinessCase} />
      <Route path="/faq" component={FAQ} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="icdu-theme">
        <TooltipProvider>
          <div className="min-h-screen bg-background">
            <Navigation />
            <main>
              <Router />
            </main>
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
