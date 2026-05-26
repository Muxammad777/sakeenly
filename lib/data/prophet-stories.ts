// Sakeenly — истории пророков для детей 4-10 лет (родитель читает вслух).
//
// ИСТОЧНИКИ (строго):
//   1. Коран — текст Откровения, цитаты по переводу Э. Кулиева (ru),
//      Sahih International / Mustafa Khattab (en), Makarem Shirazi / Fooladvand (fa),
//      Ayati (tg), Sodik (uz), Khalifa Altay (kk), Mokhtasar Kyrgyz (ky).
//   2. Сахих-хадисы — Бухари, Муслим, Ат-Тирмизи, Ан-Насаи.
//   3. Ибн Касир, «Кисас аль-Анбия» — классический сборник историй пророков.
//   4. Ат-Табари, «Тарих ар-Русуль ва-ль-Мулюк», разделы о пророках.
//   5. Per-language traditions: Yaqeen Institute / Mufti Menk (en), Hawzah /
//      Tafsir-e Nemuneh / Qisas-e Jaza'eri (fa, Sunni-compatible material only),
//      Tajik Muftiyat (tg), Shaykh Muhammad Sodiq Yusuf / islom.uz (uz),
//      muftyat.kz (kk), muftiyat.kg / namaz.kg (ky).
//
// ПРАВИЛА:
//   • Никаких выдуманных диалогов и сцен.
//   • Никаких описаний внешности пророков — это запрещено адабом.
//   • Если у пророка тонкое повествование в Коране (Аййюб, Юнус) — текст
//     остаётся коротким и честным.
//   • Стиль: спокойный рассказчик для ребёнка 4-10 лет.
//   • Каждая история — 5-8 абзацев, ~600-1000 слов = 5-8 минут чтения вслух.
//   • Структура: место/время/окружение → главное испытание →
//     как Аллах помог → урок.
//
// LOCALIZATION:
//   Контент per-locale: `byLocale[locale]`. Если язык отсутствует — фронтенд
//   откатывается на `byLocale.ru` (никогда не показываем плейсхолдеры).
//
// TODO (аудио):
//   Аудио-озвучка планируется через Sofia (ElevenLabs) или сопоставимое
//   решение. На этой итерации — только чистый текст, без плейсхолдер-кнопок.

import type { Locale } from "@/i18n/routing";

export interface ProphetStoryLocalized {
  /** Local-language rendering of the prophet's name (e.g. ru "Адам", en "Adam"). */
  name: string;
  /** Short subtitle / theme word (e.g. "первый человек" / "the first human"). */
  theme: string;
  /** 5-8 paragraphs, 600-1000 words. */
  paragraphs: string[];
  /** 1-2 sentence takeaway for a child. */
  lesson: string;
  /** Citations in this language's conventions. */
  sources: string[];
}

export interface ProphetStory {
  slug: string;
  /** Canonical Arabic name of the prophet (never localized). */
  nameAr: string;
  /** Honorific suffix in Arabic. */
  suffix: "عليه السلام";
  /** Approximate read-aloud time in minutes. */
  readingMin: number;
  /** Per-locale content. RU is mandatory; other locales are added incrementally. */
  byLocale: Partial<Record<Locale, ProphetStoryLocalized>> & {
    ru: ProphetStoryLocalized;
  };
}

/**
 * Returns the localized content for a story, falling back to RU when the
 * target locale has not yet been authored. Never returns placeholders.
 */
export function getStoryContent(
  story: ProphetStory,
  locale: Locale,
): ProphetStoryLocalized {
  return story.byLocale[locale] ?? story.byLocale.ru;
}

