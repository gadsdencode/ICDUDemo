import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { brandAccentVar, type BrandAccent } from "./types";

export interface SectionLabelProps extends HTMLAttributes<HTMLDivElement> {
  accent?: BrandAccent;
}

export function SectionLabel({
  accent = "blue",
  className,
  style,
  children,
  ...props
}: SectionLabelProps) {
  return (
    <div
      className={cn("icdu-section-label", className)}
      style={{ color: brandAccentVar[accent], ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
