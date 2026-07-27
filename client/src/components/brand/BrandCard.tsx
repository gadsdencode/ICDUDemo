import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface BrandCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Soft blue glow on hover — for interactive / featured cards */
  interactive?: boolean;
}

export function BrandCard({
  interactive = false,
  className,
  children,
  ...props
}: BrandCardProps) {
  return (
    <div
      className={cn(
        "icdu-brand-card",
        interactive && "icdu-brand-card--interactive",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
