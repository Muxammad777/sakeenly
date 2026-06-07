import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HomeVotdCarousel, HomeStreakBand } from "./HomeClient";
import { getCurrentUser } from "@/lib/auth-helpers";
import { Reveal } from "@/components/Reveal";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { RevealStagger } from "@/components/RevealStagger";
import { ActivityTicker } from "@/components/ActivityTicker";
import { SearchClient } from "@/components/search/SearchClient";
import type { Locale } from "@/i18n/routing";

interface PageProps { params: Promise<{ locale: Locale }>; }

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await getCurrentUser();
  return <HomeContent isAuthenticated={Boolean(user)} />;
}

function HomeContent({ isAuthenticated }: { isAuthenticated: boolean }) {
  const t = useTranslations("hero");
  const tStreak = useTranslations("streak");
  const tCont = useTranslations("cont");
  const tFeat = useTranslations("feat");
  const tAct = useTranslations("activity");
  const tEmo = useTranslations("emo");
  const tEmo30 = useTranslations("emo30");
  const tTrust = useTranslations("trust");
  const tClose = useTranslations("close");
  const tSr = useTranslations("sr");

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg"></div>
        <svg className="star-decor tl" width="80" height="80" viewBox="0 0 100 100" fill="none" stroke="var(--accent)" strokeWidth="0.6">
          <path d="M50 4 L58 38 L92 46 L58 54 L50 96 L42 54 L8 46 L42 38 Z" />
          <path d="M50 18 L55 42 L78 50 L55 58 L50 84 L45 58 L22 50 L45 42 Z" opacity="0.5" />
        </svg>
        <svg className="star-decor tr" width="60" height="60" viewBox="0 0 100 100" fill="none" stroke="var(--accent)" strokeWidth="0.8">
          <circle cx="50" cy="50" r="46" />
          <path d="M50 12 L60 50 L88 50 L60 50 L50 88 L40 50 L12 50 L40 50 Z" />
        </svg>
        {/* Mihrab silhouette drawn behind the hero text on first paint —
            a stylised mosque-niche arch built from a single stroked path.
            stroke-dasharray + dashoffset animate it from blank to full
            over 2.6s on page load. Purely decorative. */}
        <svg
          className="hero-mihrab"
          aria-hidden="true"
          viewBox="0 0 280 200"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        >
          <path
            className="hero-mihrab-arch"
            d="M40 200 L40 80 Q40 18 140 18 Q240 18 240 80 L240 200"
          />
          <path
            className="hero-mihrab-arch hero-mihrab-arch-inner"
            d="M58 200 L58 88 Q58 32 140 32 Q222 32 222 88 L222 200"
          />
          <path className="hero-mihrab-arch" d="M140 18 L140 6" />
          <path className="hero-mihrab-arch" d="M134 6 L146 6" />
          <circle className="hero-mihrab-orb" cx="140" cy="62" r="3" fill="currentColor" stroke="none" />
        </svg>

        {/* Slow drifting Ottoman stars — purely decorative, behind content. */}
        <div className="hero-drift" aria-hidden="true">
          <svg className="hero-drift-star d1" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.6">
            <path d="M50 8 L57 42 L92 50 L57 58 L50 92 L43 58 L8 50 L43 42 Z" />
          </svg>
          <svg className="hero-drift-star d2" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.8">
            <circle cx="50" cy="50" r="42" />
            <circle cx="50" cy="50" r="3" fill="currentColor" stroke="none" />
          </svg>
          <svg className="hero-drift-star d3" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.6">
            <path d="M50 16 L60 50 L84 50 L60 50 L50 84 L40 50 L16 50 L40 50 Z" />
          </svg>
          <svg className="hero-drift-star d4" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
            <path d="M50 4 L52 48 L96 50 L52 52 L50 96 L48 52 L4 50 L48 48 Z" opacity="0.5" />
          </svg>
        </div>

        <div className="wrap hero-inner">
          <span className="tag">
            <span className="tag-dot"></span>
            <span>{t("badge")}</span>
          </span>
          <h1>
            <span>{t("title_h")}</span> <em>{t("title_e")}</em>
            <br />
            <span>{t("title_t")}</span>
          </h1>
          <p className="sub">{t("sub")}</p>
          <div className="ctas">
            <Link className="btn btn-primary" href="/reader/1/1">
              <span>{t("cta_read")}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Link>
            <Link className="btn btn-ghost" href="/signin">{t("cta_signin")}</Link>
          </div>
          <div className="meta-row mono">
            <span>{t("meta1")}</span>
            <span>{t("meta2")}</span>
            <span>{t("meta3")}</span>
          </div>
        </div>
      </section>

      {/* ACTIVITY TICKER — live platform metrics, sits between hero and search */}
      <div className="wrap">
        <ActivityTicker labels={{
          readers: tAct.raw("readers"),
          hifz: tAct.raw("hifz"),
          bookmarks: tAct.raw("bookmarks"),
        }} />
      </div>

      {/* SEARCH — full-text over Quran, drops users straight into the reader */}
      <Reveal as="section" className="wrap home-search">
        <div className="home-search-head">
          <span className="eyebrow">{tSr("eyebrow")}</span>
          <h2>{tSr("title")}</h2>
        </div>
        <SearchClient initialQuery="" />
      </Reveal>

      {/* VOTD + Streak */}
      <Reveal as="section" className="votd-section">
        <div className="wrap-tight">
          <HomeVotdCarousel />

          <HomeStreakBand
            isAuthenticated={isAuthenticated}
            labels={{
              streakLabel: tStreak("label"),
              streakEmpty: tStreak("title_empty"),
              // Raw templates with literal {n}/{a}/{t} — interpolated client-side.
              // (Server functions can't cross the RSC boundary.)
              streakTitleTpl: tStreak.raw("title_n"),
              contLabel: tCont("label"),
              contStart: tCont("start_empty"),
              contBtn: tCont("btn"),
              contSurahPrefix: tCont("surah_prefix"),
              contAyahOfTpl: tCont.raw("ayah_of_n"),
              signinCta: tCont("signin_cta"),
            }}
          />
        </div>
      </Reveal>

      {/* FEATURES */}
      <Reveal as="section" className="wrap features">
        <div className="features-head">
          <span className="eyebrow">{tFeat("eyebrow")}</span>
          <h2 style={{ marginTop: 14 }}>{tFeat("heading")}</h2>
          <p>{tFeat("lede")}</p>
        </div>

        <RevealStagger className="feature-grid">
          <Link className="feature" href="/reader/1/1">
            <span className="feature-num">{tFeat("f1_l")}</span>
            <h3>{tFeat("f1_t")}</h3>
            <p>{tFeat("f1_b")}</p>
            <span className="link">{tFeat("f1_l2")}</span>
            <div className="pic">
              <div className="pic-content">
                <div className="arabic pic-arabic" lang="ar" dir="rtl">بِسْمِ ٱللَّٰهِ</div>
              </div>
            </div>
          </Link>

          <Link className="feature" href="/listen">
            <span className="feature-num">{tFeat("f2_l")}</span>
            <h3>{tFeat("f2_t")}</h3>
            <p>{tFeat("f2_b")}</p>
            <span className="link">{tFeat("f2_l2")}</span>
            <div className="pic">
              <div className="pic-content">
                <div className="pic-wave">
                  {[6, 14, 22, 30, 36, 28, 18, 10, 24, 14, 8].map((h, i) => (
                    <span key={i} style={{ height: h + "px", opacity: i === 4 ? 1 : undefined }}></span>
                  ))}
                </div>
              </div>
            </div>
          </Link>

          <Link className="feature" href="/ask">
            <span className="feature-num">{tFeat("f3_l")}</span>
            <h3>{tFeat("f3_t")}</h3>
            <p>{tFeat("f3_b")}</p>
            <span className="link">{tFeat("f3_l2")}</span>
            <div className="pic">
              <div className="pic-content" style={{ alignItems: "flex-start", justifyContent: "flex-end", padding: 14, display: "flex", flexDirection: "column", width: "100%", height: "100%", boxSizing: "border-box" }}>
                <div className="pic-chat" style={{ width: "100%" }}>
                  <div className="b">{tEmo("chat_q")}</div>
                  <div className="b right">{tEmo("chat_a")}</div>
                </div>
              </div>
            </div>
          </Link>
        </RevealStagger>
      </Reveal>

      {/* EMOTIONS */}
      <Reveal as="section" className="wrap emotions">
        <div className="emotions-head">
          <h2 style={{ fontWeight: 300 }}>{tEmo("heading")}</h2>
          <Link href="/ayat">{tEmo("all")}</Link>
        </div>
        <RevealStagger className="emotion-grid" delayStep={50}>
          {[
            { slug: "dlya-trevogi",        ar: "القلق",         n: 5, kind: "audio" as const, href: "/ayat/dlya-trevogi" },
            { slug: "dlya-sabra",          ar: "الصبر",         n: 6, kind: "audio" as const, href: "/ayat/dlya-sabra" },
            { slug: "dlya-blagodarnosti",  ar: "الشكر",         n: 4, kind: "audio" as const, href: "/ayat/dlya-blagodarnosti" },
            { slug: "pered-ekzamenom",     ar: "قبل الامتحان",  n: 3, kind: "dua"   as const, href: "/ayat/pered-ekzamenom" },
            { slug: "dlya-odinochestva",   ar: "الوحدة",        n: 4, kind: "audio" as const, href: "/ayat/dlya-odinochestva" },
            { slug: "pri-poteryah",        ar: "الفقد",         n: 5, kind: "audio" as const, href: "/ayat/pri-poteryah" },
            { slug: "dlya-pokayaniya",     ar: "المغفرة",       n: 6, kind: "audio" as const, href: "/ayat/dlya-pokayaniya" },
            { slug: "pered-snom",          ar: "قبل النوم",     n: 3, kind: "audio" as const, href: "/ayat/pered-snom" },
          ].map((e) => {
            let title = e.slug;
            try { title = tEmo30(e.slug); } catch { /* fallback to slug */ }
            return (
              <Link key={e.href} className="emotion" href={e.href}>
                <span className="ru">{title}</span>
                <span className="ar">{e.ar}</span>
                <span className="ct">
                  {tEmo("ct_count", { n: e.n })} · {e.kind === "dua" ? tEmo("ct_dua") : tEmo("ct_audio")}
                </span>
              </Link>
            );
          })}
        </RevealStagger>
      </Reveal>

      {/* TRUST */}
      <Reveal as="section" className="wrap">
        <RevealStagger className="trust" delayStep={90}>
          <div><div className="n"><AnimatedNumber to={114} /></div><div className="l">{tTrust("suras")}</div></div>
          <div><div className="n"><AnimatedNumber to={6236} duration={1800} /></div><div className="l">{tTrust("ayat")}</div></div>
          <div><div className="n"><AnimatedNumber to={24} /></div><div className="l">{tTrust("translations")}</div></div>
          <div><div className="n"><AnimatedNumber to={30} /></div><div className="l">{tTrust("reciters")}</div></div>
          <div><div className="n"><AnimatedNumber to={0} /></div><div className="l">{tTrust("trackers")}</div></div>
        </RevealStagger>
      </Reveal>

      {/* CLOSING */}
      <Reveal as="section" className="wrap">
        <div className="closing">
          <span className="eyebrow">{tClose("eyebrow")}</span>
          <h2>
            <span>{tClose("line1")}</span>
            <br />
            <span>{tClose("line2")}</span>
          </h2>
          <p className="mono" style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginTop: 18 }}>
            {tClose("cite")}
          </p>
          <div className="ctas">
            <Link className="btn btn-primary" href="/reader/1/1">
              <span>{tClose("cta1")}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Link>
          </div>
        </div>
      </Reveal>
    </>
  );
}
