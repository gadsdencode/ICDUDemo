import { Link } from "wouter";
import { cn } from "@/lib/utils";

const footerColumns = [
  {
    title: "Product",
    links: [
      { href: "/", label: "Overview" },
      { href: "/business-case", label: "Business Case" },
      { href: "/journey", label: "For Your Role" },
      { href: "/demos", label: "Demos" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/resources", label: "All Resources" },
      { href: "/research", label: "Evidence & Research" },
      { href: "/faq", label: "FAQ" },
      { href: "/licensing", label: "Licensing" },
    ],
  },
  {
    title: "Technical",
    links: [
      { href: "/developers", label: "Developers" },
      { href: "/demos?mode=lab", label: "Advanced Lab" },
      { href: "/fine-tune", label: "Fine-Tune (local)" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/investor", label: "Investor" },
      {
        href: "mailto:brian@osscontact.com?subject=ICDU%20Walkthrough",
        label: "Contact",
      },
    ],
  },
];

export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "border-t border-[color:var(--icdu-border)] mt-auto",
        className,
      )}
    >
      <div className="mx-auto max-w-7xl px-[clamp(1.25rem,4vw,3rem)] py-10 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5 mb-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="flex h-7 w-7 items-center justify-center rounded text-white text-xs font-bold"
                style={{ background: "var(--icdu-blue)" }}
              >
                IC
              </div>
              <span className="font-display text-sm font-semibold tracking-tight text-[color:var(--icdu-fg)]">
                ICDU
              </span>
            </div>
            <p className="text-sm text-[color:var(--icdu-fg-muted)] leading-relaxed m-0 max-w-[16rem]">
              Intent-conscious readiness for AI-assisted work — Overture Systems
              Solutions.
            </p>
          </div>

          {footerColumns.map((col) => (
            <div key={col.title}>
              <div className="text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--icdu-fg-ghost)] mb-3">
                {col.title}
              </div>
              <ul className="space-y-2 m-0 p-0 list-none">
                {col.links.map((link) => {
                  const external =
                    link.href.startsWith("mailto:") ||
                    link.href.startsWith("http");
                  if (external) {
                    return (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          className="text-sm text-[color:var(--icdu-fg-muted)] hover:text-[color:var(--icdu-fg)] transition-colors"
                        >
                          {link.label}
                        </a>
                      </li>
                    );
                  }
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-[color:var(--icdu-fg-muted)] hover:text-[color:var(--icdu-fg)] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-6 border-t border-[color:var(--icdu-border)]">
          <p className="text-sm text-[color:var(--icdu-fg-faint)] m-0">
            © {new Date().getFullYear()} Overture Systems Solutions. Patent
            pending.
          </p>
          <p className="text-sm text-[color:var(--icdu-fg-faint)] m-0">
            Evaluation materials on this site do not grant a commercial license.
          </p>
        </div>
      </div>
    </footer>
  );
}
