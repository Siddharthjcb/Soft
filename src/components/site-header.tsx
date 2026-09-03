import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";

const NAV = [
  { href: "/pricing", label: "Pricing" },
  { href: "/portfolio", label: "Work" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-paper/70 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-widest text-ink"
        >
          Website Ordering
        </Link>

        <nav className="flex items-center gap-6">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hidden text-sm text-muted transition-opacity hover:text-ink sm:block"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/sign-in"
            className="text-sm text-muted transition-opacity hover:text-ink"
          >
            Sign in
          </Link>
          <ButtonLink href="/order/new">Start an order</ButtonLink>
        </nav>
      </Container>
    </header>
  );
}
