import type { ReactNode } from "react";

/** Centered content column — max 1200px with the DESIGN.md side padding. */
export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto w-full max-w-[1200px] px-5 sm:px-10 lg:px-16 ${className}`}
    >
      {children}
    </div>
  );
}
