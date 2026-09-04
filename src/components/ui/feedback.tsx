import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";

/** Centered message block for 404 / error / empty full-page states. */
export function PageMessage({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <Container>
      <div className="flex min-h-[60vh] flex-col items-start justify-center gap-4 py-24">
        {eyebrow && (
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        {children}
      </div>
    </Container>
  );
}

function Bar({ className = "" }: { className?: string }) {
  return <div className={`rounded bg-faint ${className}`} />;
}

/** Skeleton for a list page (dashboard, admin queue). */
export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <Container>
      <div className="flex flex-col gap-10 py-16 sm:py-24">
        <Bar className="h-9 w-48" />
        <div className="flex flex-col divide-y divide-border rounded-xl border border-border">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2 p-5">
              <Bar className="h-3 w-40" />
              <Bar className="h-4 w-64" />
              <Bar className="h-3 w-32" />
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}

/** Skeleton for a detail page (order detail). */
export function DetailSkeleton() {
  return (
    <Container>
      <div className="flex flex-col gap-10 py-16 sm:py-24">
        <Bar className="h-3 w-24" />
        <Bar className="h-9 w-64" />
        <div className="flex flex-col gap-3 rounded-xl border border-border p-5">
          <Bar className="h-4 w-full" />
          <Bar className="h-4 w-5/6" />
          <Bar className="h-4 w-2/3" />
        </div>
      </div>
    </Container>
  );
}
