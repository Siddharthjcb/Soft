import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Container } from "@/components/ui/container";

export function PortalHeader() {
  return (
    <header className="border-b border-border">
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-widest text-ink"
        >
          Website Ordering
        </Link>
        <UserButton />
      </Container>
    </header>
  );
}
