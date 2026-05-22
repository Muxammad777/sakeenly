import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

interface PageProps { params: Promise<{ locale: Locale }>; }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "kid" });
  return { title: t("h1"), description: t("lede"), alternates: { canonical: "/kids" } };
}

export default async function KidsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Content />;
}

const IQRA_LETTERS = [
  { ar: "ا", name: "Алиф", done: true },
  { ar: "ب", name: "Ба", done: true },
  { ar: "ت", name: "Та", done: true },
  { ar: "ث", name: "Са", done: true },
  { ar: "ج", name: "Джим", done: true },
  { ar: "ح", name: "Ха", done: true },
  { ar: "خ", name: "Ха", done: true },
  { ar: "د", name: "Даль", done: true },
  { ar: "ذ", name: "Заль", done: true },
  { ar: "ر", name: "Ра", done: true },
  { ar: "ز", name: "Зайн", done: true },
  { ar: "س", name: "Син", done: true },
  { ar: "ش", name: "Шин", done: false },
  { ar: "ص", name: "Сад", done: false },
  { ar: "ض", name: "Дад", done: false },
  { ar: "ط", name: "Та", done: false },
];

const KID_SURAHS = [
  { num: 1,   ar: "الفاتحة", ru: "Аль-Фатиха", ayat: 7, meta: "ОТКРЫВАЮЩАЯ · 0:18", progress: 85 },
  { num: 112, ar: "الإخلاص",  ru: "Аль-Ихляс",  ayat: 4, meta: "ЕДИНСТВО · 0:11",    progress: 55 },
  { num: 113, ar: "الفلق",    ru: "Аль-Фаляк",  ayat: 5, meta: "РАССВЕТ · 0:14",     progress: 30 },
  { num: 114, ar: "الناس",   ru: "Ан-Нас",     ayat: 6, meta: "ЛЮДИ · 0:15",        progress: 12 },
];

