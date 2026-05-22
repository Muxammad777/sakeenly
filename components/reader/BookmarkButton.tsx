"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";

interface BookmarkButtonProps {
  ayahKey: string;
  isBookmarked: boolean;
  initialNote: string | null;
  isAuthenticated: boolean;
  /** Render-prop so the parent (AyahMenu) controls the visual chrome. */
  renderAs?: (args: { onClick: () => void; label: string; pending: boolean }) => React.ReactNode;
}

export function BookmarkButton({
  ayahKey,
  isBookmarked,
  isAuthenticated,
  renderAs,
}: BookmarkButtonProps) {
  const router = useRouter();
  const [optimistic, setOptimistic] = useState(isBookmarked);
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    if (!isAuthenticated) {
      router.push(`/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    const next = !optimistic;
    setOptimistic(next);
    startTransition(async () => {
      try {
        if (next) {
          const res = await fetch("/api/bookmarks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ayahKey }),
          });
          if (!res.ok) throw new Error(`POST /api/bookmarks ${res.status}`);
        } else {
          const res = await fetch(`/api/bookmarks?ayahKey=${encodeURIComponent(ayahKey)}`, {
            method: "DELETE",
          });
          if (!res.ok) throw new Error(`DELETE /api/bookmarks ${res.status}`);
        }
        router.refresh();
      } catch {
        setOptimistic(!next); // rollback on failure
      }
    });
  };

  const label = optimistic ? "💾 В закладках" : "💾 Закладка";

  if (renderAs) return <>{renderAs({ onClick: toggle, label, pending })}</>;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm text-fg-muted transition-colors hover:bg-bg-elevated hover:text-fg disabled:opacity-60"
    >
      {label}
    </button>
  );
}
