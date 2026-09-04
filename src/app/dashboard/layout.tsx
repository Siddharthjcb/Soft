import type { ReactNode } from "react";
import Link from "next/link";
import { PortalHeader } from "@/components/portal-header";
import { Container } from "@/components/ui/container";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PortalHeader />
      <div className="border-b border-border">
        <Container className="flex h-12 items-center gap-6">
          <Link
            href="/dashboard"
            className="font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-ink"
          >
            Orders
          </Link>
          <Link
            href="/dashboard/billing"
            className="font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-ink"
          >
            Billing
          </Link>
        </Container>
      </div>
      <div className="flex-1">{children}</div>
    </>
  );
}
