import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

interface PageProps { params: Promise<{ locale: Locale }>; }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "sb" });
  return { title: t("h1"), description: t("lede"), alternates: { canonical: "/scholars" } };
}

export default async function ScholarsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Content />;
}

function Content() {
  const t = useTranslations("sb");

  const board = [
    { role: "SeekersGuidance · Hanafi fiqh", bio: "Кафедра исламского права. Профиль: семейные взаимоотношения, личные правовые вопросы." },
    { role: "Yaqeen Institute · Quranic studies", bio: "PhD по тафсиру. Профиль: исторический контекст аятов, asbab al-nuzul, классические тафсиры." },
    { role: "Russian-speaking ulama", bio: "Имам и муаллим, работа с русскоязычной уммой. Профиль: переводы, локальный контекст." },
    { role: "Hadith specialist", bio: "Специализация по сахих-корпусу (Бухари, Муслим). Курирует hadith retrieval для AI." },
  ];

  return (
    <>
      <section className="wrap sb-hero" data-hero-ar="عُلَماء">
        <div className="geo-stars-fade"></div>
        <span className="tag"><span className="tag-dot"></span><span>{t("badge")}</span></span>
        <h1>{t("h1")}</h1>
        <p>{t("lede")}</p>
      </section>

      <section className="wrap pipeline">
        <span className="eyebrow">{t("pipe_eyebrow")}</span>
        <h2 style={{ marginTop: 12, fontWeight: 300 }}>{t("pipe_h")}</h2>
        <div className="pipe-grid">
          {([1, 2, 3, 4] as const).map((n) => (
            <div key={n} className="pipe">
              <span className="n">{t(`s${n}.n` as `s1.n`)}</span>
              <h3>{t(`s${n}.t` as `s1.t`)}</h3>
              <p>{t(`s${n}.d` as `s1.d`)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap board">
        <span className="eyebrow">{t("board_eyebrow")}</span>
        <h2 style={{ marginTop: 12, fontWeight: 300 }}>{t("board_h")}</h2>
        <p style={{ color: "var(--text-2)", marginTop: 14, maxWidth: "56ch" }}>{t("board_p")}</p>
        <div className="scholar-grid">
          {board.map((s, i) => (
            <div key={i} className="scholar">
              <div className="avatar">ـ</div>
              <div className="info">
                <div className="name">Имя учёного</div>
                <div className="role">{s.role}</div>
                <p className="bio">{s.bio}</p>
                <span className="pending">
                  <span className="tag-dot"></span>
                  <span>{t("pending")}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap">
        <div className="apply-band">
          <div className="geo-stars-soft"></div>
          <span className="eyebrow">{t("apply_eyebrow")}</span>
          <h2 style={{ marginTop: 14 }}>{t("apply_h")}</h2>
          <p>{t("apply_p")}</p>
          <a className="btn btn-primary" href="mailto:scholars@sakeenly.com">{t("apply_btn")}</a>
        </div>
      </section>
    </>
  );
}
