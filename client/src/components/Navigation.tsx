import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { Menu, X, ChevronDown, BookOpen, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { resourceDocs, downloadDoc, type DocFormat } from "@/lib/downloads";

const navItems = [
  { path: "/", label: "Overview", emoji: "🏠" },
  { path: "/business-case", label: "Business Case", emoji: "💼" },
  { path: "/journey", label: "Journey", emoji: "🗺" },
  { path: "/demos", label: "Demos", emoji: "⚡" },
  { path: "/fine-tune", label: "Fine-Tune", emoji: "🔧" },
  { path: "/faq", label: "FAQ", emoji: "❓" },
];

const formatBadgeClass: Record<DocFormat, string> = {
  MD: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-900",
  JSON: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-900",
  CSV: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900",
};

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
            <DropdownMenuContent align="end" className="w-[22rem] max-w-[calc(100vw-1rem)]">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Downloadable Resources</span>
                <span className="text-[10px] font-normal text-muted-foreground">
                  {resourceDocs.length} files
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {resourceDocs.map((doc) => (
                <DropdownMenuItem
                  key={doc.id}
                  onSelect={(e) => {
                    e.preventDefault();
                    downloadDoc(doc);
                  }}
                  className="cursor-pointer flex-col items-start gap-1 py-2.5"
                  data-testid={`nav-resource-${doc.id}`}
                >
                  <div className="flex w-full items-center gap-2">
                    <Download className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="font-medium text-sm flex-1 truncate">{doc.title}</span>
                    <Badge
                      variant="outline"
                      className={cn("h-4 px-1.5 text-[9px] font-semibold", formatBadgeClass[doc.format])}
                    >
                      {doc.format}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
                      {doc.size}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug pl-5">
                    {doc.description}
                  </p>
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
          mobileMenuOpen
            ? "max-h-[calc(100vh-3rem)] opacity-100 overflow-y-auto"
            : "max-h-0 opacity-0 border-t-transparent",
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
              "flex flex-col gap-1 pl-2 overflow-hidden transition-all duration-200",
              mobileResourcesOpen ? "max-h-[40rem] opacity-100" : "max-h-0 opacity-0",
            )}
          >
            {resourceDocs.map((doc) => (
              <button
                key={doc.id}
                type="button"
                className="rounded-md px-3 py-2 text-left hover-elevate flex flex-col gap-1"
                data-testid={`nav-mobile-resource-${doc.id}`}
                onClick={() => {
                  downloadDoc(doc);
                  setMobileMenuOpen(false);
                }}
              >
                <div className="flex items-center gap-2">
                  <Download className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="font-medium text-sm flex-1 truncate">{doc.title}</span>
                  <Badge
                    variant="outline"
                    className={cn("h-4 px-1.5 text-[9px] font-semibold", formatBadgeClass[doc.format])}
                  >
                    {doc.format}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
                    {doc.size}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug pl-5">
                  {doc.description}
                </p>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
