"use client";

import { useEffect, useRef } from "react";

/**
 * Hero backdrop: 4-layer composition for the landing first-fold.
 *
 *   1. Mosque photograph (kept from previous design, owned by /public/hero-mosque.jpg)
 *   2. Dark gradient sheet for headline contrast
 *   3. Giant Arabic word "السكينة" rendered super-thin at very low opacity behind the headline
 *   4. Cursor-following golden spotlight + a small constellation of slowly-drifting 8-point stars
 *
 * Renders zero text the user reads — purely ornamental. Headline + CTAs
 * sit ABOVE this on a higher z-index in page.tsx.
 */
export function HeroBackdrop() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let rafId = 0;
    let pendingX = 50;
    let pendingY = 35;

    const onMove = (e: MouseEvent) => {
      const r = root.getBoundingClientRect();
      if (e.clientY < r.top || e.clientY > r.bottom) return;
      pendingX = ((e.clientX - r.left) / r.width) * 100;
      pendingY = ((e.clientY - r.top) / r.height) * 100;
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          rafId = 0;
          root.style.setProperty("--sx", pendingX.toFixed(2) + "%");
          root.style.setProperty("--sy", pendingY.toFixed(2) + "%");
        });
      }
    };

    // Light parallax on the photo layer as user scrolls within the hero
    const onScroll = () => {
      const r = root.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height)));
      root.style.setProperty("--py", (progress * 18).toFixed(1) + "px");
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div ref={ref} className="hero-bg-root" aria-hidden="true">
      {/* Layer 1: photograph (parallax via --py) */}
      <div className="hero-bg-photo" />
      {/* Layer 2: dark gradient veil + ambient gold mesh */}
      <div className="hero-bg-veil" />
      {/* Layer 3: cursor-following golden spotlight */}
      <div className="hero-bg-spotlight" />
      {/* Layer 4: giant calligraphy "السكينة" — the word for tranquillity */}
      <div className="hero-bg-calligraphy" lang="ar" dir="rtl">
        السكينة
      </div>
      {/* Layer 5: drifting stars constellation */}
      <svg className="hero-bg-stars" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <symbol id="hb-star" viewBox="0 0 24 24">
            <path d="M12 2 L14.2 9.8 L22 12 L14.2 14.2 L12 22 L9.8 14.2 L2 12 L9.8 9.8 Z" />
          </symbol>
        </defs>
        <g fill="currentColor">
          <use href="#hb-star" x={100}  y={120} width={18} height={18} style={{ animationDelay: "0s"  }} />
          <use href="#hb-star" x={320}  y={60}  width={10} height={10} style={{ animationDelay: "1.4s" }} />
          <use href="#hb-star" x={520}  y={200} width={14} height={14} style={{ animationDelay: "2.6s" }} />
          <use href="#hb-star" x={780}  y={90}  width={20} height={20} style={{ animationDelay: "0.6s" }} />
          <use href="#hb-star" x={980}  y={170} width={12} height={12} style={{ animationDelay: "3.2s" }} />
          <use href="#hb-star" x={1080} y={380} width={16} height={16} style={{ animationDelay: "1.8s" }} />
          <use href="#hb-star" x={140}  y={460} width={14} height={14} style={{ animationDelay: "4.0s" }} />
          <use href="#hb-star" x={420}  y={520} width={9}  height={9}  style={{ animationDelay: "0.2s" }} />
        </g>
      </svg>
    </div>
  );
}
