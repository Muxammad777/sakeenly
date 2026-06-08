import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import {
  PROPHET_STORIES,
  findProphetStory,
  getStoryContent,
  nextProphetStory,
  prophetStorySlugs,
} from "@/lib/data/prophet-stories";
import { KidStoryRead } from "@/components/kids/KidStoryRead";

const READ_LABELS: Record<Locale, { btn: string; done: string }> = {
  ru: { btn: "Я прочитал эту историю",        done: "Прочитано" },
  en: { btn: "I read this story",             done: "Read" },
  ar: { btn: "قرأتُ هذه القصة",                done: "قُرئت" },
  fa: { btn: "این داستان را خواندم",          done: "خوانده شد" },
  tg: { btn: "Ин қиссаро хондам",             done: "Хонда шуд" },
  uz: { btn: "Bu qissani o'qib chiqdim",      done: "O'qildi" },
  kk: { btn: "Бұл қиссаны оқыдым",            done: "Оқылды" },
  ky: { btn: "Бул аңгемени окудум",           done: "Окулду" },
  ur: { btn: "میں نے یہ کہانی پڑھ لی",        done: "پڑھ لیا" },
  ms: { btn: "Saya sudah baca kisah ini",     done: "Sudah baca" },
  hi: { btn: "मैंने यह कहानी पढ़ ली",        done: "पढ़ ली" },
  id: { btn: "Saya sudah baca kisah ini",     done: "Sudah baca" },
};

interface PageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

