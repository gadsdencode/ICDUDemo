import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { ChevronDown } from "lucide-react";
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
import { useAudience } from "@/components/AudienceProvider";
import { formatAudienceChip } from "@/data/audience";
import { PathChip } from "@/components/PathChrome";

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
  const { personaId, industryId, resetAudience } = useAudience();
  const audienceChip = formatAudienceChip(personaId, industryId);
  const items = navItems.map((item) =>
    item.path === "/journey" && personaId
      ? { ...item, path: `/journey/${personaId}` }
      : item,
  );

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
        "sticky top-0 z-50 w-full border-b border-[color:var(--icdu-border)] bg-[color:var(--icdu-nav-bg)] backdrop-blur-sm",
        scrolled && "shadow-[0_8px_24px_-18px_rgba(24,38,53,0.45)]",
      )}
    >
      <div className="mx-auto flex min-h-[76px] max-w-[1344px] items-center justify-between gap-4 px-[19px] sm:min-h-[78px] sm:px-6 md:min-h-[94px] md:gap-6 md:px-8 lg:px-12">
        <Link
          href="/"
          className="icdu-wordmark shrink-0"
          data-testid="link-home"
          aria-label="ICDU homepage"
          onClick={() => {
            resetAudience();
            window.scrollTo(0, 0);
          }}
        >
          icdu
        </Link>

        <nav className="hidden lg:flex items-center gap-5 xl:gap-7" aria-label="Main navigation">
          {items.map((item) => {
            const isJourney = item.path === "/journey" || item.path.startsWith("/journey/");
            const isActive = isJourney
              ? location === "/journey" || location.startsWith("/journey/")
              : location === item.path ||
                (item.path !== "/" && location.startsWith(item.path));

            return (
              <Link
                key={item.path}
                href={item.path}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                className={cn(
                  "icdu-focus py-2 text-[13px] text-[color:var(--icdu-fg)] no-underline hover:text-[color:var(--icdu-plum)] hover:underline hover:underline-offset-[6px]",
                  isActive && "text-[color:var(--icdu-plum)] underline underline-offset-[6px]",
                )}
              >
                {item.label}
              </Link>
            );
          })}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-auto gap-1 px-0 py-2 text-[13px] font-normal text-[color:var(--icdu-fg)] hover:bg-transparent hover:text-[color:var(--icdu-plum)] hover:underline hover:underline-offset-[6px]",
                  resourcesActive && "text-[color:var(--icdu-plum)] underline underline-offset-[6px]",
                )}
                data-testid="nav-resources"
              >
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
          <PathChip
            testId="nav-audience-chip"
            className="hidden max-w-[14rem] xl:inline-flex"
          />
          <a href={WALKTHROUGH_URL} className="icdu-walkthrough icdu-focus" data-testid="nav-cta-walkthrough">
            <span className="sm:hidden">Walkthrough</span>
            <span className="hidden sm:inline">Book a walkthrough</span>
            <span aria-hidden="true">↗</span>
          </a>
          <ThemeToggle />
          <button
            type="button"
            className="icdu-focus lg:hidden bg-transparent px-0 py-3 text-[13px] text-[color:var(--icdu-fg)]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {audienceChip ? (
        <div className="border-t border-[color:var(--icdu-border)] px-4 py-1.5 xl:hidden">
          <PathChip
            testId="nav-audience-chip-mobile"
            className="w-full justify-between"
          />
        </div>
      ) : null}

      {mobileMenuOpen ? (
        <div className="relative mx-auto max-w-[1344px] px-[19px] sm:px-6 lg:hidden">
          <nav className="icdu-menu-panel" aria-label="Mobile navigation">
            <a
              href={WALKTHROUGH_URL}
              data-testid="nav-mobile-cta"
              onClick={() => setMobileMenuOpen(false)}
            >
              Book a walkthrough
            </a>

            {items.map((item) => {
              const isJourney = item.path === "/journey" || item.path.startsWith("/journey/");
              const isActive = isJourney
                ? location === "/journey" || location.startsWith("/journey/")
                : location === item.path ||
                  (item.path !== "/" && location.startsWith(item.path));

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={`nav-mobile-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={cn(isActive && "bg-[color:var(--icdu-lavender)]")}
                >
                  {item.label}
                </Link>
              );
            })}

            <div className="mt-2 pt-2 border-t border-[color:var(--icdu-border)]">
              <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[color:var(--icdu-fg-faint)]">
                Resources
              </div>
              {resourceLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    (location === link.href || location.startsWith(link.href)) &&
                      "bg-[color:var(--icdu-lavender)]",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
