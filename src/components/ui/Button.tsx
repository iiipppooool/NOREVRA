"use client";

import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "solid" | "outline" | "ghost" | "light";
type Size = "sm" | "md" | "lg";

const base =
  "group relative inline-flex items-center justify-center overflow-hidden select-none " +
  "label-lg whitespace-nowrap transition-[background-color,color,border-color,opacity] duration-500 " +
  "ease-[cubic-bezier(0.16,1,0.3,1)] disabled:opacity-40 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  solid: "bg-ink text-alabaster hover:bg-graphite",
  outline: "border border-ink/35 text-ink hover:border-ink hover:bg-ink hover:text-alabaster",
  light: "border border-alabaster/45 text-alabaster hover:bg-alabaster hover:text-ink",
  ghost: "text-ink hover:text-smoke px-0",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-5",
  md: "h-12 px-7",
  lg: "h-14 px-9",
};

/**
 * The label is rendered twice and the pair slides on hover. It is the only
 * ornament on the button, which is why it has to be exactly right: 0.55s on
 * an expo curve, both labels moving together.
 */
function Label({ children }: { children: ReactNode }) {
  return (
    <span className="relative block overflow-hidden">
      <span className="block transition-transform duration-[550ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full">
        {children}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 block translate-y-full transition-transform duration-[550ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0"
      >
        {children}
      </span>
    </span>
  );
}

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  full?: boolean;
};

export const Button = forwardRef<
  HTMLButtonElement,
  CommonProps & ButtonHTMLAttributes<HTMLButtonElement>
>(function Button({ variant = "solid", size = "md", className, children, full, ...rest }, ref) {
  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], full && "w-full", className)}
      {...rest}
    >
      <Label>{children}</Label>
    </button>
  );
});

export function ButtonLink({
  href,
  variant = "outline",
  size = "md",
  className,
  children,
  full,
  prefetch,
  ...rest
}: CommonProps & { href: string; prefetch?: boolean } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const external = href.startsWith("http");
  const cls = cn(base, variants[variant], sizes[size], full && "w-full", className);
  if (external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noreferrer noopener" {...rest}>
        <Label>{children}</Label>
      </a>
    );
  }
  return (
    <Link href={href} className={cls} prefetch={prefetch} {...rest}>
      <Label>{children}</Label>
    </Link>
  );
}

/** The house text link: an underline that draws itself in from the left. */
export function TextLink({
  href,
  children,
  className,
  ...rest
}: { href: string; children: ReactNode; className?: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const cls = cn("link-draw label-lg text-ink", className);
  if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}
