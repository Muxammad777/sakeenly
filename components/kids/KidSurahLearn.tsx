"use client";

// /kids/surahs/[num] — listen-then-repeat per ayah with tajweed coloring.
// Each ayah row plays the audio, then the ListenAndRecite control kicks in
// and rates the kid's recitation. When the kid lands ≥70% on every ayah,
// the surah is marked as learned and the streak/badge logic fires.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { splitByTajweed, type TajweedAnnotation } from "@/lib/quran/tajweed";
import { ListenAndRecite } from "@/components/hifz/ListenAndRecite";
import { useKids } from "./KidsProvider";

interface AyahPayload {
  ayah: number;
  textUthmani: string;
  audioUrl: string | null;
  tajweed: TajweedAnnotation[];
}

interface Props {
  surahNumber: number;
  surahArabic: string;
  surahName: string;
  ayahs: AyahPayload[];
}

const LEARNED_THRESHOLD = 70;

export function KidSurahLearn({ surahNumber, surahArabic, surahName, ayahs }: Props) {
  const { surahs, mark, profile } = useKids();
  const surahKey = String(surahNumber);
  const prevRow = surahs.get(surahKey);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [active, setActive] = useState(0);
  const learnedFromDb = prevRow?.status === "learned";

  // Mark the surah as in_progress as soon as the kid lands on the page,
  // so the surah card on /kids and /kids/surahs reflects activity even if
  // they bail before finishing.
  useEffect(() => {
    if (!profile || prevRow) return;
    void mark({ type: "surah", key: surahKey, status: "in_progress" });
  }, [profile, prevRow, mark, surahKey]);

  const handleAyahScore = (ayah: number, score: number) => {
    setScores((prev) => ({ ...prev, [ayah]: Math.max(prev[ayah] ?? 0, score) }));
  };

  const bestPerAyah = useMemo(() => ayahs.map((a) => scores[a.ayah] ?? 0), [ayahs, scores]);
  const passedAll = bestPerAyah.length === ayahs.length && bestPerAyah.every((s) => s >= LEARNED_THRESHOLD);
  const overall = bestPerAyah.length === 0 ? 0 : Math.round(bestPerAyah.reduce((a, b) => a + b, 0) / bestPerAyah.length);

  // Auto-finalize once the kid has cleared every ayah.
  useEffect(() => {
    if (!passedAll || learnedFromDb) return;
    void mark({ type: "surah", key: surahKey, status: "learned", reciteScore: overall });
  }, [passedAll, learnedFromDb, overall, mark, surahKey]);

  return (
    <>
      <section className="wrap kid-hero">
        <div className="geo-stars-fade" aria-hidden />
        <span className="tag"><span className="tag-dot"></span><span>Сура · {surahNumber}</span></span>
        <h1 lang="ar" className="kid-surah-h1">{surahArabic}</h1>
        <p className="lede">{surahName} · {ayahs.length} аят{ayahs.length === 1 ? "" : ayahs.length < 5 ? "а" : "ов"}</p>
        <div className="kid-cta">
          <Link className="btn btn-ghost" href="/kids/surahs">← К списку сур</Link>
        </div>
      </section>

      <section className="wrap">
        <div className="kid-stat-bar">
          <div className="kid-stat-bar-head">
            <span className="kid-stat-bar-label">Прогресс по суре</span>
            <span className="kid-stat-bar-val">{overall}%</span>
          </div>
          <div className="kid-stat-bar-track"><div className="kid-stat-bar-fill" style={{ width: `${overall}%` }} /></div>
        </div>

        <ol className="kid-surah-list">
          {ayahs.map((a, idx) => {
            const segments = splitByTajweed(a.textUthmani, a.tajweed);
            const score = scores[a.ayah] ?? 0;
            const passed = score >= LEARNED_THRESHOLD;
            return (
              <li key={a.ayah} className={"kid-surah-row" + (active === idx ? " active" : "") + (passed ? " passed" : "")}>
                <button type="button" className="kid-surah-row-head" onClick={() => setActive(idx)}>
                  <span className="kid-ayah-num">{a.ayah}</span>
                  <span className="kid-ayah-ar" lang="ar" dir="rtl">
                    {segments.map((seg, i) =>
                      seg.rule
                        ? <span key={i} className={`tj tj-${seg.rule}`}>{seg.text}</span>
                        : <span key={i}>{seg.text}</span>,
                    )}
                  </span>
                  {passed && (
                    <span className="kid-ayah-check" aria-label="Готово">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                    </span>
                  )}
                </button>
                {active === idx && (
                  <div className="kid-surah-row-body">
                    <ListenAndRecite
                      ayahKey={`${surahNumber}:${a.ayah}`}
                      textUthmani={a.textUthmani}
                      audioUrl={a.audioUrl}
                    />
                    <KidScoreCatcher onScore={(s) => handleAyahScore(a.ayah, s)} ayahNumber={a.ayah} />
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        {(passedAll || learnedFromDb) && (
          <div className="kid-surah-done">
            <div className="kid-surah-done-eyebrow">МашаАллах!</div>
            <div className="kid-surah-done-title">Сура {surahName} выучена</div>
            <p>Ты прочитал каждый аят правильно. Возвращайся за повторением через несколько дней.</p>
            <Link className="btn btn-primary" href="/kids/surahs">Ещё одна сура →</Link>
          </div>
        )}
      </section>
    </>
  );
}

/**
 * KidScoreCatcher — observes ListenAndRecite's per-render score DOM node
 * and forwards it back as a number. The recite component itself doesn't
 * expose a callback, but it always renders `.hifz-lr-score` once a take
 * finishes, so we read it via a MutationObserver and avoid forking the
 * component just for this hook.
 */
function KidScoreCatcher({ onScore, ayahNumber }: { onScore: (n: number) => void; ayahNumber: number }) {
  useEffect(() => {
    const root = document.querySelectorAll(".kid-surah-row.active .hifz-lr");
    const target = root[root.length - 1];
    if (!(target instanceof HTMLElement)) return;
    const sample = () => {
      const node = target.querySelector(".hifz-lr-score");
      if (!node) return;
      const txt = node.textContent?.trim() ?? "";
      const n = parseInt(txt.replace("%", ""), 10);
      if (Number.isFinite(n)) onScore(n);
    };
    const mo = new MutationObserver(sample);
    mo.observe(target, { subtree: true, childList: true, characterData: true });
    sample();
    return () => mo.disconnect();
  }, [onScore, ayahNumber]);
  return null;
}
