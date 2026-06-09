"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  /** Max tilt in degrees. Default 4. */
  tilt?: number;
}

/**
 * MagneticCard — wraps any card so it gets two interactions on hover:
 *
 *   1. CSS variables --mx / --my track the mouse position inside the card
 *      (0..100 %). Stylesheets use these to render a soft golden spotlight
 *      that follows the cursor.
 *
 *   2. The wrapper receives a tiny 3D tilt (rotateX/rotateY based on the
 *      same coordinates). Subtle — 4° max — reads as "alive", not toy.
 *
 * Deliberately a plain <div> so it composes cleanly with next-intl <Link>
 * (the link sits inside and remains the actual clickable element).
 */
export function MagneticCard({ children, className, tilt = 4 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let raf = 0;
    let px = 50, py = 50;

    const apply = () => {
      raf = 0;
      el.style.setProperty("--mx", px.toFixed(1) + "%");
      el.style.setProperty("--my", py.toFixed(1) + "%");
      const rx = ((py - 50) / 50) * -tilt;
      const ry = ((px - 50) / 50) * tilt;
      el.style.setProperty("--tilt-rx", rx.toFixed(2) + "deg");
      el.style.setProperty("--tilt-ry", ry.toFixed(2) + "deg");
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      px = ((e.clientX - r.left) / r.width) * 100;
      py = ((e.clientY - r.top) / r.height) * 100;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      px = 50; py = 50;
      el.style.setProperty("--tilt-rx", "0deg");
      el.style.setProperty("--tilt-ry", "0deg");
      el.style.setProperty("--mx", "50%");
      el.style.setProperty("--my", "50%");
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [tilt]);

  return (
    <div ref={ref} className={`magnetic ${className ?? ""}`.trim()} data-magnetic="1">
      <span className="magnetic-glow" aria-hidden="true" />
      {children}
    </div>
  );
}
