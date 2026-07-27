import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type SharedProps = {
  asChild?: boolean;
  className?: string;
  children?: React.ReactNode;
};

type PrimaryCTAButtonProps = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type PrimaryCTAAnchorProps = SharedProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export type PrimaryCTAProps = PrimaryCTAButtonProps | PrimaryCTAAnchorProps;

export const PrimaryCTA = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  PrimaryCTAProps
>(function PrimaryCTA({ asChild = false, className, children, ...props }, ref) {
  if (asChild) {
    return (
      <Slot className={cn("icdu-cta-primary", className)} ref={ref} {...props}>
        {children}
      </Slot>
    );
  }

  if ("href" in props && props.href) {
    const { href, ...anchorProps } = props as PrimaryCTAAnchorProps;
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={cn("icdu-cta-primary", className)}
        {...anchorProps}
      >
        {children}
      </a>
    );
  }

  const buttonProps = props as PrimaryCTAButtonProps;
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={buttonProps.type ?? "button"}
      className={cn("icdu-cta-primary", className)}
      {...buttonProps}
    >
      {children}
    </button>
  );
});
