"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { EMOTIONS } from "@/lib/data/emotions";

type Category =
  | "all"
  | "cat_heart"
  | "cat_life"
  | "cat_family"
  | "cat_time"
  | "cat_worship"
  | "cat_akhirah"
  | "cat_aqida"
  | "cat_signs";

// Slug → category bucket. Adding a new emotion bundle? Pin it here
// or it'll default to "cat_heart".
const CAT_KEY: Record<string, Exclude<Category, "all">> = {
  // Heart / emotions
  "dlya-trevogi":             "cat_heart",
  "dlya-sabra":               "cat_heart",
  "dlya-blagodarnosti":       "cat_heart",
  "dlya-odinochestva":        "cat_heart",
  "dlya-pokayaniya":          "cat_heart",
  "pri-pechali":              "cat_heart",
  "pri-strakhe":              "cat_heart",
  "pri-gneve":                "cat_heart",
  "dlya-ukrepleniya-imana":   "cat_heart",
  "pri-somneniyakh":          "cat_heart",
  "dlya-otkaza-ot-grekha":    "cat_heart",
  "dlya-tavakkul":            "cat_heart",
  "pri-iskushenii":           "cat_heart",
  "dlya-radosti":             "cat_heart",
  "dlya-rakhma":              "cat_heart",
  "dlya-doverija-allahu":     "cat_heart",
  // Life situations
  "pered-ekzamenom":          "cat_life",
  "pri-bolezni":              "cat_life",
  "pri-poteryah":             "cat_life",
  "pri-finansovykh-trudnostyakh": "cat_life",
  "pered-puteshestviem":      "cat_life",
  // Family
  "dlya-roditelei":           "cat_family",
  "dlya-detei":               "cat_family",
  "dlya-mira-v-sem-e":        "cat_family",
  // Time of day
  "pered-snom":               "cat_time",
  "utrom":                    "cat_time",
  "v-pyatnitsu":              "cat_time",
  // Worship
  "dlya-prosheniya-pomoshchi":"cat_worship",
  "v-ramadan":                "cat_worship",
  "v-noch-kadr":              "cat_worship",
  "o-nameze":                 "cat_worship",
  "o-zakate":                 "cat_worship",
  "o-khadje":                 "cat_worship",
  // Afterlife
  "o-rayu":                   "cat_akhirah",
  "o-ade":                    "cat_akhirah",
  "o-sudnom-dne":             "cat_akhirah",
  // Aqida / core beliefs
  "o-tavkhide":               "cat_aqida",
  "o-poslannike":             "cat_aqida",
  "o-prorokakh":              "cat_aqida",
  "o-angelakh":               "cat_aqida",
  "o-korane":                 "cat_aqida",
  // Signs of creation
  "o-tvorenii":               "cat_signs",
};

const CATEGORIES: Category[] = [
  "all",
  "cat_heart",
  "cat_life",
  "cat_family",
  "cat_time",
  "cat_worship",
  "cat_akhirah",
  "cat_aqida",
  "cat_signs",
];

export function AyatFilter() {
  const t = useTranslations("ay");
  const tEmo = useTranslations("emo30");
  const [active, setActive] = useState<Category>("all");

  const visible = useMemo(() => {
    return EMOTIONS.map((e) => ({ e, catKey: CAT_KEY[e.slug] ?? ("cat_heart" as const) }))
      .filter(({ catKey }) => active === "all" || catKey === active);
  }, [active]);

  // Pull localized title from emo30.{slug} if present, otherwise fall
  // back to the data-side ruTitle. Lets us add new bundles without
  // also editing all 7 messages files first.
  const localizedTitle = (slug: string, ruTitle: string): string => {
    try {
      const v = tEmo(slug as Parameters<typeof tEmo>[0]);
      // next-intl returns the key string when missing — treat as fallback.
      return v && v !== slug ? v : ruTitle;
    } catch {
      return ruTitle;
    }
  };

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
          {visible.map(({ e, catKey }) => {
            const verseKeys = e.verses.map((v) => v.key).join(" · ");
            return (
              <Link key={e.slug} className="ay-card" href={`/ayat/${e.slug}`}>
                <span className="cat">
                  <span>{t(catKey)}</span>
                  {" · "}
                  {t("aya_count", { count: e.verses.length })}
                </span>
                <h3>{localizedTitle(e.slug, e.ruTitle)}</h3>
                <p>{e.ruIntro}</p>
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
