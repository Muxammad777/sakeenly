"use client";

import { useTranslations } from "next-intl";

// KidBadgeWall — small grid of earned + locked badges.
// Newly-earned badges pop up via the toast at the top of the screen.

import { useEffect } from "react";
import { KID_BADGES, BADGE_BY_SLUG } from "@/lib/kids/badges";
import { useKids } from "./KidsProvider";

const ICONS: Record<string, JSX.Element> = {
  letter:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 6h14M5 12h14M5 18h9"/></svg>,
  stars:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5L12 3z"/></svg>,
  crown:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 17h18l-2-9-4 4-3-7-3 7-4-4-2 9z"/></svg>,
  book:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 5a2 2 0 012-2h12v18H6a2 2 0 01-2-2V5z"/><path d="M4 17h14"/></svg>,
  sparkle: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 4v6M12 14v6M4 12h6M14 12h6"/></svg>,
  scroll:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 5a2 2 0 012-2h10v18H7a2 2 0 01-2-2V5z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>,
  flame:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3c2 4 5 5 5 10a5 5 0 11-10 0c0-3 1-4 2-6 1 1 2 1 3 0 0-1-1-2 0-4z"/></svg>,
  moon:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 14A8 8 0 018 4a8 8 0 1012 10z"/></svg>,
};

export function KidBadgeWall() {
  const { badges, freshBadges, consumeFreshBadges } = useKids();
  const t = useTranslations("k");

  useEffect(() => {
    if (!freshBadges.length) return;
    const id = setTimeout(consumeFreshBadges, 4500);
    return () => clearTimeout(id);
  }, [freshBadges, consumeFreshBadges]);

  return (
    <>
      <div className="kid-badge-wall">
        <h2 className="kid-section-title">{t("badges_title")}</h2>
        <div className="kid-badge-grid">
          {KID_BADGES.map((b) => {
            const earned = badges.has(b.slug);
            return (
              <div key={b.slug} className={"kid-badge" + (earned ? " earned" : " locked")}>
                <div className="kid-badge-icon">{ICONS[b.icon] ?? ICONS.stars}</div>
                <div className="kid-badge-title">{b.title}</div>
                <div className="kid-badge-hint">{b.hint}</div>
              </div>
            );
          })}
        </div>
      </div>

      {freshBadges.length > 0 && (
        <div className="kid-badge-toast" role="status">
          {freshBadges.map((slug) => {
            const def = BADGE_BY_SLUG[slug];
            if (!def) return null;
            return (
              <div key={slug} className="kid-badge-toast-card">
                <div className="kid-badge-toast-icon">{ICONS[def.icon] ?? ICONS.stars}</div>
                <div>
                  <div className="kid-badge-toast-eyebrow">{t("badges_new")}</div>
                  <div className="kid-badge-toast-title">{def.title}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
