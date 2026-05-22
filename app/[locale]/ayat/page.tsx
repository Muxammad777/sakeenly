import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { EMOTIONS } from "@/lib/data/emotions";
import type { Locale } from "@/i18n/routing";

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ay" });
  return {
    title: t("h1"),
    description: t("lede"),
    alternates: { canonical: "/ayat" },
  };
}

const CAT_KEY: Record<string, "cat_heart" | "cat_life" | "cat_family" | "cat_time" | "cat_worship"> = {
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

export default async function AyatIndex({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AyatContent />;
}

function AyatContent() {
  const t = useTranslations("ay");

  return (
    <>
      <section className="wrap ay-hero">
        <div className="geo-stars-fade"></div>
        <span className="tag"><span className="tag-dot"></span><span>{t("badge")}</span></span>
        <h1>{t("h1")}</h1>
        <p>{t("lede")}</p>

        <div className="ay-filter">
          <button className="ay-pill active">{t("all")}</button>
          <button className="ay-pill">{t("cat_heart")}</button>
          <button className="ay-pill">{t("cat_life")}</button>
          <button className="ay-pill">{t("cat_family")}</button>
          <button className="ay-pill">{t("cat_time")}</button>
          <button className="ay-pill">{t("cat_worship")}</button>
        </div>
      </section>

      <section className="wrap">
        <div className="ay-grid">
          {EMOTIONS.map((e, i) => {
            const n = i + 1;
            const catKey = CAT_KEY[e.slug] ?? "cat_heart";
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