// Build all 25 prophets × N locales static pages.
export function generateStaticParams() {
  const slugs = prophetStorySlugs();
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const story = findProphetStory(slug);
  if (!story) return { title: "Истории пророков" };
  const c = getStoryContent(story, locale);
  const title = `${c.name} ${story.suffix} — ${c.theme}`;
  const description = `${c.name} ${story.suffix}: ${c.theme}. ${c.lesson}`;
  return {
    title,
    description,
    alternates: { canonical: `/kids/stories/${story.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `https://sakeenly.com/kids/stories/${story.slug}`,
      siteName: "Sakeenly",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

// Minimal per-locale UI labels for the story page. Kept inline (not in
// next-intl messages) because they're tightly coupled to this component.
const LABELS: Record<Locale, {
  crumbs: { home: string; kids: string; stories: string };
  h1Prefix: string;
  minWord: string;
  adab: string;
  lessonLbl: string;
  sourcesH: string;
  disclaimerLbl: string;
  disclaimerBody: string;
  nextLbl: string;
  nextNamePrefix: string;
  allLbl: string;
}> = {
  ar: {
    crumbs: { home: "Sakeenly", kids: "للأطفال", stories: "القصص" },
    h1Prefix: "النبي",
    minWord: "د",
    adab: "بدون صور للبشر · مستندة إلى القرآن والسنة الصحيحة",
    lessonLbl: "الدرس",
    sourcesH: "المصادر",
    disclaimerLbl: "أدب.",
    disclaimerBody:
      "هذه القصة مأخوذة من القرآن الكريم والأحاديث الصحيحة والتفاسير الكلاسيكية. لا نختلق حواراً ولا مشاهد، ولا نصف هيئة الأنبياء عليهم السلام. إن لاحظت خطأً فاكتب إلينا.",
    nextLbl: "النبي التالي",
    nextNamePrefix: "النبي",
    allLbl: "كل الأنبياء الـ25",
  },
  ru: {
    crumbs: { home: "Sakeenly", kids: "Детям", stories: "Истории" },
    h1Prefix: "Пророк",
    minWord: "мин",
    adab: "Без изображений людей · по Корану и сахих-хадисам",
    lessonLbl: "Урок",
    sourcesH: "Источники",
    disclaimerLbl: "Адаб.",
    disclaimerBody:
      "Эта история подготовлена по Корану, сахих-хадисам и классическим тафсирам. Мы не выдумываем диалогов и сцен и не описываем внешность пророков, мир им. Если вы заметили ошибку — напишите нам.",
    nextLbl: "Следующий пророк",
    nextNamePrefix: "Пророк",
    allLbl: "Все 25 пророков",
  },
  en: {
    crumbs: { home: "Sakeenly", kids: "Kids", stories: "Stories" },
    h1Prefix: "Prophet",
    minWord: "min",
    adab: "No images of people · sourced from Qur'an and authentic hadith",
    lessonLbl: "Lesson",
    sourcesH: "Sources",
    disclaimerLbl: "Adab.",
    disclaimerBody:
      "This story is drawn from the Qur'an, authentic hadith, and classical tafsir. We do not invent dialogue or scenes, and we do not describe the appearance of the Prophets, peace be upon them. If you notice an error, please write to us.",
    nextLbl: "Next prophet",
    nextNamePrefix: "Prophet",
    allLbl: "All 25 prophets",
  },
  fa: {
    crumbs: { home: "سکینلی", kids: "کودکان", stories: "داستان‌ها" },
    h1Prefix: "حضرت",
    minWord: "دقیقه",
    adab: "بدون تصویر انسان · بر اساس قرآن و حدیث صحیح",
    lessonLbl: "درس",
    sourcesH: "منابع",
    disclaimerLbl: "ادب.",
    disclaimerBody:
      "این داستان از قرآن، احادیث صحیح و تفاسیر کلاسیک گرفته شده است. ما گفتگو یا صحنه‌ای را از خود نمی‌سازیم و ظاهر پیامبران علیهم‌السلام را توصیف نمی‌کنیم. اگر اشتباهی دیدید، به ما بنویسید.",
    nextLbl: "پیامبر بعدی",
    nextNamePrefix: "حضرت",
    allLbl: "هر ۲۵ پیامبر",
  },
  tg: {
    crumbs: { home: "Sakeenly", kids: "Кӯдакон", stories: "Қиссаҳо" },
    h1Prefix: "Пайғамбар",
    minWord: "дақ",
    adab: "Бе тасвири одамон · аз рӯи Қуръон ва ҳадисҳои саҳеҳ",
    lessonLbl: "Дарс",
    sourcesH: "Сарчашмаҳо",
    disclaimerLbl: "Адаб.",
    disclaimerBody:
      "Ин қисса аз рӯи Қуръон, ҳадисҳои саҳеҳ ва тафсирҳои классикӣ омода шудааст. Мо муколама ва саҳнаҳоро аз худ намебарорем ва зоҳири пайғамбарон алайҳим-ус-салом-ро тавсиф намекунем. Агар хатое дидед, ба мо нависед.",
    nextLbl: "Пайғамбари баъдӣ",
    nextNamePrefix: "Пайғамбар",
    allLbl: "Ҳамаи 25 пайғамбар",
  },
  uz: {
    crumbs: { home: "Sakeenly", kids: "Bolalar", stories: "Qissalar" },
    h1Prefix: "Payg'ambar",
    minWord: "daq",
    adab: "Odamlar tasvirisiz · Qur'on va sahih hadislarga ko'ra",
    lessonLbl: "Saboq",
    sourcesH: "Manbalar",
    disclaimerLbl: "Adab.",
    disclaimerBody:
      "Bu qissa Qur'on, sahih hadislar va klassik tafsirlarga asosan tayyorlangan. Biz dialog yoki sahnalarni o'zimizdan to'qib chiqarmaymiz va payg'ambarlar alayhimus-salomning tashqi ko'rinishini tasvirlamaymiz. Agar xatolik sezsangiz, bizga yozing.",
    nextLbl: "Keyingi payg'ambar",
    nextNamePrefix: "Payg'ambar",
    allLbl: "Barcha 25 payg'ambar",
  },
  kk: {
    crumbs: { home: "Sakeenly", kids: "Балалар", stories: "Қиссалар" },
    h1Prefix: "Пайғамбар",
    minWord: "мин",
    adab: "Адам бейнесі жоқ · Құран мен сахих хадистерге сүйенген",
    lessonLbl: "Сабақ",
    sourcesH: "Дереккөздер",
    disclaimerLbl: "Әдеп.",
    disclaimerBody:
      "Бұл қисса Құран, сахих хадистер және классикалық тәпсірлер негізінде дайындалған. Біз диалог пен оқиғаларды өзімізден ойлап шығармаймыз және пайғамбарлардың, оларға салауат болсын, бет-әлпетін сипаттамаймыз. Қате байқасаңыз, бізге жазыңыз.",
    nextLbl: "Келесі пайғамбар",
    nextNamePrefix: "Пайғамбар",
    allLbl: "Барлық 25 пайғамбар",
  },
  ky: {
    crumbs: { home: "Sakeenly", kids: "Балдар", stories: "Аңгемелер" },
    h1Prefix: "Пайгамбар",
    minWord: "мүн",
    adab: "Адамдардын сүрөттөрү жок · Куран жана сахих хадистердин негизинде",
    lessonLbl: "Сабак",
    sourcesH: "Булактар",
    disclaimerLbl: "Адеп.",
    disclaimerBody:
      "Бул аңгеме Куран, сахих хадистер жана классикалык тафсирлердин негизинде даярдалган. Биз диалогдорду жана көрүнүштөрдү ойлоп таппайбыз жана пайгамбарлардын, аларга салам болсун, сырткы келбетин сүрөттөбөйбүз. Эгер ката байкасаңыз, бизге жазыңыз.",
    nextLbl: "Кийинки пайгамбар",
    nextNamePrefix: "Пайгамбар",
    allLbl: "Бардык 25 пайгамбар",
  },
  ur: {
    crumbs: { home: "سکینلی", kids: "بچوں کے لیے", stories: "کہانیاں" },
    h1Prefix: "حضرت",
    minWord: "منٹ",
    adab: "انسانوں کی تصویر کے بغیر · قرآن اور صحیح حدیث پر مبنی",
    lessonLbl: "سبق",
    sourcesH: "ماخذ",
    disclaimerLbl: "ادب۔",
    disclaimerBody:
      "یہ کہانی قرآن، صحیح احادیث اور کلاسیکی تفاسیر سے ماخوذ ہے۔ ہم مکالمے اور مناظر گھڑتے نہیں اور انبیاء علیہم السلام کی شکل و صورت بیان نہیں کرتے۔ اگر آپ کو غلطی نظر آئے تو ہمیں لکھیں۔",
    nextLbl: "اگلا پیغمبر",
    nextNamePrefix: "حضرت",
    allLbl: "تمام 25 پیغمبر",
  },
  ms: {
    crumbs: { home: "Sakeenly", kids: "Untuk Kanak-kanak", stories: "Kisah" },
    h1Prefix: "Nabi",
    minWord: "min",
    adab: "Tanpa gambar manusia · berdasarkan al-Quran dan hadis sahih",
    lessonLbl: "Pengajaran",
    sourcesH: "Sumber",
    disclaimerLbl: "Adab.",
    disclaimerBody:
      "Kisah ini disusun daripada al-Quran, hadis sahih, dan tafsir klasik. Kami tidak mencipta dialog atau adegan, dan tidak menggambarkan rupa para nabi 'alayhim as-salam. Jika anda menemui kesilapan, sila tulis kepada kami.",
    nextLbl: "Nabi seterusnya",
    nextNamePrefix: "Nabi",
    allLbl: "Semua 25 nabi",
  },
  hi: {
    crumbs: { home: "सकीनली", kids: "बच्चों के लिए", stories: "कहानियाँ" },
    h1Prefix: "हज़रत",
    minWord: "मिनट",
    adab: "इंसानों की तस्वीरों के बिना · क़ुरान और सहीह हदीस पर आधारित",
    lessonLbl: "सबक़",
    sourcesH: "स्रोत",
    disclaimerLbl: "अदब।",
    disclaimerBody:
      "यह कहानी क़ुरान, सहीह हदीसों और शास्त्रीय तफ़सीरों से ली गई है। हम संवाद या दृश्य गढ़ते नहीं और पैगंबरों 'अलैहिमुस-सलाम के स्वरूप का वर्णन नहीं करते। यदि आपको कोई त्रुटि दिखे, हमें लिखें।",
    nextLbl: "अगला पैगंबर",
    nextNamePrefix: "हज़रत",
    allLbl: "सभी 25 पैगंबर",
  },
  id: {
    crumbs: { home: "Sakeenly", kids: "Untuk Anak", stories: "Kisah" },
    h1Prefix: "Nabi",
    minWord: "mnt",
    adab: "Tanpa gambar manusia · berdasarkan Al-Quran dan hadis sahih",
    lessonLbl: "Pelajaran",
    sourcesH: "Sumber",
    disclaimerLbl: "Adab.",
    disclaimerBody:
      "Kisah ini disusun dari Al-Quran, hadis sahih, dan tafsir klasik. Kami tidak mengarang dialog atau adegan, dan tidak menggambarkan rupa para nabi 'alaihimus-salam. Jika Anda menemukan kesalahan, mohon tulis kepada kami.",
    nextLbl: "Nabi berikutnya",
    nextNamePrefix: "Nabi",
    allLbl: "Semua 25 nabi",
  },
};

export default async function ProphetStoryPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const story = findProphetStory(slug);
  if (!story) notFound();
  const c = getStoryContent(story, locale);
  const next = nextProphetStory(story.slug);
  const nextC = getStoryContent(next, locale);
  const L = LABELS[locale];

  return (
    <>
      {/* HERO */}
      <section className="wrap kst-hero">
        <div className="geo-stars-fade" aria-hidden></div>
        <div className="kst-crumbs">
          <Link href="/">{L.crumbs.home}</Link>
          <span className="kst-sep">/</span>
          <Link href="/kids">{L.crumbs.kids}</Link>
          <span className="kst-sep">/</span>
          <Link href="/kids/stories">{L.crumbs.stories}</Link>
          <span className="kst-sep">/</span>
          <span className="kst-here">{c.name} {story.suffix}</span>
        </div>
        <h1 className="kst-h1">{L.h1Prefix} {c.name}</h1>
        <div className="kst-arabic" dir="rtl" lang="ar">
          {story.nameAr} {story.suffix}
        </div>
        <div className="kst-meta">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
          </svg>
          <span>{story.readingMin} {L.minWord} · {c.theme}</span>
        </div>
        <div className="kst-adab">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span>{L.adab}</span>
        </div>
      </section>

      {/* BODY */}
      <section className="wrap">
        <article className="kst-article">
          {c.paragraphs.map((p, i) => (
            <p key={i} className="kst-p">{p}</p>
          ))}

          {/* Lesson */}
          <div className="kst-lesson">
            <span className="kst-lesson-lbl">{L.lessonLbl}</span>
            <p>{c.lesson}</p>
          </div>

          {/* Mark-as-read */}
          <div className="kst-read">
            <KidStoryRead slug={story.slug} label={READ_LABELS[locale].btn} labelDone={READ_LABELS[locale].done} />
          </div>

          {/* Sources */}
          <div className="kst-sources">
            <h3>{L.sourcesH}</h3>
            <ul>
              {c.sources.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="kst-disclaimer">
            <strong>{L.disclaimerLbl}</strong> {L.disclaimerBody}
          </div>
        </article>
      </section>

      {/* NEXT PROPHET */}
      <section className="wrap kst-next-wrap">
        <Link href={`/kids/stories/${next.slug}`} className="kst-next">
          <div>
            <span className="kst-next-lbl">{L.nextLbl}</span>
            <span className="kst-next-name">{L.nextNamePrefix} {nextC.name} {next.suffix}</span>
            <span className="kst-next-theme">{next.readingMin} {L.minWord} · {nextC.theme}</span>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M13 6l6 6-6 6"/>
          </svg>
        </Link>

        <div className="kst-all">
          <h4>{L.allLbl}</h4>
          <div className="kst-all-grid">
            {PROPHET_STORIES.filter((s) => s.slug !== story.slug).map((s) => {
              const sc = getStoryContent(s, locale);
              return (
                <Link key={s.slug} href={`/kids/stories/${s.slug}`} className="kst-all-mini">
                  <span className="ru">{L.nextNamePrefix} {sc.name}</span>
                  <span className="ar" dir="rtl">{s.nameAr}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
