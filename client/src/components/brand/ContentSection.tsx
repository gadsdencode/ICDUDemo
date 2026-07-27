import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SectionLabel } from "./SectionLabel";
import { SectionHeading } from "./SectionHeading";
import type { BrandAccent } from "./types";

export interface ContentSectionProps extends HTMLAttributes<HTMLElement> {
  label?: ReactNode;
  labelAccent?: BrandAccent;
  heading?: ReactNode;
  description?: ReactNode;
  /** Constrain to editorial max-width with section padding */
  contained?: boolean;
}

export function ContentSection({
  label,
  labelAccent = "blue",
  heading,
  description,
  contained = false,
  className,
  children,
  ...props
}: ContentSectionProps) {
  return (
    <section
      className={cn(
        contained &&
          "mx-auto max-w-[80rem] px-[clamp(1.25rem,4vw,3rem)] py-[clamp(2rem,5vw,4rem)]",
        className,
      )}
      {...props}
    >
      {(label || heading || description) && (
        <div className="mb-6 sm:mb-8">
          {label ? (
            <SectionLabel accent={labelAccent}>{label}</SectionLabel>
          ) : null}
          {heading ? (
            <SectionHeading
              className={cn(description ? "mb-3" : undefined)}
            >
              {heading}
            </SectionHeading>
          ) : null}
          {description ? (
            <p
              className="text-sm sm:text-base leading-relaxed max-w-3xl"
              style={{ color: "var(--icdu-fg-muted)" }}
            >
              {description}
            </p>
          ) : null}
        </div>
      )}
      {children}
    </section>
  );
}
