"use client";

// Daily challenge card on /kids. Shows 5 items (3 new + 2 review by default)
// for today, deterministic per UTC day. Each item links to the right learning
// surface (alphabet board with letter pre-selected, or surah learn page).

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useKids } from "./KidsProvider";

function applyTpl(tpl: string, vars: Record<string, string | number>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

interface DailyItem {
  type: "letter" | "surah";
  key: string;
  label: string;
  ar: string;
  mode: "new" | "review";
}

export function KidDailyChallenge() {
  const { profile } = useKids();
  const t = useTranslations("k");
  const [items, setItems] = useState<DailyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/kids/daily?profileId=${profile.id}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setItems(data.items ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [profile]);

  if (!profile || loading) {
    return (
      <div className="kid-daily kid-daily-skeleton" aria-hidden="true">
        <div className="kid-daily-head">
          <div className="kid-daily-eyebrow">{t("daily_eyebrow")}</div>
          <div className="kid-daily-title">{t("daily_loading_title")}</div>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="kid-daily kid-daily-done">
        <div className="kid-daily-head">
          <div className="kid-daily-eyebrow">{t("daily_eyebrow")}</div>
          <div className="kid-daily-title">{t("daily_done_title")}</div>
          <p className="kid-daily-sub">{t("daily_done_sub")}</p>
        </div>
      </div>
    );
  }

  const newCount = items.filter(i => i.mode === "new").length;
  const reviewCount = items.filter(i => i.mode === "review").length;

  return (
    <div className="kid-daily">
      <div className="kid-daily-head">
        <div className="kid-daily-eyebrow">{t("daily_eyebrow")}</div>
        <h3 className="kid-daily-title">{t("daily_title")}</h3>
        <p className="kid-daily-sub">{applyTpl(t.raw("daily_sub"), { newCount, reviewCount })}</p>
      </div>
      <ul className="kid-daily-list">
        {items.map((it, idx) => {
          const href = it.type === "letter"
            ? `/kids/alphabet#${it.key}`
            : `/kids/surahs/${it.key}`;
          return (
            <li key={`${it.type}-${it.key}-${idx}`} className={"kid-daily-item " + it.mode}>
              <Link href={href} className="kid-daily-link">
                <span className="kid-daily-ar" lang="ar">{it.ar}</span>
                <span className="kid-daily-text">
                  <span className="kid-daily-label">{it.label}</span>
                  <span className="kid-daily-mode">{it.mode === "new" ? t("daily_new") : t("daily_review")}</span>
                </span>
                <svg className="kid-daily-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
