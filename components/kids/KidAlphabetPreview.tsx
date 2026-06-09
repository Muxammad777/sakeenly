"use client";

import { useTranslations } from "next-intl";

// Preview of the first 16 letters on the /kids hub. Reflects real progress
// (green check on learned, soft dot on in-progress). Tapping a letter
// goes to /kids/alphabet#<slug> which the alphabet page scrolls to.

import Link from "next/link";
import { ARABIC_LETTERS } from "@/lib/kids/letters";
import { useKids } from "./KidsProvider";

const PREVIEW_COUNT = 16;

export function KidAlphabetPreview() {
  const { letters } = useKids();
  const t = useTranslations("k");
  const learnedCount = ARABIC_LETTERS.filter((l) => letters.get(l.slug)?.status === "learned").length;
  const pct = Math.round((learnedCount / ARABIC_LETTERS.length) * 100);

  return (
    <>
      <div className="iqra-grid">
        {ARABIC_LETTERS.slice(0, PREVIEW_COUNT).map((l) => {
          const status = letters.get(l.slug)?.status;
          const learned = status === "learned";
          return (
            <Link
              key={l.slug}
              href={`/kids/alphabet#${l.slug}`}
              className={`iqra-letter ${learned ? "done" : ""}`}
            >
              <span className="ar arabic" dir="rtl">{l.ar}</span>
              <span className="name">{l.name}</span>
            </Link>
          );
        })}
      </div>
      <div className="iqra-progress">
        <span>{t("alpha_progress")}</span>
        <div className="bar"><div style={{ width: `${pct}%` }} /></div>
        <span>{pct}%</span>
      </div>
    </>
  );
}
