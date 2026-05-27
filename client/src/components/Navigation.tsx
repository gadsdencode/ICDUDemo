import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { Menu, X, ChevronDown, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

const navItems = [
  { path: "/", label: "Overview", emoji: "🏠" },
  { path: "/business-case", label: "Business Case", emoji: "💼" },
  { path: "/journey", label: "Journey", emoji: "🗺" },
  { path: "/demos", label: "Demos", emoji: "⚡" },
  { path: "/fine-tune", label: "Fine-Tune", emoji: "🔧" },
  { path: "/faq", label: "FAQ", emoji: "❓" },
];

const resourceItems = [
  { label: "Whitepaper", href: "#", testId: "whitepaper" },
  { label: "Case Studies", href: "#", testId: "case-studies" },
  { label: "Documentation", href: "#", testId: "documentation" },
];

export function Navigation() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-shadow duration-200",
        scrolled && "scrolled shadow-[0_4px_24px_-4px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.45)]",
      )}
    >
      <div className="container flex h-12 sm:h-14 items-center justify-between gap-2 sm:gap-4 px-4 mx-auto max-w-7xl">
        <Link href="/" className="flex items-center gap-1.5 sm:gap-2 font-semibold shrink-0" data-testid="link-home">
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <span className="text-xs sm:text-sm font-bold">IC</span>
          </div>
          <span className="hidden sm:inline-block">ICDU</span>
        </Link>

        <nav className="hidden md:flex items-center gap-0.5 xl:gap-1">
          {navItems.map((item) => {
            const isActive =
              location === item.path ||
              (item.path !== "/" && location.startsWith(item.path));

            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className={cn("gap-1.5 px-2 xl:px-3", isActive && "bg-secondary")}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <span aria-hidden="true">{item.emoji}</span>
                  {item.label}
                </Button>
              </Link>
            );
          })}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 px-2 xl:px-3"
                data-testid="nav-resources"
              >
                <BookOpen className="h-4 w-4" />
                Resources
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Resources</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {resourceItems.map((item) => (
                <DropdownMenuItem key={item.label} asChild>
                  <a
                    href={item.href}
                    className="cursor-pointer"
                    data-testid={`nav-resource-${item.testId}`}
                  >
                    {item.label}
                  </a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "md:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-hidden transition-all duration-300 ease-in-out",
          mobileMenuOpen ? "max-h-[36rem] opacity-100" : "max-h-0 opacity-0 border-t-transparent",
        )}
      >
        <nav className="container flex flex-col p-3 sm:p-4 gap-1 sm:gap-2 mx-auto max-w-7xl">
          {navItems.map((item) => {
            const isActive =
              location === item.path ||
              (item.path !== "/" && location.startsWith(item.path));

            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start gap-2 h-9 sm:h-10"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={`nav-mobile-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <span aria-hidden="true">{item.emoji}</span>
                  {item.label}
                </Button>
              </Link>
            );
          })}

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 h-9 sm:h-10"
            onClick={() => setMobileResourcesOpen(!mobileResourcesOpen)}
            aria-expanded={mobileResourcesOpen}
            data-testid="nav-mobile-resources"
          >
            <BookOpen className="h-4 w-4" />
            Resources
            <ChevronDown
              className={cn(
                "h-3 w-3 ml-auto transition-transform",
                mobileResourcesOpen && "rotate-180",
              )}
            />
          </Button>

          <div
            className={cn(
              "flex flex-col gap-1 pl-4 overflow-hidden transition-all duration-200",
              mobileResourcesOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0",
            )}
          >
            {resourceItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm hover-elevate"
                data-testid={`nav-mobile-resource-${item.testId}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
