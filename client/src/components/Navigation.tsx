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

const WALKTHROUGH_URL =
  "mailto:brian@osscontact.com?subject=ICDU%20Walkthrough";

const navItems = [
  { path: "/", label: "Overview" },
  { path: "/business-case", label: "Business Case" },
  { path: "/journey", label: "Journey" },
  { path: "/demos", label: "Demos" },
  { path: "/faq", label: "FAQ" },
];

const resourceLinks = [
  { href: "/resources", label: "All Resources" },
  { href: "/research", label: "Evidence & Research" },
  { href: "/developers", label: "Developers" },
  { href: "/licensing", label: "Licensing" },
];

export function Navigation() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const resourcesActive = [
    "/resources",
    "/research",
    "/developers",
    "/licensing",
    "/investor",
    "/fine-tune",
  ].some((p) => location === p || location.startsWith(`${p}?`));

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-[background,box-shadow,border-color] duration-200",
        "border-[color:var(--icdu-border)] bg-[color:var(--icdu-nav-bg)] backdrop-blur-md supports-[backdrop-filter]:bg-[color:var(--icdu-nav-bg)]",
        scrolled &&
          "shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.45)]",
      )}
    >
      <div className="container flex h-12 sm:h-14 items-center justify-between gap-2 sm:gap-4 px-4 mx-auto max-w-7xl">
        <Link
          href="/"
          className="flex items-center gap-1.5 sm:gap-2 shrink-0"
          data-testid="link-home"
        >
          <div
            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded text-white"
            style={{ background: "var(--icdu-blue)" }}
          >
            <span className="text-xs sm:text-sm font-bold tracking-tight">IC</span>
          </div>
          <span className="hidden sm:inline-block font-display text-sm font-semibold tracking-tight">
            ICDU
          </span>
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
                  className={cn(
                    "gap-1.5 px-2 xl:px-3 text-xs xl:text-sm font-medium",
                    isActive && "bg-secondary",
                  )}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {item.label}
                </Button>
              </Link>
            );
          })}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={resourcesActive ? "secondary" : "ghost"}
                size="sm"
                className="gap-1.5 px-2 xl:px-3 text-xs xl:text-sm font-medium"
                data-testid="nav-resources"
              >
                <BookOpen className="h-4 w-4" />
                Resources
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Browse</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {resourceLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link
                    href={link.href}
                    className="cursor-pointer"
                    data-testid={`nav-resource-${link.href.replace("/", "")}`}
                  >
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <a
            href={WALKTHROUGH_URL}
            className="inline-flex items-center rounded-full px-2.5 py-1.5 text-sm font-medium text-white md:hidden"
            style={{ background: "var(--icdu-blue)" }}
            data-testid="nav-cta-walkthrough-mobile"
          >
            Walkthrough
          </a>
          <a
            href={WALKTHROUGH_URL}
            className="hidden md:inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium text-white"
            style={{ background: "var(--icdu-blue)" }}
            data-testid="nav-cta-walkthrough"
          >
            Book a Walkthrough
          </a>
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

      {mobileMenuOpen ? (
        <div
          className="md:hidden border-t border-[color:var(--icdu-border)] bg-[color:var(--icdu-nav-bg)] backdrop-blur-md max-h-[calc(100vh-3rem)] overflow-y-auto"
        >
          <nav className="container flex flex-col p-3 sm:p-4 gap-1 mx-auto max-w-7xl">
            <a
              href={WALKTHROUGH_URL}
              className="mb-2 inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-medium text-white"
              style={{ background: "var(--icdu-blue)" }}
              data-testid="nav-mobile-cta"
              onClick={() => setMobileMenuOpen(false)}
            >
              Book a Walkthrough
            </a>

            {navItems.map((item) => {
              const isActive =
                location === item.path ||
                (item.path !== "/" && location.startsWith(item.path));

              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className="w-full justify-start gap-2 h-10 text-sm"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid={`nav-mobile-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {item.label}
                  </Button>
                </Link>
              );
            })}

            <div className="mt-2 pt-2 border-t border-[color:var(--icdu-border)]">
              <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[color:var(--icdu-fg-faint)]">
                Resources
              </div>
              {resourceLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={
                      location === link.href || location.startsWith(link.href)
                        ? "secondary"
                        : "ghost"
                    }
                    size="sm"
                    className="w-full justify-start h-10 text-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
