import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "article";
}

/**
 * Previously a scroll-reveal wrapper (IntersectionObserver + opacity 0→1).
 * That paradigm hid content below the fold whenever JS was slow, the observer
 * fired late, or the page was captured before scroll — a class of "ghost" bugs
 * worse than the absence of a fade-in. Now a plain wrapper: section ships
 * visible, always.
 */
export function Reveal({ children, className, as: Tag = "div" }: RevealProps) {
  const Element = Tag as keyof JSX.IntrinsicElements;
  return <Element className={className}>{children}</Element>;
}
