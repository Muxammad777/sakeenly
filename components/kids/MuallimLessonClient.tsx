"use client";

// One lesson of Muallim Sani: rule explanation + practice phrases.
// Each phrase gets its own MuallimRecite widget so the child can read
// the example aloud and get red/green word-level feedback.

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useKids } from "./KidsProvider";
import { MuallimRecite } from "./MuallimRecite";
import { findMuallimLesson, neighbourLessons, MUALLIM_EXAMPLES } from "@/lib/kids/muallim";

export interface Labels {
  back: string;
  rule: string;
  practice: string;
  recite: string;
  reciteHint: string;
  doneBtn: string;
  doneAgain: string;
  mastered: string;
  next: string;
  prev: string;
  hint: string;
  lesson: string;
  micIdle: string;
  micRecording: string;
  micDone: string;
  unsupported: string;
  errNotAllowed: string;
  errNoSpeech: string;
  errAudioCapture: string;
  errNetwork: string;
  errLangUnsupported: string;
  errOther: string;
}

interface Props {
  slug: string;
  labels: Labels;
}

export function MuallimLessonClient({ slug, labels }: Props) {
  const t = useTranslations("muallim");
  const { muallim, mark, authed } = useKids();
  const lesson = findMuallimLesson(slug);
  if (!lesson) return null;

  const { prev, next } = neighbourLessons(slug);
  const examples = MUALLIM_EXAMPLES[slug] ?? [];
  const status = muallim.get(slug)?.status ?? null;
  const learned = status === "learned";

  const title = t(`${lesson.slug}_t` as never);
  const rule  = t(`${lesson.slug}_r` as never);

  async function markLearned() {
    await mark({ type: "muallim", key: slug, status: "learned" });
  }
  async function markUnlearned() {
    await mark({ type: "muallim", key: slug, status: "in_progress" });
  }

  return (
    <>
      <section className="wrap kid-hero" data-hero-ar="مُعَلِّم">
        <div className="geo-stars-fade" aria-hidden />
        <span className="tag"><span className="tag-dot"></span>{labels.lesson} {lesson.id} / 17</span>
        <h1>{title}</h1>
      </section>

      <section className="wrap muallim-lesson">
        <Link className="muallim-lesson-back" href="/kids/muallim">← {labels.back}</Link>

        <article className="muallim-rule">
          <h2 className="muallim-section-title">{labels.rule}</h2>
          <p>{rule}</p>
        </article>

        <article className="muallim-practice">
          <h2 className="muallim-section-title">{labels.practice}</h2>
          <p className="muallim-practice-lede">{labels.reciteHint}</p>
          <ul className="muallim-examples">
            {examples.map((ex, i) => (
              <li key={i}>
                <MuallimRecite
                  textUthmani={ex.ar}
                  transliteration={ex.tr}
                  hint={ex.hint}
                  labels={{
                    btnIdle: labels.micIdle,
                    btnRecording: labels.micRecording,
                    btnDone: labels.micDone,
                    unsupported: labels.unsupported,
                    errNotAllowed: labels.errNotAllowed,
                    errNoSpeech: labels.errNoSpeech,
                    errAudioCapture: labels.errAudioCapture,
                    errNetwork: labels.errNetwork,
                    errLangUnsupported: labels.errLangUnsupported,
                    errOther: labels.errOther,
                  }}
                />
              </li>
            ))}
          </ul>
        </article>

        {authed && (
          <div className="muallim-progress-bar">
            {learned ? (
              <>
                <div className="muallim-mastered">{labels.mastered}</div>
                <button type="button" className="btn btn-ghost btn-sm" onClick={markUnlearned}>{labels.doneAgain}</button>
              </>
            ) : (
              <button type="button" className="btn btn-primary" onClick={markLearned}>
                <span>{labels.doneBtn}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5 5 9-11" />
                </svg>
              </button>
            )}
          </div>
        )}

        <nav className="muallim-nav">
          {prev ? (
            <Link className="btn btn-soft btn-sm" href={`/kids/muallim/${prev.slug}`}>← {labels.prev}</Link>
          ) : <span />}
          {next ? (
            <Link className="btn btn-soft btn-sm" href={`/kids/muallim/${next.slug}`}>{labels.next} →</Link>
          ) : <span />}
        </nav>
      </section>
    </>
  );
}
