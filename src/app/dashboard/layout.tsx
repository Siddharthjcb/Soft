import type { ReactNode } from "react";
import { PortalHeader } from "@/components/portal-header";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PortalHeader />
      <div className="flex-1">{children}</div>
    </>
  );
}
