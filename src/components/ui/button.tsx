import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary";

const base =
  "inline-flex h-11 items-center justify-center rounded-lg px-5 text-sm font-medium transition-opacity duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-paper hover:opacity-90",
  secondary: "border border-border text-ink hover:bg-faint",
};

export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
  ...props
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </Link>
  );
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: {
  variant?: Variant;
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
