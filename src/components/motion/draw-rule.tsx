"use client";

import { useEffect, useRef } from "react";

/**
 * A hairline that draws itself left-to-right as it enters the viewport —
 * the "dimension line" motif that ties sections together.
 *
 * Renders as a normal 1px rule with no JS, so reduced-motion and no-JS both
 * get the finished line rather than nothing.
 */
export function DrawRule({
  className = "",
  hard = false,
}: {
  className?: string;
  /** hard = the ink-weight section break; otherwise a warm hairline */
  hard?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    void (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        gsap.from(el, {
          scaleX: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
        });
      }, el);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`h-px w-full origin-left ${hard ? "bg-ink" : "bg-border"} ${className}`}
    />
  );
}
