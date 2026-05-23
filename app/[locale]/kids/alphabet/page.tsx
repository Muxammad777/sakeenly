import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { AlphabetGrid } from "@/components/kids/AlphabetGrid";
import type { Locale } from "@/i18n/routing";

interface PageProps { params: Promise<{ locale: Locale }>; }

const LETTERS = [
  { glyph: "ا", tr: "a",  slug: "01-alif"    },
  { glyph: "ب", tr: "b",  slug: "02-ba"      },
  { glyph: "ت", tr: "t",  slug: "03-ta"      },
  { glyph: "ث", tr: "ṯ",  slug: "04-tha"     },
  { glyph: "ج", tr: "j",  slug: "05-jim"     },
  { glyph: "ح", tr: "ḥ",  slug: "06-ha"      },
  { glyph: "خ", tr: "ḫ",  slug: "07-kha"     },
  { glyph: "د", tr: "d",  slug: "08-dal"     },
  { glyph: "ذ", tr: "ḏ",  slug: "09-dhal"    },
  { glyph: "ر", tr: "r",  slug: "10-ra"      },
  { glyph: "ز", tr: "z",  slug: "11-zay"     },
  { glyph: "س", tr: "s",  slug: "12-sin"     },
  { glyph: "ش", tr: "š",  slug: "13-shin"    },
  { glyph: "ص", tr: "ṣ",  slug: "14-sad"     },
  { glyph: "ض", tr: "ḍ",  slug: "15-dad"     },
  { glyph: "ط", tr: "ṭ",  slug: "16-ta-emp"  },
  { glyph: "ظ", tr: "ẓ",  slug: "17-za-emp"  },
  { glyph: "ع", tr: "ʿ",  slug: "18-ayn"     },
  { glyph: "غ", tr: "ġ",  slug: "19-ghayn"   },
  { glyph: "ف", tr: "f",  slug: "20-fa"      },
  { glyph: "ق", tr: "q",  slug: "21-qaf"     },
  { glyph: "ك", tr: "k",  slug: "22-kaf"     },
  { glyph: "ل", tr: "l",  slug: "23-lam"     },
  { glyph: "م", tr: "m",  slug: "24-mim"     },
  { glyph: "ن", tr: "n",  slug: "25-nun"     },
  { glyph: "ه", tr: "h",  slug: "26-ha-soft" },
  { glyph: "و", tr: "w",  slug: "27-waw"     },
  { glyph: "ي", tr: "y",  slug: "28-ya"      },
];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ka" });
  return { title: t("h1"), description: t("lede"), alternates: { canonical: "/kids/alphabet" } };
}

export default async function AlphabetPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Content />;
}

function Content() {
  const t = useTranslations("ka");
  return (
    <>
      <section className="wrap kid-hero">
        <div className="geo-stars-fade"></div>
        <span className="tag"><span className="tag-dot"></span><span>{t("badge")}</span></span>
        <h1>{t("h1")}</h1>
        <p>{t("lede")}</p>
      </section>

      <section className="wrap">
        <div className="legend">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 2"/></svg>
          <div><strong>{t("tip_lab")}</strong> <span>{t("tip")}</span></div>
        </div>

        <AlphabetGrid letters={LETTERS} />
      </section>
    </>
  );
}
