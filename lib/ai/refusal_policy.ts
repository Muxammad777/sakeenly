// ─────────────────────────────────────────────────────────────────────────────
// Sakeenly — Fatwa Refusal Policy
// ─────────────────────────────────────────────────────────────────────────────
//
// We never let the LLM issue rulings on personal religious questions
// (marriage/divorce/inheritance/medicine/finance/halal-business/politics/
//  legal punishments). Those require a qualified human scholar.
//
// Detection is INTENTIONALLY high-recall: false positives just nudge the user
// toward a scholar; false negatives can do real harm. The 30-question test
// suite (20 fatwa + 10 safe) in tests/refusal_policy.test.ts is the contract.
//
// Reference resources (the only places we redirect users to):
//   - SeekersGuidance       https://seekersguidance.org/
//   - Yaqeen Institute      https://yaqeeninstitute.org/
//   - AMJA (Assembly of Muslim Jurists of America)  https://www.amjaonline.org/

export type Language = "ru" | "en" | "auto";

export const FATWA_REFERRAL_LINKS = [
  { name: "SeekersGuidance", url: "https://seekersguidance.org/answers/" },
  { name: "Yaqeen Institute", url: "https://yaqeeninstitute.org/" },
  { name: "AMJA", url: "https://www.amjaonline.org/" },
] as const;

export const REFUSAL_MESSAGE_RU = `Этот вопрос требует личной фатвы, а Sakeenly не выносит правовых решений.

Пожалуйста, обратитесь к квалифицированному учёному:
• SeekersGuidance — https://seekersguidance.org/answers/
• Yaqeen Institute — https://yaqeeninstitute.org/
• AMJA — https://www.amjaonline.org/

Я с радостью помогу с чтением Корана, объяснением аятов в их историческом контексте и общими знаниями об исламе.`;

export const REFUSAL_MESSAGE_EN = `This question calls for a personal fatwa, and Sakeenly does not issue legal rulings.

Please consult a qualified scholar:
• SeekersGuidance — https://seekersguidance.org/answers/
• Yaqeen Institute — https://yaqeeninstitute.org/
• AMJA — https://www.amjaonline.org/

I'm happy to help with Quran reading, ayah explanations in historical context, and general knowledge about Islam.`;

// ─────────────────────────────────────────────────────────────────────────────
// Triggers
// ─────────────────────────────────────────────────────────────────────────────
//
// Trigger entries are either:
//   - lowercased substrings (matched via .includes — robust to Russian
//     morphology: "халя" catches халяль / халяльно / халяльный / халяльном)
//   - RegExp for multi-word phrase patterns
//
// We split RU and EN sets so we can do per-language matching and reduce
// false-positive cross-talk between languages.

type Trigger = string | RegExp;

export const FATWA_TRIGGERS_RU: readonly Trigger[] = [
  // ── Permission-shape phrases ────────────────────────────────────────
  /можно\s+ли/iu,
  /дозволено\s+ли/iu,
  /разреш\w*\s+ли/iu,
  /допустим\w*\s+ли/iu,
  /правильно\s+ли/iu,
  /обязан\s+ли/iu,
  /должен\s+ли/iu,
  /имею\s+ли\s+я\s+право/iu,
  /как\s+правильно\s+(совершить|сделать|развест|жени|поделить|расторгн)/iu,
  /что\s+говорит\s+ислам/iu,
  /(является|считается)\s+ли\s+\S+\s+(харам|халя|разреш)/iu,

  // ── Halal / haram vocabulary ────────────────────────────────────────
  "халя",
  "харам",
  "макрух",
  "мубах",
  "мустахабб",
  "фатв",
  "хукм",
  "шариатск",
  "по шариату",
  "мазхаб",
  "ханафитск",
  "шафиитск",
  "маликитск",
  "ханбалитск",

  // ── Marriage / divorce / family rulings ─────────────────────────────
  "никях",
  "никах",
  "талак",
  "талях",
  "хульа",
  "хульу",
  "развод",
  "развест",
  "развелась",
  "жени",
  "замуж",
  "вторая жена",
  "многожен",
  "хиджаб",
  "никаб",
  "аврат",
  "махр",
  "выкуп за невест",

  // ── Inheritance ─────────────────────────────────────────────────────
  "наследств",
  "доля сына",
  "доля дочери",
  "доля жены",
  "доля мужа",
  "доля матери",
  "доля отца",

  // ── Finance: riba / loans / insurance / mortgage / crypto ──────────
  "риба",
  "процент",
  "ипотек",
  "кредит",
  "займ",
  "страхован",
  "криптовал",
  "биткоин",
  "акци",
  "торговля на бирж",
  "форекс",

  // ── Business / job permissibility ───────────────────────────────────
  /(можно|допустим\w*|разреш\w*)\s+ли\s+(работать|трудиться)/iu,
  /(халя\w*|разреш\w*|допустим\w*)\s+ли\s+(мой\s+)?(бизнес|работа|доход|заработок|деньги|зарплата)/iu,
  /работать\s+в\s+(банке|казино|букмек|ломбарде)/iu,

  // ── Medicine / abortion / euthanasia / contraception / vaccines ───
  "аборт",
  "контрацепт",
  "презерватив",
  "эвтанази",
  "пересадк",
  "донорств",
  "вакцин",
  "алкогол",

  // ── Politics / governance / hadd ────────────────────────────────────
  "халифат",
  "джихад",
  "терроризм",
  "правитель",
  "хадд",
  "кисас",
  "побиван",
  "побить камн",
  "отрубан",
];

