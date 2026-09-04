"use client";

import { useEffect, useState } from "react";
import {
  LANGUAGES,
  nextIndex,
  startIndex,
  preferredIndex,
  type PhraseKey,
} from "@/lib/languages";

const FADE_MS = 420;

/**
 * Rotates a short phrase through twelve Indian scripts.
 *
 * Deliberately restrained: one at a time, a crossfade with a 6px rise, a long
 * hold. Not a ticker. `offset` staggers instances so two are never mid-change
 * together.
 *
 * Suppressed entirely — one script, no motion — under prefers-reduced-motion
 * or save-data, preferring the viewer's own script when we serve it. Also
 * pauses while the tab is hidden, so it isn't animating in a background tab.
 */
export function LanguageCycle({
  phrase = "welcome",
  offset = 0,
  holdMs = 3800,
  className = "",
}: {
  phrase?: PhraseKey;
  offset?: number;
  holdMs?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(() => startIndex(offset));
  const [shown, setShown] = useState(true);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const saveData =
      (
        navigator as Navigator & {
          connection?: { saveData?: boolean };
        }
      ).connection?.saveData === true;

    if (reduced || saveData) {
      // Pin to one script and never animate. This is the only place we can
      // read navigator, so it cannot be derived during render without a
      // hydration mismatch — a one-time, mount-derived swap is correct here.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIndex(preferredIndex(navigator.languages ?? [navigator.language]));
      return;
    }

    let swap: ReturnType<typeof setTimeout> | undefined;
    const tick = setInterval(() => {
      if (document.hidden) return;
      setShown(false);
      swap = setTimeout(() => {
        setIndex((i) => nextIndex(i));
        setShown(true);
      }, FADE_MS);
    }, holdMs);

    return () => {
      clearInterval(tick);
      if (swap) clearTimeout(swap);
    };
  }, [holdMs]);

  const entry = LANGUAGES[index];

  return (
    <span
      className={`inline-block ${className}`}
      style={{
        fontFamily: `var(${entry.fontVar}), serif`,
        lineHeight: entry.tall ? 1.5 : 1.2,
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(6px)",
        transition: `opacity ${FADE_MS}ms ease-out, transform ${FADE_MS}ms ease-out`,
      }}
      lang={entry.id}
      aria-label={`${entry[phrase]} (${entry.label})`}
    >
      {entry[phrase]}
    </span>
  );
}
