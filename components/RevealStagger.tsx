"use client";

// RevealStagger — when this container scrolls into view, its direct
// children fade+rise one after the other with a small delay between
// each (default 70ms). Safe by design: server-rendered children are
// fully visible; only after the client mounts do we prime them to
// `opacity: 0` and then let the IntersectionObserver play them in.
// If JS never runs (very slow / broken), the cards stay visible — no
// ghost-bug regression.

import { useEffect, useRef, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  /** ms between each child's reveal start. Default 70. */
  delayStep?: number;
  /** ms of animation length per child. Default 600. */
  duration?: number;
  /** IntersectionObserver root margin / threshold. */
  threshold?: number;
}

export function RevealStagger({ children, className, delayStep = 70, duration = 600, threshold = 0.15 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const children = Array.from(el.children) as HTMLElement[];
    // Prime: invisible + ready for the keyframes to run.
    for (const c of children) {
      c.style.willChange = "opacity, transform";
      c.style.opacity = "0";
      c.style.transform = "translateY(14px)";
      c.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`;
    }

    const play = () => {
      children.forEach((c, i) => {
        const d = i * delayStep;
        setTimeout(() => {
          c.style.opacity = "1";
          c.style.transform = "translateY(0)";
        }, d);
      });
    };

    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) { play(); io.disconnect(); return; }
      }
    }, { threshold });
    io.observe(el);

    return () => io.disconnect();
  }, [delayStep, duration, threshold]);

  return <div ref={ref} className={className}>{children}</div>;
}
