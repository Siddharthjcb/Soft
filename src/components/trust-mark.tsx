"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  TRUST_THRESHOLDS,
  TRANSPARENCY,
  lineFor,
  type TrustContext,
} from "@/lib/trust-mark";

const STORAGE_KEY = "seen-before";

/**
 * Two <TrustMark>s mount per page (the mobile inline one and the desktop
 * fixture; CSS hides one). Reading localStorage per instance meant the first
 * to mount set the flag and the second immediately read itself as a returning
 * visitor. Resolve it once per page load and share the answer.
 */
let returningVisitor: boolean | null = null;

function readReturningOnce(): boolean {
  if (returningVisitor !== null) return returningVisitor;
  try {
    returningVisitor = window.localStorage.getItem(STORAGE_KEY) === "1";
    window.localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    returningVisitor = false; // private mode — treat as a first visit
  }
  return returningVisitor;
}

/**
 * Derives the Mark's context from what the visitor is actually doing.
 * Deliberately coarse — the point is that the line feels apt, not that we
 * track anyone.
 */
function useTrustContext(signingUp: boolean): {
  context: TrustContext;
  visible: boolean;
} {
  const [context, setContext] = useState<TrustContext>("arrive");
  const [visible, setVisible] = useState(false);
  const browsing = useRef(false);

  useEffect(() => {
    const returning = readReturningOnce();

    const appear = setTimeout(
      () => setVisible(true),
      TRUST_THRESHOLDS.appearAfterMs,
    );
    // localStorage cannot be read during render without a hydration mismatch.
    // Safe here: the Mark is still invisible for appearAfterMs, so this swap
    // is never seen — which is also why it must not animate.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (returning) setContext("returning");

    const promote = () => {
      if (browsing.current) return;
      browsing.current = true;
      setContext((c) => (c === "arrive" || c === "returning" ? "browsing" : c));
    };

    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max > TRUST_THRESHOLDS.browsingAtScroll) {
        promote();
      }
    };

    const dwell = setTimeout(promote, TRUST_THRESHOLDS.browsingAfterMs);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      clearTimeout(appear);
      clearTimeout(dwell);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return { context: signingUp ? "signing-up" : context, visible };
}

/** The proofreader's mark. Drawn, not an icon-set import. */
function Mark({ className = "" }: { className?: string }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M2 11.5 L5.5 15 L15 3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="square"
      />
      <path
        d="M2 3 L5.5 6.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="square"
        opacity="0.45"
      />
    </svg>
  );
}

export function TrustMark({
  signingUp = false,
  inline = false,
}: {
  signingUp?: boolean;
  /** mobile / in-flow placement instead of the desktop fixture */
  inline?: boolean;
}) {
  const { context, visible } = useTrustContext(signingUp);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const line = lineFor(context);

  const position = inline
    ? "relative w-full"
    : "fixed bottom-10 left-8 z-40 hidden max-w-sm md:block";

  return (
    <div
      className={`${position} transition-opacity duration-700`}
      style={{ opacity: visible ? 1 : 0 }}
    >
      {open && (
        <div className="mb-2 border border-ink bg-surface p-7">
          <div className="mb-5 flex items-center gap-3">
            <Mark className="text-clay" />
            <h2 className="font-display text-xl font-semibold tracking-tight">
              {TRANSPARENCY.heading}
            </h2>
          </div>
          <p className="mb-5 text-sm leading-relaxed">{TRANSPARENCY.body}</p>
          <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-muted">
            {TRANSPARENCY.promisesHeading}
          </p>
          <ul className="mb-6 flex flex-col gap-2">
            {TRANSPARENCY.promises.map((p) => (
              <li key={p} className="text-sm leading-snug">
                —&nbsp; {p}
              </li>
            ))}
          </ul>
          <Link
            href={TRANSPARENCY.href}
            className="border-b border-clay pb-0.5 text-sm text-clay"
          >
            {TRANSPARENCY.linkLabel} →
          </Link>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 border border-border bg-surface px-4 py-3 text-left transition-colors hover:border-clay"
      >
        <span className="shrink-0 text-clay">
          <Mark />
        </span>
        <span className="text-[13.5px] leading-snug">{line}</span>
        <span className="ml-auto font-mono text-sm text-muted">
          {open ? "−" : "+"}
        </span>
      </button>
    </div>
  );
}
