import Link from "next/link";
import { Container } from "@/components/ui/container";
import { LanguageCycle } from "@/components/language-cycle";
import { PRIMARY_CTA } from "@/lib/cta";

const LINKS = [
  { href: "/pricing", label: "Pricing" },
  { href: "/portfolio", label: "Work" },
  { href: PRIMARY_CTA.href, label: "Start a site" },
  { href: "/sign-in", label: "Sign in" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <Container className="flex flex-col gap-8 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <span className="font-display text-lg font-semibold tracking-[-0.02em]">
            [STUDIO&nbsp;NAME]
          </span>
          <span className="text-[15px] text-muted">
            Built by a person, not a pipeline. Coimbatore.
          </span>
          {/* the quiet third placement — slow, always on */}
          <LanguageCycle
            phrase="welcome"
            offset={3}
            holdMs={8000}
            className="mt-1 text-xl text-clay"
          />
        </div>

        <nav className="flex flex-wrap gap-x-7 gap-y-2 text-[15px] text-muted">
          {LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="transition-colors hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </Container>

      <Container className="pb-10">
        <p className="font-mono text-xs text-muted">
          © {year} · All prices in ₹ (INR), provisional
        </p>
      </Container>
    </footer>
  );
}
