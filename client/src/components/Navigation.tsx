import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import {
  Home,
  Map,
  Zap,
  Briefcase,
  HelpCircle,
  Wrench,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  { path: "/", label: "Overview", icon: Home },
  { path: "/business-case", label: "Business Case", icon: Briefcase },
  { path: "/journey", label: "Journey", icon: Map },
  { path: "/demos", label: "Demos", icon: Zap },
  { path: "/fine-tune", label: "Fine-Tune", icon: Wrench },
  { path: "/faq", label: "FAQ", icon: HelpCircle },
];

export function Navigation() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-12 sm:h-14 items-center justify-between gap-2 sm:gap-4 px-4 mx-auto max-w-7xl">
        <Link href="/" className="flex items-center gap-1.5 sm:gap-2 font-semibold" data-testid="link-home">
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <span className="text-xs sm:text-sm font-bold">IC</span>
          </div>
          <span className="hidden sm:inline-block">ICDU</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path || 
              (item.path !== "/" && location.startsWith(item.path));
            
            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "gap-2",
                    isActive && "bg-secondary"
                  )}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8 sm:h-9 sm:w-9"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container flex flex-col p-3 sm:p-4 gap-1 sm:gap-2 mx-auto max-w-7xl">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path || 
                (item.path !== "/" && location.startsWith(item.path));
              
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className="w-full justify-start gap-2 h-9 sm:h-10"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid={`nav-mobile-${item.label.toLowerCase()}`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