export const PROPHET_STORIES: ProphetStory[] = [
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: "adam",
    nameAr: "آدم",
    suffix: "عليه السلام",
    readingMin: 6,
    byLocale: {
      tg: {
        name: "Одам",
        theme: "нахустин инсон",
        paragraphs: [
          "Хеле пеш, ҳанӯз одам набуд, шаҳре набуд, кӯдакон дар кӯчаҳо намедавиданд — танҳо замин ва осмон буд, фариштагон ва Аллоҳе, ки ҳамаашро офарид. Фариштагон шабу рӯз Аллоҳро ибодат мекарданд ва ҳаргиз хаста намешуданд. Онҳо аз нур офарида шуда буданд ва ҳар сухани Парвардигорашонро итоат мекарданд.",
          "Як рӯз Аллоҳ ба фариштагон фармуд: «Ман дар замин халифае хоҳам гузошт». Фариштагон ҳайрон шуданд ва пурсиданд: «Эй Парвардигор, оё касеро мегузорӣ, ки фасод кунад ва хун резад, дар ҳоле ки мо Туро тасбеҳ мегӯем ва пок медонем?» Аллоҳ ҷавоб дод: «Ман медонам он чизе ро, ки шумо намедонед».",
          "Он гоҳ Аллоҳ як каф хок аз замин гирифт ва ба амри Худ аз он нахустин инсонро офарид. Номи ӯ Одам буд. Аллоҳ аз рӯҳи Худ дар ӯ дамид ва Одам зинда шуд. Аллоҳ ба Одам номи ҳама чизро омӯзонд: дарахт чист, санг чист, об чист, парранда чист. Одам ҳамаашро аз бар кард, зеро Аллоҳ дар ӯ чизе нихода буд, ки ҳайвонҳо надоранд — ақле, ки фикр карда метавонад.",
          "Сипас Аллоҳ ба фариштагон фармуд, ки ба Одам ба нишонаи эҳтиром барои ин махлуқи нав саҷда кунанд. Ҳама фариштагон саҷда карданд. Танҳо Иблис, ки аз ҷинниён буд, рад кард. Гуфт: «Ман аз ӯ беҳтарам — маро аз оташ офаридӣ, аммо ӯро аз гил». Дар дили Иблис кибру ғурур буд, ва ғурур бемориест, ки чашми дилро бар ҳақиқат кӯр мекунад. Пас Аллоҳ Иблисро ронд.",
          "Одам дар ҷаннат зиндагӣ мекард. Аллоҳ барои ӯ ҳамсаре офарид — Ҳавво. Якҷоя зиндагӣ мекарданд, аз меваҳои ширини он мехӯрданд, оби соф менӯшиданд ва овози фариштагонро мешуниданд. Аммо Аллоҳ ба онҳо фармуд: «Дар ҷаннат сокин бошед ва аз он ҳар чи мехоҳед бихӯред, лекин ба ин дарахт наздик нашавед». Ин озмоиш буд. Аллоҳ мехост, ки Одам ва Ҳавво худашон интихоб кунанд — итоат кунанд ё на.",
          "Иблис, ки кинаашро фаромӯш накарда буд, ба Одам ва Ҳавво васваса омӯхт. Сухани зебо, аммо фиребкорона гуфт: «Агар аз ин дарахт бихӯред, чун фариштагон мешавед ва ҷовидона мемонед». Одам ва Ҳавво манъро аз ёд бурданд ва аз мева чашиданд. Дар ҳамон лаҳза фаҳмиданд, ки кори бад кардаанд. Шарманда шуданд.",
          "Аммо Одам аз хатои худ нагурехт. Ба сӯи Аллоҳ баргашт ва ҳамон калимаҳоеро гуфт, ки худи Аллоҳ ба ӯ омӯхта буд: «Парвардигоро! Мо ба худамон ситам кардем; агар Ту моро набахшӣ ва раҳм накунӣ, аз зиёнкорон хоҳем буд». Аллоҳ тавбаи ӯро қабул кард, чун Аллоҳ тавбакунандагонро дӯст медорад. Одам ва Ҳавво ба замин фуруд оварда шуданд ва Одам нахустин пайғамбар ва нахустин инсон дар замин шуд.",
          "Аз он рӯз ҳар инсон фарзанди Одам аст. Ҳама мардум бародар ва хоҳаранд, чун аз як падар омадаанд. Ва ҳар бор ки мо хато мекунем, ҳамон корро карда метавонем, ки Одам кард: ба сӯи Аллоҳ баргардем ва мағфират пурсем. Аллоҳ Ал-Ғафур — Бахшандаи доим аст.",
        ],
        lesson:
          "Дарс: хато кардан як ҷузъи инсон будан аст, аммо мӯъмини ҳақиқӣ аз хатои худ намегурезад. Ба сӯи Аллоҳ меравад ва мегӯяд: «Маро бубахш». Ва Аллоҳ мебахшад.",
        sources: [
          "Қуръон 2:30-39 (офариниши Одам, саҷдаи фариштагон, озмоиш ва тавба)",
          "Қуръон 7:11-25 (саркашии Иблис ва аз ҷаннат ронда шудан)",
          "Қуръон 20:115-122 (фаромӯшии Одам ва қабули тавба)",
          "Саҳеҳи Бухорӣ 3326 (ҳадис дар офариниши Одам)",
          "Ибни Касир, Қисас ул-Анбиё, боби Одам алайҳис-салом",
        ],
      },
      uz: {
        name: "Odam",
        theme: "birinchi inson",
        paragraphs: [
          "Juda qadim zamonlarda, hali odam ham yo'q edi, shahar ham yo'q edi, ko'chada yugurib yuradigan bolalar ham yo'q edi — faqat yer va osmon, farishtalar va hammasini yaratgan Alloh bor edi. Farishtalar kechayu kunduz Allohga ibodat qilar, hech qachon charchamasdilar. Ular nurdan yaratilgan bo'lib, Rabbining har bir so'ziga itoat qilardilar.",
          "Bir kuni Alloh farishtalarga: \"Men yer yuzida xalifa qilmoqchiman\", — dedi. Farishtalar hayron bo'lib so'rashdi: \"Yo Rabbi, biz Senga tasbeh aytib, Seni ulug'lab turganimizda, Sen yer yuzida buzg'unchilik qilib qon to'kadiganlarni qo'yasanmi?\" Alloh ularga: \"Men sizlar bilmaydigan narsalarni bilaman\", — deb javob berdi.",
          "Shunda Alloh yerdan bir hovuch tuproq olib, O'z amri bilan undan birinchi insonni yaratdi. Uning ismi Odam edi. Alloh unga O'z ruhidan puflab, Odam tirildi. Alloh Odamga hamma narsaning nomini o'rgatdi: daraxt nima, tosh nima, suv nima, qush nima. Odam hammasini yodlab oldi, chunki Alloh uning ichiga hayvonlarda yo'q narsani — fikrlay oladigan aqlni qo'ygan edi.",
          "Keyin Alloh farishtalarga yangi yaratilgan zotga hurmat sifatida Odamga sajda qilishni amr qildi. Hamma farishtalar sajdaga bosh qo'ydi. Faqat jinlardan bo'lgan Iblis bosh tortdi. U: \"Men undan yaxshiman — meni o'tdan, uni esa tuproqdan yaratding\", — dedi. Iblisning yuragida kibr bor edi, kibr esa qalbni haqiqatdan ko'r qiladigan kasallikdir. Shu sababli Alloh Iblisni quvib chiqardi.",
          "Odam Jannatda yashar edi. Alloh unga juft sifatida Havvoni yaratdi. Ular birga yashardi, shirin mevalaridan yer, tiniq suvini ichar, farishtalar ovozini eshitardi. Lekin Alloh ularga: \"Jannatda istaganingizdek yashang, undan nimani xohlasangiz yeng, ammo mana shu daraxtga yaqinlashmang\", — dedi. Bu sinov edi. Alloh Odam va Havvo o'zlari itoat etishni yoki etmaslikni tanlashlarini xohlardi.",
          "Iblis kinasini unutmagani uchun Odam va Havvoga vasvasa qila boshladi. Chiroyli, ammo aldovchi so'zlar bilan: \"Agar shu daraxtdan tatib ko'rsangiz, farishtalarga aylanasiz va abadiy yashaysiz\", — dedi. Odam va Havvo taqiqni unutib, mevadan totishdi. O'sha onda yomon ish qilganlarini tushunishdi. Uyalishdi.",
          "Lekin Odam o'z xatosidan qochmadi. Allohga yuzlanib, Alloh O'zi unga o'rgatgan so'zlarni aytdi: \"Ey Rabbimiz! Biz o'zimizga zulm qildik. Agar Sen bizni kechirmasang va rahm qilmasang, biz albatta ziyon ko'rganlardan bo'lamiz\". Alloh uning tavbasini qabul qildi, chunki Alloh tavba qiluvchilarni sevadi. Odam va Havvo yer yuziga tushirildi va Odam yer yuzidagi birinchi payg'ambar va birinchi inson bo'ldi.",
          "O'shandan beri har bir inson Odamning farzandidir. Hamma odamlar bir otadan kelgan, shuning uchun aka-uka va opa-singildirlar. Va biz har gal xato qilganimizda, Odam qilgan ishni qila olamiz: Allohga yuzlanib, mag'firat so'raymiz. Alloh — Al-G'afur, doim kechiruvchidir.",
        ],
        lesson:
          "Saboq: xato qilish insonlikning bir qismi, ammo haqiqiy mo'min xatosidan qochmaydi. U Allohga yuzlanib, \"Meni kechir\", — deydi. Va Alloh kechiradi.",
        sources: [
          "Qur'on 2:30-39 (Odamning yaratilishi, farishtalarning sajdasi, sinov va tavba)",
          "Qur'on 7:11-25 (Iblisning bosh tortishi, jannatdan haydalishi)",
          "Qur'on 20:115-122 (Odamning unutishi va tavbaning qabul etilishi)",
          "Sahihul Buxoriy 3326 (Odamning yaratilishi haqida)",
          "Ibn Kasir, Qisasul Anbiyo, Odam alayhissalom bobi",
        ],
      },
      en: {
        name: "Adam",
        theme: "the first human",
        paragraphs: [
          "Long before there were people, before there were cities, before any child had ever laughed in a garden — there was only the earth, the sky, the angels, and Allah, who had made all of it. The angels worshipped Allah day and night, and they never grew tired. They were made of light, and they obeyed every word their Lord spoke.",
          "One day Allah said to the angels: \"I am going to place a successor on the earth.\" The angels were puzzled. They asked, \"My Lord, will You place on it one who will spread corruption and shed blood, while we glorify Your praise?\" And Allah answered them: \"Indeed, I know what you do not know.\"",
          "Then Allah took a handful of clay from the earth, and from that clay, by His command, He shaped the first human. His name was Adam. Allah breathed into him from His spirit, and Adam came alive. Allah taught Adam the names of everything — what is a tree, what is a stone, what is water, what is a bird. Adam remembered every one, because Allah placed inside him something that animals do not have: a mind that can know.",
          "Allah then told the angels to bow to Adam as a sign of honour for this new creation. All the angels bowed. Only Iblis, who was from the jinn, refused. He said, \"I am better than him. You created me from fire, and You created him from clay.\" Iblis's heart was full of pride, and pride is the disease that blinds a soul to the truth. So Allah drove Iblis out.",
          "Adam lived in Jannah, the Garden. Allah created a wife for him, Hawwa (Eve). They lived together, ate its sweet fruits, drank its clear water, and heard the voices of the angels. But Allah said to them: \"Live in the Garden, eat from it as you wish, but do not go near this one tree.\" It was a test. Allah wanted Adam and Hawwa to choose for themselves whether to obey.",
          "Iblis, who had not forgotten his anger, came whispering to Adam and Hawwa. He spoke beautiful, twisted words: \"If you eat from this tree, you will become like angels and live forever.\" Adam and Hawwa forgot the warning and tasted the fruit. The moment they did, they felt ashamed.",
          "But Adam did not run from his mistake. He turned to Allah with the very words Allah Himself had taught him: \"Our Lord, we have wronged ourselves. If You do not forgive us and have mercy on us, we will surely be among the losers.\" And Allah accepted his repentance, because Allah loves those who turn back to Him. Adam and Hawwa were sent down to live on the earth, and Adam became the first prophet and the first human to walk it.",
          "Ever since, every human being is a child of Adam. All people are brothers and sisters through their first father. And whenever we make a mistake, we can do exactly what Adam did: turn back to Allah and ask for forgiveness. Allah is al-Ghafur, the Ever-Forgiving.",
        ],
        lesson:
          "Lesson: making a mistake is part of being human, but a believer does not run from it. He turns to Allah and says, \"Forgive me.\" And Allah forgives.",
        sources: [
          "Quran 2:30-39 (creation of Adam, the angels' bow, the test, and tawbah)",
          "Quran 7:11-25 (Iblis's refusal and expulsion from the Garden)",
          "Quran 20:115-122 (Adam forgetting and Allah accepting his repentance)",
          "Sahih al-Bukhari 3326 (the creation of Adam)",
          "Ibn Kathir, Qisas al-Anbiya, chapter on Adam",
        ],
      },
      fa: {
        name: "آدم",
        theme: "نخستین انسان",
        paragraphs: [
          "روزگاری بسیار دور، پیش از آنکه انسانی روی زمین قدم بگذارد، پیش از آنکه شهری ساخته شود یا کودکی در باغی بخندد، تنها زمین بود و آسمان و فرشتگانی که خداوند آنها را آفریده بود. فرشتگان شب و روز خداوند را عبادت می‌کردند و هرگز خسته نمی‌شدند. آنها از نور آفریده شده بودند و هر سخن پروردگارشان را اطاعت می‌کردند.",
          "روزی خداوند به فرشتگان فرمود: «من در زمین جانشینی قرار خواهم داد.» فرشتگان شگفت‌زده شدند و گفتند: «پروردگارا، آیا کسی را در آن قرار می‌دهی که فساد کند و خون بریزد، در حالی که ما تو را تسبیح و تقدیس می‌کنیم؟» خداوند به آنان پاسخ داد: «من می‌دانم آنچه را که شما نمی‌دانید.»",
          "آنگاه خداوند مشتی از خاک زمین برداشت و به فرمان خویش از آن، نخستین انسان را آفرید. نامش آدم بود. خداوند از روح خود در او دمید و آدم زنده شد. خداوند نام همه چیز را به آدم آموخت: نام درخت، نام سنگ، نام آب، نام پرنده. آدم همه را به خاطر سپرد، چرا که خداوند در درون او چیزی نهاده بود که جانوران ندارند: عقلی که می‌اندیشد.",
          "سپس خداوند به فرشتگان فرمود که برای احترام به این آفریده‌ی تازه، در برابر آدم سجده کنند. همه‌ی فرشتگان سجده کردند. تنها ابلیس که از جنّیان بود، سرپیچی کرد. گفت: «من از او بهترم؛ مرا از آتش آفریدی و او را از خاک.» در دل ابلیس کبر و غرور خانه کرده بود، و غرور دردی است که دل را از دیدن حقیقت کور می‌کند. پس خداوند ابلیس را راند.",
          "آدم در بهشت زندگی می‌کرد. خداوند برای او همسری به نام حوّا آفرید. آنان در کنار هم زندگی می‌کردند، از میوه‌های شیرین بهشت می‌خوردند و آب گوارای آن را می‌نوشیدند. اما خداوند به آنها فرمود: «در بهشت ساکن شوید و از آن هر چه خواستید بخورید، ولی به این درخت نزدیک نشوید.» این یک آزمایش بود؛ خداوند می‌خواست آدم و حوّا خود انتخاب کنند که فرمان ببرند یا نه.",
          "ابلیس که کینه‌اش را فراموش نکرده بود، در گوش آدم و حوّا وسوسه خواند. با سخنانی زیبا اما فریبنده گفت: «اگر از این درخت بخورید، چون فرشتگان می‌شوید و جاودانه خواهید زیست.» آدم و حوّا فرمان را از یاد بردند و از میوه چشیدند. در همان لحظه فهمیدند که خطا کرده‌اند. شرمنده شدند.",
          "اما آدم از اشتباه خود نگریخت. به سوی خداوند بازگشت و همان کلماتی را گفت که خود خداوند به او آموخته بود: «پروردگارا، ما به خویشتن ستم کردیم؛ اگر ما را نیامرزی و بر ما رحم نکنی، از زیانکاران خواهیم بود.» خداوند توبه‌ی او را پذیرفت، چرا که خداوند توبه‌کنندگان را دوست می‌دارد. آدم و حوّا به زمین فرود آمدند و آدم نخستین پیامبر و نخستین انسان روی زمین شد.",
          "از آن روز هر انسانی فرزند آدم است. همه‌ی مردم برادر و خواهرند، چرا که از یک پدر آمده‌اند. و هر بار که ما اشتباه می‌کنیم، می‌توانیم همان کاری را کنیم که آدم کرد: به سوی خداوند بازگردیم و آمرزش بخواهیم. خداوند الغفور است، آمرزنده‌ی همیشگی.",
        ],
        lesson:
          "درس: اشتباه کردن جزء انسان بودن است، اما مؤمن واقعی از اشتباه خود نمی‌گریزد. به سوی خداوند بازمی‌گردد و می‌گوید: «مرا ببخش.» و خداوند می‌بخشد.",
        sources: [
          "قرآن ۲:۳۰-۳۹ (آفرینش آدم، سجده‌ی فرشتگان، آزمایش و توبه)",
          "قرآن ۷:۱۱-۲۵ (سرپیچی ابلیس و اخراج از بهشت)",
          "قرآن ۲۰:۱۱۵-۱۲۲ (فراموشی آدم و پذیرش توبه)",
          "صحیح بخاری ۳۳۲۶ (حدیث آفرینش آدم)",
          "ابن کثیر، قصص الانبیاء، باب آدم علیه‌السلام",
        ],
      },
      ru: {
        name: "Адам",
        theme: "первый человек",
        paragraphs: [
          "Давным-давно, когда ещё не было людей, не было городов, не было детей, бегающих по улицам, — была только земля, небо, ангелы и Аллах, Который всё это сотворил. Ангелы поклонялись Аллаху днём и ночью и не уставали. Они были созданы из света и слушались каждого слова своего Господа.",
          "И вот однажды Аллах сказал ангелам: «Я создам на земле наместника». Ангелы удивились и спросили: «Господи, неужели Ты создашь того, кто будет проливать кровь и совершать дурное, тогда как мы прославляем Тебя?» Аллах ответил им: «Я знаю то, чего вы не знаете».",
          "Тогда Аллах взял немного земли — и из этой земли, по Своему повелению, сотворил первого человека. Его имя — Адам. Аллах вдохнул в него дух, и Адам ожил. Аллах научил Адама именам всех вещей: что такое дерево, что такое камень, что такое вода, что такое птица. Адам запомнил все эти имена, потому что Аллах вложил в него разум — большой подарок, которого нет у животных.",
          "Аллах велел ангелам поклониться Адаму в знак уважения к новому творению. И все ангелы поклонились. Только один из джиннов, по имени Иблис, отказался. Он сказал: «Я лучше его — меня Ты создал из огня, а его из глины». В сердце Иблиса жила гордыня, а гордыня — это болезнь, из-за которой нельзя видеть истину. И Аллах изгнал Иблиса.",
          "Адам жил в Раю. Аллах создал ему жену — Хавву. Они жили вместе, ели сладкие плоды, пили чистую воду и слышали голоса ангелов. Но Аллах сказал им: «Живите в Раю, ешьте, что хотите, но не приближайтесь к этому дереву». Это было испытание. Аллах хотел, чтобы Адам и Хавва сами выбрали — слушаться или нет.",
          "Иблис, который затаил зло, начал нашёптывать Адаму и Хавве. Он говорил красивые, но обманные слова: «Если съедите плод этого дерева — станете как ангелы и будете жить вечно». Адам и Хавва забыли запрет и попробовали плод. И в ту же минуту они поняли, что сделали что-то нехорошее. Им стало стыдно.",
          "Но Адам не убежал от своей ошибки. Он повернулся к Аллаху и сказал слова, которым его научил Сам Аллах: «Господи! Мы поступили несправедливо по отношению к себе. Если Ты не простишь нас и не помилуешь — мы окажемся среди потерпевших убыток». И Аллах принял его покаяние, ведь Аллах любит тех, кто кается. Адам и Хавва были отправлены жить на землю — и Адам стал первым пророком и первым человеком на земле.",
          "С тех пор каждый человек — потомок Адама. Все люди — братья и сёстры по своему праотцу. И каждый раз, когда мы ошибаемся, мы можем сделать то же, что сделал Адам: повернуться к Аллаху и попросить прощения. Аллах — Аль-Гафур, Прощающий.",
        ],
        lesson:
          "Урок: ошибаться — это по-человечески, но настоящий мумин не убегает от ошибки. Он идёт к Аллаху и говорит: «Прости меня». И Аллах прощает.",
        sources: [
          "Коран 2:30-39 (сотворение Адама, поклон ангелов, искушение и тауба)",
          "Коран 7:11-25 (отказ Иблиса, изгнание из Рая)",
          "Коран 20:115-122 (забвение Адама и принятие покаяния)",
          "Ибн Касир, «Кисас аль-Анбия», глава «Хабар об Адаме»",
          "Сахих аль-Бухари 3326 (хадис о сотворении Адама)",
        ],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    slug: "nuh",
    nameAr: "نُوح",
    suffix: "عليه السلام",
    readingMin: 7,
    byLocale: {
      tg: {
        name: "Нӯҳ",
        theme: "киштии наҷот",
        paragraphs: [
          "Пас аз Одам асрҳои бисёр гузашт. Одамон дар замин зиндагӣ мекарданд ва дар оғоз Аллоҳро ёд медоштанд. Аммо бо мурури замон фаромӯш карданд. Ба санггҳое, ки худашон тарошида буданд, ва ба дарахтоне, ки худашон шинонида буданд, ибодат сар карданд. Аввал ин сангҳоро ба номи мардуми солеҳи фавтида ёд мекарданд, баъд кам-кам бовар карданд, ки худи сангҳо метавонанд ёрӣ диҳанд ва ҳифз кунанд. Ва ҳамин тариқ Офаридгорашонро фаромӯш карданд.",
          "Он гоҳ Аллоҳ ба онҳо пайғамбари худ Нӯҳро фиристод. Нӯҳ қавмашро ба сӯи Аллоҳ даъват кардан гирифт. Мегуфт: «Эй қавми ман! Аллоҳро ибодат кунед, ҷуз Ӯ барои шумо маъбуде нест. Ман аз азоби рӯзи бузург бар шумо метарсам». Ӯ рӯзу шаб мехонд. Пинҳон ва ошкоро мехонд. Бо нармӣ ва бо сахтгирӣ мехонд.",
          "Солҳо гузашт — на як, на даҳ, балки наздик ҳазор сол. Нӯҳ нӯҳсаду панҷоҳ сол қавми худро ба сӯи Аллоҳ даъват кард. Аммо қариб ҳеҷ кас гӯш надод. Мардум ангуштонашонро дар гӯш мегузоштанд, либосашонро ба сар мекашиданд, то садои ӯро нашунаванд. Ба Нӯҳ механдиданд ва ба ҳамдигар мегуфтанд: «Бутҳои худро тарк накунед».",
          "Ниҳоят Нӯҳ ба Парвардигораш руҷӯъ кард. Аз хастагии худ шиква накард — балки адолат хост. Аллоҳ ба ӯ ҷавоб дод: «Ҳеҷ кас аз қавми ту имон нахоҳад овард, ҷуз онҳое ки аллакай имон овардаанд». Сипас Аллоҳ ба Нӯҳ амр кард, ки киштие — киштии бузурге — созад.",
          "Нӯҳ бар замини хушк, дур аз ҳар баҳре, ба сохтани киштӣ оғоз кард. Мардум меомаданд ва механдиданд: «Эй Нӯҳ, ту дар биёбон киштӣ месозӣ! Куҷо мехоҳӣ онро ронӣ?» Нӯҳ бо оромӣ ҷавоб медод: «Агар имрӯз шумо ба мо механдед, мо низ боре ба шумо хоҳем хандид, ҳамчунон ки ҳоло механдед». Ӯ хашмгин намешуд — танҳо месохт.",
          "Вақте киштӣ омода шуд, Аллоҳ ба Нӯҳ амр кард, ки оилаашро, имонорандагон ва аз ҳар ҷонваре як ҷуфт бо худ гирад, то зиндагӣ пас аз тӯфон давом ёбад. Сипас аз замин чашмаҳо ҷӯшид ва аз осмон бороне борид, ки ҳеҷ гоҳ чунин набуд. Об боло мерафт. Дарёҳо аз соҳилҳояшон гузаштанд, баҳрҳо аз кӯҳҳо болотар шуданд. Тамоми ҷаҳон зери об шуд.",
          "Яке аз писарони Нӯҳ ба киштӣ нанишаст. Бо ғурур гуфт: «Ман бар кӯҳе мебароям, ки маро аз об наҷот диҳад». Нӯҳ ба ӯ фарёд кашид: «Имрӯз ҳеҷ ҳифзкунандае аз амри Аллоҳ нест, ҷуз касе, ки Аллоҳ ба ӯ раҳм кунад». Аммо мавҷе байни онҳо гузашт — ва писар ғарқ шуд. Нӯҳ гирист ва дар бораи писараш аз Аллоҳ пурсид, чун ин писари ӯ буд. Аллоҳ бо нармӣ ба Нӯҳ ёдрас кард: наҷот на дар хун ва на дар хешу табор, балки дар имон аст.",
          "Вақте азоб ба охир расид, Аллоҳ ба замин фармуд: «Оби худро фурӯ бар» ва ба осмон гуфт: «Бас кун». Об қафо нишаст. Киштӣ бар кӯҳе истод ва Нӯҳ бо мӯъминон бар замини пок қадам гузошт. Аллоҳ насли онҳоро баракат дод — ва аз ҳамон мӯъминон ҳама халқҳое, ки имрӯз дар замин зиндагӣ мекунанд, ба дунё омаданд.",
        ],
        lesson:
          "Дарс: даъватгари ҳақиқӣ ҳатто агар солҳо ба ӯ хандиданд, таслим намешавад. Ва оилаи ҳақиқӣ танҳо хун нест — балки имон аст. Танҳо он чизе наҷот медиҳад, ки дар дил аст.",
        sources: [
          "Қуръон 71 (сураи «Нӯҳ» — пурраи қиссаи даъват)",
          "Қуръон 11:25-49 (сохтани киштӣ, тӯфон ва писари Нӯҳ)",
          "Қуръон 29:14 (ёдоварии 950 сол даъват)",
          "Ибни Касир, Қисас ул-Анбиё, боби Нӯҳ алайҳис-салом",
          "Табарӣ, Таърих, боби Нӯҳ ва тӯфон",
        ],
      },
      uz: {
        name: "Nuh",
        theme: "kema",
        paragraphs: [
          "Odamdan keyin ko'p avlodlar o'tdi. Odamlar yer yuzida yashar, dastlab Allohni eslab turardilar. Lekin vaqt o'tishi bilan unuta boshladilar. O'zlari o'yib chiqargan toshlarga, o'zlari ekkan daraxtlarga sajda qila boshladilar. Avval bu toshlarni o'tib ketgan solih kishilarning ismi bilan atashar, keyin asta-sekin toshlarning o'zi yordam berib, himoya qiladi deb ishonib qolishdi. Shunday qilib Yaratganlarini unutdilar.",
          "Shunda Alloh ularga payg'ambar Nuhni yubordi. Nuh qavmini yana Allohga qaytishga chaqira boshladi. U: \"Ey qavmim! Allohga ibodat qiling, Undan o'zga sizning iloh yo'q. Men sizlar uchun katta Kunning azobidan qo'rqaman\", — derdi. Kechayu kunduz chaqirardi. Yashirin va oshkor chaqirardi. Yumshoq va qattiq chaqirardi.",
          "Yillar o'tdi — bir yil emas, o'n yil emas, balki ming yilga yaqin. Nuh to'qqiz yuz ellik yil davomida qavmini Allohga chaqirdi. Lekin deyarli hech kim quloq solmadi. Odamlar uning ovozini eshitmaslik uchun barmoqlarini quloqlariga tiqar, kiyimlarini boshlariga yopib olishar edi. Nuhni masxara qilishar va bir-birlariga: \"Butlaringizni tashlamang\", — deyishar edi.",
          "Nihoyat Nuh Rabbiga yuzlandi. U o'z charchog'idan shikoyat qilmadi — adolat so'radi. Alloh unga: \"Sening qavmingdan iymon keltirganlardan boshqa hech kim iymon keltirmaydi\", — deb javob berdi. So'ng Alloh Nuhga katta kema — kema qurishni amr qildi.",
          "Nuh quruq yerda, dengizdan uzoqda kemani qurishni boshladi. Odamlar kelib tomosha qilib, kulishardi: \"Ey Nuh, sahroda kema qurayapsanmi? Uni qayerga olib borasan?\" Nuh xotirjam: \"Agar bugun siz bizni mazax qilsangiz, biz ham keyin xuddi shunday siz hozir mazax qilayotganingizdek sizdan kuldiramiz\", — deb javob berardi. U jahli chiqmasdan, faqat qurishni davom ettirardi.",
          "Kema tayyor bo'lganida, Alloh Nuhga oilasini, iymon keltirganlarni va har bir hayvondan bir juftdan o'zi bilan olib chiqishni amr qildi — to'fondan keyin hayot davom etishi uchun. Shunda yerdan chashmalar otilib chiqdi, osmondan esa shunday yomg'ir yog'a boshladiki, hech qachon bunday bo'lmagan edi. Suv ko'tarila-ko'tarila ketdi. Daryolar qirg'oqlaridan oshib, dengizlar tog'lardan ham yuqori ko'tarildi. Butun olam suv ostida qoldi.",
          "Nuhning bir o'g'li kemaga chiqmadi. U mag'rurlanib: \"Men suvdan saqlanish uchun tog'ga chiqib olaman\", — dedi. Nuh unga: \"Bugun Allohning amridan saqlovchi yo'q, faqat U rahm qilgan kishidangina najot bor\", — deb baqirdi. Ammo ular o'rtasidan to'lqin o'tib, o'g'il g'arq bo'ldi. Nuh yig'lab, o'g'li haqida Rabbidan so'radi, axir bu uning o'g'li edi. Alloh unga yumshoqlik bilan eslatdi: najot qon yoki qarindoshlikda emas, balki iymondadir.",
          "Azob tugaganda, Alloh yerga: \"Suvingni yutib ol\", deb, osmonga: \"To'xta\", deb amr qildi. Suv qaytdi. Kema bir tog'da to'xtadi va Nuh iymonlilar bilan birga toza yerga qadam qo'ydi. Alloh ularning naslini barakali qildi — va o'sha mo'minlardan bugungi yer yuzida yashayotgan barcha xalqlar kelib chiqdi.",
        ],
        lesson:
          "Saboq: haqiqiy da'vatchi, hatto ustidan yillar davomida kulishsa ham, taslim bo'lmaydi. Haqiqiy oila esa faqat qon emas, balki iymondir. Kishini qutqaradigan narsa — yuragidagidir.",
        sources: [
          "Qur'on, Nuh surasi (71-sura — to'liq da'vat qissasi)",
          "Qur'on 11:25-49 (kemaning qurilishi, to'fon, Nuhning o'g'li)",
          "Qur'on 29:14 (950 yil da'vat haqida zikr)",
          "Ibn Kasir, Qisasul Anbiyo, Nuh alayhissalom bobi",
          "Tabariy, Tarixul rusul val-muluk, Nuh va to'fon bo'limi",
        ],
      },
      en: {
        name: "Nuh",
        theme: "the ark",
        paragraphs: [
          "Many generations passed after Adam. People lived on the earth, and at first they remembered Allah. But over time they began to forget. They started worshipping stones they had carved themselves and trees they had planted themselves. The stones first carried the names of righteous people who had died, and then — slowly — the people came to believe the stones themselves could help and protect them. And so they forgot their Creator.",
          "Allah then sent to them the Prophet Nuh. Nuh began calling his people back to Allah. He said, \"My people, worship Allah. You have no god besides Him. I fear for you the punishment of a tremendous Day.\" He called them by day, and he called them by night. He called them in secret, and he called them openly. He called them gently, and he called them firmly.",
          "Years passed — not one year, not ten, but nearly a thousand. Nuh called his people to Allah for nine hundred and fifty years. Yet hardly anyone listened. People stuffed their fingers in their ears and pulled their cloaks over their heads so they would not hear him. They laughed at Nuh and told each other, \"Do not abandon your idols.\"",
          "Finally Nuh turned to Allah. He did not complain about his exhaustion — he asked for justice. And Allah answered him: \"None of your people will believe except those who have already believed.\" Then Allah commanded Nuh to build a ship — a great ark.",
          "Nuh began building the ark on dry land, far from any sea. People came to watch and laugh. \"Nuh, you are building a ship in the desert! Where will you sail it?\" Nuh would answer calmly, \"If you mock us now, we will mock you later as you mock us today.\" He did not get angry. He just kept building.",
          "When the ark was ready, Allah commanded Nuh to take his family, those who had believed, and a pair from every kind of animal, so that life could continue after the flood. Then the springs burst open from the earth, and the sky poured down rain such as had never been seen. The water rose and rose. Rivers overflowed; the sea climbed above the mountains. The whole world was covered.",
          "One of Nuh's sons refused to enter the ark. He said proudly, \"I will climb a mountain that will protect me from the water.\" Nuh cried out to him, \"Today there is no protection from the command of Allah except for those He has mercy upon.\" But a wave passed between them, and the son drowned. Nuh wept and asked his Lord about him, for this was his son. And Allah gently reminded Nuh that salvation is not in blood or kinship — it is in faith.",
          "When the punishment was over, Allah commanded the earth, \"Swallow your water,\" and the sky, \"Hold back.\" The waters receded. The ark came to rest on a mountain, and Nuh and the believers stepped out onto a cleansed earth. Allah blessed their descendants, and from those believers came all the peoples who live on earth today.",
        ],
        lesson:
          "Lesson: a true caller does not give up, even when people mock him for years. And a true family is not only blood — it is faith. What truly saves a person is what is inside the heart.",
        sources: [
          "Quran 71 (Surah Nuh — the full account of the call)",
          "Quran 11:25-49 (the building of the ark, the flood, and Nuh's son)",
          "Quran 29:14 (mention of the 950 years of preaching)",
          "Ibn Kathir, Qisas al-Anbiya, chapter on Nuh",
          "al-Tabari, Tarikh, section on Nuh and the flood",
        ],
      },
      fa: {
        name: "نوح",
        theme: "کشتی نجات",
        paragraphs: [
          "نسل‌های بسیاری پس از آدم گذشت. مردم روی زمین زندگی می‌کردند و در آغاز خداوند را به یاد داشتند. اما به مرور زمان فراموش کردند. به پرستش سنگ‌هایی روی آوردند که خود تراشیده بودند و درختانی که خود کاشته بودند. در ابتدا آن سنگ‌ها را به نام صالحانِ درگذشته می‌خواندند، و سپس کم‌کم باور کردند که خودِ سنگ‌ها به آنان یاری و پناه می‌دهند. بدین‌سان آفریدگار خود را از یاد بردند.",
          "آنگاه خداوند پیامبرش نوح را به سوی آنان فرستاد. نوح قومش را به سوی خداوند فرا می‌خواند و می‌گفت: «ای قوم من! خدا را بپرستید که جز او معبودی برای شما نیست. من بر شما از عذاب روزی بزرگ می‌ترسم.» روز و شب می‌خواند. در نهان و آشکار می‌خواند. به نرمی می‌خواند و به سختی می‌خواند.",
          "سال‌ها گذشت؛ نه یک سال، نه ده سال، بلکه نزدیک به هزار سال. نوح نهصد و پنجاه سال قوم خود را به سوی خداوند دعوت کرد. اما جز اندکی کسی نشنید. مردم انگشت در گوش می‌گذاشتند و جامه بر سر می‌کشیدند تا صدای او را نشنوند. به او می‌خندیدند و به یکدیگر می‌گفتند: «بت‌های خویش را وامگذارید.»",
          "سرانجام نوح به سوی پروردگارش بازگشت. از خستگی خود گله نکرد، بلکه خواستار عدل شد. خداوند به او پاسخ داد: «هیچ‌کس از قوم تو ایمان نخواهد آورد جز کسانی که ایمان آورده‌اند.» سپس خداوند به نوح فرمان داد کشتی‌ای بسازد ـ کشتی‌ای بزرگ.",
          "نوح در میان خشکی شروع به ساختن کشتی کرد، دور از هر دریایی. مردم می‌آمدند و می‌خندیدند: «ای نوح، در بیابان کشتی می‌سازی؟ کجا با آن خواهی رفت؟» نوح آرام پاسخ می‌داد: «اگر امروز شما به ما می‌خندید، روزی ما نیز چنان‌که شما اکنون می‌خندید، به شما خواهیم خندید.» خشم نمی‌گرفت ـ فقط می‌ساخت.",
          "وقتی کشتی آماده شد، خداوند به نوح فرمود تا خانواده‌اش و آنان که ایمان آورده بودند را با خود ببرد و از هر جانوری یک جفت سوار کند تا زندگی پس از طوفان تداوم یابد. آنگاه از زمین چشمه‌ها جوشید و از آسمان بارانی فرود آمد که هرگز چنان نباریده بود. آب بالا و بالاتر آمد. رودها از کناره‌ها گذشتند و دریاها از کوه‌ها فراتر رفتند. سراسر جهان زیر آب رفت.",
          "یکی از پسران نوح در کشتی ننشست. با تکبر گفت: «من به کوهی پناه می‌برم که مرا از آب حفظ کند.» نوح بانگ زد: «امروز هیچ پناهی از فرمان خداوند نیست جز برای آن‌که مورد رحمت اوست.» اما موجی میان آن دو افتاد و پسر غرق شد. نوح گریست و درباره‌ی او از پروردگار خویش پرسید، چرا که فرزندش بود. خداوند به نرمی او را یادآور شد که نجات در خویشاوندی و خون نیست، بلکه در ایمان است.",
          "وقتی عذاب پایان یافت، خداوند به زمین فرمود: «آب خود را فرو ببر» و به آسمان فرمود: «بایست.» آب فروکش کرد. کشتی بر کوهی آرام گرفت و نوح و مؤمنان بر زمینِ پاک شده فرود آمدند. خداوند نسل آنان را برکت داد و از همان مؤمنان همه‌ی مردمان زمین امروز پدید آمدند.",
        ],
        lesson:
          "درس: داعی راستین حتی اگر سال‌ها به او بخندند، تسلیم نمی‌شود. و خانواده‌ی واقعی تنها خویشاوندی خونی نیست؛ ایمان است. تنها چیزی که انسان را نجات می‌دهد، آن چیزی است که در دل اوست.",
        sources: [
          "قرآن، سوره‌ی نوح (سوره‌ی ۷۱ - تمام داستان دعوت)",
          "قرآن ۱۱:۲۵-۴۹ (ساختن کشتی، طوفان و پسر نوح)",
          "قرآن ۲۹:۱۴ (یادکرد از ۹۵۰ سال دعوت)",
          "ابن کثیر، قصص الانبیاء، باب نوح علیه‌السلام",
          "طبری، تاریخ الرسل و الملوک، باب نوح و طوفان",
        ],
      },
      ru: {
        name: "Нух",
        theme: "ковчег",
        paragraphs: [
          "Много веков прошло после Адама. Люди жили на земле, и сначала они помнили Аллаха. Но потом стали забывать. Они начали поклоняться камням, которые сами вырезали, и деревьям, которые сами сажали. Они называли эти камни именами добрых людей, давно умерших, — а потом стали считать, что сами камни помогают и защищают. И так они забыли своего Создателя.",
          "Тогда Аллах послал к этим людям пророка Нуха. Нух стал звать свой народ обратно к Аллаху. Он говорил: «О мой народ! Поклоняйтесь Аллаху — у вас нет другого божества, кроме Него. Я боюсь, что вас постигнет наказание великого Дня». Он говорил это днём и говорил это ночью. Говорил тайно и говорил вслух. Говорил мягко и говорил строго.",
          "Так шли годы — не один, не десять, а почти тысячу лет. Нух звал свой народ к Аллаху девятьсот пятьдесят лет. Но почти никто не слушал. Люди затыкали уши пальцами, накрывали головы одеждой, чтобы не слышать его. Они смеялись над Нухом и говорили друг другу: «Не оставляйте своих идолов».",
          "И тогда Нух обратился к Аллаху. Он не жаловался на свою усталость — он просил справедливости. И Аллах ответил Нуху: «Никто из твоего народа не уверует, кроме тех, кто уже уверовал». И Аллах велел Нуху построить корабль — большой корабль, ковчег.",
          "Нух начал строить ковчег прямо на земле, далеко от моря. И люди приходили смотреть и смеялись: «Нух, ты строишь корабль на песке! Куда ты на нём поплывёшь?» А Нух отвечал: «Если вы сейчас смеётесь над нами, то мы будем смеяться над вами так, как сейчас смеётесь вы». Он не злился — он просто строил.",
          "Когда ковчег был готов, Аллах велел Нуху взять с собой семью, тех, кто уверовал, и по паре от каждого вида животных — чтобы жизнь продолжилась после потопа. И тогда из земли забили источники, а с неба полился дождь — такой, какого никогда не было. Вода поднималась и поднималась. Реки выходили из берегов, моря поднимались выше гор. Весь мир покрылся водой.",
          "Один из сыновей Нуха не сел в ковчег. Он гордо сказал: «Я заберусь на гору, и она спасёт меня от воды». Нух крикнул ему: «Сегодня никто не защитит от веления Аллаха, кроме того, кого Он помилует». Но между ними прошла волна — и сын утонул. Нух заплакал и спросил Аллаха о нём, ведь это был его сын. И Аллах мягко напомнил Нуху: спасение — не в крови и не в родстве, а в вере.",
          "Когда наказание закончилось, Аллах велел земле: «Поглоти свою воду», а небу: «Удержись». И вода ушла. Ковчег остановился на горе, и Нух с верующими вышел на чистую землю. Аллах благословил их потомство — и от этих верующих произошли все народы, которые есть на земле сегодня.",
        ],
        lesson:
          "Урок: настоящий пророк не сдаётся, даже если над ним смеются годами. И настоящая семья — это не только кровь, но и вера. Спасает только то, что в сердце.",
        sources: [
          "Коран 71 (сура «Нух» — полная история призыва)",
          "Коран 11:25-49 (строительство ковчега, потоп, сын Нуха)",
          "Коран 29:14 (упоминание о 950 годах призыва)",
          "Ибн Касир, «Кисас аль-Анбия», глава «Хабар о Нухе»",
          "Ат-Табари, «Тарих», раздел о Нухе и потопе",
        ],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    slug: "ibrahim",
    nameAr: "إِبْرَاهِيم",
    suffix: "عليه السلام",
    readingMin: 8,
    byLocale: {
      tg: {
        name: "Иброҳим",
        theme: "халилуллоҳ",
        paragraphs: [
          "Замоне дар сарзамине миёни ду дарёи бузург, писаре ба номи Иброҳим зиндагӣ мекард. Қавми ӯ ба бутҳо — ҳайкалҳои сангиву чӯбин ибодат мекард. Бовар доштанд, ки ин ҳайкалҳо метавонанд ёрӣ диҳанд, бемориро шифо бахшанд ва борон оваранд. Ҳатто падари Иброҳим чунин ҳайкалҳоро мепардохт ва дар бозор мефурӯхт.",
          "Аммо Иброҳими хурд аз аввал тарзи дигаре фикр мекард. Ба осмон менигарист ва аз худ мепурсид: «Кӣ ҳамаи инро офарид?» Як шаб ситораи рӯшане дар осмон дид ва гуфт: «Шояд ин Парвардигори ман бошад». Аммо ситора ғуруб кард. Иброҳим гуфт: «Ман ғурубкунандагонро дӯст намедорам». Сипас моҳро дид ва гуфт: «Шояд ин Парвардигори ман бошад». Аммо моҳ ҳам пинҳон шуд. Сипас офтобро дид — бузургу пурзӯр. Аммо офтоб низ дар уфуқ нишаст. Он гоҳ Иброҳим фаҳмид: ҳар чи тағйир мекунад ва меравад, наметавонад Худо бошад. Худо бояд он бошад, ки ҳамеша ҳаст ва тағйир намепазирад. Дили Иброҳим ба сӯи Аллоҳ гардид.",
          "Иброҳим ба қавми худ гуфт: «Ин ҳайкалҳо на мешунаванд, на мебинанд ва на ба шумо ёрӣ дода метавонанд. Барои чӣ онҳоро мепарастед?» Қавмаш хашмгин шуд. Як рӯз, вақте ҳама ба ҷашне рафта буданд, Иброҳим танҳо ба бутхона даромад. Таборе гирифт ва ҳамаи бутҳоро шикаст, ҷуз бузургтаринашонро. Таборро бар дӯши он бути бузург гузошт.",
          "Вақте қавм баргашт ва бутҳои шикастаро дид, фарёд заданд: «Кӣ ин корро кардааст?» Иброҳимро гумон бурданд ва ба муҳокима кашиданд. Иброҳим бо оромӣ гуфт: «Аз ин бути бузург пурсед — шояд ин ӯ кардааст». Қавм гуфтанд: «Ту худ медонӣ, ки ин бутҳо сухан намегӯянд!» Он гоҳ Иброҳим гуфт: «Пас чӣ гуна чизе ро мепарастед, ки на сухан гуфта метавонад ва на ба шумо ёрӣ дода метавонад?» Сарҳояшонро ба зер партофтанд — чун дар дил медонистанд, ки Иброҳим бар ҳақ аст. Аммо кибру ғурур нагузошт, ки эътироф кунанд.",
          "Қарор доданд Иброҳимро ба ҷазои даҳшатноке маҳкум кунанд — дар оташи бузурге сӯзонад. Рӯзҳо ҳезум ҷамъ карданд ва оташе афрӯхтанд, ки ҳатто наздик шудан ба он имконнопазир буд. Иброҳимро дар он афканданд. Аммо Аллоҳ ба оташ фармуд: «Эй оташ! Барои Иброҳим хунук ва саломат бош». Оташ ӯро насӯзонд. Иброҳим тану осуда аз шӯъла берун омад, чун Аллоҳ бо ӯ буд.",
          "Иброҳим бо оилааш аз он сарзамин кӯч кард. Аллоҳ ба ӯ амр кард, ки ба ҷое дур равад — ҳамон ҷое ки имрӯз Макка аст. Дар он замон ин ҷо водии хушку холӣ буд, бе об ва бе мардум. Иброҳим занаш Ҳоҷар ва писари хурдсолаш Исмоилро дар он ҷо гузошт, чун Аллоҳ амр карда буд. Ҳоҷар пурсид: «Оё Аллоҳ ба ту амр кардааст?» Иброҳим гуфт: «Бале». Ҳоҷар гуфт: «Пас Аллоҳ моро тарк нахоҳад кард».",
          "Вақте оби Исмоил тамом шуд, Ҳоҷар ҳафт бор миёни ду теппа — Сафо ва Марва давид, дар ҷустуҷӯи ёрӣ. Аллоҳ аз замин чашмае ҷӯшонд, рост дар назди пои Исмоили хурдсол. Ин чашмаро Замзам меноманд ва беш аз чор ҳазор сол аст, ки ҷорӣ аст. Ҳар мусулмоне, ки ба Макка барои ҳаҷ меояд, аз он менӯшад ва миёни Сафо ва Марва меравад, ба ёди сабри Ҳоҷар.",
          "Вақте Исмоил калон шуд, Аллоҳ ба Иброҳим ва Исмоил амр кард, ки якҷоя нахустин Хонаро барои ибодати Аллоҳ бино кунанд — Каъбаро. Бо дастони худ сангҳоро мебардоштанд ва Иброҳим дуо мекард: «Парвардигоро, аз мо қабул кун». Имрӯз ҳар мусулмоне дар ҷаҳон, ҳар куҷое бошад, ҳангоми намоз рӯ ба ҳамон Каъба мекунад. Аллоҳ барои вафодории Иброҳим номеро ба ӯ ато кард, ки ба ҳеҷ кас надода буд — «Халилуллоҳ», дӯсти Аллоҳ.",
        ],
        lesson:
          "Дарс: Иброҳим танҳо дар муқобили як қавми пурра истода буд, чун Аллоҳ дар дилаш буд. Вақте бо Аллоҳ бошӣ — ҳатто оташ хунук мешавад.",
        sources: [
          "Қуръон 6:74-79 (тааммули Иброҳим бар ситора, моҳ, офтоб)",
          "Қуръон 21:51-70 (шикастани бутҳо ва наҷот аз оташ)",
          "Қуръон 14:35-41 (дуои Иброҳим барои Макка ва насл)",
          "Қуръон 2:124-129 (бино кардани Каъба)",
          "Қуръон 4:125 (Аллоҳ Иброҳимро «халил» номид)",
          "Саҳеҳи Бухорӣ 3364-3365 (қиссаи Ҳоҷар, Исмоил ва Замзам)",
          "Ибни Касир, Қисас ул-Анбиё, бобҳои Иброҳим алайҳис-салом",
        ],
      },
      uz: {
        name: "Ibrohim",
        theme: "Xalilulloh",
        paragraphs: [
          "Qadim zamonlarda, ikki ulug' daryo orasidagi bir yurtda Ibrohim ismli o'g'il bola yashar edi. Uning qavmi butlarga — tosh va yog'och haykallarga sig'inar edi. Bu haykallar odamlarga yordam berishi, kasalliklarni davolashi va yomg'ir keltirishi mumkin deb ishonardilar. Hatto Ibrohimning otasi ham shunday haykallar yasab, bozorda sotardi.",
          "Lekin yosh Ibrohim avvaldan boshqacha o'ylar edi. U osmonga qarab o'zidan so'rar edi: \"Bularning hammasini kim yaratdi?\" Bir kechasi yorqin yulduzni ko'rib: \"Balki bu mening Rabbimdir\", — dedi. Lekin yulduz botdi. Ibrohim: \"Men botadiganlarni sevmayman\", — dedi. Keyin oyni ko'rib: \"Balki bu mening Rabbimdir\", — dedi. Oy ham botdi. Keyin quyoshni ko'rdi — katta va kuchli. Ammo quyosh ham ufqda botdi. O'shanda Ibrohim tushundi: o'zgaradigan va g'oyib bo'ladigan narsa Xudo bo'la olmaydi. Xudo doimo bor va o'zgarmas bo'lishi kerak. Ibrohimning yuragi Allohga burildi.",
          "Ibrohim qavmiga: \"Bu haykallar sizni eshitmaydi, ko'rmaydi va sizga yordam bera olmaydi. Nega ularga sajda qilasiz?\" — dedi. Odamlar g'azablandi. Bir kuni hamma bayramga ketganda, Ibrohim yolg'iz butxonaga kirib bordi. Boltani olib, eng kattasidan boshqa hamma haykalni sindirdi. Boltani esa o'sha katta butning yelkasiga osib qo'ydi.",
          "Qavm qaytib kelib, sindirilgan butlarni ko'rib: \"Bu ishni kim qildi?\" — deb baqirishdi. Ibrohimdan shubhalanib, uni sudga keltirishdi. Ibrohim xotirjam: \"Mana shu kattadan so'rang — balki o'sha qilgandir\", — dedi. Qavm: \"Sen o'zing bilasanki, bu butlar gapirmaydi-ku!\" — deyishdi. Shunda Ibrohim: \"Bo'lmasa, qanday qilib gapirolmaydigan va sizga yordam bera olmaydigan narsaga sig'inasizlar?\" — dedi. Ular boshlarini quyi soldilar — chunki yuraklarining tubida Ibrohim haq ekanini bilishardi. Lekin kibrlari tan olishga qo'ymadi.",
          "Ular Ibrohimni dahshatli jazoga — katta gulxanda yondirishga qaror qilishdi. Bir necha kun davomida o'tin to'plashdi va shu darajada o'tni yoqishdiki, hech kim unga yaqinlasholmas edi. Ibrohimni o'sha olovga tashlashdi. Lekin Alloh olovga: \"Ey olov! Ibrohim uchun sovuq va omon bo'l\", — deb amr qildi. Olov uni kuydirmadi. Ibrohim alangadan eson-omon va xotirjam chiqdi, chunki Alloh u bilan edi.",
          "Ibrohim oilasi bilan u yurtni tark etdi. Alloh unga uzoqqa — bugungi Makka shahriga ketishni amr qildi. O'sha paytda bu joy suvsiz va odamlarsiz, quruq, bo'sh vodiy edi. Ibrohim xotini Hojar va kichik o'g'li Ismoilni o'sha joyda qoldirdi, chunki Alloh shunday buyurgan edi. Hojar: \"Buni senga Alloh buyurdimi?\" — deb so'radi. Ibrohim: \"Ha\", — dedi. Shunda Hojar: \"Bo'lmasa Alloh bizni tashlab qo'ymaydi\", — dedi.",
          "Ismoilning suvi tugaganda, Hojar yordam axtarib, Safo va Marva degan ikki tepalik orasida yetti marta yugurdi. Alloh chaqaloq Ismoilning oyog'i ostidan yerdan buloq otib chiqardi. Bu buloq Zamzam deb ataladi va to'rt ming yildan beri oqib turibdi. Hajga kelgan har bir musulmon undan ichadi va Hojarning sabrini eslab, Safo va Marva orasida yuradi.",
          "Ismoil katta bo'lganida, Alloh Ibrohim va Ismoilga birgalikda Allohga ibodat qilish uchun birinchi uyni — Ka'bani qurishni amr qildi. Ular toshlarni o'z qo'llari bilan ko'tarib, Ibrohim duo qilardi: \"Ey Rabbimiz, bizdan qabul qilgin\". Bugun dunyoning qaysi burchagida bo'lmasin, har bir musulmon namoz o'qiyotganda o'sha Ka'baga yuzlanadi. Ibrohimning sodiqligi uchun Alloh unga hech kimga bermagan nomni berdi — \"Xalilulloh\", Allohning do'sti.",
        ],
        lesson:
          "Saboq: Ibrohim yolg'iz o'zi butun qavmga qarshi turdi, chunki yuragida Alloh bor edi. Alloh bilan birga bo'lganda, hatto olov ham sovib qoladi.",
        sources: [
          "Qur'on 6:74-79 (Ibrohimning yulduz, oy, quyosh haqidagi tafakkuri)",
          "Qur'on 21:51-70 (butlarning sindirilishi va olovdan najot)",
          "Qur'on 14:35-41 (Ibrohimning Makka va avlod uchun duosi)",
          "Qur'on 2:124-129 (Ka'baning qurilishi)",
          "Qur'on 4:125 (Alloh Ibrohimni \"xalil\" deb atadi)",
          "Sahihul Buxoriy 3364-3365 (Hojar, Ismoil va Zamzam qissasi)",
          "Ibn Kasir, Qisasul Anbiyo, Ibrohim alayhissalom boblari",
        ],
      },
      en: {
        name: "Ibrahim",
        theme: "Khalil Allah",
        paragraphs: [
          "Long ago, in a land between two great rivers, lived a boy named Ibrahim. His people worshipped idols — statues of stone and wood. They believed these statues could help, heal sickness, and bring rain. Even Ibrahim's father carved such statues and sold them in the marketplace.",
          "But young Ibrahim thought differently. He looked at the sky and asked himself, \"Who made all of this?\" One night he saw a bright star and said, \"Perhaps this is my Lord.\" But the star set. So Ibrahim said, \"I do not love things that set.\" Then he saw the moon and said, \"Perhaps this is my Lord.\" But the moon set too. Then he saw the sun — large and powerful — but the sun also slipped behind the horizon. And Ibrahim understood: anything that changes and disappears cannot be God. God must be the One who is always there, who never changes. And Ibrahim's heart turned to Allah.",
          "Ibrahim began to say to his people, \"These statues cannot hear you, see you, or help you. Why do you worship them?\" The people grew angry. One day, when everyone had gone to a festival, Ibrahim went alone into the idol temple. He took an axe and smashed every statue except the biggest one. He hung the axe on the shoulder of that great idol.",
          "When the people returned and saw the broken idols, they cried out, \"Who did this?\" They suspected Ibrahim and brought him to trial. Ibrahim said calmly, \"Ask the big one — perhaps it did this.\" The people answered, \"You know these idols do not speak!\" Then Ibrahim said, \"So how can you worship something that cannot speak and cannot help?\" They lowered their heads, because deep down they knew Ibrahim was right. But pride would not let them admit it.",
          "They decided to punish Ibrahim by burning him in a tremendous fire. For days they gathered wood and lit a blaze so fierce that no one could come near it. They flung Ibrahim into the flames. But Allah commanded the fire: \"O fire, be cool and safe for Ibrahim.\" The fire did not touch him. Ibrahim walked out of the flames whole and at peace, because Allah was with him.",
          "Ibrahim left that land with his family. Allah commanded him to travel far away — to the place where the city of Makkah stands today. At that time it was an empty, dry valley with no water and no people. Ibrahim left his wife Hajar and his baby son Isma'il there because Allah had commanded it. Hajar asked, \"Has Allah commanded you to do this?\" Ibrahim said, \"Yes.\" And Hajar said, \"Then Allah will not abandon us.\"",
          "When Isma'il ran out of water, Hajar ran seven times between two hills, Safa and Marwa, searching for help. And Allah opened a spring from the earth right at the feet of the infant Isma'il. That spring is called Zamzam, and it has been flowing for more than four thousand years. Every Muslim who comes to Makkah for Hajj drinks from it and walks between Safa and Marwa, in memory of Hajar's patience.",
          "When Isma'il grew up, Allah commanded Ibrahim and Isma'il to build together the first House for the worship of Allah — the Ka'bah. They lifted the stones with their own hands, and Ibrahim prayed, \"Our Lord, accept this from us.\" To this day, every Muslim in the world, wherever they are, turns toward that Ka'bah when they pray. For his faithfulness Allah gave Ibrahim a title He gave no one else: Khalil Allah, the intimate friend of Allah.",
        ],
        lesson:
          "Lesson: Ibrahim stood alone against a whole nation because Allah was in his heart. When you are with Allah, even fire becomes cool.",
        sources: [
          "Quran 6:74-79 (Ibrahim's reflections on the star, moon, and sun)",
          "Quran 21:51-70 (breaking the idols and the rescue from the fire)",
          "Quran 14:35-41 (Ibrahim's du'a for Makkah and his descendants)",
          "Quran 2:124-129 (the building of the Ka'bah)",
          "Quran 4:125 (Allah named Ibrahim Khalil)",
          "Sahih al-Bukhari 3364-3365 (the story of Hajar, Isma'il, and Zamzam)",
          "Ibn Kathir, Qisas al-Anbiya, chapters on Ibrahim",
        ],
      },
      fa: {
        name: "ابراهیم",
        theme: "خلیل‌الله",
        paragraphs: [
          "روزگاری دور، در سرزمینی میان دو رود بزرگ، پسری به نام ابراهیم می‌زیست. قومش بت می‌پرستیدند ـ مجسمه‌هایی از سنگ و چوب. باور داشتند که این مجسمه‌ها می‌توانند یاری دهند، بیماری را شفا بخشند و باران بیاورند. حتی پدر ابراهیم نیز چنین مجسمه‌هایی می‌تراشید و در بازار می‌فروخت.",
          "اما ابراهیمِ کوچک از آغاز اندیشه‌ای دیگر داشت. به آسمان می‌نگریست و از خود می‌پرسید: «چه کسی همه‌ی اینها را آفریده است؟» شبی ستاره‌ای درخشان در آسمان دید و گفت: «شاید این پروردگار من باشد.» اما ستاره غروب کرد. ابراهیم گفت: «من غروب‌کنندگان را دوست ندارم.» سپس ماه را دید و گفت: «شاید این پروردگار من باشد.» اما ماه نیز پنهان شد. آنگاه خورشید را دید ـ بزرگ و نیرومند ـ اما خورشید نیز در افق فرو نشست. ابراهیم دریافت: هر چه تغییر می‌کند و می‌رود، نمی‌تواند خدا باشد. خدا باید آن باشد که همیشه هست و دگرگون نمی‌شود. دل ابراهیم به سوی الله گردید.",
          "ابراهیم به قوم خود گفت: «این مجسمه‌ها نه می‌شنوند، نه می‌بینند و نه می‌توانند به شما سود رسانند. چرا آنها را می‌پرستید؟» قومش خشمگین شدند. روزی که همه به جشنی رفته بودند، ابراهیم تنها به بتکده درآمد. تبری برداشت و همه‌ی بت‌ها را شکست، مگر بزرگ‌ترین آنها را. تبر را بر دوش بت بزرگ نهاد.",
          "وقتی قوم بازگشتند و بت‌های شکسته را دیدند، فریاد زدند: «چه کسی این کار را کرد؟» ابراهیم را گمان بردند و به محاکمه کشاندند. ابراهیم آرام گفت: «از این بت بزرگ بپرسید؛ شاید او این کار را کرده باشد.» قوم پاسخ دادند: «تو خود می‌دانی که این بت‌ها سخن نمی‌گویند!» آنگاه ابراهیم گفت: «پس چگونه چیزی را می‌پرستید که نه می‌تواند سخن گوید و نه به شما سود رساند؟» سرها فرو افتاد ـ چرا که در درون می‌دانستند ابراهیم بر حق است. اما کبر نگذاشت بپذیرند.",
          "تصمیم گرفتند ابراهیم را به مجازاتی هولناک بکشانند ـ او را در آتشی بزرگ بسوزانند. روزها هیزم گرد آوردند و آتشی برافروختند که هیچ‌کس به آن نزدیک نمی‌توانست شد. ابراهیم را در میان شعله افکندند. اما خداوند به آتش فرمود: «ای آتش، بر ابراهیم سرد و سلامت باش.» آتش او را نسوزاند. ابراهیم تندرست و آرام از میان شعله بیرون آمد، زیرا خداوند با او بود.",
          "ابراهیم با خانواده‌اش از آن سرزمین کوچ کرد. خداوند فرمان داد تا به جایی دور برود ـ همان جایی که امروز مکه است. در آن روزگار، آن سرزمین درّه‌ای خالی و خشک بود، بی‌آب و بی‌مردم. ابراهیم همسرش هاجر و کودک خردسالش اسماعیل را در آنجا گذاشت، چرا که خداوند چنین خواسته بود. هاجر پرسید: «آیا خداوند تو را به این کار فرموده است؟» ابراهیم گفت: «آری.» هاجر پاسخ داد: «پس خداوند ما را وانخواهد گذاشت.»",
          "وقتی آبِ اسماعیل تمام شد، هاجر هفت بار میان دو تپه‌ی صفا و مروه دوید و جست‌و‌جوی یاری کرد. خداوند چشمه‌ای از زمین، درست در کنار پای اسماعیلِ شیرخوار، بیرون آورد. این چشمه «زمزم» نام دارد و بیش از چهار هزار سال است که جاری است. هر مسلمانی که برای حج به مکه می‌آید، از آن می‌نوشد و میان صفا و مروه می‌رود، به یاد صبر هاجر.",
          "وقتی اسماعیل بزرگ شد، خداوند به ابراهیم و اسماعیل فرمان داد که نخستین خانه را برای پرستش الله بنا کنند ـ کعبه را. آن دو با دستان خویش سنگ‌ها را برمی‌داشتند و ابراهیم دعا می‌کرد: «پروردگارا، از ما بپذیر.» امروز هر مسلمانی در جهان، هر جا که باشد، هنگام نماز رو به همان کعبه می‌کند. خداوند برای پاسداشت وفاداری ابراهیم، نامی به او ارزانی کرد که به هیچ‌کس دیگر نداده است: «خلیل‌الله»، دوست خدا.",
        ],
        lesson:
          "درس: ابراهیم تنها در برابر یک قوم ایستاد، زیرا الله در دل او بود. وقتی با خداوند باشی، حتی آتش سرد می‌شود.",
        sources: [
          "قرآن ۶:۷۴-۷۹ (تأملات ابراهیم در ستاره و ماه و خورشید)",
          "قرآن ۲۱:۵۱-۷۰ (شکستن بت‌ها و رهایی از آتش)",
          "قرآن ۱۴:۳۵-۴۱ (دعای ابراهیم برای مکه و فرزندانش)",
          "قرآن ۲:۱۲۴-۱۲۹ (ساختن کعبه)",
          "قرآن ۴:۱۲۵ (نامگذاری ابراهیم به «خلیل»)",
          "صحیح بخاری ۳۳۶۴-۳۳۶۵ (داستان هاجر، اسماعیل و زمزم)",
          "ابن کثیر، قصص الانبیاء، باب ابراهیم علیه‌السلام",
        ],
      },
      ru: {
        name: "Ибрахим",
        theme: "халиль-Аллах",
        paragraphs: [
          "Жил когда-то в стране между двух больших рек мальчик по имени Ибрахим. Его народ поклонялся идолам — статуям из камня и дерева. Они верили, что эти статуи могут помогать людям, лечить болезни и приносить дождь. Даже отец Ибрахима делал такие статуи и продавал их на рынке.",
          "Но маленький Ибрахим уже думал по-другому. Он смотрел на небо и спрашивал себя: «Кто создал всё это?» Однажды он увидел в небе яркую звезду и сказал: «Может быть, это мой Господь?» Но звезда закатилась. И Ибрахим сказал: «Я не люблю тех, кто заходит». Потом он увидел луну и сказал: «Может быть, это мой Господь?» Но и луна ушла. Потом он увидел солнце — большое и сильное. Но и солнце село за горизонт. И тогда Ибрахим понял: всё, что меняется и уходит, не может быть Богом. Бог должен быть Тот, Кто всегда есть и не меняется. И сердце Ибрахима повернулось к Аллаху.",
          "Ибрахим стал говорить своему народу: «Эти статуи не слышат вас, не видят вас и не могут вам помочь. Зачем вы им поклоняетесь?» Народ злился. Однажды, когда все ушли на праздник, Ибрахим пошёл в храм идолов один. Он взял топор и разбил все статуи, кроме самой большой. А топор повесил на плечо этой большой статуи.",
          "Когда народ вернулся и увидел разбитых идолов, они закричали: «Кто это сделал?» Люди заподозрили Ибрахима и привели его на суд. Ибрахим спокойно сказал: «Спросите большую статую — может быть, это она сделала». Народ ответил: «Ты же знаешь, что эти статуи не разговаривают!» И тогда Ибрахим сказал: «Так как же вы поклоняетесь тому, что не может ни говорить, ни помочь?» И они опустили головы — потому что в глубине сердца знали, что Ибрахим прав. Но гордыня не дала им признать это.",
          "Они решили наказать Ибрахима страшно — сжечь его в огромном костре. Они собирали дрова много дней, разожгли такое пламя, к которому даже подойти было нельзя. Бросили Ибрахима в этот огонь. Но Аллах сказал огню: «О огонь! Будь прохладой и спасением для Ибрахима». И огонь не тронул его. Ибрахим вышел из пламени целым и спокойным, потому что Аллах был с ним.",
          "Ибрахим ушёл из этой страны со своей семьёй. Аллах велел ему отправиться далеко — туда, где сегодня находится город Мекка. В то время это была пустая, сухая долина без воды и без людей. Ибрахим оставил там свою жену Хаджар и маленького сына Исмаила, потому что Аллах велел. Хаджар спросила: «Аллах ли велел тебе?» Ибрахим сказал: «Да». И тогда Хаджар сказала: «Значит, Аллах не оставит нас».",
          "Когда у Исмаила закончилась вода, Хаджар бегала между двумя холмами — Сафа и Марва — семь раз, ища помощи. И Аллах открыл из земли источник прямо у ног младенца Исмаила. Этот источник называется Замзам и течёт до сих пор, более четырёх тысяч лет. Все мусульмане, которые приезжают в Мекку для хаджа, пьют эту воду и проходят между Сафа и Марва — в память о терпении Хаджар.",
          "Когда Исмаил вырос, Аллах велел Ибрахиму и Исмаилу построить вместе первый Дом для поклонения Аллаху — Каабу. Они поднимали камни своими руками, и Ибрахим молился: «Господи наш, прими от нас». И сегодня каждый мусульманин в мире, где бы он ни жил, поворачивается лицом к этой Каабе, когда совершает намаз. За свою верность Аллах назвал Ибрахима словом, которое никому больше не дал, — Халиль-Аллах, «друг Аллаха».",
        ],
        lesson:
          "Урок: Ибрахим в одиночку стоял против целого народа, потому что в его сердце был Аллах. Когда ты с Аллахом — даже огонь становится прохладой.",
        sources: [
          "Коран 6:74-79 (размышления Ибрахима о звезде, луне, солнце)",
          "Коран 21:51-70 (разбитие идолов и спасение из огня)",
          "Коран 14:35-41 (мольба Ибрахима о Мекке и потомстве)",
          "Коран 2:124-129 (строительство Каабы)",
          "Коран 4:125 (Аллах назвал Ибрахима «халилем»)",
          "Сахих аль-Бухари 3364-3365 (история Хаджар, Исмаила и Замзама)",
          "Ибн Касир, «Кисас аль-Анбия», главы об Ибрахиме",
        ],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    slug: "yusuf",
    nameAr: "يُوسُف",
    suffix: "عليه السلام",
    readingMin: 8,
    byLocale: {
      tg: {
        name: "Юсуф",
        theme: "хоби ситораҳо",
        paragraphs: [
          "Дар сарзамини дур пайғамбар Яъқуб, писари Исҳоқ, писари Иброҳим зиндагӣ мекард. Дувоздаҳ писар дошт ва яке аз хурдиҳояш Юсуф ном дошт. Яъқуб ҳама фарзандонашро дӯст медошт, аммо Юсуф ба дилаш наздиктар буд — чун дар ин писар нуре медид, ки танҳо аз они баргузидагони Аллоҳ аст.",
          "Як рӯз Юсуф пеши падар омад ва хобашро гуфт: «Падарҷон, дар хоб ёздаҳ ситора ва офтобу моҳро дидам, ки ҳама ба ман саҷда мекунанд». Яъқуб фаҳмид, ки Аллоҳ барои Юсуф ояндаи бузурге омода мекунад. Ба писараш гуфт: «Писарам, ин хобро ба бародаронат накун, мабодо бар ту ҳилае андешанд. Шайтон душмани ошкори инсон аст».",
          "Аммо бародарон аллакай дида буданд, ки падар Юсуфро бештар дӯст медорад, ва дар дилҳояшон гули нохуше шукуфт — рашк. Тавтиа карданд ва як рӯз Юсуфро ба саҳро бурданд. Ӯро ба чоҳи чуқуре партофтанд ва ба падар гуфтанд, ки Юсуфро гург хӯрдааст. Яъқуб боварашон накард, лекин чӣ карда метавонист? Танҳо гуфт: «Сабри ҷамил». Ва интизорӣ кашид. Он қадар гирист, ки чашмонаш аз ашк суст шуданд.",
          "Юсуф танҳо дар чоҳ нишаст. Аммо Аллоҳ ӯро тарк накард. Корвоне аз он ҷо мегузашт ва писаракро аз чоҳ берун кашид. Юсуфро дар Миср ба яке аз бузургтарин одамони он сарзамин фурӯхтанд. Юсуф дар он ҷо ба воя расид ва Аллоҳ ба ӯ ақл, меҳрубонӣ ва зебоии хуй ато кард.",
          "Ҳамсари он мардак мехост Юсуфро ба кори бад водор созад. Ӯро мехонд, васваса мекард, ҳама чизро ваъда мекард. Аммо Юсуф гуфт: «Ба Аллоҳ паноҳ мебарам». Ҳаргиз ризо нашуд, чун аз Аллоҳ беш аз ҳар каси замин метарсид. Барои ҳамин ба ноҳақ ба зиндон андохта шуд. Юсуф солҳои зиёд дар зиндон монд.",
          "Дар зиндон Аллоҳ ба Юсуф таъбири хоб омӯзонд. Як рӯз подшоҳи Миср хоби аҷибе дид — ҳафт гови фарбеҳ, ки ҳафт гови лоғар онҳоро мехӯранд, ва ҳафт хӯшаи сабз ва ҳафт хӯшаи хушк. Ҳеҷ кас аз хирадмандон наметавонист онро шарҳ диҳад. Он гоҳ Юсуфро ба ёд оварданд. Юсуф гуфт: «Ҳафт сол фаровонӣ хоҳад буд, баъд ҳафт сол гуруснагӣ. Гандумро коред ва дар хӯша нигоҳ доред, то барои солҳои сахт кофӣ бошад».",
          "Подшоҳ аз ҳикмати Юсуф чунон ҳайрон шуд, ки ӯро аз зиндон берун овард ва сардори ҳамаи анборҳои Мисрро ба ӯ супорид. Вақте гуруснагӣ омад, мардум аз ҳама ҷо барои гандум ба Миср меомаданд. Бародарони Юсуф низ омаданд — ҳамонҳое, ки солҳои пеш ӯро ба чоҳ андохта буданд. Онҳо Юсуфро нашинохтанд, аммо ӯ онҳоро шинохт. Юсуф метавонист интиқом гирад. Аммо роҳи дигарро интихоб кард.",
          "Юсуф онҳоро бахшид. Гуфт: «Имрӯз бар шумо ҳеҷ маломате нест. Аллоҳ шуморо бубахшад, ки Ӯ Меҳрубонтарини меҳрубонон аст». Аз онҳо хост, ки падарро биёваранд. Вақте Яъқуб Юсуфро дид, биноии чашмонаш аз шодӣ баргашт. Тамоми оила дар Миср ҷамъ омад. Вақте ҳама пеши Юсуф расиданд, падару модар ва ёздаҳ бародар бар ӯ ба нишонаи эҳтиром саҷда карданд. Юсуф хоби кӯдакиашро ба ёд овард — ёздаҳ ситора, офтоб ва моҳ. Гуфт: «Ин таъбири хоби кӯҳнаи ман аст; Парвардигорам онро ҳақиқат сохт».",
        ],
        lesson:
          "Дарс: ҳатто агар одамон ба ту бадӣ кунанд — Аллоҳ ҳақро медонад. Бахшиш аз интиқом нерумандтар аст. Ва он орзуе, ки Аллоҳ дар дил мегузорад, дар вақташ ҳатман амалӣ мешавад.",
        sources: [
          "Қуръон 12 (сураи «Юсуф» — тамоми қисса якбора нозил шудааст)",
          "Ибни Касир, Қисас ул-Анбиё, боби Юсуф алайҳис-салом",
          "Саҳеҳи Бухорӣ 3375 (ҳадис дар бораи шарафи Юсуф)",
          "Тафсири Табарӣ бар сураи Юсуф",
        ],
      },
      uz: {
        name: "Yusuf",
        theme: "yulduzlar tushi",
        paragraphs: [
          "Uzoq bir yurtda payg'ambar Ya'qub yashar edi, u Is'hoqning o'g'li, Iso'hoq esa Ibrohimning o'g'li edi. Uning o'n ikki o'g'li bor edi, kichkinalaridan birining ismi Yusuf edi. Ya'qub barcha farzandlarini sevardi, lekin Yusuf yuragiga juda yaqin edi — chunki bu o'g'ilda Alloh tanlagan zotlarga xos nurni ko'rar edi.",
          "Bir kuni Yusuf otasining oldiga kelib, ko'rgan tushini aytdi: \"Ota, men tushimda o'n bir yulduz, quyosh va oyni ko'rdim — hammasi menga sajda qildi\". Ya'qub Allohning Yusufga buyuk kelajak tayyorlayotganini tushundi. O'g'liga: \"O'g'lim, bu tushni akalaringga aytmagin, sizga qarshi biror narsa ko'ylab qo'yishlari mumkin. Albatta, shayton insonning ochiq dushmanidir\", — dedi.",
          "Lekin akalari otaning Yusufni qanchalik sevishini ko'rib qo'yishgan edi va yuraklarida xunuk gul — hasad ungan edi. Ular til biriktirishib, bir kuni Yusufni dalaga olib chiqishdi. Uni chuqur quduqqa tashladilar, otalariga esa Yusufni bo'ri yeb ketdi, deyishdi. Ya'qub ularga ishonmadi, lekin nima qila olardi? Faqat: \"Chiroyli sabr\", — dedi. Va kutdi. Yig'lay-yig'lay ko'zlari ham xira tortdi.",
          "Yusuf yolg'iz o'zi quduqda o'tirar edi. Lekin Alloh uni yolg'iz qoldirmadi. O'tib ketayotgan karvon bolani quduqdan tortib oldi. Yusufni Misrga olib borib, yurtning eng kattalaridan birining xonadoniga sotishdi. Yusuf o'sha yerda ulg'aydi va Alloh unga aql, mehribonlik va go'zal axloq berdi.",
          "Ana shu katta odamning xotini Yusufni nojo'ya ishga undamoqchi bo'ldi. Uni chaqirar, vasvasaga solar, hamma narsani va'da qilar edi. Lekin Yusuf: \"Allohdan panoh tilayman\", — dedi. U bunga ko'nmadi, chunki Allohdan yer yuzidagi har qanday mavjudotdan ko'ra ko'proq qo'rqar edi. Shuning uchun u nohaq zindonga tashlandi. Yusuf ko'p yillar davomida zindonda qoldi.",
          "Zindonda Alloh Yusufga tush ta'birini o'rgatdi. Bir kuni Misr podshohi g'aroyib tush ko'rdi — yetti semiz sigirni yetti oriq sigir yeyayotgani, va yetti yashil boshoq va yetti quruq boshoq. Donishmandlarning hech biri uni izohlay olmadi. O'shanda Yusufni esladilar. Yusuf shunday tushuntirdi: \"Yetti yil hosil yili bo'ladi, keyin yetti yil ocharchilik. Donni eking va boshoqda qoldiring, qiyin yillarga yetadi\".",
          "Podshoh Yusufning donoligidan shu qadar hayratga tushdiki, uni zindondan chiqarib, butun Misr omborlariga bosh qildi. Ocharchilik kelganida, hamma yurtdan don olishga Misrga oqib kelar edi. Yusufning akalari ham keldi — bir necha yil oldin uni quduqqa tashlaganlar. Ular Yusufni tanimadilar, lekin u ularni tanidi. Yusuf qasos olishi mumkin edi. Lekin u boshqa yo'lni tanladi.",
          "Yusuf ularni kechirdi. \"Bugun sizlarga hech qanday tanbeh yo'q. Alloh sizlarni kechirsin, U eng rahmlilarning rahmlisidir\", — dedi. Otasini olib kelishlarini so'radi. Ya'qub Yusufni ko'rganda, ko'zlari quvonchdan yana ochildi. Butun oila Misrda jamuljam bo'ldi. Hamma Yusufning oldiga kirib kelganlarida, ota-ona va o'n bir aka unga hurmat yuzasidan bosh egishdi. Yusuf bolaligida ko'rgan tushini esladi — o'n bir yulduz, quyosh va oy. \"Mana, qadimgi tushimning ta'biri shu; Rabbim uni haqiqatga aylantirdi\", — dedi.",
        ],
        lesson:
          "Saboq: odamlar senga yomonlik qilsa ham, Alloh haqiqatni biladi. Kechirim qasosdan kuchliroq. Va Alloh yuragingga solgan orzu o'z vaqtida amalga oshadi.",
        sources: [
          "Qur'on, Yusuf surasi (12-sura — to'liq qissa bir martada nozil bo'lgan)",
          "Ibn Kasir, Qisasul Anbiyo, Yusuf alayhissalom bobi",
          "Sahihul Buxoriy 3375 (Yusufning sharafi haqida)",
          "Tabariy tafsiri, Yusuf surasiga",
        ],
      },
      en: {
        name: "Yusuf",
        theme: "the dream of stars",
        paragraphs: [
          "In a faraway land lived the Prophet Ya'qub, the son of Ishaq, the son of Ibrahim. He had twelve sons, and one of the younger ones was named Yusuf. Ya'qub loved all his children, but Yusuf was especially close to his heart, because he could see in the boy a light that belongs only to those Allah chooses.",
          "One day Yusuf came to his father and told him a dream: \"Father, I saw in a dream eleven stars, the sun, and the moon — all of them bowing to me.\" Ya'qub understood that Allah was preparing Yusuf for a great future. He told his son, \"My son, do not tell this dream to your brothers, lest they plot something against you. Indeed, Shaytan is a clear enemy to man.\"",
          "But the brothers had already seen how much their father loved Yusuf, and an ugly flower grew in their hearts: envy. They plotted, and one day they took Yusuf out into the open country. They threw him into a deep well, and they told their father that a wolf had eaten him. Ya'qub did not believe them, but what could he do? He only said, \"Beautiful patience.\" And he waited. He wept so long that his eyes grew weak.",
          "Yusuf sat alone in the well. But Allah did not abandon him. A caravan passed by, and they pulled the boy out. They sold Yusuf in Egypt, into the household of one of the noblest men of the land. Yusuf grew up there, and Allah gave him intelligence, kindness, and a beautiful character.",
          "The wife of that nobleman tried to tempt Yusuf to do something wrong. She called him, she enticed him, she promised him everything. But Yusuf said, \"I seek refuge in Allah.\" He would not give in, because he feared Allah more than anyone on earth. For refusing, he was sent unjustly to prison. Yusuf spent many years there.",
          "In prison, Allah taught Yusuf how to interpret dreams. One day the king of Egypt had a strange dream — seven fat cows being devoured by seven lean ones, and seven green ears of grain and seven dry ones. None of his wise men could explain it. Then they remembered Yusuf. Yusuf explained: \"There will be seven years of plenty, then seven years of famine. Plant grain and leave it in the ear, so there will be enough for the hard years.\"",
          "The king was so amazed by Yusuf's wisdom that he brought him out of prison and put him in charge of all the storehouses of Egypt. When the famine came, people came to Egypt from every direction for grain. Yusuf's brothers also came — the very ones who had thrown him into the well years before. They did not recognize him, but he recognized them. Yusuf could have taken revenge. But he chose something else.",
          "Yusuf forgave them. He said, \"There is no blame on you today. May Allah forgive you, and He is the Most Merciful of the merciful.\" He asked them to bring his father. When Ya'qub saw Yusuf, his sight returned with joy. The whole family met again in Egypt. When they all came in to Yusuf, his parents and his eleven brothers bowed before him in respect. And Yusuf remembered his childhood dream — eleven stars, the sun, and the moon. He said, \"This is the interpretation of my dream from long ago. My Lord has made it true.\"",
        ],
        lesson:
          "Lesson: even if people wrong you, Allah knows the truth. Forgiveness is stronger than revenge. And a dream Allah places in your heart will come true in its time.",
        sources: [
          "Quran 12 (Surah Yusuf — the whole story, revealed as one)",
          "Ibn Kathir, Qisas al-Anbiya, chapter on Yusuf",
          "Sahih al-Bukhari 3375 (on the nobility of Yusuf)",
          "al-Tabari, tafsir on Surah Yusuf",
        ],
      },
      fa: {
        name: "یوسف",
        theme: "خواب ستاره‌ها",
        paragraphs: [
          "در سرزمینی دور، حضرت یعقوب پسر اسحاق پسر ابراهیم می‌زیست. دوازده پسر داشت و یکی از کوچک‌ترهایشان یوسف بود. یعقوب همه‌ی فرزندانش را دوست می‌داشت، اما یوسف در دل او جای ویژه‌ای داشت ـ زیرا در آن پسر نوری می‌دید که تنها از آنِ برگزیدگانِ خداست.",
          "روزی یوسف نزد پدر آمد و خوابی را برای او بازگو کرد: «پدر! در خواب یازده ستاره و خورشید و ماه را دیدم که در برابر من سجده می‌کنند.» یعقوب دریافت که خداوند یوسف را برای آینده‌ای بزرگ آماده می‌کند. به پسر خود گفت: «فرزندم، این رؤیا را برای برادرانت بازگو مکن، مبادا بر تو نیرنگی بزنند. به‌راستی شیطان دشمن آشکار آدمی است.»",
          "اما برادران از پیش دیده بودند که پدر یوسف را چقدر دوست می‌دارد و گلِ ناپاکی در دل‌هایشان روییده بود: حسد. توطئه چیدند و روزی یوسف را با خود به دشت بردند. او را در چاهی عمیق افکندند و به پدرشان گفتند که گرگ، یوسف را دریده است. یعقوب باور نکرد، اما چه می‌توانست بکند؟ تنها گفت: «صبر زیبا، صبر جمیل.» و به انتظار ماند. آن‌قدر گریست تا چشمانش از اندوه نا‌توان شد.",
          "یوسف تنها در چاه نشسته بود. اما خداوند او را وانگذاشت. کاروانی از آنجا گذشت و کودک را از چاه بیرون کشید. او را در مصر به یکی از بزرگان آن سرزمین فروختند. یوسف در آن خانه بزرگ شد و خداوند به او خرد و مهربانی و زیبایی نهاد بخشید.",
          "همسر آن بزرگ‌مرد می‌خواست یوسف را به کار ناشایست وادارد. او را خواند، فریب داد و همه چیز را به او وعده داد. اما یوسف گفت: «به خدا پناه می‌برم.» تسلیم نشد، زیرا از خداوند بیش از هر کس بر روی زمین بیم داشت. به همین سبب، به ناحق به زندان افتاد. یوسف سال‌ها در زندان ماند.",
          "در زندان، خداوند به یوسف تعبیر خواب آموخت. روزی پادشاه مصر خوابی شگفت دید: هفت گاو فربه که هفت گاو لاغر آنها را می‌خورند، و هفت خوشه‌ی سبز و هفت خوشه‌ی خشک. هیچ‌یک از خردمندان نتوانستند آن را تعبیر کنند. آنگاه یوسف را به یاد آوردند. یوسف گفت: «هفت سال فراوانی خواهد آمد و سپس هفت سال خشکسالی. گندم را بکارید و در خوشه نگاه دارید تا برای سال‌های سخت کافی باشد.»",
          "پادشاه از خرد یوسف چنان شگفت‌زده شد که او را از زندان درآورد و سرپرستی همه‌ی انبارهای مصر را به او سپرد. وقتی خشکسالی آمد، مردم از هر سو برای گندم به مصر می‌آمدند. برادران یوسف نیز آمدند ـ همان‌ها که سال‌ها پیش او را در چاه افکنده بودند. آنان یوسف را نشناختند، اما او ایشان را شناخت. یوسف می‌توانست انتقام بگیرد. اما راه دیگری برگزید.",
          "یوسف برادرانش را بخشید. گفت: «امروز بر شما هیچ سرزنشی نیست. خداوند شما را بیامرزد و او ارحم‌الراحمین است.» از آنان خواست پدر را نزد او بیاورند. وقتی یعقوب یوسف را دید، بینایی‌اش از شادی بازگشت. همه‌ی خانواده در مصر گرد آمدند. آنگاه که همه نزد یوسف رفتند، پدر و مادر و یازده برادر در برابر او به نشانه‌ی احترام خم شدند. یوسف خواب کودکی‌اش را به یاد آورد ـ یازده ستاره، خورشید و ماه. گفت: «این تعبیر خواب دیرینه‌ی من است؛ پروردگار من آن را راست گرداند.»",
        ],
        lesson:
          "درس: حتی اگر مردم به تو بدی کنند، خداوند حقیقت را می‌داند. بخشش از انتقام نیرومندتر است. و رؤیایی که خداوند در دل تو می‌نهد، در وقت خویش به حقیقت می‌پیوندد.",
        sources: [
          "قرآن، سوره‌ی یوسف (سوره‌ی ۱۲ - تمام داستان به یکباره نازل شده است)",
          "ابن کثیر، قصص الانبیاء، باب یوسف علیه‌السلام",
          "صحیح بخاری ۳۳۷۵ (در فضل یوسف)",
          "تفسیر طبری بر سوره‌ی یوسف",
        ],
      },
      ru: {
        name: "Юсуф",
        theme: "сон о звёздах",
        paragraphs: [
          "В далёкой стране жил пророк Якуб, сын Исхака, сына Ибрахима. У него было двенадцать сыновей, и одного из младших звали Юсуф. Якуб любил всех своих детей, но Юсуф был особенно близок его сердцу — потому что в этом мальчике Якуб видел свет, который бывает только у избранных Аллахом.",
          "Однажды Юсуф пришёл к отцу и рассказал ему сон: «Отец, я видел во сне одиннадцать звёзд, солнце и луну — все они поклонились мне». Якуб понял, что Аллах готовит Юсуфу великое будущее. И он сказал сыну: «Сын мой, не рассказывай этот сон своим братьям, чтобы они не замыслили против тебя плохого. Поистине, шайтан — явный враг человека».",
          "Но братья всё равно увидели, как отец любит Юсуфа, и в их сердцах вырос недобрый цветок — зависть. Они сговорились и однажды забрали Юсуфа в поле. Они бросили его в глубокий колодец, а отцу сказали, что Юсуфа съел волк. Якуб не поверил им, но что он мог сделать? Он только сказал: «Прекрасное терпение». И стал ждать. И плакал так долго, что от слёз ослабло его зрение.",
          "А Юсуф сидел в колодце один. Но Аллах не оставил его. Мимо проходил караван, и они достали мальчика из колодца. Они продали Юсуфа в Египет — в дом одного из самых знатных людей страны. Юсуф вырос там, и Аллах дал ему ум, доброту и красоту души.",
          "Жена этого знатного человека хотела, чтобы Юсуф поступил плохо. Она звала его, искушала, обещала ему всё. Но Юсуф сказал: «Прибегаю к Аллаху». Он не уступил, потому что боялся Аллаха больше, чем кого-либо на земле. И за это его отправили в темницу — несправедливо. Юсуф провёл в темнице много лет.",
          "В темнице Аллах научил Юсуфа толковать сны. Однажды царь Египта увидел странный сон — семь тучных коров, которых пожирают семь тощих, и семь зелёных колосьев, и семь сухих. Никто из мудрецов не смог объяснить. Тогда вспомнили о Юсуфе. Юсуф объяснил: «Будет семь лет урожая, а потом семь лет голода. Сейте зерно и оставляйте в колосе, чтобы хватило на тяжёлые годы».",
          "Царь так удивился мудрости Юсуфа, что вывел его из темницы и поставил его управлять всеми хранилищами Египта. Когда пришёл голод, люди шли в Египет за зерном со всех сторон. Пришли и братья Юсуфа — те самые, что бросили его в колодец много лет назад. Они не узнали Юсуфа, а он узнал их. Юсуф мог отомстить. Но он выбрал другое.",
          "Юсуф простил их. Он сказал: «Нет упрёка вам сегодня. Аллах простит вас, и Он — Милостивейший из милостивых». Он попросил привезти отца. Когда Якуб увидел Юсуфа — его зрение вернулось от радости. Вся семья встретилась в Египте. И когда они все вошли к Юсуфу, родители и одиннадцать братьев поклонились ему в знак уважения. И Юсуф вспомнил сон детства — одиннадцать звёзд, солнце и луну. И сказал: «Это — толкование моего давнего сна. Господь сделал его явью».",
        ],
        lesson:
          "Урок: даже если люди делают тебе зло — Аллах знает истину. Прощение сильнее мести. А мечта, которую вложил в сердце Аллах, всегда сбудется в своё время.",
        sources: [
          "Коран 12 (сура «Юсуф» — вся история, ниспослана целиком)",
          "Ибн Касир, «Кисас аль-Анбия», глава «Хабар о Юсуфе»",
          "Сахих аль-Бухари 3375 (хадис о благородстве Юсуфа)",
          "Ат-Табари, тафсир на суру Юсуф",
        ],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    slug: "musa",
    nameAr: "مُوسَى",
    suffix: "عليه السلام",
    readingMin: 8,
    byLocale: {
      tg: {
        name: "Мусо",
        theme: "шикофтани баҳр",
        paragraphs: [
          "Дар Миср подшоҳи мағруре ҳукм меронд — фиръавн. Худро худо мепиндошт ва ба мардум мегуфт, ки боло аз ӯ касе нест. Дар сарзамини ӯ насли пайғамбар Яъқуб зиндагӣ мекард — қавме, ки онҳоро «Бани Исроил» меномиданд. Фиръавн онҳоро ғулом сохта буд. Сангҳоро мекашонданд, қасрҳо ва аҳромҳои ӯро месохтанд, ва ҳеҷ кас ба онҳо раҳм намекард.",
          "Фиръавн хоби даҳшатноке дид ва хобгузоронаш гуфтанд: «Дар миёни Бани Исроил писаре зода хоҳад шуд, ки подшоҳии туро вайрон мекунад». Фиръавн фармони бераҳмонае дод: ҳамаи писарбачаҳои тозазод аз он қавмро бикушед. Модарон мегиристанд ва фарзандонашонро пинҳон мекарданд. Дар чунин рӯзгори даҳшат Мусои хурдсол ба дунё омад.",
          "Модари Мусо барои ӯ метарсид. Аллоҳ ба дилаш илҳом кард: «Ӯро дар сабаде гузор ва ба дарёи Нил бифирист. Натарс ва ғам нахӯр — Мо ӯро ба ту бармегардонем ва аз фиристодагон қарор медиҳем». Бо дили ларзон чунин кард. Сабад бар об равон шуд ва ба қаср фиръавн расид. Зани фиръавн кӯдакро ёфт ва чунон ба ӯ дил баст, ки шавҳарашро розӣ кард, то кӯдакро дар қаср нигоҳ доранд. Ҳамин тариқ Мусо дар ҳамон хонае ба воя расид, ки соҳибаш мехост ӯро бикушад.",
          "Вақте Мусо калон шуд, Аллоҳ ба ӯ ҳикмат бахшид. Як рӯз дид, ки мисриёне ба яке аз қавми ӯ ситам мекунанд. Мусо хост онҳоро ҷудо кунад, аммо бо зарбааш мисриён аз пой афтод. Мусо чунин намехост. Тарсид ва аз Миср гурехт. Рӯзҳои зиёд дар биёбон роҳ пеймуд то ба сарзамини бегонае ба номи Мадян расид. Дар он ҷо хонадор шуд ва ҳашт ё даҳ сол гӯсфанд чаронд ва зиндагии оромро сипарӣ кард.",
          "Шабе, ки Мусо бо оилааш дар роҳ буд, аз дур оташеро дид. Ба ҳамсараш гуфт: «Биистед, ман меравам ва пораи оташе меорам». Чун ба наздикии оташ расид, садоеро шунид — ки сухани худи Аллоҳ буд. Аллоҳ гуфт: «Эй Мусо, ҳамоно манам Парвардигори ту. Кафшонатро аз пойҳоят берун бияр — ту дар водии муқаддаси Тувво ҳастӣ». Аллоҳ Мусоро пайғамбар гардонд ва фармуд: «Ба сӯи фиръавн бирав — ӯ аз ҳад гузаштааст». Ин фармони пур аз тарс буд, чун фиръавн дар ҷустуҷӯи Мусо буд.",
          "Мусо аз Парвардигораш ёрӣ хост: «Парвардигоро! Гиреҳ аз забонам бикшо, то сухани ман дарк кунанд. Ва бародарам Ҳорунро ёварам гардон». Аллоҳ дуои ӯро қабул кард. Мусо ва Ҳорун ба назди фиръавн рафтанд ва гуфтанд: «Ба Аллоҳ имон ор ва қавми моро озод кун». Аммо фиръавн танҳо хандид ва беҳтарин ҷодугаронашро ҷамъ кард, то Мусоро шикаст диҳанд.",
          "Ҷодугарон ресмонҳо ва асоҳои худро партофтанд — ва он чун морон ҷунбидан гирифт. Ин як хаёл буд. Сипас Мусо асои худро партофт — ва он ба море бузург ва ҳақиқӣ табдил ёфт, ки ҳар чизе ки ҷодугарон сохта буданд, фурӯ бурд. Ҷодугарон ба саҷда афтоданд ва гуфтанд: «Ба Парвардигори Мусо ва Ҳорун имон овардем». Фиръавн дар хашм онҳоро кушт, аммо онҳо мӯъмин аз дунё рафтанд.",
          "Аллоҳ ба Мусо амр кард, ки шабона қавми худро аз Миср берун орад. Тамоми шаб роҳ рафтанд то ба баҳр расиданд. Аз қафо лашкари фиръавн пайдо шуд — аспон, аробаҳо, силоҳ. Бани Исроил фарёд карданд: «Гирифтор шудем!» Мусо бо оромӣ ҷавоб дод: «Не. Парвардигорам бо ман аст; Ӯ ба ман роҳ нишон медиҳад». Аллоҳ ба Мусо амр кард, ки бо асояш бар баҳр занад. Баҳр шикофт — роҳи хушк миёни ду девори об пайдо шуд. Қавми Мусо аз қаъри баҳр гузаштанд. Вақте фиръавн бо лашкараш аз пайи онҳо ҳамла кард, баҳр бар сараш фурӯ омад — ва фиръавн бо ҳамаи лашкараш ғарқ шуд. Мусо ва қавмаш ба сӯи озодӣ қадам гузоштанд.",
        ],
        lesson:
          "Дарс: ҳатто пурзӯртарин подшоҳ дар муқобили Аллоҳ нотавон аст. Агар он чи Аллоҳ амр кардааст иҷро кунӣ, Ӯ ба ту роҳе боз мекунад — ҳатто аз миёни баҳр.",
        sources: [
          "Қуръон 28:1-42 (зодрӯзи Мусо, гурез ба Мадян, даъват дар Тур)",
          "Қуръон 20:9-79 (мулоқот бо Аллоҳ, асо, рӯёрӯӣ бо фиръавн)",
          "Қуръон 26:10-66 (ҷодугарони фиръавн, хуруҷ, шикофтани баҳр)",
          "Ибни Касир, Қисас ул-Анбиё, бобҳои Мусо алайҳис-салом",
          "Саҳеҳи Бухорӣ 3398 (аҳодис дар бораи Мусо)",
        ],
      },
      uz: {
        name: "Muso",
        theme: "dengizning bo'linishi",
        paragraphs: [
          "Misrda mag'rur podshoh hukm surardi — Fir'avn. U o'zini xudo deb hisoblar, odamlarga undan baland zot yo'qligini aytar edi. Uning yurtida payg'ambar Ya'qubning avlodlari — \"Bani Isroil\" deb atalgan qavm yashar edi. Fir'avn ularni qul qilib olgan edi. Ular tosh tashir, uning saroylari va piramidalarini qurar, ularga hech kim rahm qilmas edi.",
          "Fir'avn dahshatli tush ko'rdi va tushni izohlovchilari unga: \"Bani Isroil orasida senga shohlikni vayron qiladigan o'g'il tug'iladi\", — deyishdi. Fir'avn shafqatsiz farmon chiqardi: o'sha qavmning hamma yangi tug'ilgan o'g'illarini o'ldirish. Onalar yig'lab, bolalarini yashirardi. Aynan o'sha qo'rqinchli paytda kichkina Muso dunyoga keldi.",
          "Musoning onasi u uchun qo'rqdi. Alloh uning qalbiga ilhom soldi: \"Uni savatga solib, Nil daryosiga oqizib yubor. Qo'rqma va g'amlanma — Biz uni senga qaytaramiz va elchilardan qilamiz\". Titroq yurak bilan u shunday qildi. Savat oqib borib, to'g'ri Fir'avnning saroyiga keldi. Fir'avnning xotini chaqaloqni topib, unga shu qadar bog'lanib qoldiki, erini bolani saroyda saqlashga ko'ndirdi. Shunday qilib Muso uni o'ldirmoqchi bo'lgan odamning xonadonida ulg'aydi.",
          "Muso ulg'ayganda, Alloh unga hikmat berdi. Bir kuni Muso bir misrlik o'z qavmidan birini xafa qilayotganini ko'rdi. Muso ularni ajratmoqchi bo'ldi, lekin uning urishidan misrlik o'lib qoldi. Muso buni xohlamagandi. U qo'rqib, Misrdan qochdi. U sahroda ko'p kun yurib, Madyan degan begona yurtga keldi. Bu yerda uylandi va sakkiz yoki o'n yil davomida qo'y boqib, tinch hayot kechirdi.",
          "Bir kechasi Muso oilasi bilan yo'lda ketayotganda, uzoqdan olov ko'rdi. Xotiniga: \"Kuting, men borib bir cho'g' olib kelaman\", — dedi. Muso olovga yaqinlashganda, ovoz eshitdi — bu Allohning O'zining ovozi edi. Alloh: \"Ey Muso, albatta Men sening Rabbingman. Oyog'ingdan kavshlaringni yech — sen muqaddas Tuvo vodiysidasan\", — dedi. Alloh Musoni payg'ambar qildi va: \"Fir'avnning oldiga bor — u haddan oshdi\", — deb amr qildi. Bu juda qo'rqinchli buyruq edi, chunki Fir'avn Musoni izlardi.",
          "Muso Allohdan yordam so'radi: \"Yo Rabbi, tilimning tugunini yech, ular nutqimni tushunadigan bo'lsin. Akam Horunni menga yordamchi qil\". Alloh uning duosini qabul qildi. Muso va Horun Fir'avnning oldiga kelib: \"Allohga iymon keltir va qavmimizni qo'yib yubor\", — dedi. Lekin Fir'avn faqat kuldi va Musoni mag'lub etish uchun eng yaxshi sehrgarlarini to'pladi.",
          "Sehrgarlar ip va hassalarini tashladilar — va ular ilonlar kabi qimirlay boshladi. Bu illyuziya edi. Shunda Muso hassasini tashladi — va u haqiqiy katta ilonga aylanib, sehrgarlarning yasagan hammasini yutib yubordi. Sehrgarlarning o'zlari sajdaga yiqilishib: \"Biz Muso va Horunning Rabbiga iymon keltirdik\", — deyishdi. Fir'avn g'azab bilan ularni o'ldirdi, lekin ular mo'min holicha o'ldilar.",
          "Alloh Musoga qavmini Misrdan tunda olib chiqishni amr qildi. Ular tun bo'yi yurib, dengiz qirg'og'iga keldilar. Orqadan Fir'avn lashkari ko'rindi — otlar, aravalar, qurollar. Bani Isroil: \"Bizni tutib oladilar!\" — deb baqirishdi. Muso xotirjam javob berdi: \"Yo'q. Rabbim men bilan; U meni yo'l ko'rsatadi\". Alloh Musoga hassasini dengizga urishni amr qildi. Dengiz ikkiga bo'lindi — ikki suv devori orasida quruq yo'l paydo bo'ldi. Musoning qavmi dengiz tubidan o'tib oldi. Fir'avn lashkari bilan ularning orqasidan kirganda, dengiz ustiga yopilib ketdi — va Fir'avn butun lashkari bilan g'arq bo'ldi. Muso va qavmi ozodlik tomon chiqib ketdilar.",
        ],
        lesson:
          "Saboq: hatto eng qudratli podshoh Alloh oldida ojizdir. Agar Alloh amr qilgan ishni qilsang, U senga yo'l ochib beradi — hatto dengiz orqali ham.",
        sources: [
          "Qur'on 28:1-42 (Musoning tug'ilishi, Madyanga qochishi, Tur tog'ida da'vat)",
          "Qur'on 20:9-79 (Alloh bilan uchrashuv, hassa, Fir'avn bilan qarama-qarshilik)",
          "Qur'on 26:10-66 (Fir'avnning sehrgarlari, chiqib ketish, dengizning bo'linishi)",
          "Ibn Kasir, Qisasul Anbiyo, Muso alayhissalom boblari",
          "Sahihul Buxoriy 3398 (Muso haqidagi hadislar)",
        ],
      },
      en: {
        name: "Musa",
        theme: "the parting of the sea",
        paragraphs: [
          "In Egypt there ruled a proud king — Pharaoh. He thought himself a god and told the people that no one was higher than he was. In his land lived the descendants of the Prophet Ya'qub, a people called Bani Isra'il, the Children of Israel. Pharaoh made them slaves. They hauled stones and built his palaces and pyramids, and no one had any mercy on them.",
          "Pharaoh had a terrible dream, and his interpreters told him: \"Among the Children of Israel, a boy will be born who will destroy your kingdom.\" Pharaoh issued a cruel command: every newborn boy of that people was to be killed. Mothers wept and hid their babies. It was in that fearful time that the little Musa was born.",
          "Musa's mother was afraid for him. And Allah inspired her: \"Place him in a basket and put it on the river Nile. Do not fear, do not grieve. We will return him to you and make him a messenger.\" With a trembling heart she did so. The basket floated down the river — and came to rest right at Pharaoh's palace. Pharaoh's wife found the baby and loved him so much that she begged her husband to let her keep him. So Musa grew up in the very house of the man who wanted to kill him.",
          "When Musa grew up, Allah gave him wisdom. One day Musa saw an Egyptian harming a man from his own people. Musa wanted to separate them, but his blow killed the Egyptian. Musa had not meant that. He was afraid and fled from Egypt. He walked for many days through the desert and came to a foreign land — Madyan. There he married and tended sheep for eight or ten years, living a quiet life.",
          "One night, as Musa traveled with his family, he saw a fire in the distance. He said to his wife, \"Wait — I will go and bring back an ember.\" When Musa came near the fire, he heard a voice — and it was the voice of Allah Himself. Allah said to him, \"O Musa, indeed I am your Lord. Take off your sandals — you are in the sacred valley of Tuwa.\" Allah made Musa a prophet and commanded, \"Go to Pharaoh — he has transgressed all bounds.\" It was a terrifying command, for Pharaoh was hunting Musa.",
          "Musa asked Allah for help: \"My Lord, untie the knot from my tongue, that they may understand my speech. And make my brother Harun a helper for me.\" Allah answered his du'a. Musa and Harun came to Pharaoh and said: \"Believe in Allah and let our people go.\" But Pharaoh only laughed and gathered his best magicians to defeat Musa.",
          "The magicians threw down their ropes and staffs, and they seemed to slither like snakes. It was an illusion. Then Musa threw down his staff — and it became a real, great serpent that swallowed everything the magicians had made. The magicians themselves fell down in prostration and said: \"We believe in the Lord of Musa and Harun.\" In his rage Pharaoh killed them, but they died as believers.",
          "Allah commanded Musa to lead his people out of Egypt by night. They marched all night until they reached the sea. Then Pharaoh's army appeared behind them — horses, chariots, weapons. The Children of Israel cried out, \"We are caught!\" Musa answered calmly, \"No. My Lord is with me; He will guide me.\" Allah commanded Musa to strike the sea with his staff. The sea split open — a dry path appeared between two walls of water. Musa's people walked across on the seabed. When Pharaoh and his army charged in behind them, the sea closed over them — and Pharaoh drowned with all his army. Musa and his people walked into freedom.",
        ],
        lesson:
          "Lesson: even the mightiest king is weak before Allah. If you do what Allah commands, He will open a road for you — even through the sea.",
        sources: [
          "Quran 28:1-42 (the birth of Musa, his flight to Madyan, and the call at Mount Tur)",
          "Quran 20:9-79 (the meeting with Allah, the staff, the confrontation with Pharaoh)",
          "Quran 26:10-66 (Pharaoh's magicians, the exodus, the parting of the sea)",
          "Ibn Kathir, Qisas al-Anbiya, chapters on Musa",
          "Sahih al-Bukhari 3398 (ahadith on Musa)",
        ],
      },
      fa: {
        name: "موسی",
        theme: "شکافتن دریا",
        paragraphs: [
          "در مصر، پادشاهی مغرور حکم می‌راند ـ فرعون. خود را خدا می‌پنداشت و به مردم می‌گفت کسی بالاتر از او نیست. در سرزمینش نسل پیامبر یعقوب می‌زیستند، قومی که آنها را «بنی‌اسرائیل» می‌خواندند. فرعون آنان را برده‌ی خود ساخته بود. سنگ می‌کشیدند و کاخ‌ها و اهرام او را می‌ساختند، و کسی بر آنان رحم نمی‌کرد.",
          "فرعون خوابی هولناک دید و خوابگزارانش گفتند: «در میان بنی‌اسرائیل پسری زاده خواهد شد که پادشاهی تو را بر باد می‌دهد.» فرعون فرمانی بی‌رحم صادر کرد: هر نوزاد پسر از آن قوم باید کشته شود. مادران می‌گریستند و فرزندانشان را پنهان می‌کردند. در همان روزگار سخت، موسای کوچک به دنیا آمد.",
          "مادر موسی بر او بیمناک بود. خداوند به دل او الهام کرد: «او را در سبدی بگذار و به رودخانه‌ی نیل بسپار. مترس و اندوهگین مباش؛ ما او را به تو بازمی‌گردانیم و از فرستادگان قرار می‌دهیم.» با دلی لرزان چنین کرد. سبد روی آب رفت و درست به کاخ فرعون رسید. همسر فرعون کودک را یافت و چنان دل به او بست که شوهرش را قانع کرد تا کودک را در کاخ نگاه دارند. این‌گونه موسی در همان خانه‌ای بزرگ شد که صاحبش می‌خواست او را بکشد.",
          "وقتی موسی بزرگ شد، خداوند به او حکمت بخشید. روزی دید مردی مصری به یکی از قوم خود ستم می‌کند. موسی خواست آن دو را از هم جدا کند، اما با ضربه‌اش، مرد مصری از پا درآمد. موسی چنین نمی‌خواست. ترسید و از مصر گریخت. روزها در بیابان راه پیمود تا به سرزمینی بیگانه به نام مَدْیَن رسید. آنجا ازدواج کرد و هشت یا ده سال گوسفند چراند و زندگی آرامی داشت.",
          "شبی که موسی با خانواده‌اش در راه بود، در دوردست آتشی دید. به همسرش گفت: «بمانید، من می‌روم و پاره‌آتشی می‌آورم.» چون به آتش نزدیک شد، صدایی شنید ـ سخن خود خداوند بود. الله فرمود: «ای موسی، همانا منم پروردگار تو. کفش‌های خود را بیرون آور؛ تو در وادی مقدس طُوی هستی.» خداوند موسی را پیامبر گرداند و فرمان داد: «به سوی فرعون برو؛ او سرکشی کرده است.» این فرمانی هراس‌انگیز بود، زیرا فرعون در جست‌وجوی موسی بود.",
          "موسی از پروردگارش یاری خواست: «پروردگارا، گره از زبانم بگشای تا سخن مرا دریابند. و برادرم هارون را یاور من قرار ده.» خداوند دعای او را پذیرفت. موسی و هارون نزد فرعون رفتند و گفتند: «به الله ایمان آور و قوم ما را آزاد کن.» اما فرعون تنها خندید و بهترین جادوگرانش را گرد آورد تا موسی را شکست دهند.",
          "جادوگران ریسمان‌ها و عصاهای خود را افکندند و چنان نمودند که گویی ماران در حال جنبیدن‌اند. این یک پندار بود. آنگاه موسی عصای خود را افکند ـ و عصا اژدهایی راستین شد که هر چه را جادوگران ساخته بودند بلعید. خودِ جادوگران به سجده افتادند و گفتند: «به پروردگار موسی و هارون ایمان آوردیم.» فرعون به خشم آمد و آنان را کشت، اما آنان مؤمن از دنیا رفتند.",
          "خداوند به موسی فرمان داد که قومش را شبانه از مصر بیرون برد. تمام شب راه رفتند تا به دریا رسیدند. در پشت سر، لشکر فرعون پدیدار شد ـ اسبان، گردونه‌ها، سلاح‌ها. بنی‌اسرائیل فریاد زدند: «ما را گرفتار کردند!» موسی آرام گفت: «نه، پروردگار من با من است؛ او مرا راه می‌نماید.» خداوند به موسی فرمود تا با عصای خویش بر دریا زند. دریا شکافت ـ راهی خشک میان دو دیوار آب پدید آمد. قوم موسی از کف دریا گذشتند. وقتی فرعون با لشکرش از پی آنان درآمد، دریا بر سرشان فروریخت ـ و فرعون با تمام سپاهش غرق شد. موسی و قومش به سوی آزادی گام نهادند.",
        ],
        lesson:
          "درس: حتی توانمندترین پادشاه در برابر خداوند ناتوان است. اگر آنچه را الله فرمان داده انجام دهی، او راهی برایت می‌گشاید ـ حتی از میان دریا.",
        sources: [
          "قرآن ۲۸:۱-۴۲ (تولد موسی، گریز به مدین، دعوت در طُوی)",
          "قرآن ۲۰:۹-۷۹ (لقای الهی، عصا، رویارویی با فرعون)",
          "قرآن ۲۶:۱۰-۶۶ (جادوگران فرعون، خروج، شکافتن دریا)",
          "ابن کثیر، قصص الانبیاء، باب موسی علیه‌السلام",
          "صحیح بخاری ۳۳۹۸ (احادیث در باب موسی)",
        ],
      },
      ru: {
        name: "Муса",
        theme: "разделение моря",
        paragraphs: [
          "В Египте правил гордый царь — фараон. Он считал себя богом и говорил людям, что выше его нет никого. В его стране жили потомки пророка Якуба — народ, который называли «Бану Исраиль», «сыны Исраиля». Фараон сделал их рабами. Они таскали камни, строили его дворцы и пирамиды, и никто их не жалел.",
          "Фараону приснился страшный сон, и его толкователи сказали: «Среди сынов Исраиля родится мальчик, который разрушит твоё царство». Тогда фараон отдал жестокий приказ: убивать всех новорождённых мальчиков из этого народа. Матери плакали и прятали детей. И в это страшное время родился маленький Муса.",
          "Мать Мусы боялась за него. И Аллах внушил ей: «Положи его в корзину и отпусти по реке Нил. Не бойся и не печалься — Мы вернём его тебе и сделаем его пророком». С трепещущим сердцем мать сделала так. Корзина поплыла по реке — и приплыла прямо ко дворцу фараона. Жена фараона нашла младенца и так его полюбила, что упросила мужа оставить ребёнка во дворце. Так Муса вырос в самом доме того, кто хотел его убить.",
          "Когда Муса вырос, Аллах дал ему мудрость. Однажды Муса увидел, как египтянин обижает человека из его народа. Муса хотел разнять их, но толкнул египтянина — и тот умер. Муса не хотел этого. Он испугался и убежал из Египта. Он шёл много дней по пустыне и пришёл в чужую страну — Мадьян. Там он женился, пас овец восемь или десять лет и жил спокойной жизнью.",
          "Однажды, когда Муса шёл с семьёй ночью, он увидел вдалеке огонь. Он сказал жене: «Подождите, я схожу за огоньком». Когда Муса подошёл к огню, он услышал голос — это говорил Сам Аллах. Аллах сказал ему: «О Муса! Воистину, Я — твой Господь. Сними свою обувь, ты — в священной долине Тува». И Аллах сделал Мусу пророком и велел: «Иди к фараону — он преступил все границы». Это был самый страшный приказ, ведь фараон искал Мусу.",
          "Муса попросил у Аллаха помощи: «Господи, развяжи узел с языка моего, чтобы они поняли мою речь. И сделай моего брата Харуна моим помощником». Аллах ответил на его дуа. Муса и Харун пришли к фараону и сказали ему: «Уверуй в Аллаха и отпусти народ наш». Но фараон только посмеялся и собрал своих лучших колдунов, чтобы они победили Мусу.",
          "Колдуны бросили свои верёвки и палки — и они зашевелились, как змеи. Это была иллюзия. Тогда Муса бросил свой посох — и посох превратился в настоящую большую змею, которая проглотила всё, что сделали колдуны. И сами колдуны упали ниц и сказали: «Мы уверовали в Господа Мусы и Харуна». Фараон в ярости казнил их, но они умерли мумининами.",
          "Аллах велел Мусе ночью увести свой народ из Египта. Они шли всю ночь и дошли до моря. И тут позади показалось войско фараона — кони, колесницы, оружие. Сыны Исраиля закричали: «Нас догонят!» Муса спокойно ответил: «Нет. Со мной — мой Господь, Он укажет мне путь». И Аллах велел Мусе ударить посохом по морю. Море раскрылось — и в нём появилась сухая дорога между двумя стенами воды. Народ Мусы прошёл по дну. Когда фараон со своим войском бросился следом, море сомкнулось — и фараон утонул со всей своей армией. А Муса и его народ вышли на свободу.",
        ],
        lesson:
          "Урок: даже самый сильный царь — слаб перед Аллахом. Если ты делаешь то, что велел Аллах, Он откроет тебе дорогу даже через море.",
        sources: [
          "Коран 28:1-42 (рождение Мусы, бегство в Мадьян, призыв на Тур)",
          "Коран 20:9-79 (встреча с Аллахом, посох, противостояние с фараоном)",
          "Коран 26:10-66 (колдуны фараона, исход, разделение моря)",
          "Ибн Касир, «Кисас аль-Анбия», главы о Мусе",
          "Сахих аль-Бухари 3398 (хадисы о Мусе)",
        ],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    slug: "ayyub",
    nameAr: "أَيُّوب",
    suffix: "عليه السلام",
    readingMin: 5,
    byLocale: {
      tg: {
        name: "Айюб",
        theme: "сабр",
        paragraphs: [
          "Пайғамбар Айюб марди некхоҳ буд. Аллоҳ ба ӯ зиёд дода буд: оилаи бузург, фарзандони бисёр, замини ҳосилхез, чорво, хонаҳо. Айюб ҳаргиз фаромӯш намекард, ки ҳамаи ин аз кист. Ҳар рӯз ба Аллоҳ шукр мегуфт ва ба бенавоён ёрӣ мерасонд.",
          "Сипас Аллоҳ ба Айюб озмоиши бузургро фиристод. Айюб қариб ҳамаашро аз даст дод — ҳам молу мулкаш ва ҳам саломатиашро. Бемории сахт ба ӯ ҳамла кард ва дер бо ӯ монд. Солҳои зиёд Айюб бемор хоб буд. Кор карда наметавонист. Он чи пеш карда метавонист, акнун карда наметавонист. Танҳо ҳамсараш дар назди ӯ монд ва ӯро парасторӣ кард.",
          "Аммо Айюб шикоят накард. Бар Аллоҳ хашм нагирифт. Нагуфт: «Чаро ман?» Айюб медонист: он чи Аллоҳ дод, метавонад худаш бозсонад. Сабр кард. Сабри хомӯш, бе ҳеҷ нолае. Танҳо имонашро давом дод.",
          "Танҳо вақте озмоиш хеле сангин шуд, Айюб бо як дуои кӯтоҳ ба Парвардигораш руҷӯъ кард. Гуфт: «Парвардигоро! Маро ранҷ расидааст ва Ту Меҳрубонтарини меҳрубононӣ». Нагуфт: «Парвардигоро, ин балоро ҳамин лаҳза бардор». Чизе талаб накард. Танҳо меҳрубонии Аллоҳро ба ёди Ӯ овард — ва ба Ӯ таваккал кард.",
          "Аллоҳ ба Айюб ҷавоб дод. Дар Қуръон Аллоҳ мефармояд: «Дуои ӯро қабул кардем ва он чи аз ранҷ ба ӯ расида буд, бардоштем». Аллоҳ ба Айюб амр кард: «По бар замин зан». Айюб чунин кард ва аз замин чашмаи хунуку соф ҷӯшид. Аллоҳ гуфт: «Ин барои шустушӯ ва нӯшидан аст». Айюб бо он об худро шуст, аз он нӯшид ва беморӣ аз ӯ рафт. Аллоҳ саломатияшро баргардонид, оилаашро ба ӯ дод ва ҳатто беш аз пеш ба ӯ ато кард.",
          "Аллоҳ дар Қуръон дар бораи Айюб сухани зебое гуфт: «Ҳамоно Мо ӯро сабркунанда ёфтем. Чӣ некӯ бандае!» Ин аз баландтарин суханҳоест, ки дар бораи як инсон гуфта мешавад. Ҳар гоҳ мардум дар сахтӣ Айюбро ба ёд меоранд, дилашон сабук мешавад. Чун Айюб нишон дод: ҳатто бузургтарин дард рӯзе ба охир мерасад, агар бо Аллоҳ бимонӣ.",
        ],
        lesson:
          "Дарс: сабр ин хомӯш мондан бо қаҳр нест, балки таваккал ба Аллоҳ дар сахтӣ аст. Айюб талаб накард — балки бо нармӣ дуо кард. Ва Аллоҳ ҷавоб дод.",
        sources: [
          "Қуръон 21:83-84 (дуои Айюб ва ҷавоби Аллоҳ)",
          "Қуръон 38:41-44 (чашма, шифо ва ситоиши Аллоҳ)",
          "Ибни Касир, Қисас ул-Анбиё, боби Айюб алайҳис-салом",
        ],
      },
      uz: {
        name: "Ayyub",
        theme: "sabr",
        paragraphs: [
          "Payg'ambar Ayyub yaxshi inson edi. Alloh unga ko'p narsa bergan edi: katta oila, ko'p farzandlar, hosildor yer, mol-qo'y, uylar. Ayyub bularning hammasi kimdan ekanini hech qachon unutmas edi. Har kuni Allohga shukr qilar, kambag'allarga yordam berar edi.",
          "Keyin Alloh Ayyubga katta sinov yubordi. Ayyub deyarli hammasini — mol-mulkini ham, sog'lig'ini ham yo'qotdi. Og'ir kasallik unga keldi va uzoq vaqt undan ketmadi. Yillar davomida Ayyub kasallikda yotdi. Ishlay olmas edi. Ilgari qila olgan ishlarini endi qila olmas edi. Faqat xotini uning yonida qoldi va u haqida g'amxo'rlik qildi.",
          "Lekin Ayyub shikoyat qilmadi. Allohga g'azablanmadi. \"Nega bu menga?\" demadi. Ayyub yodida tutar edi: Alloh bergan narsani O'zi qaytib olishi mumkin. Va sabr qildi. Jimgina, hech qanday shovqinsiz sabr qildi. Faqat iymonida davom etdi.",
          "Sinov juda og'irlashganda, Ayyub qisqa bir duo bilan Rabbiga yuzlandi. \"Ey Rabbim! Menga ofat tegdi, Sen esa eng rahmlilarning rahmlisidirsan\", — dedi. \"Ey Rabbim, bu ofatni darhol olib tashla\", demadi. Talab qilmadi. Faqat Allohga O'zining rahmatini eslatdi — va Unga tavakkul qildi.",
          "Alloh Ayyubga javob berdi. Qur'onda Alloh: \"Biz uning duosini qabul qildik va undan zararni olib tashladik\", — deydi. Alloh Ayyubga: \"Oyog'ingni yerga ur\", — deb amr qildi. Ayyub urdi — va yerdan sovuq, tiniq buloq otilib chiqdi. Alloh: \"Bu yuvinish va ichish uchun\", — dedi. Ayyub u suv bilan yuvinib, undan ichdi va kasallik undan ketdi. Alloh unga sog'liqni qaytarib berdi, oilasini qaytardi, hatto avvalgidan ham ko'proq berdi.",
          "Alloh Ayyub haqida Qur'onda juda chiroyli so'zlar aytdi: \"Albatta, Biz uni sabrli topdik. U qanday yaxshi banda edi!\" Bu inson haqida aytilishi mumkin bo'lgan eng yuksak so'zlar. Qiyinchilikda yashayotgan odamlar Ayyubni eslagani, ko'ngillari yengillashadi. Chunki Ayyub ko'rsatdi: hatto eng katta og'riq ham bir kun tugaydi, agar Alloh bilan birga qolsang.",
        ],
        lesson:
          "Saboq: sabr — bu g'azablanib jimligini saqlash emas, balki qiyinchilikda Allohga tavakkul qilishdir. Ayyub talab qilmadi — yumshoq so'radi. Va Alloh javob berdi.",
        sources: [
          "Qur'on 21:83-84 (Ayyubning duosi va Allohning javobi)",
          "Qur'on 38:41-44 (buloq, shifo va Allohning maqtovi)",
          "Ibn Kasir, Qisasul Anbiyo, Ayyub alayhissalom bobi",
        ],
      },
      en: {
        name: "Ayyub",
        theme: "patience",
        paragraphs: [
          "The Prophet Ayyub was a good man. Allah had given him much: a large family, many children, fertile land, livestock, homes. Ayyub never forgot Who gave him all of this. Every day he thanked Allah and helped the poor.",
          "Then Allah sent Ayyub a great trial. Ayyub lost almost everything — both his wealth and his health. A heavy illness came over him and did not leave him for a long time. For years Ayyub lay sick. He could not work. He could not do the things he once did. Only his wife stayed by him and cared for him.",
          "But Ayyub did not complain. He did not get angry with Allah. He did not say, \"Why me?\" Ayyub remembered: what Allah gives, Allah may also take back. So he bore it patiently. He bore it quietly, without loud words. He simply kept believing.",
          "Only when the trial became truly heavy did Ayyub turn to Allah with a single short prayer. He said, \"My Lord, indeed adversity has touched me, and You are the Most Merciful of the merciful.\" He did not say, \"Lift this from me at once.\" He did not demand. He simply reminded Allah of His mercy — and trusted Him.",
          "And Allah answered Ayyub. In the Qur'an Allah says, \"So We responded to him and removed the harm.\" Allah said to Ayyub, \"Strike with your foot upon the ground.\" Ayyub did, and a cool, clear spring burst out of the earth. Allah said, \"This is for washing and drinking.\" Ayyub washed himself, drank from it, and the illness left. Allah restored his health, returned his family to him, and gave him even more than before.",
          "And Allah spoke beautiful words about Ayyub in the Qur'an: \"Indeed, We found him patient. An excellent servant!\" These are among the highest words that can be said about any human being. Whenever people in difficulty remember Ayyub, their burden grows lighter. Because Ayyub showed: even the greatest pain ends one day, if you stay with Allah.",
        ],
        lesson:
          "Lesson: patience is not staying silent while resentful — it is trusting Allah when life is hard. Ayyub did not demand. He asked gently. And Allah answered.",
        sources: [
          "Quran 21:83-84 (the du'a of Ayyub and Allah's response)",
          "Quran 38:41-44 (the spring, the healing, and Allah's praise of Ayyub)",
          "Ibn Kathir, Qisas al-Anbiya, chapter on Ayyub",
        ],
      },
      fa: {
        name: "ایوب",
        theme: "صبر",
        paragraphs: [
          "حضرت ایوب مردی نیکوکار بود. خداوند بسیار به او داده بود: خانواده‌ای بزرگ، فرزندان فراوان، زمینی حاصلخیز، دام و خانه. ایوب هرگز فراموش نمی‌کرد که این همه از کیست. هر روز خداوند را سپاس می‌گفت و به نیازمندان یاری می‌رساند.",
          "آنگاه خداوند آزمونی بزرگ برای ایوب فرستاد. ایوب نزدیک به همه چیز خویش را از دست داد ـ هم مال و هم تندرستی. بیماری سنگینی بر او وارد آمد و سال‌ها از او دور نشد. ایوب سال‌ها در بستر بیماری ماند. نمی‌توانست کار کند. نمی‌توانست آنچه پیش‌تر می‌توانست انجام دهد. تنها همسرش در کنار او ماند و از او پرستاری کرد.",
          "اما ایوب شکایت نکرد. بر خداوند خشم نگرفت. نگفت: «چرا من؟» ایوب می‌دانست: آنچه را خدا داد، خود نیز می‌تواند بازستاند. پس صبر کرد. آرام صبر کرد، بی هیچ گله‌ای. تنها به ایمان خود ادامه داد.",
          "زمانی که آزمون بسیار سنگین شد، ایوب با دعایی کوتاه به سوی پروردگار خود بازگشت. گفت: «پروردگارا، رنج به من رسیده است و تو ارحم‌الراحمینی.» نگفت: «این بلا را همین اکنون بردار.» چیزی نخواست به اصرار. تنها مهربانی خدا را به یاد او آورد ـ و به او توکل کرد.",
          "خداوند ایوب را پاسخ داد. در قرآن می‌فرماید: «دعای او را اجابت کردیم و آنچه را از سختی به او رسیده بود برداشتیم.» خداوند به ایوب فرمان داد: «پای بر زمین بکوب.» ایوب چنین کرد و چشمه‌ای سرد و پاک از زمین جوشید. خداوند فرمود: «این برای شستشو و نوشیدن است.» ایوب با آن آب خود را شست، از آن نوشید و بیماری از او رفت. خداوند تندرستی را به او بازگرداند، خانواده‌اش را به او رساند، و حتی بیش از پیش به او بخشید.",
          "خداوند در قرآن درباره‌ی ایوب سخنی بس زیبا فرموده است: «همانا او را شکیبا یافتیم؛ نیکو بنده‌ای بود.» این از بالاترین سخنانی است که درباره‌ی یک انسان می‌توان گفت. هر گاه مردمان در سختی به یاد ایوب می‌افتند، بار از دل آنان سبک می‌شود. زیرا ایوب نشان داد: بزرگ‌ترین درد روزی پایان می‌گیرد، اگر با خدا بمانی.",
        ],
        lesson:
          "درس: صبر، خاموش نشستن با کینه نیست؛ توکل بر خداست در سختی. ایوب چیزی نخواست به اصرار، آرام دعا کرد ـ و خداوند پاسخ داد.",
        sources: [
          "قرآن ۲۱:۸۳-۸۴ (دعای ایوب و پاسخ خداوند)",
          "قرآن ۳۸:۴۱-۴۴ (چشمه، شفا و ستایش خداوند)",
          "ابن کثیر، قصص الانبیاء، باب ایوب علیه‌السلام",
        ],
      },
      ru: {
        name: "Аййюб",
        theme: "терпение",
        paragraphs: [
          "Пророк Айюб был добрым человеком. Аллах дал ему многое: большую семью, много детей, плодородную землю, скот, дома. Айюб никогда не забывал, от Кого всё это. Он каждый день благодарил Аллаха и помогал бедным.",
          "Но потом Аллах послал Айюбу испытание. Большое испытание. Айюб потерял почти всё — и имущество, и здоровье. Тяжёлая болезнь пришла к нему и долго не уходила. Многие годы Айюб лежал больной. Он не мог работать. Не мог делать всё то, что мог раньше. Только его жена осталась рядом и заботилась о нём.",
          "Но Айюб не жаловался. Он не сердился на Аллаха. Он не говорил: «За что мне это?» Айюб помнил: то, что Аллах дал, — Аллах вправе и забрать. И он терпел. Терпел тихо, без громких слов. Просто продолжал верить.",
          "И только когда испытание стало совсем тяжёлым, Айюб обратился к Аллаху одной короткой молитвой. Он сказал: «Господи! Меня постигла беда, а Ты — Милостивейший из милостивых». Он не сказал: «Господи, забери эту беду немедленно». Он не требовал. Он только напомнил Аллаху о Его милости — и доверился.",
          "И Аллах ответил Айюбу. В Коране Аллах говорит: «Мы ответили ему и сняли с него беду». Аллах велел Айюбу: «Ударь ногой в землю». Айюб ударил — и из земли забил холодный, чистый источник. Аллах сказал: «Это — для омовения и питья». Айюб вымылся этой водой, выпил её — и болезнь ушла. Аллах вернул Айюбу здоровье, вернул ему семью, дал ему ещё больше, чем было раньше.",
          "И Аллах в Коране сказал об Айюбе очень красивые слова: «Воистину, Мы нашли его терпеливым. Прекрасный раб!» Это самые высокие слова, которые можно сказать о человеке. Когда люди в трудной жизни вспоминают об Айюбе — им становится легче. Потому что Айюб показал: даже самая большая боль когда-нибудь заканчивается, если ты остаёшься с Аллахом.",
        ],
        lesson:
          "Урок: терпение — это не молчать с обидой, а доверять Аллаху, когда трудно. Айюб не требовал — он просил мягко. И Аллах ответил.",
        sources: [
          "Коран 21:83-84 (мольба Айюба и ответ Аллаха)",
          "Коран 38:41-44 (источник, исцеление, оценка Аллаха)",
          "Ибн Касир, «Кисас аль-Анбия», глава «Хабар об Айюбе»",
        ],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    slug: "yunus",
    nameAr: "يُونُس",
    suffix: "عليه السلام",
    readingMin: 5,
    byLocale: {
      tg: {
        name: "Юнус",
        theme: "наҳанг",
        paragraphs: [
          "Аллоҳ пайғамбар Юнусро ба сӯи қавме фиристод, ки дар шаҳри Найнаво зиндагӣ мекард. Он қавм Аллоҳро фаромӯш карда буд ва бутҳоро мепарастид. Юнус рӯзҳои бисёр онҳоро ба ҳақ даъват кард, аммо мардум гӯш надоданд. Ба ӯ механдиданд, рӯй мегардониданд ва ҳамоно он чи бо дасти худ сохта буданд, мепарастиданд.",
          "Юнус хаста ва нохуш шуд. Бе он ки изни Аллоҳро бигирад, шаҳрро тарк кард. Ба киштӣ нишаст ва ба баҳр рафт — дур аз он қавм. Аммо Юнус ин корро бе пурсиши Парвардигор кард. Ва пайғамбарон бояд интизори амри Парвардигор шаванд.",
          "Дар баҳр тӯфони шадиде хест. Киштӣ меларзид, бод фарёд мекашид ва мавҷҳо киштиро ба боло ва поён мепартофтанд. Маллоҳон тарсиданд, ки киштӣ ғарқ мешавад. Ба расми он замон қуръа партофтанд, то муайян кунанд кӣ ро ба баҳр пайдо кунанд, то бор сабук шавад. Се бор қуръа ба номи Юнус афтод. Юнус фаҳмид: ин озмоиш аз ҷониби Аллоҳ аст. Худ ба баҳр ҷаст.",
          "Дар баҳр наҳанги бузурге ӯро фурӯ бурд. Ба амри Аллоҳ, наҳанг ба Юнус ҳеҷ зараре нарасонд. Юнус худро дар торикӣ ёфт — торикии баҳр, торикии шаб, торикии шиками наҳанг. Се торикӣ ӯро иҳота карда буд. Ва дар ҳамон торикии комил, Юнус ба хатои худ пай бурд — ки қавмашро пеш аз амри Аллоҳ тарк кардааст.",
          "Он гоҳ Юнус аз он торикӣ ҳамон калимаҳоро бар забон овард, ки Аллоҳ то рӯзи қиёмат дар Қуръон нигоҳ доштааст: «Ҳеҷ маъбуде ҷуз Ту нест, пок ҳастӣ Ту; ҳамоно ман аз ситамкорон будам». Узр натарошид. Нагуфт: «Қавм бад буд». Эътироф кард: «Ман худ хато кардам».",
          "Аллоҳ ҷавобашро дод. Ба наҳанг амр кард ва наҳанг Юнусро ба соҳил андохт. Юнус хеле бенаво буд. Аллоҳ дар канораш растание рӯёнд, ки баргҳояш ӯро аз офтоб ҳифз мекард ва хӯроки ӯ буд. Юнус нерӯ гирифт ва ба сӯи қавмаш баргашт. Дар ҳамин миён, тамоми қавми ӯ — то охирин нафар — ба Аллоҳ имон оварда буданд. Аллоҳ онҳоро бубахшид.",
        ],
        lesson:
          "Дарс: вақте мо хато мекунем, набояд дигаронро айбдор кунем. Чун Юнус бигӯ: «Ман ситам кардам». Ва Аллоҳ ҳатто аз чуқуртарин торикиҳо садои туро мешунавад.",
        sources: [
          "Қуръон 21:87-88 (дуои Юнус аз торикиҳо ва ҷавоби Аллоҳ)",
          "Қуръон 37:139-148 (киштӣ, наҳанг ва наҷот)",
          "Қуръон 10:98 (имон овардани тамоми қавми Юнус)",
          "Тирмизӣ 3505 (дуои Юнус, ҳасан)",
          "Ибни Касир, Қисас ул-Анбиё, боби Юнус алайҳис-салом",
        ],
      },
      uz: {
        name: "Yunus",
        theme: "baliq",
        paragraphs: [
          "Alloh payg'ambar Yunusni Nineviya shahrida yashagan qavmga yubordi. Bu qavm Allohni unutgan va butlarga sig'inardi. Yunus ularni ko'p kun davomida haqqa chaqirdi, lekin odamlar quloq solmadi. Uni masxara qilishar, yuz o'girishar va o'z qo'llari bilan yasagan narsalariga sig'inishda davom etardilar.",
          "Yunus charchadi va xafa bo'ldi. U Allohning izinini kutmasdan shaharni tark etdi. Kemaga chiqib, dengizga jo'nadi — o'sha qavmdan uzoqqa. Lekin Yunus bu ishni Rabbisidan so'ramay qildi. Vaholanki, payg'ambarlar Rabbining amrini kutishlari kerak edi.",
          "Dengizda qattiq bo'ron boshlandi. Kema chayqalar, shamol uvillab, to'lqinlar kemani yuqoriga va pastga otib turardi. Dengizchilar qo'rqib ketishdi — kema cho'kishi mumkin edi. O'sha davrning odatiga ko'ra, yukni yengillatish uchun kimni dengizga tashlashni qur'a tashlab aniqlamoqchi bo'lishdi. Qur'a uch marta Yunusga tushdi. Shunda Yunus tushundi: bu Allohdan sinov. U o'zi dengizga sakradi.",
          "Dengizda katta baliq uni yutib yubordi. Allohning irodasi bilan baliq Yunusga hech qanday zarar yetkazmadi. Yunus zulmatda qoldi — dengiz zulmati, kechaning zulmati, baliq qornining zulmati. Uch zulmat uni o'rab oldi. Va o'sha to'liq zulmatda Yunus xatosini tushundi — Allohning amrisiz qavmini tark etgan edi.",
          "Shunda Yunus o'sha zulmat ichidan, Alloh qiyomatgacha Qur'onda saqlab qoldirgan so'zlarni aytdi: \"Sendan o'zga iloh yo'q. Senga tasbeh aytaman. Albatta, men zolimlardan bo'ldim\". U bahona qilmadi. \"Qavm yomon edi\", demadi. Tan oldi: \"Men xato qildim\".",
          "Alloh unga javob berdi. Alloh baliqqa amr qildi va baliq Yunusni sohilga tashladi. Yunus juda zaif edi. Alloh uning yonida bir o'simlik o'stirdi, uning barglari uni quyoshdan himoya qilar va oziq berardi. Yunus kuchini tikladi va qavmiga qaytdi. Bu vaqt ichida uning qavmi — har bir kishi — Allohga iymon keltirgan edi. Alloh ularni kechirdi.",
        ],
        lesson:
          "Saboq: xato qilganimizda, boshqalarni ayblamasligimiz kerak. Yunus kabi ayt: \"Men zolim edim\". Va Alloh seni hatto eng chuqur zulmatdan ham eshitadi.",
        sources: [
          "Qur'on 21:87-88 (Yunusning zulmatdagi duosi va Allohning javobi)",
          "Qur'on 37:139-148 (kema, baliq va najot)",
          "Qur'on 10:98 (Yunus qavmining to'liq iymon keltirishi)",
          "Tirmiziy 3505 (Yunusning duosi, hadis hasan)",
          "Ibn Kasir, Qisasul Anbiyo, Yunus alayhissalom bobi",
        ],
      },
      en: {
        name: "Yunus",
        theme: "the whale",
        paragraphs: [
          "Allah sent the Prophet Yunus to a people who lived in the city of Nineveh. They had forgotten Allah and worshipped idols. Yunus called them to the truth for many days, but they did not listen. They laughed at him, turned away, and kept worshipping what they had made with their own hands.",
          "Yunus grew tired and upset. So he left the city without waiting for Allah's permission. He boarded a ship and sailed out to sea — far from that people. But Yunus had done this without asking his Lord. Prophets must wait for the command of Allah.",
          "A violent storm rose at sea. The ship rocked, the wind howled, the waves threw the ship up and down. The sailors were terrified — the ship could sink. As was the custom of that time, they drew lots to decide whom to throw overboard to lighten the load. Three times the lot fell on Yunus. Then Yunus understood: this was a trial from Allah. He himself jumped into the sea.",
          "A great whale swallowed him in the sea. By Allah's will, the whale did Yunus no harm. Yunus found himself in darkness — the darkness of the sea, the darkness of night, the darkness of the whale's belly. Three layers of darkness around him. And there, in complete darkness, Yunus understood his mistake — he had left his people before Allah had said so.",
          "Then from within that darkness Yunus spoke the words Allah has preserved in the Qur'an for every person until the Day of Judgement: \"There is no god but You. Glory to You. Indeed, I have been among the wrongdoers.\" He did not make excuses. He did not say, \"The people were bad.\" He admitted, \"It was I who erred.\"",
          "And Allah answered him. Allah commanded the whale, and the whale cast Yunus out onto a shore. Yunus was very weak. Allah caused a plant to grow next to him, whose leaves shaded him from the sun and gave him food. Yunus recovered his strength and returned to his people. And in that time his people — every single one of them — had believed in Allah. And Allah forgave them.",
        ],
        lesson:
          "Lesson: when we make a mistake, we should not blame others. Say what Yunus said: \"I was wrong.\" And Allah will hear you, even from the deepest darkness.",
        sources: [
          "Quran 21:87-88 (Yunus's du'a from the darkness and Allah's response)",
          "Quran 37:139-148 (the ship, the whale, and the rescue)",
          "Quran 10:98 (the people of Yunus all believed)",
          "Jami' at-Tirmidhi 3505 (the du'a of Yunus, graded hasan)",
          "Ibn Kathir, Qisas al-Anbiya, chapter on Yunus",
        ],
      },
      fa: {
        name: "یونس",
        theme: "ماهی",
        paragraphs: [
          "خداوند پیامبرش یونس را به سوی قومی که در شهر نینوا می‌زیستند، فرستاد. آن قوم خدای خود را فراموش کرده بودند و بت می‌پرستیدند. یونس روزها آنان را به حقیقت فراخواند، اما گوش نسپردند. به او می‌خندیدند، روی برمی‌گرداندند و همچنان آنچه را با دست خود ساخته بودند می‌پرستیدند.",
          "یونس خسته و دلگیر شد. پیش از آنکه اذن از پروردگارش بگیرد، شهر را ترک کرد. سوار کشتی شد و به دریا رفت ـ دور از آن قوم. اما این کار را بی‌اذنِ الله انجام داد. حال آنکه پیامبران باید منتظر فرمان پروردگار بمانند.",
          "در دریا توفانی سخت برخاست. کشتی می‌لرزید، باد می‌غرید و موج‌ها کشتی را بالا و پایین می‌بردند. ملاحان ترسیدند که کشتی غرق شود. به رسم آن زمان قرعه افکندند تا تصمیم گیرند چه کسی را به دریا اندازند تا بار سبک شود. سه بار قرعه به نام یونس افتاد. آنگاه یونس دریافت: این آزمونی از سوی خداست. خود به دریا افکند.",
          "ماهیِ بزرگی او را در دریا فرو بلعید. به اراده‌ی خدا، ماهی هیچ گزندی به یونس نرساند. یونس در تاریکی فرو رفت ـ تاریکی دریا، تاریکی شب، تاریکی شکم ماهی. سه تاریکی او را در میان گرفته بود. و در آن تاریکیِ تمام، یونس به خطای خویش پی برد ـ که پیش از فرمان خدا قوم خود را ترک کرده بود.",
          "آنگاه یونس از میان آن تاریکی همان سخنی را بر زبان آورد که خداوند تا روز قیامت در قرآن نگاه داشته است: «لا اله الا انت سبحانک انی کنت من الظالمین» ـ «هیچ معبودی جز تو نیست؛ پاک و منزهی. به‌راستی من از ستمکاران بودم.» عذر نتراشید. نگفت: «قوم بد بودند.» اعتراف کرد: «من خود خطا کردم.»",
          "خداوند او را پاسخ داد. به ماهی فرمان داد و ماهی یونس را بر ساحل افکند. یونس بسیار ناتوان بود. خداوند گیاهی در کنار او رویاند که برگ‌هایش او را از آفتاب پناه می‌داد و خوراکش بود. یونس نیرو گرفت و به سوی قوم خویش بازگشت. در آن مدت، همه‌ی قوم او ـ تا آخرین تن ـ ایمان آورده بودند. خداوند آنان را آمرزید.",
        ],
        lesson:
          "درس: وقتی اشتباه می‌کنیم، نباید دیگران را سرزنش کنیم. مثل یونس بگو: «من ستم کردم.» و خداوند صدای تو را حتی از ژرف‌ترین تاریکی‌ها می‌شنود.",
        sources: [
          "قرآن ۲۱:۸۷-۸۸ (دعای یونس از تاریکی‌ها و پاسخ خداوند)",
          "قرآن ۳۷:۱۳۹-۱۴۸ (داستان کشتی، ماهی و نجات)",
          "قرآن ۱۰:۹۸ (ایمان آوردن همه‌ی قوم یونس)",
          "ترمذی ۳۵۰۵ (دعای یونس، حدیث حسن)",
          "ابن کثیر، قصص الانبیاء، باب یونس علیه‌السلام",
        ],
      },
      ru: {
        name: "Юнус",
        theme: "кит",
        paragraphs: [
          "Аллах послал пророка Юнуса к народу, который жил в городе Ниневия. Этот народ забыл Аллаха и поклонялся идолам. Юнус много дней звал их к истине, но люди не слушали. Они смеялись над ним, отворачивались и продолжали поклоняться тому, что сделали своими руками.",
          "Юнус устал и расстроился. И он ушёл из города, не дождавшись разрешения Аллаха. Он сел на корабль и поплыл по морю — далеко от того народа. Но Юнус сделал это, не спросив Аллаха. А пророки должны ждать веления Господа.",
          "В море начался сильный шторм. Корабль качало, ветер выл, волны бросали корабль то вверх, то вниз. Моряки испугались — корабль мог утонуть. По обычаю того времени, они бросили жребий, чтобы решить, кого сбросить с корабля и облегчить груз. Жребий три раза выпадал на Юнуса. И тогда Юнус понял: это испытание от Аллаха. Он сам прыгнул в море.",
          "В море его проглотил большой кит. По воле Аллаха кит не сделал Юнусу ничего плохого. Юнус оказался в темноте — в темноте моря, в темноте ночи, в темноте чрева кита. Три темноты вокруг него. И там, в полной тьме, Юнус понял свою ошибку — он ушёл от своего народа, не дождавшись Аллаха.",
          "И тогда Юнус из этой тьмы сказал слова, которые Аллах потом сохранил в Коране для всех людей до Судного дня: «Нет божества, кроме Тебя! Пречист Ты! Воистину, я был из числа несправедливых». Он не оправдывался. Не говорил: «Народ был плохой». Он признал: «Это я ошибся».",
          "И Аллах ответил ему. Аллах велел киту, и кит выбросил Юнуса на берег. Юнус был очень слаб. Аллах вырастил рядом с ним растение, листья которого защищали Юнуса от солнца и давали ему еду. Юнус восстановил силы и вернулся к своему народу. А его народ за это время — все, до одного человека — уверовал в Аллаха. И Аллах простил их.",
        ],
        lesson:
          "Урок: когда мы ошибаемся, не надо обвинять других. Скажи, как Юнус: «Я был несправедлив». И Аллах услышит даже из самой глубокой темноты.",
        sources: [
          "Коран 21:87-88 (мольба Юнуса из тьмы и ответ Аллаха)",
          "Коран 37:139-148 (история с кораблём, китом и спасением)",
          "Коран 10:98 (народ Юнуса уверовал полностью)",
          "Ат-Тирмизи 3505 (хадис о мольбе Юнуса, грейд — хасан)",
          "Ибн Касир, «Кисас аль-Анбия», глава «Хабар о Юнусе»",
        ],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    slug: "sulayman",
    nameAr: "سُلَيْمَان",
    suffix: "عليه السلام",
    readingMin: 7,
    byLocale: {
      tg: {
        name: "Сулаймон",
        theme: "подшоҳии бод",
        paragraphs: [
          "Пайғамбар Сулаймон писари пайғамбар Довуд буд. Аллоҳ ба ӯ туҳфаҳое дод, ки ба ҳеҷ каси дигар надода буд. Сулаймон ҳам пайғамбар буд ва ҳам подшоҳ. Аллоҳ ба ӯ подшоҳии бузург, ҳикмат ва се қобилияти аҷиб ато кард: бод ба ӯ хидмат мекард, ҷинниён барои ӯ кор мекарданд, ва Сулаймон забони ҳайвонҳо ва паррандаҳоро мефаҳмид.",
          "Вақте Сулаймон мехост ба ҷое дур равад, ба киштӣ ё шутур ниёз надошт. Бод тахти ӯро бармедошт ва дар як рӯз ба он ҷое мерасонд, ки одами муқаррарӣ як моҳ роҳ мепаймуд. Ҷинниён барои ӯ биноҳои баланд месохтанд, аз қаъри баҳр марворид мегирифтанд ва кориҳое мекарданд, ки аз дасти инсони муқаррарӣ намеояд.",
          "Як рӯз Сулаймон бо лашкараш аз водии мӯрчагон гузашт. Як мӯрча ба ҳамҷинсонаш фарёд кашид: «Эй мӯрчагон! Ба хонаҳои худ даройед, то Сулаймон ва лашкараш шуморо нохост поймол накунанд!» Сулаймон ӯро шунид, чун Аллоҳ ба ӯ фаҳмидани забони ҳайвонҳоро дода буд. Ба сухани он мӯрча табассум кард ва гуфт: «Парвардигоро, ба ман тавфиқ деҳ, то неъматеро, ки ба ман ва падару модарам ато кардаӣ, шукр гузорам».",
          "Як бори дигар Сулаймон ҳамаи паррандагонашро ҷамъ кард, аммо ҳудҳудро надид. Гуфт: «Ҳудҳуд куҷост? Агар бо узр баргардад, ӯро ҷазо медиҳам». Каме баъд ҳудҳуд омад ва гуфт: «Чизе ёфтам, ки ту намедонистӣ. Аз Сабаъ омадам. Дар он ҷо зане ба номи Билқис фармонравоӣ мекунад. Тахти бузурге дорад. Аммо ӯ ва қавмаш офтобро мепарастанд, на Аллоҳро».",
          "Сулаймон ҳамла накард. Ба Билқис мактубе навишт ва ӯро ба ҳақ даъват кард. Билқис муддате андешид ва худ ба назди Сулаймон омад. Чун подшоҳӣ, ҳикмат ва меҳрубонии ӯро дид, фаҳмид, ки Сулаймон подшоҳи муқаррарӣ нест. Ва вақте дид, ки Сулаймон танҳо Аллоҳро мепарастад ва ба подшоҳии худ бо такаббур барахӯрд намекунад, дилаш гардид. Гуфт: «Бо Сулаймон ба Аллоҳи Парвардигори оламиён таслим шудам».",
          "Сулаймон медонист, ки тамоми подшоҳиаш аз Аллоҳ аст. Намегуфт: «Ин аз они ман аст». Мегуфт: «Ин аз фазли Парвардигорам аст, то маро биозмояд — шукр мекунам ё нашукрӣ». Хеле сахт аст: ин қадар чиз доштан ва такаббур накардан. Сулаймон аз ин озмоиш ғолиб баромад, чун дилаш машғули Аллоҳ буд, на машғули ашё.",
          "Дар охири умраш Сулаймон бар асои худ такя дода ҷон супурд ва он қадар истода монд, ки ҷинниёни поён, дар ҳоли кор, аз марги ӯ огоҳ нашуданд. Онҳо ҳамоно кор мекарданд, гумон карда ки подшоҳ ба онҳо менигарад. Танҳо вақте асо шикаст, Сулаймон афтод ва ҷинниён огоҳ шуданд. Ин нишонае барои ҳамаи мост: ҳатто бузургтарини одамон ҳам мирандаанд. Танҳо он чи барои Аллоҳ кардаем, мемонад.",
        ],
        lesson:
          "Дарс: доштани бисёр низ озмоишест на камтар аз надоштани ҳеҷ. Сулаймон ҳама чиз дошт ва дар ҳар неъмат Аллоҳро ба ёд дошт. Ин шоҳии ҳақиқӣ аст.",
        sources: [
          "Қуръон 27:15-44 (ҳикмати Сулаймон, мӯрчагон, ҳудҳуд, Билқис)",
          "Қуръон 38:30-40 (подшоҳӣ, бод, шукри Сулаймон)",
          "Қуръон 34:12-14 (хидмати ҷинниён ва марги Сулаймон)",
          "Ибни Касир, Қисас ул-Анбиё, бобҳои Довуд ва Сулаймон алайҳимас-салом",
        ],
      },
      uz: {
        name: "Sulaymon",
        theme: "shamol saltanati",
        paragraphs: [
          "Payg'ambar Sulaymon payg'ambar Dovudning o'g'li edi. Alloh unga hech kimga bermagan in'omlarni berdi. Sulaymon ham payg'ambar, ham podshoh edi. Alloh unga buyuk podshohlik, hikmat va uchta ajoyib qobiliyat berdi: shamol unga xizmat qilardi, jinlar uning uchun ishlardi va Sulaymon hayvonlar va qushlar tilini tushunardi.",
          "Sulaymon uzoq joyga safarga chiqmoqchi bo'lsa, unga kema yoki tuya kerak emas edi. Shamol uning taxtini ko'tarib, bir kunda oddiy odam bir oyda boradigan joyga olib borardi. Jinlar unga baland binolar qurar, dengiz tubidan marvarid keltirar, oddiy odamlar bajara olmaydigan ishlarni qilardilar.",
          "Bir kuni Sulaymon lashkari bilan chumolilar vodiysidan o'tdi. Birdan bir chumoli o'z toifasiga: \"Ey chumolilar! Uylaringizga kiring, Sulaymon va uning lashkari sezmasdan sizlarni ezib qo'ymasin!\" — deb baqirdi. Sulaymon uni eshitdi, chunki Alloh unga hayvonlar tilini tushunish qobiliyatini bergan edi. U bu so'zlarga jilmayib: \"Yo Rabbim! Menga va ota-onamga in'om qilgan ne'matlaringga shukr qiluvchi qil meni\", — dedi.",
          "Yana bir kuni Sulaymon barcha qushlarini to'pladi, lekin hudhudni ko'rmadi. \"Hudhud qayerda? Agar uzrli sabab bilan kelmasa, uni jazolayman\", — dedi. Sal o'tib hudhud kelib: \"Men sen bilmaydigan narsani bildim. Sabodan keldim. U yerda Bilqis ismli ayol hukmronlik qiladi. Uning katta taxti bor. Lekin u va qavmi quyoshga sig'inadi, Allohga emas\", — dedi.",
          "Sulaymon hujum qilmadi. Bilqisga maktub yozib, uni haqqa chaqirdi. Bilqis uzoq o'ylab, o'zi Sulaymonning oldiga keldi. Uning podshohligini, hikmatini va mehribonligini ko'rib, Sulaymon oddiy podshoh emasligini tushundi. Sulaymonning faqat Allohga sig'inishini va podshohligi bilan g'ururlanmasligini ko'rib, qalbi yumshadi. \"Sulaymon bilan birga olamlarning Rabbi Allohga taslim bo'ldim\", — dedi.",
          "Sulaymon butun podshohligini Allohdan ekanini bilar edi. \"Bu mening\", demas edi. \"Bu Rabbimning fazlidan, U menga: shukr qilamanmi yoki nashukrlik qilamanmi, deb sinash uchun\", — der edi. Bunchalik ko'p narsaga ega bo'lib, mag'rurlanmaslik juda qiyin. Sulaymon bunga eridi, chunki qalbi narsalar bilan emas, Alloh bilan band edi.",
          "Hayotining oxirida Sulaymon hassasiga suyanib jon berdi va shu holatda shunday uzoq turdiki, pastda ishlayotgan jinlar uning vafotini sezmadilar. Ular podshoh ularga qarab turibdi deb o'ylab, ishni davom ettiraverdilar. Faqat hassa singandagina Sulaymon yiqildi, va jinlar tushundilar. Bu hammamiz uchun belgidir: hatto eng buyuk odamlar ham o'tkinchidir. Faqat Alloh uchun qilgan ishlarimiz qoladi.",
        ],
        lesson:
          "Saboq: ko'p narsaga ega bo'lish — hech narsasiz qolishdan kam sinov emas. Sulaymonda hamma narsa bor edi — va u har in'omda Allohni eslar edi. Asl boylik shu.",
        sources: [
          "Qur'on 27:15-44 (Sulaymonning hikmati, chumolilar, hudhud, Bilqis)",
          "Qur'on 38:30-40 (podshohlik, shamol, Sulaymonning shukri)",
          "Qur'on 34:12-14 (jinlar xizmati va Sulaymonning vafoti)",
          "Ibn Kasir, Qisasul Anbiyo, Dovud va Sulaymon alayhimassalom boblari",
        ],
      },
      en: {
        name: "Sulayman",
        theme: "the kingdom of the wind",
        paragraphs: [
          "The Prophet Sulayman was the son of the Prophet Dawud. Allah gave him gifts He had given no one else. Sulayman was both a prophet and a king. Allah gave him a great kingdom, wisdom, and three remarkable abilities: the wind served him, the jinn worked for him, and he could understand the speech of animals and birds.",
          "When Sulayman wanted to travel far, he did not need ships or camels. The wind lifted his throne and carried him in a single day to a place an ordinary traveller would have reached in a month. The jinn built tall buildings for him, brought pearls up from the depths of the sea, and did things ordinary people cannot do.",
          "One day Sulayman was passing with his army through a valley of ants. A female ant cried out to her people: \"O ants, enter your homes lest Sulayman and his army crush you while they do not perceive you!\" Sulayman heard her, because Allah had given him the ability to understand the speech of animals. He smiled at her words and said, \"My Lord, enable me to be grateful for the favour You have bestowed upon me and upon my parents.\"",
          "Another time Sulayman gathered all his birds and noticed that the hoopoe was missing. He said, \"Where is the hoopoe? If he does not come with a clear excuse, I shall punish him.\" After a while the hoopoe arrived and said, \"I have come to know what you did not. I have come from Saba. There a woman named Bilqis rules. She has a great throne. But she and her people worship the sun, not Allah.\"",
          "Sulayman did not attack. He wrote Bilqis a letter and invited her to the truth. Bilqis thought long and then came herself to Sulayman. When she saw his kingdom, his wisdom, and his kindness, she understood that Sulayman was no ordinary king. And when she saw how Sulayman worshipped Allah alone and was not proud of his kingdom, her heart turned. She said, \"I have submitted with Sulayman to Allah, the Lord of the worlds.\"",
          "Sulayman knew that his entire kingdom was from Allah. He did not say, \"This is mine.\" He said, \"This is by the favour of my Lord, that He may test me — whether I will be grateful or ungrateful.\" It is very hard to have so much and not become proud. Sulayman managed it because his heart was full of Allah, not of things.",
          "At the end of his life, Sulayman died leaning on his staff, and he stood that way so long that the jinn working below did not notice his death. They kept working, thinking the king was watching them. Only when the staff broke did Sulayman fall — and the jinn realized. This is a sign for all of us: even the greatest people are mortal. Only what we did for the sake of Allah will remain.",
        ],
        lesson:
          "Lesson: having much is a test no less than having nothing. Sulayman had everything — and remembered Allah in every gift. That is real wealth.",
        sources: [
          "Quran 27:15-44 (Sulayman's wisdom, the ants, the hoopoe, and Bilqis)",
          "Quran 38:30-40 (kingdom, the wind, and Sulayman's gratitude)",
          "Quran 34:12-14 (the service of the jinn and Sulayman's death)",
          "Ibn Kathir, Qisas al-Anbiya, chapters on Dawud and Sulayman",
        ],
      },
      fa: {
        name: "سلیمان",
        theme: "پادشاهیِ باد",
        paragraphs: [
          "حضرت سلیمان فرزند حضرت داوود بود. خداوند به او عطایایی بخشید که به هیچ‌کس دیگر نداده بود. سلیمان هم پیامبر بود و هم پادشاه. خداوند پادشاهیِ بزرگ، حکمت و سه توانایی شگفت به او ارزانی فرمود: باد به فرمان او بود، جنّیان برای او کار می‌کردند و او زبان جانوران و پرندگان را می‌فهمید.",
          "هرگاه سلیمان می‌خواست به جایی دور سفر کند، به کشتی و شتر نیاز نداشت. باد تخت او را برمی‌داشت و در یک روز به جایی می‌رساند که مسافری معمولی یک ماه راه می‌پیمود. جنّیان برای او ساختمان‌های بلند می‌ساختند، از ژرفای دریا مروارید می‌آوردند و کارهایی می‌کردند که از دست انسان معمولی برنمی‌آید.",
          "روزی سلیمان با سپاهش از وادی مورچگان می‌گذشت. ناگاه مورچه‌ای فریاد برآورد: «ای مورچگان! به لانه‌های خود درآیید تا سلیمان و سپاهیانش، ناخواسته، شما را پایمال نکنند.» سلیمان سخن او را شنید، زیرا خداوند زبان جانوران را به او آموخته بود. به سخن آن مورچه لبخند زد و گفت: «پروردگارا، به من توفیق ده تا نعمت تو را که بر من و بر پدر و مادرم ارزانی داشته‌ای، سپاس گویم.»",
          "روزی دیگر سلیمان همه‌ی پرندگان خویش را گرد آورد، اما هدهد را در میان آنان ندید. گفت: «هدهد کجاست؟ اگر برهانی روشن نیاورد، او را کیفر می‌دهم.» چندی بعد هدهد بازگشت و گفت: «من به چیزی پی برده‌ام که تو ندانسته‌ای. از سرزمین سبأ آمده‌ام. در آنجا زنی به نام بلقیس فرمانروایی می‌کند. او تختی بزرگ دارد. اما او و قومش خورشید را می‌پرستند، نه خدا را.»",
          "سلیمان حمله نکرد. به بلقیس نامه‌ای نوشت و او را به حقیقت دعوت کرد. بلقیس بسیار اندیشید و سپس خود نزد سلیمان آمد. چون پادشاهی، حکمت و مهربانی او را دید، دریافت که سلیمان شاهی معمولی نیست. و چون دید که سلیمان تنها خدا را می‌پرستد و به پادشاهی خود نمی‌بالد، دلش گردید. گفت: «همراه با سلیمان، در برابر خداوند پروردگار جهانیان تسلیم شدم.»",
          "سلیمان می‌دانست که همه‌ی پادشاهی او از خداست. نمی‌گفت: «این مالِ من است.» می‌گفت: «این از فضلِ پروردگار من است تا مرا بیازماید که آیا سپاس می‌گزارم یا ناسپاسی می‌کنم.» این بسیار دشوار است: داشتنِ چنین فراوانی و در عین حال متکبر نشدن. سلیمان از این آزمون پیروز بیرون آمد، زیرا دلش به یاد خدا بود، نه به چیزها.",
          "در پایان زندگی، سلیمان بر عصای خویش تکیه داده درگذشت و چنان ایستاده ماند که جنّیان پایین در حال کار، از مرگش آگاه نشدند. آنان همچنان کار می‌کردند به این پندار که پادشاه به آنان می‌نگرد. تنها زمانی که عصا شکست، سلیمان فروافتاد و جنّیان آگاه شدند. این نشانه‌ای است برای همه‌ی ما: حتی بزرگ‌ترینِ آدمیان نیز فناپذیرند. تنها آن چه برای خدا کرده‌ایم باقی می‌ماند.",
        ],
        lesson:
          "درس: داشتنِ بسیار نیز همانند نداشتن، آزمونی است. سلیمان همه چیز داشت و در هر نعمت خدا را به یاد داشت. این، توانگری حقیقی است.",
        sources: [
          "قرآن ۲۷:۱۵-۴۴ (حکمت سلیمان، مورچگان، هدهد و بلقیس)",
          "قرآن ۳۸:۳۰-۴۰ (پادشاهی، باد و سپاس سلیمان)",
          "قرآن ۳۴:۱۲-۱۴ (خدمت جنّیان و مرگ سلیمان)",
          "ابن کثیر، قصص الانبیاء، باب داوود و سلیمان علیهماالسلام",
        ],
      },
      ru: {
        name: "Сулейман",
        theme: "царство ветра",
        paragraphs: [
          "Пророк Сулейман был сыном пророка Дауда. И Аллах дал ему такие подарки, каких не давал никому. Сулейман был пророком — и царём. Аллах дал ему великое царство, мудрость и три удивительные способности: ветер служил ему, джинны работали для него, и Сулейман понимал язык животных и птиц.",
          "Когда Сулейман хотел отправиться в далёкое место, ему не нужны были корабли или верблюды. Ветер поднимал его трон и переносил его за один день туда, куда обычный человек шёл бы целый месяц. А джинны строили для него высокие здания, добывали для него жемчуг со дна моря, делали то, что не могут сделать обычные люди.",
          "Однажды Сулейман со своим войском шёл по долине муравьёв. И вдруг одна муравьиха закричала своим: «О муравьи! Войдите в свои жилища, чтобы Сулейман и его войско не растоптали вас, не замечая!» Сулейман услышал её — потому что Аллах дал ему понимать язык животных. И он улыбнулся её словам и сказал: «Господи! Сделай так, чтобы я благодарил Тебя за милость, которой Ты одарил меня и моих родителей».",
          "В другой раз Сулейман собрал всех своих птиц, но не увидел удода. Он спросил: «Где удод? Если он не вернётся с уважительной причиной, я накажу его». И через некоторое время удод прилетел и сказал: «Я узнал то, чего ты не знал. Я прилетел из Сабы. Там правит женщина по имени Билькыс. У неё великий трон. Но она и её народ поклоняются солнцу, а не Аллаху».",
          "Сулейман не стал нападать. Он написал Билькыс письмо и пригласил её к истине. Билькыс долго думала — и сама приехала к Сулейману. Когда она увидела его царство, его мудрость, его доброту — она поняла, что Сулейман не обычный царь. И когда она увидела, как Сулейман поклоняется только Аллаху и не гордится своим царством, — её сердце повернулось. Она сказала: «Я предалась с Сулейманом Аллаху, Господу миров».",
          "Сулейман знал, что всё его царство — от Аллаха. Он не сказал: «Это моё». Он сказал: «Это милость моего Господа, чтобы испытать меня — буду ли я благодарен или нет». Это очень трудно: иметь так много и не гордиться. Сулейман справлялся с этим, потому что его сердце было занято Аллахом, а не вещами.",
          "В конце жизни Сулейман умер, опираясь на свой посох, и стоял так долго, что джинны, которые работали внизу, не заметили его смерти. Они продолжали работать, думая, что царь смотрит на них. Только когда посох сломался — Сулейман упал, и джинны поняли. Это знак для всех нас: даже самые великие из людей — смертны. Останется только то, что мы сделали ради Аллаха.",
        ],
        lesson:
          "Урок: иметь много — это испытание не меньше, чем не иметь ничего. Сулейман имел всё — и помнил Аллаха в каждом подарке. Это и есть настоящее богатство.",
        sources: [
          "Коран 27:15-44 (мудрость Сулеймана, муравьи, удод, Билькыс)",
          "Коран 38:30-40 (царство, ветер, благодарность Сулеймана)",
          "Коран 34:12-14 (служба джиннов, смерть Сулеймана)",
          "Ибн Касир, «Кисас аль-Анбия», главы о Дауде и Сулеймане",
        ],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    slug: "isa",
    nameAr: "عِيسَى",
    suffix: "عليه السلام",
    readingMin: 7,
    byLocale: {
      tg: {
        name: "Исо",
        theme: "як калимаи Аллоҳ",
        paragraphs: [
          "Замоне духтаре бисёр пок ва тарсонда зиндагӣ мекард. Номаш Марьям, духтари Имрон буд. Аз кӯдакӣ ба хидмати Аллоҳ бахшида шуда буд ва дар маъбад зери сарпарастии пайғамбар Закариё зиндагӣ мекард. Ҳар бор ки Закариё ба назди ӯ меомад, дар канораш хӯроке меёфт, ки бо роҳе пайдо шуда буд, ки наметавонист бифаҳмад. Мепурсид: «Ин аз куҷост, Марьям?» Марьям ҷавоб медод: «Аз ҷониби Аллоҳ. Аллоҳ ба ҳар кӣ хоҳад, бе ҳисоб рӯзӣ медиҳад».",
          "Як рӯз ба назди Марьям фариштае омад — Ҷабраил (алайҳис-салом) буд. Хабаре овард, ки дилашро ба ларза овард. Фаришта гуфт: «Аллоҳ ба ту муждаи калимае аз сӯи Худро медиҳад; номаш Масеҳ, Исо писари Марьям аст». Марьям бо ҳайрат гуфт: «Чи гуна ман фарзанд хоҳам дошт, дар ҳоле ки ҳеҷ мард ба ман нарасидааст?» Фаришта ҷавоб дод: «Чунин Аллоҳ ҳар чи бихоҳад меофарад. Чун ба коре ҳукм кунад, ба он мегӯяд: «Бош» — ва мешавад».",
          "Ин муъҷизаи бузургест. Агар Аллоҳ Одамро бе падару модар — танҳо аз хок — офарид, чаро натавонад Исоро бе падар биофарад? Барои Аллоҳ ҳеҷ чиз сангин нест. Исо «писари Худо» нест, ҳамчун баъзеҳо мепиндоранд. Исо бандаи Аллоҳ аст, инсонест ҳамчун дигар пайғамбарон. Аллоҳ танҳо ӯро ба тарзи махсус офарид, то ба мардум нишон диҳад: Манам Аллоҳ ва бар ҳар чиз тавоно.",
          "Вақте Марьям Исоро ба дунё овард, бо кӯдак ба миёни мардум баргашт. Мардум ӯро муттаҳам сохтанд ва суханҳои зишт гуфтанд. Марьям чизе ҷавоб надод — Аллоҳ ба ӯ фармони хомӯшӣ дода буд. Танҳо ба кӯдак ишора кард. Мардум ҳайрон гуфтанд: «Чи гуна бо кӯдаке дар гаҳвора сухан гӯем?» Он гоҳ Исои бисёр хурдсол, ки ҳанӯз қадам намезад, ба изни Аллоҳ гуфт: «Ман бандаи Аллоҳам. Ӯ ба ман китоб додааст ва маро пайғамбар гардонидааст. Ҳар куҷо бошам, маро муборак сохтааст».",
          "Вақте Исо калон шуд, Аллоҳ ӯро пайғамбари Бани Исроил гардонид. Аллоҳ ба ӯ муъҷизаҳое дод, ки қариб ба ҳеҷ каси дигар надода буд. Исо нобиноёни модарзодро шифо мебахшид. Махтавкаронро шифо медод. Мурдагонро ба изни Аллоҳ зинда мекард. Аз гил пайкари паррандае месохт, ба он медамид ва ба изни Аллоҳ паррандаи зинда мешуд ва парвоз мекард. Ҳеҷ кадоми ин муъҷизаҳо аз худи Исо набуд — ҳама аз ҷониби Аллоҳ буд. Исо ҳамеша ба мардум мегуфт: «Аллоҳро ибодат кунед, Парвардигори ман ва Парвардигори шумо».",
          "Аммо на ҳама имон оварданд. Гурӯҳе аз қавмаш қарор доданд, ки Исоро бикушанд. Барои дастгир кардани ӯ омаданд. Аммо Аллоҳ пайғамбари худро ҳифз кард. Аллоҳ Исоро зинда ба сӯи Худ ба осмон бардошт. Ва он касеро, ки барои дастгирии ӯ омада буд, Аллоҳ ба шакли Исо даровард. Онҳо ӯро гирифтанд ва ба дор кашиданд — ба ин гумон ки Исоро ба дор кашидаанд. Аммо Исо бар салиб намурд. Аллоҳ дар Қуръон ошкоро мефармояд: «Ӯро накуштанд ва ба дор накашиданд, балки барои онҳо мушаббаҳ шуд». Исо назди Парвардигораш зинда аст.",
          "Мо мусулмонон Исоро дӯст медорем. Исо яке аз фиристодагони бузурги Аллоҳ аст. Ӯ аз пайғамбарони улул-азм аст. Мусулмонон бар ин боваранд, ки дар охирзамон, пеш аз рӯзи қиёмат, Исо ба замин бармегардад — ҳокими одиле ки бар тамоми замин ҳақ ва ибодати Аллоҳи ягонаро барқарор хоҳад сохт. Аз ин рӯ, ҳар гоҳ Исоро ёд мекунем, мегӯем: «алайҳис-салом» — салом бар ӯ бод.",
        ],
        lesson:
          "Дарс: Аллоҳро кофист, ки бигӯяд «Бош» ва чизе пайдо мешавад. Исо Худо нест, балки бандаи бузурги Аллоҳ аст. Мо ӯро дӯст медорем ва бозгашташро интизорем.",
        sources: [
          "Қуръон 3:42-59 (мужда ба Марьям, зодрӯзи Исо ва пайғамбариаш)",
          "Қуръон 19:16-36 (Марьям, зодрӯз ва сухани кӯдак)",
          "Қуръон 5:110-118 (муъҷизаҳои Исо ва шаҳодаташ дар рӯзи қиёмат)",
          "Қуръон 4:157-158 (Аллоҳ нагузошт Исоро бикушанд, ӯро ба сӯи Худ бардошт)",
          "Саҳеҳи Бухорӣ 3448 / Саҳеҳи Муслим 155 (бозгашти Исо)",
          "Ибни Касир, Қисас ул-Анбиё, боби Исо ибни Марьям алайҳис-салом",
        ],
      },
      uz: {
        name: "Iso",
        theme: "Allohning bir kalimasi",
        paragraphs: [
          "Bir vaqtlar juda pok va Allohdan qo'rqadigan qiz yashardi. Uning ismi Maryam, Imronning qizi edi. Bolaligidan Allohga xizmatga bag'ishlangan bo'lib, payg'ambar Zakariyoning g'amxo'rligida ibodatxonada yashardi. Zakariyo har gal uning oldiga kelganda, yonida tushuntirib bo'lmaydigan tarzda paydo bo'lgan ovqatni topib turardi. \"Bu qayerdan keldi, Maryam?\" — der edi. Maryam: \"Bu Allohdan. Alloh xohlagan kishisiga hisobsiz rizq beradi\", — deb javob berardi.",
          "Bir kuni Maryamning oldiga farishta keldi — bu Jabroil alayhissalom edi. U Maryamning yuragini titratgan xabar olib keldi. Farishta: \"Alloh senga O'zidan bir kalimaning xushxabarini bermoqda; uning ismi Masih, Maryamning o'g'li Iso\", — dedi. Maryam hayrat bilan: \"Menda qanday farzand bo'lardi, hech bir erkak menga tegmagan bo'lsa?\" — dedi. Farishta: \"Alloh shu tariqa xohlaganini yaratadi. U bir ishni hukm qilsa, faqat unga: 'Bo'l' — deydi, va u bo'ladi\", — deb javob berdi.",
          "Bu buyuk mo'jiza. Agar Alloh Odamni ota-onasiz — faqat tuproqdan — yaratgan bo'lsa, Isoni otasiz yarata olmasmidi? Alloh uchun hech narsa qiyin emas. Iso ba'zilar o'ylagandek \"Xudoning o'g'li\" emas. Iso Allohning bandasi, boshqa payg'ambarlar kabi insondir. Alloh uni odamlarga: \"Men Allohman va hamma narsaga qodirman\", deyish uchun shunchaki maxsus tarzda yaratdi.",
          "Maryam Isoni dunyoga keltirganda, chaqaloq bilan odamlarga qaytdi. Odamlar uni ayblay boshladilar, xunuk gaplar ayta boshladilar. Maryam hech narsa demadi — Alloh unga jim turishni amr qilgan edi. U faqat chaqaloqqa ishora qildi. Odamlar: \"Beshikdagi chaqaloq bilan qanday gaplashamiz?\" — deb hayron bo'lishdi. Shunda hali yura olmaydigan, juda kichkina Iso Allohning iznidan gapirdi: \"Men Allohning bandasiman. U menga Kitob bergan va meni payg'ambar qilgan. Qaerda bo'lsam, meni baraka qilgan\".",
          "Iso ulg'aygach, Alloh uni Bani Isroilning payg'ambari qildi. Alloh unga deyarli hech kimga bermagan mo'jizalarni berdi. Iso ko'rsiz tug'ilganlarni davolardi. Moxovlilarni davolardi. O'lganlarni Allohning izni bilan tiriltirar edi. Loydan qush shaklini yasab, unga puflar, va Allohning izni bilan u tirik qushga aylanib uchib ketardi. Bu mo'jizalarning birortasi Isoning o'zidan emas edi — hammasi Allohdan edi. Iso doim odamlarga: \"Mening Rabbim va sizning Rabbingiz bo'lgan Allohga ibodat qiling\", — deb aytardi.",
          "Lekin hamma iymon keltirmadi. Qavmidan ba'zilari Isoni o'ldirmoqchi bo'ldilar. Uni qo'lga olgani keldilar. Lekin Alloh O'z payg'ambarini himoya qildi. Alloh Isoni tirik holida O'ziga, osmonga ko'tardi. Uni qo'lga olishga kelgan kishini esa Alloh Isoga o'xshatib qo'ydi. Kelganlar o'sha odamni tutib, xochga mixladilar — Isoni xochga mixladik deb o'ylab. Lekin Iso xochda o'lmadi. Alloh Qur'onda ochiq aytadi: \"Ular uni o'ldirmadilar ham, xochga mixlamadilar ham, balki ularga shunday tuyuldi\". Iso Rabbi huzurida tirikdir.",
          "Biz musulmonlar Isoni sevamiz. Iso Allohning ulug' elchilaridan biridir. U Ulul-Azm payg'ambarlardan. Musulmonlar Iso oxir zamonda, qiyomatdan oldin, yer yuziga qaytib kelishiga — butun yer yuzida haqqa va yagona Allohga ibodatga adolatli rahbarlik qiladigan hokim sifatida — ishonadilar. Shuning uchun, Isoni eslagan har gal: \"alayhissalom\" — unga salom bo'lsin — deymiz.",
        ],
        lesson:
          "Saboq: Allohga \"Bo'l\" deyish kifoya — va narsa paydo bo'ladi. Iso Xudo emas, balki Allohning ulug' bandasi. Biz uni sevamiz va qaytib kelishini kutamiz.",
        sources: [
          "Qur'on 3:42-59 (Maryamga xushxabar, Isoning tug'ilishi, uning payg'ambarligi)",
          "Qur'on 19:16-36 (Maryam, tug'ilish, chaqaloqning nutqi)",
          "Qur'on 5:110-118 (Isoning mo'jizalari va qiyomatdagi guvohligi)",
          "Qur'on 4:157-158 (Alloh Isoni o'ldirishlariga yo'l qo'ymadi, uni O'ziga ko'tardi)",
          "Sahihul Buxoriy 3448 / Sahihul Muslim 155 (Isoning qaytishi)",
          "Ibn Kasir, Qisasul Anbiyo, Iso ibn Maryam alayhissalom bobi",
        ],
      },
      en: {
        name: "Isa",
        theme: "a word from Allah",
        paragraphs: [
          "There once lived a very pure, very God-conscious young woman. Her name was Maryam, the daughter of Imran. From childhood she was dedicated to the worship of Allah and lived in the sanctuary under the care of the Prophet Zakariyya. Every time Zakariyya came to her, he found food beside her that had appeared by a means he could not explain. He asked, \"Where is this from, Maryam?\" She answered, \"It is from Allah. Allah provides for whom He wills without measure.\"",
          "One day an angel came to Maryam — it was Jibril (peace be upon him). He brought her news that made her heart tremble. The angel said, \"Allah gives you good news of a word from Him. His name is the Masih, Isa son of Maryam.\" Maryam asked in wonder, \"How can I have a child when no man has touched me?\" The angel replied, \"So does Allah create whatever He wills. When He decrees a matter, He only says to it, 'Be,' and it is.\"",
          "This is a tremendous miracle. If Allah created Adam without father or mother — from clay alone — why could He not create Isa without a father? Nothing is difficult for Allah. Isa is not \"a son of God\" as some imagine. Isa is a servant of Allah, a human being like every prophet. Allah simply created him in a special way to show people: I am Allah, and I am able to do all things.",
          "When Maryam gave birth to Isa, she returned to her people with the baby in her arms. People began to accuse her, to say ugly things. Maryam said nothing back to them — Allah had commanded her silence. She only pointed at the infant. The people exclaimed, \"How can we speak to a baby in a cradle?\" And then Isa — still tiny, still unable to walk — spoke by Allah's permission. He said, \"I am the servant of Allah. He has given me the Scripture and made me a prophet. He has made me blessed wherever I may be.\"",
          "When Isa grew up, Allah made him a prophet to the Children of Israel. And Allah gave him miracles such as He gave to almost no one else. Isa healed those born blind. He healed lepers. He brought the dead back to life — but only by Allah's permission. He shaped a bird out of clay, breathed on it, and it became a living bird and flew away. None of these miracles came from Isa himself; they all came from Allah. And Isa always told the people, \"Worship Allah, my Lord and your Lord.\"",
          "But not everyone believed. Some of his people decided to kill Isa. They came to arrest him. But Allah protected His prophet. Allah raised Isa to Himself — alive, into the heavens. And the man who came to arrest him, Allah made him resemble Isa. Those who came seized that man and crucified him — thinking they had crucified Isa. But Isa did not die on the cross. Allah states clearly in the Qur'an: \"They did not kill him nor did they crucify him; but it only appeared so to them.\" Isa is alive with his Lord.",
          "We Muslims love Isa. Isa is one of the great messengers of Allah. He is one of the Ulul Azm, the messengers of firm resolve. And Muslims believe that at the end of times, Isa will return to the earth, before the Day of Judgement, as a just leader who will establish truth and the worship of Allah alone over the whole earth. That is why, whenever we mention Isa, we say, \"alayhi as-salam\" — peace be upon him.",
        ],
        lesson:
          "Lesson: for Allah it is enough to say \"Be,\" and a thing comes into being. Isa is not God — he is a great servant of Allah. We love him and we await his return.",
        sources: [
          "Quran 3:42-59 (good news to Maryam, the birth of Isa, his prophethood)",
          "Quran 19:16-36 (Maryam, the birth, and the speech of the infant)",
          "Quran 5:110-118 (the miracles of Isa and his testimony on the Day of Judgement)",
          "Quran 4:157-158 (Allah did not allow them to kill Isa; He raised him to Himself)",
          "Sahih al-Bukhari 3448 / Sahih Muslim 155 (the return of Isa)",
          "Ibn Kathir, Qisas al-Anbiya, chapter on Isa ibn Maryam",
        ],
      },
      fa: {
        name: "عیسی",
        theme: "کلمه‌ای از سوی الله",
        paragraphs: [
          "روزگاری دختری بسیار پاک و خداترس می‌زیست. نام او مریم، دختر عمران بود. از کودکی به خدمت خداوند پیشکش شده بود و در محرابی زیر سرپرستی حضرت زکریا زندگی می‌کرد. هر بار که زکریا نزد او می‌آمد، در کنار او خوراکی می‌یافت که از راهی شگفت پدید آمده بود. می‌پرسید: «این از کجاست، مریم؟» مریم پاسخ می‌داد: «از سوی خداست. خداوند به هر که بخواهد، بی‌حساب روزی می‌دهد.»",
          "روزی فرشته‌ای بر مریم نازل شد ـ جبرئیل علیه‌السلام بود. خبری آورد که دل مریم را به لرزه افکند. فرشته گفت: «خداوند به تو مژده‌ی کلمه‌ای از سوی خود را می‌دهد؛ نام او مسیح، عیسی پسر مریم است.» مریم با شگفتی گفت: «چگونه فرزندی خواهم داشت در حالی که هیچ مردی به من دست نزده است؟» فرشته پاسخ داد: «این‌گونه خداوند آنچه را بخواهد می‌آفریند. هرگاه به کاری حکم کند، تنها به آن می‌گوید: باش! و می‌شود.»",
          "این معجزه‌ای بزرگ است. اگر خداوند آدم را بی پدر و بی مادر ـ تنها از خاک ـ آفرید، چرا نتواند عیسی را بی‌پدر بیافریند؟ هیچ‌چیز بر خداوند دشوار نیست. عیسی «پسر خدا» نیست، چنان‌که برخی می‌پندارند. عیسی بنده‌ی خداست، انسانی مانند دیگر پیامبران. خداوند تنها او را به گونه‌ای ویژه آفرید تا به مردم بنمایاند: من اللّهم و بر همه چیز توانا.",
          "آنگاه که مریم عیسی را به دنیا آورد، با کودک به میان مردم بازگشت. مردم به او تهمت زدند و سخنان زشت گفتند. مریم چیزی پاسخ نگفت ـ خداوند به او فرمان سکوت داده بود. تنها به کودک اشاره کرد. مردم شگفت‌زده گفتند: «چگونه با کودکی در گهواره سخن بگوییم؟» آنگاه عیسیِ بسیار کوچک، که هنوز راه نمی‌رفت، به اذن الهی سخن گفت: «من بنده‌ی خدایم. او به من کتاب داده و مرا پیامبر گردانده است. هر جا که باشم، مرا مبارک ساخته است.»",
          "وقتی عیسی بزرگ شد، خداوند او را پیامبر بنی‌اسرائیل قرار داد. خداوند به او معجزاتی بخشید که به کسی دیگر چنین نداده بود. عیسی نابینایان مادرزاد را شفا می‌داد. جذامیان را شفا می‌داد. مردگان را به اذن خدا زنده می‌کرد. از گِل پیکره‌ی پرنده‌ای می‌ساخت، در آن می‌دمید و به اذن خدا پرنده‌ای زنده می‌شد و پرواز می‌کرد. هیچ‌یک از این معجزات از خود عیسی نبود؛ همگی از سوی خدا بود. عیسی همواره به مردم می‌گفت: «الله را بپرستید، پروردگار من و پروردگار شما.»",
          "اما همه ایمان نیاوردند. گروهی از قومش بر آن شدند که عیسی را بکشند. برای دستگیر کردن او آمدند. اما خداوند پیامبر خویش را پاس داشت. خداوند عیسی را زنده به سوی خود بالا برد. و آن کس را که برای دستگیری‌اش آمده بود، خداوند به شکل عیسی درآورد. آنان او را گرفتند و به دار آویختند، به این پندار که عیسی را به دار کشیده‌اند. اما عیسی بر صلیب کشته نشد. خداوند در قرآن آشکارا می‌فرماید: «او را نکشتند و به صلیب نکشیدند، بلکه امر بر آنان مشتبه شد.» عیسی نزد پروردگار خویش زنده است.",
          "ما مسلمانان عیسی را دوست می‌داریم. عیسی یکی از فرستادگان بزرگ خداست. او از پیامبران اولوالعزم است. مسلمانان بر این باورند که در آخر زمان، پیش از روز قیامت، عیسی به زمین بازخواهد گشت ـ پیشوایی عادل که بر سراسر زمین، حقیقت و پرستش الله یکتا را برقرار خواهد ساخت. از این رو، هرگاه از عیسی یاد می‌کنیم، می‌گوییم: «علیه السلام» ـ درود بر او باد.",
        ],
        lesson:
          "درس: خداوند را کافی است که بفرماید «باش» تا چیزی پدید آید. عیسی خدا نیست؛ بنده‌ی بزرگ خداست. ما او را دوست می‌داریم و بازگشتش را چشم به راهیم.",
        sources: [
          "قرآن ۳:۴۲-۵۹ (بشارت به مریم، تولد عیسی و نبوت او)",
          "قرآن ۱۹:۱۶-۳۶ (مریم، تولد و سخن گفتن کودک)",
          "قرآن ۵:۱۱۰-۱۱۸ (معجزات عیسی و گواهی او در روز قیامت)",
          "قرآن ۴:۱۵۷-۱۵۸ (الله اجازه نداد عیسی کشته شود و او را به سوی خود بالا برد)",
          "صحیح بخاری ۳۴۴۸ / صحیح مسلم ۱۵۵ (بازگشت عیسی)",
          "ابن کثیر، قصص الانبیاء، باب عیسی بن مریم علیه‌السلام",
        ],
      },
      ru: {
        name: "Иса",
        theme: "одно слово Аллаха",
        paragraphs: [
          "Жила однажды очень чистая, очень богобоязненная девушка. Её звали Марьям, дочь Имрана. С детства она была посвящена служению Аллаху и жила в храме под опекой пророка Закарии. Каждый раз, когда Закария приходил к ней, он находил у неё еду, которая появлялась чудесным образом. Он спрашивал: «Откуда это, Марьям?» Она отвечала: «Это от Аллаха. Аллах даёт пропитание, кому пожелает, без счёта».",
          "Однажды к Марьям явился ангел — это был Джибриль (мир ему). Он принёс ей весть, от которой её сердце задрожало. Ангел сказал: «Аллах даёт тебе радостную весть о слове от Него. Имя его — Масих, Иса, сын Марьям». Марьям удивилась: «Как у меня будет ребёнок, если ко мне не прикасался ни один мужчина?» Ангел ответил: «Так Аллах творит, что пожелает. Когда Он решает дело, Он только говорит ему: будь — и оно становится».",
          "Это великое чудо. Если Аллах создал Адама без отца и матери — из земли, — то почему бы Ему не создать Ису без отца? Для Аллаха нет ничего трудного. Иса — не «сын Бога», как думают некоторые. Иса — раб Аллаха, такой же человек, как все пророки. Просто Аллах создал его особым образом, чтобы показать людям: Я — Аллах, и Я могу всё.",
          "Когда Марьям родила Ису, она вернулась к людям с младенцем на руках. Люди стали обвинять её, говорить нехорошие вещи. Марьям ничего им не отвечала — Аллах велел ей молчать. Она только указала на младенца. Люди удивились: «Как мы будем говорить с младенцем в колыбели?» И тогда Иса — совсем маленький, ещё не умеющий ходить, — заговорил по воле Аллаха. Он сказал: «Я — раб Аллаха. Он дал мне Писание и сделал меня пророком. Он сделал меня благословенным, где бы я ни был».",
          "Когда Иса вырос, Аллах сделал его пророком к сынам Исраиля. И Аллах дал ему чудеса, какие не давал почти никому. Иса исцелял слепых от рождения. Исцелял прокажённых. Воскрешал мёртвых — но только с дозволения Аллаха. Он делал из глины фигурку птицы, дул на неё — и она становилась живой птицей и улетала. Все эти чудеса — не от самого Исы. Все они — от Аллаха. И Иса всегда говорил людям: «Поклоняйтесь Аллаху, моему Господу и вашему Господу».",
          "Но люди не все поверили. Некоторые из его народа решили убить Ису. Они пришли арестовать его. Но Аллах защитил Своего пророка. Аллах поднял Ису к Себе — живым, на небо. А того, кто пришёл его арестовать, Аллах сделал похожим на Ису. И те, кто пришёл, схватили этого человека и распяли — думая, что распяли Ису. Но Иса не умер на кресте. Аллах в Коране ясно говорит: «Они не убили его и не распяли, но это лишь показалось им». Иса жив у своего Господа.",
          "Мы, мусульмане, любим Ису. Иса — один из великих пророков Аллаха. Он — один из «улюль-азм», пророков с твёрдой решимостью. И мусульмане верят, что в конце времён Иса снова придёт на землю, перед Судным днём — придёт справедливым правителем, чтобы установить истину и поклонение одному Аллаху на всей земле. Поэтому, когда мы вспоминаем Ису, мы говорим: «Алейхи-с-салям» — мир ему.",
        ],
        lesson:
          "Урок: Аллаху достаточно сказать «Будь» — и всё становится. Иса — не Бог, а великий раб Аллаха. Мы любим его и ждём его возвращения.",
        sources: [
          "Коран 3:42-59 (благовестие Марьям, рождение Исы, его пророчество)",
          "Коран 19:16-36 (Марьям, рождение, речь младенца)",
          "Коран 5:110-118 (чудеса Исы и его свидетельство в Судный день)",
          "Коран 4:157-158 (Аллах не дал убить Ису, а вознёс к Себе)",
          "Сахих аль-Бухари 3448 / Сахих Муслим 155 (хадис о возвращении Исы)",
          "Ибн Касир, «Кисас аль-Анбия», глава «Хабар об Исе ибн Марьям»",
        ],
      },
    },
  },
];

export function findProphetStory(slug: string): ProphetStory | undefined {
  return PROPHET_STORIES.find((s) => s.slug === slug);
}

export function prophetStorySlugs(): string[] {
  return PROPHET_STORIES.map((s) => s.slug);
}

/**
 * Returns the next prophet in the array (wraps around to the first).
 * Used by the "Next prophet →" CTA at the bottom of each story page.
 */
export function nextProphetStory(slug: string): ProphetStory {
  const idx = PROPHET_STORIES.findIndex((s) => s.slug === slug);
  if (idx === -1) return PROPHET_STORIES[0];
  return PROPHET_STORIES[(idx + 1) % PROPHET_STORIES.length];
}
