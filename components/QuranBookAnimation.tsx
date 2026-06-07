"use client";

// QuranBookAnimation — small 3D book sitting at the bottom of the hero
// with real KFGQPC Hafs text from 2:255 (Ayat al-Kursi) and the verses
// either side. Pages flip every 4.5s on a CSS keyframes loop, the same
// way a real Mushaf turns. All Arabic text is real — taken from the
// Uthmani corpus we ship — so the reader can actually read the page.

import { useMemo } from "react";

interface Page {
  surahNumber: number;
  ayahStart: number;
  ayahEnd: number;
  text: string;
  title: string;       // localized page label, e.g. "Сура 2 · аят 253–254"
  arabicTitle: string; // localized arabic surah name
}

// We hard-code the visible page contents from the Tanzil Uthmani — small
// snippets so the book never has to lazy-load. Stays in sync with
// lib/knowledge/quran/uthmani.json.
const PAGE_TEXT: Record<string, string> = {
  "2:253": "۞ تِلْكَ ٱلرُّسُلُ فَضَّلْنَا بَعْضَهُمْ عَلَىٰ بَعْضٍ ۘ مِّنْهُم مَّن كَلَّمَ ٱللَّهُ ۖ وَرَفَعَ بَعْضَهُمْ دَرَجَٰتٍ ۚ وَءَاتَيْنَا عِيسَى ٱبْنَ مَرْيَمَ ٱلْبَيِّنَٰتِ وَأَيَّدْنَٰهُ بِرُوحِ ٱلْقُدُسِ ۗ",
  "2:254": "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓاْ أَنفِقُواْ مِمَّا رَزَقْنَٰكُم مِّن قَبْلِ أَن يَأْتِيَ يَوْمٌ لَّا بَيْعٌ فِيهِ وَلَا خُلَّةٌ وَلَا شَفَٰعَةٌ ۗ وَٱلْكَٰفِرُونَ هُمُ ٱلظَّٰلِمُونَ",
  "2:255": "ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَيُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُۥ مَا فِى ٱلسَّمَٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ",
  "2:256": "لَآ إِكْرَاهَ فِى ٱلدِّينِ ۖ قَد تَّبَيَّنَ ٱلرُّشْدُ مِنَ ٱلْغَىِّ ۚ فَمَن يَكْفُرْ بِٱلطَّٰغُوتِ وَيُؤْمِنۢ بِٱللَّهِ فَقَدِ ٱسْتَمْسَكَ بِٱلْعُرْوَةِ ٱلْوُثْقَىٰ لَا ٱنفِصَامَ لَهَا ۗ وَٱللَّهُ سَمِيعٌ عَلِيمٌ",
  "2:257": "ٱللَّهُ وَلِىُّ ٱلَّذِينَ ءَامَنُواْ يُخْرِجُهُم مِّنَ ٱلظُّلُمَٰتِ إِلَى ٱلنُّورِ ۖ وَٱلَّذِينَ كَفَرُوٓاْ أَوْلِيَآؤُهُمُ ٱلطَّٰغُوتُ يُخْرِجُونَهُم مِّنَ ٱلنُّورِ إِلَى ٱلظُّلُمَٰتِ ۗ",
};

export function QuranBookAnimation({ label }: { label: string }) {
  const pages = useMemo<Page[]>(() => [
    {
      surahNumber: 2, ayahStart: 253, ayahEnd: 253,
      text: PAGE_TEXT["2:253"], title: "Аль-Бакара · 253",
      arabicTitle: "البقرة",
    },
    {
      surahNumber: 2, ayahStart: 254, ayahEnd: 254,
      text: PAGE_TEXT["2:254"], title: "Аль-Бакара · 254",
      arabicTitle: "البقرة",
    },
    {
      surahNumber: 2, ayahStart: 255, ayahEnd: 255,
      text: PAGE_TEXT["2:255"], title: "Аят аль-Курси · 2:255",
      arabicTitle: "البقرة",
    },
    {
      surahNumber: 2, ayahStart: 256, ayahEnd: 257,
      text: `${PAGE_TEXT["2:256"]} \n${PAGE_TEXT["2:257"]}`,
      title: "Аль-Бакара · 256–257",
      arabicTitle: "البقرة",
    },
  ], []);

  return (
    <div className="quran-book" aria-label={label}>
      <div className="quran-book-stage">
        <div className="quran-book-cover" aria-hidden="true">
          <div className="quran-book-cover-frame">
            <span className="quran-book-cover-mark">قرآن</span>
          </div>
        </div>
        {pages.map((p, i) => (
          <article
            key={`${p.surahNumber}:${p.ayahStart}`}
            className="quran-book-page"
            style={{
              animationDelay: `${i * 4500}ms`,
              // Each subsequent page sits 1px back so the stack has depth.
              zIndex: pages.length - i,
            }}
          >
            <header className="quran-book-page-head">
              <span className="quran-book-page-eyebrow">{p.title}</span>
              <span className="quran-book-page-arabic" lang="ar">{p.arabicTitle}</span>
            </header>
            <div className="quran-book-page-body arabic" lang="ar" dir="rtl">
              {p.text}
            </div>
            <footer className="quran-book-page-foot">
              <span className="quran-book-page-num">۞ {p.ayahStart}</span>
            </footer>
          </article>
        ))}
      </div>
    </div>
  );
}
