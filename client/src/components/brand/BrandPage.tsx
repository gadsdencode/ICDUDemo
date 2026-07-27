import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { SiteFooter } from "@/components/SiteFooter";

/** Consistent interior-page wrapper — warm ground + editorial rhythm */
export function BrandPage({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("icdu-page flex flex-col", className)} {...props}>
      <div className="icdu-page-inner flex-1 w-full">{children}</div>
      <SiteFooter />
    </div>
  );
}
