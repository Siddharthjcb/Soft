"use client";

import { useEffect } from "react";

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
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: "1rem",
          padding: "6rem 1.25rem",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          background: "#fff",
          color: "#0a0a0a",
        }}
      >
        <h1 style={{ fontSize: "1.75rem", fontWeight: 600 }}>
          Something went wrong
        </h1>
        <button
          type="button"
          onClick={reset}
          style={{
            height: 44,
            padding: "0 1.25rem",
            borderRadius: 8,
            background: "#0a0a0a",
            color: "#fff",
            border: "none",
            fontSize: "0.875rem",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
