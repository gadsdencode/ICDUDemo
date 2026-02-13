import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { Home, Map, Zap, Briefcase, HelpCircle, Menu, X, Download, FileText, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

const navItems = [
  { path: "/", label: "Overview", icon: Home },
  { path: "/journey", label: "Journey", icon: Map },
  { path: "/demos", label: "Demos", icon: Zap },
  { path: "/business-case", label: "Business Case", icon: Briefcase },
  { path: "/faq", label: "FAQ", icon: HelpCircle },
];

const downloadItems = [
  {
    label: "ICDU AI Research Paper",
    filename: "ICDU_AI_Research_Paper.pdf",
    description: "Full research paper (PDF)",
  },
  {
    label: "Why Overture - One Pager",
    filename: "Why_Overture_OnePager.docx",
    description: "Overture overview (Word)",
  },
  {
    label: "ICDU Executive Pitch",
    filename: "ICDU_Executive_Pitch.docx",
    description: "Executive summary (Word)",
  },
  {
    label: "ICDU Executive Quick Hits",
    filename: "ICDU_Executive_Quick_Hits.docx",
    description: "Key highlights (Word)",
  },
  {
    label: "ICDU vs Standard LLM",
    filename: "ICDU_vs_Standard_LLM_Financial_Impact.docx",
    description: "Comparison & financial impact (Word)",
  },
];

export function Navigation() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);

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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                data-testid="nav-resources"
              >
                <Download className="h-4 w-4" />
                Resources
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>Download Documents</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {downloadItems.map((item) => (
                <DropdownMenuItem key={item.filename} asChild>
                  <a
                    href={`/downloads/${item.filename}`}
                    download={item.filename}
                    className="flex items-start gap-3 cursor-pointer"
                    data-testid={`download-${item.filename}`}
                  >
                    <FileText className="h-4 w-4 mt-0.5 shrink-0 opacity-60" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    </div>
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

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 h-9 sm:h-10"
              onClick={() => setMobileResourcesOpen(!mobileResourcesOpen)}
              data-testid="nav-mobile-resources"
            >
              <Download className="h-4 w-4" />
              Resources
              <ChevronDown className={cn("h-3 w-3 ml-auto transition-transform", mobileResourcesOpen && "rotate-180")} />
            </Button>

            {mobileResourcesOpen && (
              <div className="flex flex-col gap-1 pl-4">
                {downloadItems.map((item) => (
                  <a
                    key={item.filename}
                    href={`/downloads/${item.filename}`}
                    download={item.filename}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover-elevate"
                    data-testid={`download-mobile-${item.filename}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FileText className="h-4 w-4 shrink-0 opacity-60" />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
