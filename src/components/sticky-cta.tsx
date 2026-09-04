"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { STICKY_CTA } from "@/lib/cta";

/**
 * A single line pinned to the bottom on mobile once the hero has scrolled
 * away. Dismissible, and it stays dismissed for the visit.
 *
 * This is the one piece of "sticky" the direction allows: it is genuine UX
 * (the primary action is otherwise off-screen for the whole page) rather than
 * a nag. No countdown, no urgency, no re-appearing.
 */
export function StickyCta() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed]);

  if (dismissed) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 md:hidden"
      style={{
        transform: show ? "translateY(0)" : "translateY(100%)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      aria-hidden={!show}
    >
      <div className="flex items-center justify-between gap-4 bg-clay px-5 py-3.5">
        <Link
          href={STICKY_CTA.href}
          className="text-[15px] font-medium text-paper"
          tabIndex={show ? 0 : -1}
        >
          {STICKY_CTA.label}
        </Link>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          tabIndex={show ? 0 : -1}
          className="px-2 text-lg leading-none text-paper/75"
        >
          ×
        </button>
      </div>
    </div>
  );
}
