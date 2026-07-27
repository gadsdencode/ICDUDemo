import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type SharedProps = {
  asChild?: boolean;
  className?: string;
  children?: React.ReactNode;
};

type SecondaryCTAButtonProps = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type SecondaryCTAAnchorProps = SharedProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export type SecondaryCTAProps = SecondaryCTAButtonProps | SecondaryCTAAnchorProps;

export const SecondaryCTA = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  SecondaryCTAProps
>(function SecondaryCTA({ asChild = false, className, children, ...props }, ref) {
  if (asChild) {
    return (
      <Slot className={cn("icdu-cta-secondary", className)} ref={ref} {...props}>
        {children}
      </Slot>
    );
  }

  if ("href" in props && props.href) {
    const { href, ...anchorProps } = props as SecondaryCTAAnchorProps;
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={cn("icdu-cta-secondary", className)}
        {...anchorProps}
      >
        {children}
      </a>
    );
  }

  const buttonProps = props as SecondaryCTAButtonProps;
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={buttonProps.type ?? "button"}
      className={cn("icdu-cta-secondary", className)}
      {...buttonProps}
    >
      {children}
    </button>
  );
});
