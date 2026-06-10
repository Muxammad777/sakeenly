import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { KidsProvider } from "@/components/kids/KidsProvider";
import { KidStreakBlock } from "@/components/kids/KidStreakBlock";
import { KidAlphabetPreview } from "@/components/kids/KidAlphabetPreview";
import { KidSurahPreview } from "@/components/kids/KidSurahPreview";
import { KidDailyChallenge } from "@/components/kids/KidDailyChallenge";
import { KidBadgeWall } from "@/components/kids/KidBadgeWall";

interface PageProps { params: Promise<{ locale: Locale }>; }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "kid" });
  return { title: t("h1"), description: t("lede"), alternates: { canonical: "/kids" } };
}

export default async function KidsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <KidsProvider>
      <Content />
    </KidsProvider>
  );
}

const PROPHET_STORIES = [
  {
    n: "01",
    tKey: "prophet1",
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
    tKey: "prophet2",
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
    tKey: "prophet3",
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
    tKey: "prophet4",
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
    tKey: "prophet5",
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
    tKey: "prophet6",
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
      <section className="wrap kid-hero" data-hero-ar="أطفال">
        <div className="geo-stars-fade" aria-hidden />
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

      {/* DAILY CHALLENGE */}
      <section className="wrap">
        <KidDailyChallenge />
      </section>

      {/* STREAK */}
      <section className="wrap">
        <KidStreakBlock />
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

        <KidAlphabetPreview />
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

        <KidSurahPreview />
      </section>

      {/* MUALLIM SANI — tajwid course */}
      <section className="wrap kid-section" id="muallim">
        <div className="kid-section-head">
          <div className="kid-num">04</div>
          <div>
            <h2>Муаллим Сани</h2>
            <p>17 уроков таджвида по книге Р.Р. Аббясова — современной переработке «Мөгаллим Сани» Ахмадхади Максуди.</p>
          </div>
          <span className="kid-pill">Таджвид</span>
        </div>
        <Link href="/kids/muallim" className="muallim-promo">
          <div className="muallim-promo-body">
            <span className="muallim-promo-eyebrow">КУРС</span>
            <h3>Учимся читать Коран по правилам</h3>
            <p>От шадды и танвина — до калькаля. Микрофон + анализ произношения после каждого правила.</p>
            <span className="muallim-promo-cta">Открыть курс →</span>
          </div>
          <div className="muallim-promo-art" lang="ar" dir="rtl">مُعَلِّم سَانٍ</div>
        </Link>
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
                <span className="name">{t(`${p.tKey}_name`)}</span>
                <span className="ar arabic" dir="rtl">{t(`${p.tKey}_ar`)}</span>
                <p className="summary">{t(`${p.tKey}_summary`)}</p>
                <div className="prophet-meta">
                  <span>{t("sec3_minutes", { n: p.mins })}</span>
                  <span>{t("sec3_listen")}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* BADGES */}
      <section className="wrap">
        <KidBadgeWall />
      </section>

    </>
  );
}
