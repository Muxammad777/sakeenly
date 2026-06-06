"use client";

// Small client island inside the prophet-story page. Lets the kid mark
// the story as read (→ contributes to streak + "first story" badge).
// Wrapped in its own <KidsProvider> so the host server page stays clean.

import { KidsProvider, useKids } from "./KidsProvider";

function ReadButton({ slug, label, labelDone }: { slug: string; label: string; labelDone: string }) {
  const { stories, mark, authed, loading } = useKids();
  const status = stories.get(slug)?.status;
  const done = status === "learned";

  if (loading) return null;
  if (!authed) return null;

  return (
    <button
      type="button"
      className={"kid-story-read " + (done ? "done" : "")}
      onClick={() => { if (!done) void mark({ type: "story", key: slug, status: "learned" }); }}
      disabled={done}
    >
      {done ? (
        <>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          <span>{labelDone}</span>
        </>
      ) : (
        <span>{label}</span>
      )}
    </button>
  );
}

export function KidStoryRead({ slug, label, labelDone }: { slug: string; label: string; labelDone: string }) {
  return (
    <KidsProvider>
      <ReadButton slug={slug} label={label} labelDone={labelDone} />
    </KidsProvider>
  );
}
