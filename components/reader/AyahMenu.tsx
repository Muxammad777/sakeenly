"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import * as Popover from "@radix-ui/react-popover";
import { Bookmark, Share2, Sparkles, Headphones, StickyNote, MoreHorizontal } from "lucide-react";
import { useAudioPlayer } from "./AudioPlayerProvider";
import { BookmarkButton } from "./BookmarkButton";

interface AyahMenuProps {
  ayahKey: string; // "1:1"
  audioUrl?: string;
  isBookmarked: boolean;
  initialNote?: string | null;
  isAuthenticated: boolean;
}

export function AyahMenu({
  ayahKey,
  audioUrl,
  isBookmarked,
  initialNote,
  isAuthenticated,
}: AyahMenuProps) {
  const router = useRouter();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState(initialNote ?? "");
  const [noteSaving, setNoteSaving] = useState(false);
  const { playOne } = useAudioPlayer();

  const openNote = () => {
    if (!isAuthenticated) {
      window.location.href = `/${locale}/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    setNoteText(initialNote ?? "");
    setOpen(false);
    setNoteOpen(true);
  };

  const saveNote = async () => {
    if (noteSaving) return;
    setNoteSaving(true);
    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ayahKey, note: noteText.trim() || undefined }),
      });
      if (res.ok) {
        setNoteOpen(false);
        router.refresh();
      }
    } finally {
      setNoteSaving(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/reader/${ayahKey.replace(":", "/")}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: `Sakeenly · ${ayahKey}`, url });
      } catch {
        /* user cancelled — silent */
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
    setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label={`Действия для аята ${ayahKey}`}
          className="grid h-9 w-9 place-items-center rounded-full text-fg-muted transition-colors hover:bg-bg-elevated hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          className="z-40 w-56 rounded-xl border border-border bg-bg-elevated p-1 shadow-lg"
        >
          <MenuItem
            icon={<Sparkles className="h-4 w-4" />}
            label="💬 Объяснить"
            hint="скоро"
            disabled
            onClick={() => setOpen(false)}
          />
          {audioUrl ? (
            <MenuItem
              icon={<Headphones className="h-4 w-4" />}
              label="🎵 Слушать аят"
              onClick={() => {
                playOne({ url: audioUrl, ayahKey });
                setOpen(false);
              }}
            />
          ) : null}
          <BookmarkButton
            ayahKey={ayahKey}
            isBookmarked={isBookmarked}
            initialNote={initialNote ?? null}
            isAuthenticated={isAuthenticated}
            renderAs={({ onClick, label }) => (
              <MenuItem
                icon={<Bookmark className="h-4 w-4" />}
                label={label}
                onClick={() => {
                  onClick();
                  setOpen(false);
                }}
              />
            )}
          />
          <MenuItem
            icon={<StickyNote className="h-4 w-4" />}
            label={initialNote ? "📝 Заметка ✓" : "📝 Заметка"}
            onClick={openNote}
          />
          <MenuItem
            icon={<Share2 className="h-4 w-4" />}
            label="📤 Поделиться"
            onClick={handleShare}
          />
        </Popover.Content>
      </Popover.Portal>

      {noteOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setNoteOpen(false); }}
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-bg-elevated p-5 shadow-2xl">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-fg-muted">
                Заметка · {ayahKey}
              </h3>
              <button
                type="button"
                onClick={() => setNoteOpen(false)}
                className="grid h-7 w-7 place-items-center rounded-full text-fg-muted hover:bg-bg hover:text-fg"
                aria-label="Закрыть"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Твоя заметка к этому аяту…"
              maxLength={2000}
              rows={6}
              autoFocus
              className="block w-full resize-none rounded-xl border border-border bg-bg p-3 text-sm text-fg outline-none transition-colors focus:border-accent"
            />
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] text-fg-muted">{noteText.length} / 2000</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNoteOpen(false)}
                  className="rounded-full px-4 py-1.5 text-sm text-fg-muted hover:bg-bg hover:text-fg"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={saveNote}
                  disabled={noteSaving}
                  className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-fg transition-opacity disabled:opacity-60"
                >
                  {noteSaving ? "Сохраняю…" : "Сохранить"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Popover.Root>
  );
}

function MenuItem({
  icon,
  label,
  hint,
  disabled,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm text-fg outline-none transition-colors hover:bg-bg disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="flex items-center gap-2">
        <span className="text-fg-muted">{icon}</span>
        {label}
      </span>
      {hint ? <span className="text-xs text-fg-muted">{hint}</span> : null}
    </button>
  );
}
