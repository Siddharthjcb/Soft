import type { ReactNode } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { PortalHeader } from "@/components/portal-header";
import { Container } from "@/components/ui/container";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Authoritative admin gate: role lives on the User model (CLAUDE.md).
  // Non-admins are redirected to /dashboard.
  await requireAdmin();

  return (
    <>
      <PortalHeader />
      <div className="border-b border-border">
        <Container className="flex h-12 items-center gap-6">
          <Link
            href="/admin"
            className="font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-ink"
          >
            Orders
          </Link>
          <Link
            href="/admin/customers"
            className="font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-ink"
          >
            Customers
          </Link>
        </Container>
      </div>
      <div className="flex-1">{children}</div>
    </>
  );
}
