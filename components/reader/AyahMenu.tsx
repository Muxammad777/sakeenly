"use client";

import { useState } from "react";
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
  const [open, setOpen] = useState(false);
  const { playOne } = useAudioPlayer();

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
            label="📝 Заметка"
            hint="откройте закладку"
            disabled
            onClick={() => setOpen(false)}
          />
          <MenuItem
            icon={<Share2 className="h-4 w-4" />}
            label="📤 Поделиться"
            onClick={handleShare}
          />
        </Popover.Content>
      </Popover.Portal>
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
