import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HomeVotdCarousel, HomeStreakBand } from "./HomeClient";
import { getCurrentUser } from "@/lib/auth-helpers";
import { Reveal } from "@/components/Reveal";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { RevealStagger } from "@/components/RevealStagger";
import { ActivityTicker } from "@/components/ActivityTicker";
import { HeroBackdrop } from "@/components/HeroBackdrop";
import { MagneticCard } from "@/components/MagneticCard";
import { SearchClient } from "@/components/search/SearchClient";
import type { Locale } from "@/i18n/routing";

interface PageProps { params: Promise<{ locale: Locale }>; }

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await getCurrentUser();
  return <HomeContent isAuthenticated={Boolean(user)} />;
}

/**
 * Mihrab arch SVG — the prayer-niche silhouette used as a thin ornament
 * above the closing CTA. Single 1.4 stroke gold line, public-domain shape.
 */
function MihrabArch() {
  return (
    <svg className="closing-arch" viewBox="0 0 96 64" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M4 62 L4 36 C 4 18, 24 4, 48 4 C 72 4, 92 18, 92 36 L 92 62" />
      <path d="M14 62 L14 38 C 14 24, 28 14, 48 14 C 68 14, 82 24, 82 38 L 82 62" opacity="0.55" />
      <circle cx="48" cy="22" r="1.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function HomeContent({ isAuthenticated }: { isAuthenticated: boolean }) {
  const t = useTranslations("hero");
  const tStreak = useTranslations("streak");
  const tCont = useTranslations("cont");
  const tFeat = useTranslations("feat");
  const tAct = useTranslations("activity");
  const tWhy = useTranslations("why");
  const tEmo = useTranslations("emo");
  const tEmo30 = useTranslations("emo30");
  const tTrust = useTranslations("trust");
  const tClose = useTranslations("close");
  const tSr = useTranslations("sr");

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="hero">
        <HeroBackdrop />

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

        <ActivityTicker labels={{
          readers: tAct.raw("readers"),
          hifz: tAct.raw("hifz"),
          bookmarks: tAct.raw("bookmarks"),
        }} />
      </section>

      {/* ── SEARCH ──────────────────────────────────────────────── */}
      <Reveal as="section" className="wrap home-search">
        <div className="home-search-head">
          <span className="eyebrow">{tSr("eyebrow")}</span>
          <h2>{tSr("title")}</h2>
        </div>
        <SearchClient initialQuery="" />
      </Reveal>

      {/* ── VOTD + STREAK ───────────────────────────────────────── */}
      <Reveal as="section" className="votd-section">
        <div className="wrap-tight">
          <HomeVotdCarousel />

          <HomeStreakBand
            isAuthenticated={isAuthenticated}
            labels={{
              streakLabel: tStreak("label"),
              streakEmpty: tStreak("title_empty"),
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

      {/* ── WHY SAKEENLY ────────────────────────────────────────── */}
      <Reveal as="section" className="wrap why">
        <div className="why-head">
          <span className="eyebrow">{tWhy("eyebrow")}</span>
          <h2>{tWhy("heading")}</h2>
          <p>{tWhy("lede")}</p>
        </div>
        <RevealStagger className="why-grid" delayStep={70}>
          {[
            { t: tWhy("p1_t"), b: tWhy("p1_b"), icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.5 8.5 0 1 1-3.32-6.74"/>
                <path d="M21 4v4h-4"/>
                <circle cx="9" cy="11" r="1" fill="currentColor"/>
                <circle cx="13" cy="11" r="1" fill="currentColor"/>
                <path d="M8 14.5c1 1 2.5 1.5 4 1.5s3-.5 4-1.5"/>
              </svg>
            ) },
            { t: tWhy("p2_t"), b: tWhy("p2_b"), icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2V5z"/>
                <path d="M4 17h14"/>
                <path d="M9 8h6M9 11h6"/>
              </svg>
            ) },
            { t: tWhy("p3_t"), b: tWhy("p3_b"), icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2 4 5v7c0 4.5 3.5 8.5 8 10 4.5-1.5 8-5.5 8-10V5l-8-3z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
            ) },
            { t: tWhy("p4_t"), b: tWhy("p4_b"), icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/>
                <path d="M3 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/>
              </svg>
            ) },
            { t: tWhy("p5_t"), b: tWhy("p5_b"), icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3l18 18"/>
                <path d="M10.7 5.3A10 10 0 0 1 22 12s-1 1.8-3 3.7"/>
                <path d="M6.5 6.5C3.5 8.5 2 12 2 12s3 6 10 6c1.7 0 3.2-.3 4.5-.9"/>
                <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>
              </svg>
            ) },
          ].map((card, i) => (
            <MagneticCard key={i}>
              <article className="why-card">
                <div className="why-card-icon" aria-hidden="true">{card.icon}</div>
                <h3>{card.t}</h3>
                <p>{card.b}</p>
              </article>
            </MagneticCard>
          ))}
        </RevealStagger>
      </Reveal>

      {/* ── FEATURES ────────────────────────────────────────────── */}
      <Reveal as="section" className="wrap features">
        <div className="features-head">
          <span className="eyebrow">{tFeat("eyebrow")}</span>
          <h2 style={{ marginTop: 14 }}>{tFeat("heading")}</h2>
          <p>{tFeat("lede")}</p>
        </div>

        <RevealStagger className="feature-grid">
          <MagneticCard>
            <Link className="feature" href="/reader/1/1">
              <span className="feature-num">{tFeat("f1_l")}</span>
              <h3>{tFeat("f1_t")}</h3>
              <p>{tFeat("f1_b")}</p>
              <span className="link">
                {tFeat("f1_l2")}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
              <div className="pic">
                <div className="pic-content">
                  <div className="arabic pic-arabic" lang="ar" dir="rtl">بِسْمِ ٱللَّٰهِ</div>
                </div>
              </div>
            </Link>
          </MagneticCard>

          <MagneticCard>
            <Link className="feature" href="/listen">
              <span className="feature-num">{tFeat("f2_l")}</span>
              <h3>{tFeat("f2_t")}</h3>
              <p>{tFeat("f2_b")}</p>
              <span className="link">
                {tFeat("f2_l2")}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
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
          </MagneticCard>

          <MagneticCard>
            <Link className="feature" href="/ask">
              <span className="feature-num">{tFeat("f3_l")}</span>
              <h3>{tFeat("f3_t")}</h3>
              <p>{tFeat("f3_b")}</p>
              <span className="link">
                {tFeat("f3_l2")}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
              <div className="pic">
                <div className="pic-content" style={{ alignItems: "flex-start", justifyContent: "flex-end", padding: 14, display: "flex", flexDirection: "column", width: "100%", height: "100%", boxSizing: "border-box" }}>
                  <div className="pic-chat" style={{ width: "100%" }}>
                    <div className="b">{tEmo("chat_q")}</div>
                    <div className="b right">{tEmo("chat_a")}</div>
                  </div>
                </div>
              </div>
            </Link>
          </MagneticCard>
        </RevealStagger>
      </Reveal>

      {/* ── EMOTIONS ────────────────────────────────────────────── */}
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

      {/* ── TRUST ───────────────────────────────────────────────── */}
      <Reveal as="section" className="wrap">
        <RevealStagger className="trust" delayStep={90}>
          <div><div className="n"><AnimatedNumber to={114} /></div><div className="l">{tTrust("suras")}</div></div>
          <div><div className="n"><AnimatedNumber to={6236} duration={1800} /></div><div className="l">{tTrust("ayat")}</div></div>
          <div><div className="n"><AnimatedNumber to={24} /></div><div className="l">{tTrust("translations")}</div></div>
          <div><div className="n"><AnimatedNumber to={30} /></div><div className="l">{tTrust("reciters")}</div></div>
          <div><div className="n"><AnimatedNumber to={0} /></div><div className="l">{tTrust("trackers")}</div></div>
        </RevealStagger>
      </Reveal>

      {/* ── CLOSING ─────────────────────────────────────────────── */}
      <Reveal as="section" className="wrap">
        <div className="closing">
          <MihrabArch />
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
