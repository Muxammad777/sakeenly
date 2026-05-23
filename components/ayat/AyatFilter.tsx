"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { EMOTIONS } from "@/lib/data/emotions";

type Category = "all" | "cat_heart" | "cat_life" | "cat_family" | "cat_time" | "cat_worship";

const CAT_KEY: Record<string, Exclude<Category, "all">> = {
  "dlya-trevogi":             "cat_heart",
  "dlya-sabra":               "cat_heart",
  "dlya-blagodarnosti":       "cat_heart",
  "dlya-odinochestva":        "cat_heart",
  "pered-ekzamenom":          "cat_life",
  "pered-snom":               "cat_time",
  "utrom":                    "cat_time",
  "dlya-pokayaniya":          "cat_heart",
  "pri-pechali":              "cat_heart",
  "pri-strakhe":              "cat_heart",
  "pri-gneve":                "cat_heart",
  "dlya-ukrepleniya-imana":   "cat_heart",
  "pri-bolezni":              "cat_life",
  "pri-poteryah":             "cat_life",
  "dlya-roditelei":           "cat_family",
  "dlya-detei":               "cat_family",
  "pri-finansovykh-trudnostyakh": "cat_life",
  "pri-somneniyakh":          "cat_heart",
  "pered-puteshestviem":      "cat_life",
  "dlya-otkaza-ot-grekha":    "cat_heart",
  "dlya-tavakkul":            "cat_heart",
  "dlya-prosheniya-pomoshchi":"cat_worship",
  "pri-iskushenii":           "cat_heart",
  "dlya-radosti":             "cat_heart",
  "v-pyatnitsu":              "cat_time",
  "v-ramadan":                "cat_worship",
  "v-noch-kadr":              "cat_worship",
  "dlya-mira-v-sem-e":        "cat_family",
  "dlya-rakhma":              "cat_heart",
  "dlya-doverija-allahu":     "cat_heart",
};

const CATEGORIES: Category[] = ["all", "cat_heart", "cat_life", "cat_family", "cat_time", "cat_worship"];

export function AyatFilter() {
  const t = useTranslations("ay");
  const [active, setActive] = useState<Category>("all");

  const visible = useMemo(() => {
    return EMOTIONS.map((e, i) => ({ e, n: i + 1, catKey: CAT_KEY[e.slug] ?? "cat_heart" as const }))
      .filter(({ catKey }) => active === "all" || catKey === active);
  }, [active]);

  return (
    <>
      <section className="wrap">
        <div className="ay-filter">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={"ay-pill" + (active === c ? " active" : "")}
              onClick={() => setActive(c)}
              aria-pressed={active === c}
            >
              {t(c === "all" ? "all" : c)}
            </button>
          ))}
        </div>

        <div className="ay-grid">
          {visible.map(({ e, n, catKey }) => {
            const verseKeys = e.verses.map((v) => v.key).join(" · ");
            return (
              <Link key={e.slug} className="ay-card" href={`/ayat/${e.slug}`}>
                <span className="cat">
                  <span>{t(catKey)}</span>
                  {" · "}
                  {t("aya_count", { count: e.verses.length })}
                </span>
                <h3>{t(`c${n}.t` as `c1.t`)}</h3>
                <p>{t(`c${n}.d` as `c1.d`)}</p>
                <div className="foot">
                  <span>{verseKeys}</span>
                  <span className="more">{t("open")}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}

