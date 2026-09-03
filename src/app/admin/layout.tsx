import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth";
import { PortalHeader } from "@/components/portal-header";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Authoritative admin gate: role lives on the User model (CLAUDE.md).
  // Non-admins are redirected to /dashboard.
  await requireAdmin();
  return (
    <>
      <PortalHeader />
      <div className="flex-1">{children}</div>
    </>
  );
}
