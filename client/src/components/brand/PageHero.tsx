import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SectionLabel } from "./SectionLabel";
import { SectionHeading } from "./SectionHeading";
import type { BrandAccent } from "./types";

export interface PageHeroProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  label?: ReactNode;
  labelAccent?: BrandAccent;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  align?: "center" | "left";
  /** Use Sora for the title (default). Set false for Instrument Serif. */
  displayTitle?: boolean;
}

export function PageHero({
  label,
  labelAccent = "blue",
  title,
  description,
  actions,
  align = "center",
  displayTitle = true,
  className,
  children,
  ...props
}: PageHeroProps) {
  return (
    <header
      className={cn(
        "mb-6 sm:mb-10",
        align === "center" && "text-center",
        className,
      )}
      {...props}
    >
      {label ? (
        <SectionLabel
          accent={labelAccent}
          className={cn(align === "center" && "inline-block")}
        >
          {label}
        </SectionLabel>
      ) : null}

      <SectionHeading
        as="h1"
        display={displayTitle}
        className={cn(
          displayTitle
            ? "text-[clamp(1.75rem,4vw,2.75rem)]"
            : "text-[clamp(1.75rem,4vw,3rem)]",
          label ? "mt-0" : undefined,
          description || actions ? "mb-4" : undefined,
        )}
      >
        {title}
      </SectionHeading>

      {description ? (
        <p
          className={cn(
            "text-sm sm:text-base leading-relaxed max-w-3xl",
            align === "center" && "mx-auto",
            actions ? "mb-6" : undefined,
          )}
          style={{ color: "var(--icdu-fg-muted)" }}
        >
          {description}
        </p>
      ) : null}

      {actions ? (
        <div
          className={cn(
            "flex flex-wrap gap-3",
            align === "center" && "justify-center",
          )}
        >
          {actions}
        </div>
      ) : null}

      {children}
    </header>
  );
}
