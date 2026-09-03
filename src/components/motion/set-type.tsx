"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * "Type sets" — the editorial surface's signature reveal.
 *
 * On scroll-in the element fades up 8px while its variable-font weight settles
 * from `from` to `to`. GSAP is imported dynamically so it never lands in the
 * initial bundle.
 *
 * Under prefers-reduced-motion nothing animates and nothing is lost: the
 * element is already in its final state in the markup, so the reduced path is
 * simply "do nothing".
 */
export function SetType({
  as: Tag = "div",
  children,
  className = "",
  from = 480,
  to = 600,
  delay = 0,
  weight = true,
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  from?: number;
  to?: number;
  delay?: number;
  /** set false for body copy that should not shift weight */
  weight?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);

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
        const vars: Record<string, unknown> = {
          opacity: 0,
          y: 8,
          duration: 0.5,
          ease: "power2.out",
          delay,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        };
        if (weight) vars["--wght"] = from;
        gsap.from(el, vars);
      }, el);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [from, delay, weight]);

  return (
    <Tag
      ref={ref}
      className={className}
      style={
        weight
          ? ({
              "--wght": to,
              fontVariationSettings: '"wght" var(--wght)',
            } as React.CSSProperties)
          : undefined
      }
    >
      {children}
    </Tag>
  );
}