const PROPHET_STORIES = [
  {
    n: "01",
    name: "Нух ﷺ и ковчег",
    ar: "نوح عليه السلام",
    summary: "Когда люди забыли Аллаха, Нух 950 лет звал их к Книге. Аллах велел построить большой корабль и взять с собой каждого зверя по паре.",
    mins: 4,
    svg: (
      <>
        <path d="M30 70 Q50 60 70 70 T110 70 T150 70 T170 70" strokeOpacity="0.6" />
        <path d="M20 80 Q40 70 60 80 T100 80 T140 80 T180 80" strokeOpacity="0.4" />
        <path d="M60 40 L140 40 L150 60 L50 60 Z" />
        <path d="M80 25 L80 40 L120 25 L120 40" />
        <circle cx="100" cy="50" r="2" fill="currentColor" />
      </>
    ),
  },
  {
    n: "02",
    name: "Юнус ﷺ и кит",
    ar: "يونس عليه السلام",
    summary: "В темноте моря, в темноте ночи, в темноте кита Юнус сказал: «Нет божества, кроме Тебя. Я обидел себя». И Аллах ответил.",
    mins: 3,
    svg: (
      <>
        <path d="M30 60 Q50 30 110 40 Q160 50 175 60 Q160 70 110 80 Q50 90 30 60 Z" />
        <path d="M175 60 L195 45 M175 60 L195 75" strokeOpacity="0.6" />
        <circle cx="60" cy="55" r="2" fill="currentColor" />
        <path d="M55 65 Q65 70 75 65" strokeOpacity="0.6" />
      </>
    ),
  },
  {
    n: "03",
    name: "Ибрахим ﷺ и звёзды",
    ar: "إبراهيم عليه السلام",
    summary: "Маленький Ибрахим смотрел на звёзды и думал: «Это мой Господь?» — но звёзды погасли. Он искал того, кто не уходит.",
    mins: 5,
    svg: (
      <>
        <path d="M100 18 L106 38 L126 42 L106 46 L100 70 L94 46 L74 42 L94 38 Z" opacity="0.7" />
        <circle cx="100" cy="42" r="2" fill="currentColor" />
        <path d="M40 86 Q100 78 160 86" strokeOpacity="0.5" />
      </>
    ),
  },
  {
    n: "04",
    name: "Мухаммад ﷺ в пещере",
    ar: "محمد ﷺ",
    summary: "Враги стояли у входа в пещеру. Абу Бакр заплакал. Пророк ﷺ сказал: «Не печалься, Аллах с нами». И всё было хорошо.",
    mins: 4,
    svg: (
      <>
        <path d="M30 80 Q30 30 100 30 Q170 30 170 80 Z" strokeOpacity="0.4" />
        <circle cx="100" cy="55" r="20" strokeOpacity="0.3" />
        <path d="M100 35 L100 75 M80 55 L120 55 M85 40 L115 70 M115 40 L85 70" strokeOpacity="0.5" />
      </>
    ),
  },
  {
    n: "05",
    name: "Муса ﷺ и море",
    ar: "موسى عليه السلام",
    summary: "Враг догонял. Море впереди. Народ кричал: «Нас поймают!» Муса сказал: «Нет. С нами Аллах, Он укажет путь». И море раскрылось.",
    mins: 5,
    svg: (
      <>
        <path d="M30 80 L100 30 L170 80" strokeOpacity="0.6" />
        <path d="M40 70 L90 70 M110 70 L160 70" strokeOpacity="0.4" />
        <line x1="100" y1="30" x2="100" y2="80" strokeWidth="2" />
      </>
    ),
  },
  {
    n: "06",
    name: "Марьям и пальма",
    ar: "مريم عليها السلام",
    summary: "Когда было больно и страшно, Аллах сказал Марьям: «Потряси пальму — упадут свежие финики». И всё стало нежно.",
    mins: 3,
    svg: (
      <>
        <line x1="100" y1="20" x2="100" y2="80" strokeWidth="2" />
        <path d="M100 30 Q70 25 60 35" strokeOpacity="0.7" />
        <path d="M100 30 Q130 25 140 35" strokeOpacity="0.7" />
        <path d="M100 36 Q75 36 65 48" strokeOpacity="0.5" />
        <path d="M100 36 Q125 36 135 48" strokeOpacity="0.5" />
        <circle cx="100" cy="40" r="3" fill="currentColor" opacity="0.8" />
        <circle cx="95" cy="42" r="2" fill="currentColor" opacity="0.6" />
        <circle cx="105" cy="42" r="2" fill="currentColor" opacity="0.6" />
      </>
    ),
  },
];