export const FATWA_TRIGGERS_EN: readonly Trigger[] = [
  // ── Permission-shape phrases ────────────────────────────────────────
  /\bis\s+it\s+(permissible|allowed|halal|haram|haraam|permitted|allowable|ok|okay)\b/i,
  /\bis\s+\w+(\s+\w+)?\s+(halal|haram|haraam)\b/i,
  /\bcan\s+(i|we|a\s+muslim|a\s+muslima?|muslims|men|women|she|he)\b/i,
  /\bam\s+i\s+(allowed|permitted|supposed)\s+to\b/i,
  /\bdo\s+i\s+(have|need)\s+to\b/i,
  /\bshould\s+i\b/i,
  /\bmust\s+i\b/i,
  /\bare\s+(muslims|women|men)\s+allowed\b/i,
  /\bwhat\s+(does|do)\s+islam\s+say(s)?\s+about\b/i,
  /\bwhat\s+is\s+the\s+ruling\s+(on|of|about|regarding|for)\b/i,
  /\bruling\s+(on|of|about|regarding)\b/i,

  // ── Halal / haram vocabulary ────────────────────────────────────────
  /\bhalal\b/i,
  /\bharaam?\b/i,
  /\bmakruh\b/i,
  /\bmubah\b/i,
  /\bmustahabb\b/i,
  /\bfatwa\b/i,
  /\bhukm\b/i,
  /\bmadhhab\b/i,
  /\b(hanafi|shafii|shafi'i|maliki|hanbali)\b/i,

  // ── Marriage / divorce ──────────────────────────────────────────────
  /\b(nikah|nikkah)\b/i,
  /\b(talaq|talak)\b/i,
  /\b(khula|khul'a)\b/i,
  /\bmahr\b/i,
  /\b(polygamy|polygyny|second\s+wife)\b/i,
  /\b(marry|marrying|divorce|divorcing)\b/i,
  /\b(hijab|niqab|awrah|aurat)\b/i,
  /\bdating\b/i,

  // ── Inheritance ─────────────────────────────────────────────────────
  /\b(inheritance|inherit|heir|heirs)\b/i,
  /\bshare\s+of\s+(the\s+|my\s+)?(son|daughter|wife|husband|mother|father|brother|sister)\b/i,

  // ── Finance ─────────────────────────────────────────────────────────
  /\briba\b/i,
  /\binterest\s+(rate|on|from|paid|earned)\b/i,
  /\bmortgage\b/i,
  /\b(loan|loans)\b/i,
  /\binsurance\b/i,
  /\b(crypto|bitcoin|ethereum|stocks?|trading|forex)\b/i,

  // ── Business / job permissibility ───────────────────────────────────
  /\bis\s+(my\s+|the\s+)?(job|business|income|salary|work|trade)\s+(halal|haram|haraam)\b/i,
  /\bcan\s+i\s+work\s+(at|in|as)\b/i,

  // ── Medicine ────────────────────────────────────────────────────────
  /\babortion\b/i,
  /\bcontracepti/i,
  /\bcondoms?\b/i,
  /\beuthanasia\b/i,
  /\b(organ\s+(donation|transplant)|donate\s+organs?)\b/i,
  /\bvaccin/i,
  /\b(alcohol|wine|beer)\b/i,

  // ── Politics / governance ───────────────────────────────────────────
  /\b(caliphate|khilafa)\b/i,
  /\bjihad\b/i,
  /\bterroris/i,

  // ── Punishments ─────────────────────────────────────────────────────
  /\b(hadd|hudud)\b/i,
  /\bqisas\b/i,
  /\bstoning\b/i,
  /\bamput(at|e)/i,
];

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

const CYRILLIC = /[Ѐ-ӿ]/;

export function detectLanguage(text: string): "ru" | "en" {
  return CYRILLIC.test(text) ? "ru" : "en";
}

function matchAny(text: string, triggers: readonly Trigger[]): boolean {
  for (const t of triggers) {
    if (typeof t === "string") {
      if (text.includes(t)) return true;
    } else if (t.test(text)) return true;
  }
  return false;
}

export function isFatwaShaped(question: string, language: Language = "auto"): boolean {
  if (!question || typeof question !== "string") return false;
  const text = question.toLowerCase().normalize("NFC");

  // Always run both sets when language is "auto" — questions in mixed scripts
  // are common (e.g. Russian text with the word "halal" written in Latin).
  if (language === "auto") {
    return matchAny(text, FATWA_TRIGGERS_RU) || matchAny(text, FATWA_TRIGGERS_EN);
  }
  return matchAny(text, language === "ru" ? FATWA_TRIGGERS_RU : FATWA_TRIGGERS_EN);
}

export function refusalMessageFor(language: Language): string {
  const lang = language === "auto" ? "ru" : language;
  return lang === "en" ? REFUSAL_MESSAGE_EN : REFUSAL_MESSAGE_RU;
}
