"use client";

// Top-level kids context: loads the user's first profile and exposes
// progress maps + a mark() mutation that the rest of the kids UI calls.
//
// Per spec we boot with a single auto-created profile (the API GET seeds it
// on first request), so most users will only ever see one. Switching between
// multiple kids is a future-tier feature — already supported by the schema.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface KidProfile {
  id: string;
  name: string;
  ageBand: string;
  avatarSlug: string;
  streakCurrent: number;
  streakLongest: number;
  lastActiveDate: string | null;
  learnedLetters: number;
  learnedSurahs: number;
  readStories: number;
  badges: string[];
}

export type KidsProgressType = "letter" | "surah" | "story";
export type KidsProgressStatus = "in_progress" | "learned";

export interface KidsProgressRow {
  type: KidsProgressType;
  key: string;
  status: KidsProgressStatus;
  traceScore: number;
  reciteScore: number;
  attempts: number;
  masteredAt: string | null;
}

interface MarkInput {
  type: KidsProgressType;
  key: string;
  status?: KidsProgressStatus;
  traceScore?: number;
  reciteScore?: number;
}

interface KidsCtx {
  loading: boolean;
  authed: boolean;
  profile: KidProfile | null;
  letters: Map<string, KidsProgressRow>;
  surahs: Map<string, KidsProgressRow>;
  stories: Map<string, KidsProgressRow>;
  badges: Set<string>;
  freshBadges: string[];
  consumeFreshBadges: () => void;
  mark: (input: MarkInput) => Promise<void>;
  refresh: () => Promise<void>;
}

const KidsContext = createContext<KidsCtx | null>(null);

export function useKids() {
  const ctx = useContext(KidsContext);
  if (!ctx) throw new Error("useKids must be used inside <KidsProvider>");
  return ctx;
}

function rowsToMap(rows: KidsProgressRow[]): Map<string, KidsProgressRow> {
  const m = new Map<string, KidsProgressRow>();
  for (const r of rows) m.set(r.key, r);
  return m;
}

export function KidsProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [profile, setProfile] = useState<KidProfile | null>(null);
  const [letters, setLetters] = useState<Map<string, KidsProgressRow>>(new Map());
  const [surahs, setSurahs] = useState<Map<string, KidsProgressRow>>(new Map());
  const [stories, setStories] = useState<Map<string, KidsProgressRow>>(new Map());
  const [badges, setBadges] = useState<Set<string>>(new Set());
  const [freshBadges, setFreshBadges] = useState<string[]>([]);

  const loadProgress = useCallback(async (profileId: string) => {
    const res = await fetch(`/api/kids/progress?profileId=${profileId}`, { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setLetters(rowsToMap(data.letters ?? []));
    setSurahs(rowsToMap(data.surahs ?? []));
    setStories(rowsToMap(data.stories ?? []));
  }, []);

  const bootstrap = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/kids/profile", { cache: "no-store" });
      if (!res.ok) { setAuthed(false); return; }
      const data = await res.json();
      const first: KidProfile | undefined = data.profiles?.[0];
      if (!first) { setAuthed(false); return; }
      setAuthed(true);
      setProfile(first);
      setBadges(new Set(first.badges));
      await loadProgress(first.id);
    } finally {
      setLoading(false);
    }
  }, [loadProgress]);

  useEffect(() => { void bootstrap(); }, [bootstrap]);

  const mark = useCallback(async (input: MarkInput) => {
    if (!profile) return;
    const status = input.status ?? "in_progress";
    // Optimistic local update.
    const optimistic: KidsProgressRow = {
      type: input.type,
      key: input.key,
      status,
      traceScore: input.traceScore ?? 0,
      reciteScore: input.reciteScore ?? 0,
      attempts: 1,
      masteredAt: status === "learned" ? new Date().toISOString() : null,
    };
    const apply = (prev: Map<string, KidsProgressRow>) => {
      const next = new Map(prev);
      const existing = next.get(input.key);
      next.set(input.key, {
        ...optimistic,
        attempts: (existing?.attempts ?? 0) + 1,
        traceScore: input.traceScore ?? existing?.traceScore ?? 0,
        reciteScore: input.reciteScore ?? existing?.reciteScore ?? 0,
      });
      return next;
    };
    if (input.type === "letter") setLetters(apply);
    else if (input.type === "surah") setSurahs(apply);
    else setStories(apply);

    const res = await fetch("/api/kids/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId: profile.id, ...input, status }),
    });
    if (!res.ok) {
      await loadProgress(profile.id);
      return;
    }
    const data = await res.json();
    if (data?.streak?.updated) {
      setProfile((p) => p ? { ...p, streakCurrent: data.streak.current, streakLongest: data.streak.longest } : p);
    }
    if (Array.isArray(data?.freshBadges) && data.freshBadges.length) {
      setBadges((b) => {
        const n = new Set(b);
        for (const slug of data.freshBadges) n.add(slug);
        return n;
      });
      setFreshBadges((fb) => [...fb, ...data.freshBadges]);
    }
  }, [profile, loadProgress]);

  const consumeFreshBadges = useCallback(() => setFreshBadges([]), []);

  const value = useMemo<KidsCtx>(() => ({
    loading, authed, profile, letters, surahs, stories, badges, freshBadges,
    consumeFreshBadges,
    mark,
    refresh: bootstrap,
  }), [loading, authed, profile, letters, surahs, stories, badges, freshBadges, consumeFreshBadges, mark, bootstrap]);

  return <KidsContext.Provider value={value}>{children}</KidsContext.Provider>;
}
