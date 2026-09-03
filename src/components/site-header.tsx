import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { PRIMARY_CTA } from "@/lib/cta";

const NAV = [
  { href: "/portfolio", label: "Work" },
  { href: "/pricing", label: "Pricing" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-paper/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-[-0.02em]"
        >
          [STUDIO&nbsp;NAME]
        </Link>

        <nav className="flex items-center gap-5 sm:gap-7">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hidden text-[15px] text-muted transition-colors hover:text-ink sm:block"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/sign-in"
            className="hidden text-[15px] text-muted transition-colors hover:text-ink sm:block"
          >
            Sign in
          </Link>
          <ButtonLink href={PRIMARY_CTA.href}>{PRIMARY_CTA.label}</ButtonLink>
        </nav>
      </Container>
    </header>
  );
}
