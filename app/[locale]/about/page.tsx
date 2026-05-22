import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

interface PageProps { params: Promise<{ locale: Locale }>; }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ab" });
  return { title: t("h1"), description: t("lede"), alternates: { canonical: "/about" } };
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Content />;
}

function Content() {
  const t = useTranslations("ab");

  const sources = [
    { svg: <><path d="M4 19.5V6a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2"/></>, ti: "Quran.com API v4", d: "Текст Корана, переводы, аудио чтецов" },
    { svg: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18"/></>, ti: "Sunnah.com", d: "Хадис-корпус (Бухари, Муслим и другие)" },
    { svg: <path d="M12 3 L14.5 10 L22 12 L14.5 14 L12 21 L9.5 14 L2 12 L9.5 10 Z"/>, ti: "KFGQPC Hafs", d: "Шрифт от King Fahd Glorious Qur'an Complex" },
    { svg: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18"/></>, ti: "Перевод Э. Кулиева", d: "Основной русский перевод по умолчанию" },
    { svg: <><path d="M12 8v8M8 12h8"/><circle cx="12" cy="12" r="9"/></>, ti: "Anthropic Claude", d: "AI Q&A с обязательными inline-цитатами" },
    { svg: <><path d="M3 12c5-5 13-5 18 0M3 12c5 5 13 5 18 0"/><circle cx="12" cy="12" r="3"/></>, ti: "Voyage AI", d: "Эмбеддинги для семантического поиска" },
  ];

  return (
    <>
      <section className="wrap about-hero">
        <div className="geo-stars-fade"></div>
        <span className="tag"><span className="tag-dot"></span><span>{t("badge")}</span></span>
        <h1>{t("h1")}</h1>
        <div className="arabic-mark">سَكِينَة</div>
        <p>{t("lede")}</p>
      </section>

      <section className="wrap principles">
        <span className="eyebrow">{t("principles_eyebrow")}</span>
        <h2 style={{ marginTop: 12, fontWeight: 300 }}>{t("principles_h")}</h2>
        <div className="principles-grid">
          {([1, 2, 3, 4, 5, 6] as const).map((n) => (
            <div key={n} className="principle">
              <span className="n">{t(`p${n}.n` as `p1.n`)}</span>
              <h3>{t(`p${n}.t` as `p1.t`)}</h3>
              <p>{t(`p${n}.d` as `p1.d`)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap">
        <div className="quotebox">
          <div className="geo-stars-soft"></div>
          <p className="arabic" dir="rtl">هُوَ الَّذِي أَنزَلَ السَّكِينَةَ فِي قُلُوبِ الْمُؤْمِنِينَ</p>
          <p className="tr">{t("quote_tr")}</p>
          <p className="cite">{t("quote_cite")}</p>
        </div>
      </section>

      <section className="wrap sources-section">
        <span className="eyebrow">{t("sources_eyebrow")}</span>
        <h2 style={{ marginTop: 12, fontWeight: 300 }}>{t("sources_h")}</h2>
        <div className="sources-list">
          {sources.map((s) => (
            <div key={s.ti} className="src-item">
              <div className="icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">{s.svg}</svg>
              </div>
              <div className="body">
                <div className="t">{s.ti}</div>
                <div className="d">{s.d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-band">
        <div className="geo-stars-soft"></div>
        <div className="wrap inner">
          <span className="eyebrow">{t("cta_eyebrow")}</span>
          <h2 style={{ marginTop: 14 }}>{t("cta_h")}</h2>
          <p>{t("cta_p")}</p>
          <div className="cta-row">
            <Link className="btn btn-primary" href="/scholars">{t("cta_btn1")}</Link>
            <Link className="btn btn-ghost" href="/privacy">{t("cta_btn2")}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
