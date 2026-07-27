import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { brandAccentVar, type BrandAccent } from "./types";

export interface MetricCardProps extends HTMLAttributes<HTMLDivElement> {
  value: ReactNode;
  label: ReactNode;
  sublabel?: ReactNode;
  accent?: BrandAccent;
}

export function MetricCard({
  value,
  label,
  sublabel,
  accent = "blue",
  className,
  ...props
}: MetricCardProps) {
  return (
    <div className={cn("icdu-metric-card", className)} {...props}>
      <div className="icdu-metric-value">{value}</div>
      <div
        className="mt-1 text-xs sm:text-sm leading-snug"
        style={{ color: "var(--icdu-fg-faint)" }}
      >
        {label}
      </div>
      {sublabel ? (
        <div
          className="mt-2 text-xs font-semibold uppercase tracking-[0.1em]"
          style={{ color: brandAccentVar[accent] }}
        >
          {sublabel}
        </div>
      ) : null}
    </div>
  );
}
