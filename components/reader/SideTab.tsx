"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface SideTabProps {
  /** Which edge of the viewport the tab + drawer attach to. */
  side: "left" | "right";
  /** Short vertical label shown on the floating tab (e.g. "ПЕРЕВОД"). */
  label: string;
  /** Optional aria-label override if the visible label is too short. */
  ariaLabel?: string;
  /** Drawer contents. */
  children: React.ReactNode;
}

/**
 * Mobile-only floating side tab + slide-in drawer.
 *
 * Renders a thin vertical button hugging the left or right viewport edge.
 * Tap opens a drawer from the same edge containing `children`. Tap on the
 * backdrop or X closes. Body scroll is locked while open.
 *
 * Hidden on ≥720px (desktop) via `.side-tab` CSS — the existing inline
 * pickers (trans-bar, AudioPlayer reciter chip) are the desktop UX.
 */
export function SideTab({ side, label, ariaLabel, children }: SideTabProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={`side-tab side-tab-${side}`}
        aria-label={ariaLabel ?? label}
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <span className="side-tab-label">{label}</span>
      </button>

      {open && mounted && createPortal(
        <>
          <div
            className="side-tab-backdrop"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            className={`side-tab-drawer side-tab-drawer-${side}`}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel ?? label}
          >
            <div className="side-tab-drawer-head">
              <span className="side-tab-drawer-title">{label}</span>
              <button
                type="button"
                aria-label="Закрыть"
                onClick={() => setOpen(false)}
                className="side-tab-drawer-close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="side-tab-drawer-body">
              {children}
            </div>
          </div>
        </>,
        document.body,
      )}
    </>
  );
}
