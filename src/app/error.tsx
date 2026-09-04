"use client";

import { useEffect } from "react";
import { PageMessage } from "@/components/ui/feedback";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageMessage eyebrow="Error" title="Something went wrong">
      <p className="max-w-md text-base leading-relaxed text-muted">
        This page failed to load. Try again, or head back and retry.
      </p>
      <Button onClick={reset}>Try again</Button>
    </PageMessage>
  );
}
