"use client";

// A 2px-tall gold line fixed to the top of the viewport that fills
// from left to right as the user scrolls. Cheap (one passive scroll
// listener), no layout impact. Hidden when there's nothing to scroll.

import { useEffect, useRef } from "react";

export function ScrollProgress() {
  const fillRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fill = fillRef.current;
    if (!fill) return;

    let raf = 0;
    const compute = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
      fill.style.transform = `scaleX(${pct / 100})`;
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { compute(); raf = 0; });
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", compute);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <div ref={fillRef} className="scroll-progress-fill" />
    </div>
  );
}
