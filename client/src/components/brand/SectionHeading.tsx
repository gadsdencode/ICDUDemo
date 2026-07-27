import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SectionHeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4";
  /** Use Sora display face instead of Instrument Serif */
  display?: boolean;
}

export function SectionHeading({
  as: Tag = "h2",
  display = false,
  className,
  children,
  ...props
}: SectionHeadingProps) {
  return (
    <Tag
      className={cn(
        display ? "icdu-display-heading" : "icdu-section-heading",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
