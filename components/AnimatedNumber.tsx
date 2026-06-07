"use client";

// AnimatedNumber — counts from 0 (or a `from` value) up to `to` as soon
// as the element enters the viewport. Uses requestAnimationFrame with an
// ease-out cubic so big numbers (6,236) feel like they're being tallied,
// not just incremented. Honours prefers-reduced-motion.

import { useEffect, useRef, useState } from "react";

interface Props {
  to: number;
  from?: number;
  /** Animation duration in ms. Defaults to 1400. */
  duration?: number;
  /** Optional locale for formatting (defaults to user's). */
  locale?: string;
  /** Re-trigger animation every time the element enters the viewport. */
  retrigger?: boolean;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function AnimatedNumber({ to, from = 0, duration = 1400, locale, retrigger = false }: Props) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [value, setValue] = useState(from);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { setValue(to); return; }

    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const v = from + (to - from) * easeOutCubic(t);
        setValue(v);
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      let raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          if (!retrigger && startedRef.current) return;
          startedRef.current = true;
          run();
        }
      }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [to, from, duration, retrigger]);

  const formatted = Number.isFinite(value)
    ? Math.round(value).toLocaleString(locale ?? undefined)
    : String(to);

  return <span ref={ref}>{formatted}</span>;
}