function Content() {
  const t = useTranslations("kid");

  return (
    <>
      {/* HERO */}
      <section className="wrap kid-hero">
        <div className="kid-bubbles" aria-hidden="true">
          <div className="kid-bubble" style={{ width: 56, height: 56, top: "14%", left: "10%" }}>ا</div>
          <div className="kid-bubble" style={{ width: 64, height: 64, top: "30%", right: "12%" }}>ب</div>
          <div className="kid-bubble" style={{ width: 48, height: 48, bottom: "18%", left: "18%" }}>ت</div>
          <div className="kid-bubble" style={{ width: 56, height: 56, bottom: "8%", right: "22%" }}>ج</div>
        </div>
        <svg className="kid-star" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.8">
          <path d="M50 4 L58 38 L92 46 L58 54 L50 96 L42 54 L8 46 L42 38 Z" />
          <path d="M50 18 L55 42 L78 50 L55 58 L50 84 L45 58 L22 50 L45 42 Z" opacity="0.6" />
          <circle cx="50" cy="50" r="3" fill="currentColor" stroke="none" />
        </svg>
        <span className="tag" style={{ marginTop: 26 }}>
          <span className="tag-dot"></span>
          <span>{t("badge")}</span>
        </span>
        <h1>{t("h1")}</h1>
        <p className="lede">{t("lede")}</p>
        <div className="kid-cta">
          <Link className="btn btn-primary" href="/kids/alphabet">
            {t("cta1")}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </Link>
          <Link className="btn btn-ghost" href="/kids/surahs">{t("cta2")}</Link>
        </div>
      </section>

      {/* STREAK */}
      <section className="wrap">
        <div className="kid-streak">
          <div className="kid-streak-card">
            <div className="kid-streak-num">12</div>
            <div className="kid-streak-info">
              <span className="lbl">{t("streak_alphabet")}</span>
              <span className="title">{t("streak_progress", { done: 12, total: 28 })}</span>
              <div className="memo-progress" style={{ marginTop: 8, width: 200 }}>
                <div style={{ width: "43%" }} />
              </div>
            </div>
          </div>
          <div className="kid-streak-card">
            <div className="kid-streak-num">4</div>
            <div className="kid-streak-info">
              <span className="lbl">{t("streak_days_lbl")}</span>
              <span className="title">{t("streak_days_title", { n: 4 })}</span>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                {["П", "В", "С"].map((d) => <div key={d} className="streak-dot done">{d}</div>)}
                <div className="streak-dot today">Ч</div>
                {["П", "С", "В"].map((d, i) => <div key={i + 100} className="streak-dot">{d}</div>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IQRA */}
      <section className="wrap kid-section" id="alphabet">
        <div className="kid-section-head">
          <div className="kid-num">01</div>
          <div>
            <h2>{t("sec1_h")}</h2>
            <p>{t("sec1_p")}</p>
          </div>
          <span className="kid-pill">{t("sec1_pill")}</span>
        </div>

        <div className="iqra-grid">
          {IQRA_LETTERS.map((l) => (
            <Link key={l.ar} href="/kids/alphabet" className={`iqra-letter ${l.done ? "done" : ""}`}>
              <span className="ar arabic" dir="rtl">{l.ar}</span>
              <span className="name">{l.name}</span>
            </Link>
          ))}
        </div>

        <div className="iqra-progress">
          <span>{t("progress")}</span>
          <div className="bar"><div style={{ width: "43%" }} /></div>
          <span>43%</span>
        </div>
      </section>

      {/* FIRST SURAHS */}
      <section className="wrap kid-section" id="surahs">
        <div className="kid-section-head">
          <div className="kid-num">02</div>
          <div>
            <h2>{t("sec2_h")}</h2>
            <p>{t("sec2_p")}</p>
          </div>
          <span className="kid-pill">{t("sec2_pill")}</span>
        </div>

        <div className="surah-cards">
          {KID_SURAHS.map((s) => (
            <Link key={s.num} className="surah-card" href={`/reader/${s.num}/1`}>
              <span className="num">№{s.num} · {s.ayat}</span>
              <span className="ru">{s.ru}</span>
              <div className="ar arabic" dir="rtl">{s.ar}</div>
              <div className="meta">{s.meta}</div>
              <div className="memo-progress" style={{ marginTop: 6 }}>
                <div style={{ width: `${s.progress}%` }} />
              </div>
              <div className="surah-card-cta">
                <button type="button">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  {t("sec2_listen")}
                </button>
                <button type="button">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
                  {t("sec2_learn")}
                </button>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* PROPHET STORIES */}
      <section className="wrap kid-section" id="stories">
        <div className="kid-section-head">
          <div className="kid-num">03</div>
          <div>
            <h2>{t("sec3_h")}</h2>
            <p>{t("sec3_p")}</p>
          </div>
          <span className="kid-pill">{t("sec3_pill")}</span>
        </div>

        <div className="prophet-grid">
          {PROPHET_STORIES.map((p) => (
            <Link key={p.n} className="prophet-card" href="/kids/stories">
              <div className="prophet-illustration">
                <svg viewBox="0 0 200 100" fill="none" stroke="currentColor" strokeWidth="1.5">
                  {p.svg}
                </svg>
              </div>
              <div className="prophet-body">
                <span className="num">{t("sec3_story_n", { n: p.n })}</span>
                <span className="name">{p.name}</span>
                <span className="ar arabic" dir="rtl">{p.ar}</span>
                <p className="summary">{p.summary}</p>
                <div className="prophet-meta">
                  <span>{t("sec3_minutes", { n: p.mins })}</span>
                  <span>{t("sec3_listen")}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* PARENT CTA */}
      <section className="wrap">
        <div className="parent-cta">
          <div>
            <span className="eyebrow">{t("parent_eyebrow")}</span>
            <h3>{t("parent_h")}</h3>
            <p>{t("parent_p")}</p>
          </div>
          <Link className="btn btn-primary" href="/pricing">
            {t("parent_btn")}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </Link>
        </div>
      </section>
    </>
  );
}
