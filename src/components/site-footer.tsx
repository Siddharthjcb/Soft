import Link from "next/link";
import { Container } from "@/components/ui/container";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <Container className="flex flex-col gap-6 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-xs uppercase tracking-widest text-ink">
            Website Ordering
          </span>
          <span className="text-sm text-muted">
            Order a website, pay online, track it to delivery.
          </span>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          <Link href="/pricing" className="transition-opacity hover:text-ink">
            Pricing
          </Link>
          <Link href="/portfolio" className="transition-opacity hover:text-ink">
            Work
          </Link>
          <Link href="/order/new" className="transition-opacity hover:text-ink">
            Start an order
          </Link>
          <Link href="/sign-in" className="transition-opacity hover:text-ink">
            Sign in
          </Link>
        </nav>
      </Container>

      <Container className="pb-10">
        <p className="font-mono text-xs text-muted">
          © {year} · All prices in ₹ (INR)
        </p>
      </Container>
    </footer>
  );
}
