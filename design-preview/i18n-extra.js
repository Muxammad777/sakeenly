/**
 * Sakeenly — additional translations for the 7 original design pages.
 *
 * The originals (index/reader/listen/kids/pricing/privacy/ayat-dlya-trevogi)
 * each carry their own inline DICT, but body content is only partially tagged
 * with [data-i18n]. This file:
 *   1. Extends window.SakeenlyI18n.DICT with the missing translation keys.
 *   2. Per-page taggers add [data-i18n] attributes to the right DOM nodes.
 *   3. Re-applies translations on init and on every langchange event.
 *
 * Loaded as <script> right before </body> on each original; non-intrusive —
 * does not change the visual design, only enriches translation coverage.
 */

(function () {
  // URL override — write ?_lang= to localStorage ONCE, then strip from URL via
  // history.replaceState so user's subsequent dropdown picks don't get
  // clobbered on page reload (that was the "language switches itself" bug).
  try {
    const m = location.search.match(/[?&]_lang=([a-z]{2})/);
    if (m) {
      localStorage.setItem('sakeenly:lang', m[1]);
      const cleanSearch = location.search.replace(/[?&]_lang=[a-z]{2}/, '').replace(/^&/, '?').replace(/^\?$/, '');
      history.replaceState(null, '', location.pathname + cleanSearch + location.hash);
    }
  } catch (e) {}

  if (!window.SakeenlyI18n) return; // safety: only run where originals' i18n loaded

  // ─── EXTRA DICT (each key → 5 langs) ─────────────────────────────────
  const E = {};
  const add = (k, ru, tg, uz, kk, ky) => { E[k] = { ru, tg, uz, kk, ky }; };

  // FOOTER — override originals' inline DICT with more native KY/KK words.
  add('foot.product', 'Продукт',  'Маҳсулот',  'Mahsulot',  'Өнім',     'Кызматтар');
  add('foot.company', 'Компания', 'Ширкат',    'Kompaniya', 'Мекеме',   'Мекеме');
  add('foot.help',    'Помощь',   'Кӯмак',     'Yordam',    'Көмек',    'Жардам');

  // PRICING — hero lede paragraph (after h1)
  add('pr.lede',
      'Бесплатный план даёт всё необходимое для ежедневного чтения. Premium открывает безлимит ИИ-вопросов и темы. Family — до шести человек в одной семье. Без рекламы. Никогда.',
      'Нақшаи ройгон ҳамаи лозимаро барои хониши ҳаррӯза медиҳад. Premium саволҳои бемаҳдуди AI ва мавзӯъҳоро мекушояд. Family — то шаш нафар дар як оила. Бе реклама. Ҳаргиз.',
      'Bepul reja kunlik oʻqish uchun barchasini beradi. Premium cheksiz AI savollar va mavzularni ochadi. Family — bitta oilada olti kishigacha. Reklamasiz. Hech qachon.',
      'Тегін жоспар күнделікті оқу үшін бәрін береді. Premium шексіз AI сұрақтар мен тақырыптарды ашады. Family — бір отбасында алты адамға дейін. Жарнамасыз. Ешқашан.',
      'Бекер план күн сайын окуу үчүн баарын берет. Premium чексиз AI суроолор жана темаларды ачат. Family — бир үй-бүлөдө алты адамга чейин. Жарнамасыз. Эч качан.');

  // PRICING — plan cards
  add('pr.p1.name', 'Свободный', 'Озод', 'Bepul', 'Тегін', 'Бекер');
  add('pr.p1.sub', 'Всё, что нужно для ежедневного чтения. Никаких ограничений на сам Коран.',
                   'Ҳама чизе, ки барои хониши ҳаррӯза лозим аст. Бе маҳдудият бар худи Қуръон.',
                   'Kunlik oʻqish uchun kerakli hamma narsa. Qurʼonning oʻziga hech qanday cheklov yoʻq.',
                   'Күнделікті оқу үшін керектінің бәрі. Құранның өзіне ешқандай шектеу жоқ.',
                   'Күн сайын окуу үчүн керектүү бардыгы. Курандын өзүнө эч кандай чектөө жок.');
  add('pr.p1.per', '/ навсегда', '/ ҳамеша', '/ abadiy', '/ мәңгілік', '/ түбөлүк');
  add('pr.p1.hint', 'Без карты. Без срока.', 'Бе корт. Бе муҳлат.', 'Kartasiz. Muddatsiz.', 'Картасыз. Мерзімсіз.', 'Картасыз. Мөөнөтсүз.');
  add('pr.p1.cta', 'Уже подключён', 'Аллакай пайваст', 'Allaqachon ulanган', 'Қазірден қосылған', 'Эмиле байланышкан');
  add('pr.p1.lbl', 'Включено', 'Шомил аст', 'Kiritilgan', 'Кіреді', 'Камтылган');
  add('pr.p1.f1', 'Все 114 сур · 5 переводов · KFGQPC Hafs', 'Ҳама 114 сура · 5 тарҷума · KFGQPC Hafs', 'Barcha 114 sura · 5 tarjima · KFGQPC Hafs', 'Барлық 114 сүре · 5 аударма · KFGQPC Hafs', 'Бардык 114 сүрө · 5 котормо · KFGQPC Hafs');
  add('pr.p1.f2', '30 чтецов · аудио на каждый аят', '30 қорӣ · овоз барои ҳар оят', '30 qori · har oyatga audio', '30 қари · әр аятқа аудио', '30 кары · ар аятка үн');
  add('pr.p1.f3', 'Закладки и заметки · без лимита', 'Нишонаҳо ва ёддоштҳо · бе маҳдудият', 'Xatchoʻp va eslatma · cheklovsiz', 'Бетбелгілер мен жазбалар · шектеусіз', 'Кыстармалар жана эскертүүлөр · чектөөсүз');
  add('pr.p1.f4', 'ИИ-вопросы · 5 в день', 'Саволҳои AI · 5 дар рӯз', 'AI savollar · kuniga 5 ta', 'AI сұрақтар · күніне 5', 'AI суроолор · күнүнө 5');
  add('pr.p1.f5', 'Темы Light, Dark, Sepia', 'Мавзӯъҳои Light, Dark, Sepia', 'Light, Dark, Sepia mavzulari', 'Light, Dark, Sepia тақырыптары', 'Light, Dark, Sepia темалары');
  add('pr.p1.f6', 'Тема Mushaf-paper', 'Мавзӯи Mushaf-paper', 'Mushaf-paper mavzu', 'Mushaf-paper тақырыбы', 'Mushaf-paper темасы');
  add('pr.p1.f7', 'Безлимитные ИИ-вопросы', 'Саволҳои бемаҳдуди AI', 'Cheksiz AI savollar', 'Шексіз AI сұрақтар', 'Чексиз AI суроолор');

  // Premium plan
  add('pr.popular', 'ПОПУЛЯРНЫЙ', 'МАШҲУР', 'OMMABOP', 'ТАНЫМАЛ', 'ПОПУЛЯРДУУ');
  add('pr.p2.sub', 'Для тех, кто читает каждый день и задаёт вопросы Книге.',
                   'Барои онҳое, ки ҳар рӯз мехонанд ва ба Китоб савол медиҳанд.',
                   'Har kuni oʻqib, Kitobga savol beradiganlar uchun.',
                   'Күн сайын оқып, Кітапқа сұрақ қоятындар үшін.',
                   'Күн сайын окуп, Китепке суроо берген адамдар үчүн.');
  add('pr.p2.per', '/ мес', '/ моҳ', '/ oyiga', '/ айына', '/ айына');
  add('pr.p2.hint', '$59.88 в год при помесячной оплате', '$59.88 дар сол ҳангоми пардохти моҳона', 'Oylik toʻlovda yiliga $59.88', 'Ай сайын төлемде жылына $59.88', 'Ай сайын төлөмдө жылына $59.88');
  add('pr.p2.cta', 'Подключить Premium', 'Пайваст шудан ба Premium', 'Premiumga ulanish', 'Premium қосылу', 'Premiumга кошулуу');
  add('pr.p2.lbl', 'Всё из Свободного, плюс', 'Ҳамаи Озод, илова', 'Bepuldan hammasi, qoʻshimcha', 'Тегіннен барлығы, плюс', 'Бекерден бардыгы, плюс');
  add('pr.p2.f1', 'Безлимит ИИ-вопросов · с RAG и citations', 'Саволҳои бемаҳдуди AI · бо RAG ва иқтибос', 'Cheksiz AI savollar · RAG va iqtiboslar bilan', 'Шексіз AI сұрақтар · RAG және дәйексөздермен', 'Чексиз AI суроолор · RAG жана цитаталар менен');
  add('pr.p2.f2', 'Все темы, включая Mushaf-paper', 'Ҳама мавзӯъ, аз ҷумла Mushaf-paper', 'Barcha mavzu, jumladan Mushaf-paper', 'Барлық тақырып, Mushaf-paper қоса', 'Бардык тема, Mushaf-paper кошо');
  add('pr.p2.f3', 'Расширенные тафсиры (Ибн Касир, Куртуби)', 'Тафсирҳои васеъ (Ибни Касир, Қуртубӣ)', 'Kengaytirilgan tafsirlar (Ibn Kasir, Qurtubiy)', 'Кеңейтілген тәпсірлер (Ибн Касир, Қуртуби)', 'Кеңейтилген тафсирлер (Ибн Касир, Куртуби)');
  add('pr.p2.f4', 'Офлайн-режим: 10 сур', 'Реҷаи офлайн: 10 сура', 'Oflayn rejim: 10 sura', 'Офлайн режим: 10 сүре', 'Оффлайн режим: 10 сүрө');
  add('pr.p2.f5', 'Sleep-таймер, скорость 0.5×–2×', 'Sleep-таймер, суръат 0.5×–2×', 'Sleep-taymer, tezlik 0.5×–2×', 'Sleep-таймер, жылдамдық 0.5×–2×', 'Sleep-таймер, ылдамдык 0.5×–2×');
  add('pr.p2.f6', 'Приоритетная поддержка', 'Дастгирии бартарӣ', 'Ustuvor qoʻllab-quvvatlash', 'Басым қолдау', 'Артыкчылыктуу колдоо');

  // Family plan
  add('pr.p3.name', 'Семья', 'Оила', 'Oila', 'Отбасы', 'Үй-бүлө');
  add('pr.p3.sub', 'До шести человек, общая библиотека закладок и детский режим.',
                   'То шаш нафар, китобхонаи умумии нишонаҳо ва реҷаи кӯдакон.',
                   'Olti kishigacha, umumiy xatchoʻp kutubxonasi va bolalar rejimi.',
                   'Алты адамға дейін, ортақ бетбелгілер мен балалар режимі.',
                   'Алты адамга чейин, жалпы кыстармалар жана балдар режими.');
  add('pr.p3.per', '/ мес', '/ моҳ', '/ oyiga', '/ айына', '/ айына');
  add('pr.p3.hint', 'Один аккаунт — шесть людей', 'Як account — шаш нафар', 'Bitta akkaunt — olti kishi', 'Бір аккаунт — алты адам', 'Бир аккаунт — алты адам');
  add('pr.p3.cta', 'Подключить Семейный', 'Пайвасти оилавӣ', 'Oilaga ulanish', 'Отбасылықты қосу', 'Үй-бүлөлүктү кошуу');
  add('pr.p3.lbl', 'Всё из Premium, плюс', 'Ҳамаи Premium, илова', 'Premiumdan hammasi, qoʻshimcha', 'Premium-нен барлығы, плюс', 'Premiumден бардыгы, плюс');
  add('pr.p3.f1', 'До 6 аккаунтов в семье', 'То 6 account дар оила', 'Oilada 6 ta akkauntgacha', 'Отбасында 6 аккаунтқа дейін', 'Үй-бүлөдө 6 аккаунтка чейин');
  add('pr.p3.f2', 'Детский режим: Икра, первые суры, истории пророков', 'Реҷаи кӯдакон: Иқра, сураҳои аввал, достонҳои пайғамбарон', 'Bolalar rejimi: Iqra, birinchi suralar, paygʻambarlar hikoyalari', 'Балалар режимі: Иқра, алғашқы сүрелер, пайғамбарлар әңгімелері', 'Балдар режими: Иқра, алгачкы сүрөлөр, пайгамбарлар окуялары');
  add('pr.p3.f3', 'Дашборд для родителей · streak ребёнка', 'Дашборд барои волидайн · streak кӯдак', 'Ota-ona dashboard · bolaning streak', 'Ата-аналар dashboard · бала streak', 'Ата-эне dashboard · баланын streak');
  add('pr.p3.f4', 'Общая полка закладок', 'Раффи умумии нишонаҳо', 'Umumiy xatchoʻp javoni', 'Ортақ бетбелгілер сөресі', 'Жалпы кыстармалар текчеси');
  add('pr.p3.f5', 'Офлайн-режим: вся Книга', 'Реҷаи офлайн: ҳамаи Китоб', 'Oflayn rejim: butun Kitob', 'Офлайн режим: бүкіл Кітап', 'Оффлайн режим: бүт Китеп');

  // Pricing comparison: ACTUAL keys from real DOM structure
  add('pr.cmp.h_title', 'Что входит куда', 'Чӣ дар куҷост', 'Nima qayerda', 'Не қайда', 'Эмне кайда');
  add('pr.cmp.h_sub', 'Если хочется детально.', 'Агар ба тафсил хоҳед.', 'Agar batafsil xohlasangiz.', 'Егер егжей-тегжейлі қалаңыз.', 'Эгер кенен билгиңиз келсе.');
  // Table headers (capitalized in CSS, raw lowercase in DOM)
  add('pr.cmp.col1', 'Возможность', 'Имконият', 'Imkoniyat', 'Мүмкіндік', 'Мүмкүнчүлүк');
  add('pr.cmp.col2', 'Свободный', 'Озод', 'Bepul', 'Тегін', 'Бекер');
  add('pr.cmp.col3', 'Premium', 'Premium', 'Premium', 'Premium', 'Premium');
  add('pr.cmp.col4', 'Семья', 'Оила', 'Oila', 'Отбасы', 'Үй-бүлө');
  // Section dividers
  add('pr.cmp.s1', 'Чтение и аудио', 'Хондан ва овоз', 'Oʻqish va audio', 'Оқу және аудио', 'Окуу жана үн');
  add('pr.cmp.s2', 'ИИ-помощник', 'Ёрдамчии AI', 'AI yordamchi', 'AI көмекші', 'AI жардамчы');
  add('pr.cmp.s3', 'Темы и интерфейс', 'Мавзӯъҳо ва интерфейс', 'Mavzular va interfeys', 'Тақырып және интерфейс', 'Темалар жана интерфейс');
  add('pr.cmp.s4', 'Семья и дети', 'Оила ва кӯдакон', 'Oila va bolalar', 'Отбасы және балалар', 'Үй-бүлө жана балдар');
  // Row labels (EXACT texts from DOM)
  add('pr.cmp.row.114', '114 сур · 5 переводов', '114 сура · 5 тарҷума', '114 sura · 5 tarjima', '114 сүре · 5 аударма', '114 сүрө · 5 котормо');
  add('pr.cmp.row.30q', '30 чтецов · аудио на аят', '30 қорӣ · овоз барои оят', '30 qori · oyatga audio', '30 қари · аятқа аудио', '30 кары · аятка үн');
  add('pr.cmp.row.off', 'Офлайн-режим', 'Реҷаи офлайн', 'Oflayn rejim', 'Офлайн режим', 'Оффлайн режим');
  add('pr.cmp.row.sleep', 'Sleep-таймер · скорость 0.5×–2×', 'Sleep-таймер · суръат 0.5×–2×', 'Sleep-taymer · tezlik 0.5×–2×', 'Sleep-таймер · жылдамдық 0.5×–2×', 'Sleep-таймер · ылдамдык 0.5×–2×');
  add('pr.cmp.row.aiq', 'Вопросы с цитатами из Корана/хадисов', 'Саволҳо бо иқтибос аз Қуръон/ҳадис', 'Qurʼon/hadis iqtiboslari bilan savollar', 'Құран/хадис дәйексөздерімен сұрақтар', 'Куран/хадис цитаталары менен суроолор');
  add('pr.cmp.row.tafsir', 'Расширенные тафсиры', 'Тафсирҳои васеъ', 'Kengaytirilgan tafsirlar', 'Кеңейтілген тәпсірлер', 'Кеңейтилген тафсирлер');
  add('pr.cmp.row.lds', 'Light · Dark · Sepia', 'Light · Dark · Sepia', 'Light · Dark · Sepia', 'Light · Dark · Sepia', 'Light · Dark · Sepia');
  add('pr.cmp.row.mushaf', 'Mushaf-paper тема', 'Mushaf-paper мавзӯъ', 'Mushaf-paper mavzu', 'Mushaf-paper тақырып', 'Mushaf-paper тема');
  add('pr.cmp.row.6acc', 'До 6 аккаунтов', 'То 6 account', '6 ta akkauntgacha', '6 аккаунтқа дейін', '6 аккаунтка чейин');
  add('pr.cmp.row.kids', 'Детский режим · Икра · первые суры', 'Реҷаи кӯдакон · Иқра · сураҳои аввал', 'Bolalar rejimi · Iqra · birinchi suralar', 'Балалар режимі · Иқра · алғашқы сүрелер', 'Балдар режими · Иқра · алгачкы сүрөлөр');
  add('pr.cmp.row.dash', 'Дашборд для родителей', 'Дашборд барои волидайн', 'Ota-ona dashboard', 'Ата-аналар dashboard', 'Ата-эне dashboard');
  // Trust tiles at bottom of pricing
  add('pr.trust1.t', '0 рекламы, никогда', '0 реклама, ҳаргиз', '0 reklama, hech qachon', '0 жарнама, ешқашан', '0 жарнама, эч качан');
  add('pr.trust1.p', 'Sakeenly не продаёт твоё внимание. Мы не работаем с рекламными сетями. Никакого Google Ads, Facebook, AdSense.',
                    'Sakeenly диққати шуморо намефурӯшад. Бо шабакаҳои реклама ҳамкорӣ намекунем.',
                    'Sakeenly diqqatingizni sotmaydi. Reklama tarmoqlari bilan ishlamaymiz.',
                    'Sakeenly назарыңды сатпайды. Жарнама желілерімен жұмыс істемейміз.',
                    'Sakeenly көңүлүңдү сатпайт. Жарнама тармактары менен иштебейбиз.');
  add('pr.trust2.t', 'Закладки шифрованы', 'Нишонаҳо рамзгузорӣ шудаанд', 'Xatchoʻplar shifrlangan', 'Бетбелгілер шифрланған', 'Кыстармалар шифрленген');
  add('pr.trust2.p', 'At-rest шифрование. Полный экспорт по запросу. Удаление аккаунта каскадно сносит все данные.',
                    'Рамзгузории дар амонат. Содирот пурра.',
                    'At-rest shifrlash. Toʻliq eksport.',
                    'At-rest шифрлеу. Толық экспорт.',
                    'At-rest шифрлөө. Толук экспорт.');
  add('pr.trust3.t', 'Отмена в один клик', 'Бекор кардан як зер', 'Bir tegishda bekor qilish', 'Бір кликпен тоқтату', 'Бир чыкылдатуу менен токтотуу');
  add('pr.trust3.p', 'В Профиле. Подписка останется активной до конца оплаченного периода — никаких сюрпризов.',
                    'Дар Профил. Обуна то охири давраи пардохт фаъол боқӣ мемонад.',
                    'Profilda. Obuna toʻlangan davrning oxirigacha faol qoladi.',
                    'Профильде. Жазылым төленген кезеңнің соңына дейін белсенді қалады.',
                    'Профилде. Жазылуу төлөнгөн мөөнөттүн аягына чейин активдүү бойдон калат.');

  // FAQ — actual texts in DOM (6 items + heading)
  add('pr.faq.h', 'Частые вопросы', 'Саволҳои зуд-зуд', 'Tez-tez beriladigan savollar', 'Жиі қойылатын сұрақтар', 'Көп берилген суроолор');
  add('pr.faq.q1', 'Действительно ли весь Коран бесплатно?',
                   'Оё ҳақиқатан тамоми Қуръон ройгон аст?',
                   'Haqiqatan ham butun Qurʼon bepulmi?',
                   'Шынында да бүкіл Құран тегін бе?',
                   'Чындыгында бүт Куран бекерби?');
  add('pr.faq.a1', 'Да. Все 114 сур, 5 переводов, 30 чтецов, закладки и заметки — на бесплатном плане навсегда. Книга не должна быть платной. Платным становится только инструментарий: безлимит ИИ-помощника, расширенные тафсиры, офлайн-режим, детский режим.',
                   'Бале. Ҳама 114 сура, 5 тарҷума, 30 қорӣ, нишонаҳо ва ёддоштҳо — ҳамеша ройгон. Китоб набояд пулакӣ бошад. Танҳо абзорҳо пулакианд: AI бемаҳдуд, тафсирҳои васеъ, офлайн, реҷаи кӯдакон.',
                   'Ha. Barcha 114 sura, 5 tarjima, 30 qori, xatchoʻp va eslatma — bepul rejada abadiy. Kitob pullik boʻlmasligi kerak. Faqat asboblar pullik: cheksiz AI, kengaytirilgan tafsirlar, oflayn, bolalar rejimi.',
                   'Иә. Барлық 114 сүре, 5 аударма, 30 қари, бетбелгілер мен жазбалар — тегін жоспарда мәңгі. Кітап ақылы болмауы керек. Тек құралдар ақылы: шексіз AI, кеңейтілген тәпсірлер, офлайн, балалар режимі.',
                   'Ооба. Бардык 114 сүрө, 5 котормо, 30 кары, кыстармалар жана эскертүүлөр — бекер планда түбөлүк. Китеп акылуу болбошу керек. Бир гана аспаптар акылуу: чексиз AI, кеңейтилген тафсирлер, оффлайн, балдар режими.');
  add('pr.faq.q2', 'Почему в платежах нет криптовалют?',
                   'Чаро дар пардохтҳо криптовалют нест?',
                   'Nima uchun toʻlovlarda kripto yoʻq?',
                   'Неліктен төлемдерде криптовалюта жоқ?',
                   'Эмне үчүн төлөмдөрдө крипто жок?');
  add('pr.faq.a2', 'Криптоплатежи на этом рынке несут больше вопросов, чем закрывают. Sakeenly работает только с прозрачными методами: Stripe (Visa/Mastercard/МИР через российские reseller\'ы), Apple Pay, Google Pay.',
                   'Криптопардохтҳо дар ин бозор саволи зиёд эҷод мекунанд. Sakeenly танҳо бо усулҳои шаффоф кор мекунад: Stripe, Apple Pay, Google Pay.',
                   'Kripto toʻlovlar bu bozorda koʻp savollar tugʻdiradi. Sakeenly faqat shaffof usullar bilan ishlaydi: Stripe, Apple Pay, Google Pay.',
                   'Крипто-төлемдер бұл нарықта көп сұрақ туғызады. Sakeenly тек ашық әдістермен жұмыс істейді: Stripe, Apple Pay, Google Pay.',
                   'Крипто-төлөмдөр бул базарда көп суроо жаратат. Sakeenly бир гана ачык ыкмалар менен иштейт: Stripe, Apple Pay, Google Pay.');
  add('pr.faq.q3', 'Что значит «5 ИИ-вопросов в день» на бесплатном плане?',
                   '«5 саволи AI дар рӯз» дар нақшаи ройгон чӣ маънӣ дорад?',
                   'Bepul rejadagi «kuniga 5 ta AI savol» nimani anglatadi?',
                   'Тегін жоспардағы «күніне 5 AI сұрақ» нені білдіреді?',
                   'Бекер планындагы «күнүнө 5 AI суроо» эмнени билдирет?');
  add('pr.faq.a3', 'Каждые 24 часа доступно 5 вопросов в /ask. Лимит сбрасывается в полночь по твоему таймзоне. Чтение, аудио и закладки не лимитированы.',
                   'Ҳар 24 соат 5 савол дар /ask дастрас аст. Лимит дар нисфи шаб бозсозӣ мешавад.',
                   'Har 24 soatda /ask da 5 ta savol mavjud. Limit yarim tunda yangilanadi.',
                   '24 сағат сайын /ask-та 5 сұрақ қолжетімді. Лимит түн ортасында жаңарады.',
                   'Ар 24 саатта /ask-те 5 суроо жеткиликтүү. Лимит түн жарымында жаңырат.');
  add('pr.faq.q4', 'Что с фатва-вопросами?',
                   'Бо саволҳои фатво чӣ?',
                   'Fatvo savollari haqida nima?',
                   'Пәтуа сұрақтары туралы не?',
                   'Фатва суроолору жөнүндө эмне?');
  add('pr.faq.a4', 'ИИ-помощник Sakeenly не отвечает на фатва-вопросы (брак, развод, наследство, медицина, политика, бизнес). Вместо этого мы перенаправляем к учёным: SeekersGuidance, Yaqeen Institute, AMJA. Это сознательное ограничение, не баг.',
                   'Ёрдамчии AI ба саволҳои фатво ҷавоб намедиҳад. Ба уламо равон мекунем: SeekersGuidance, Yaqeen Institute, AMJA.',
                   'AI yordamchi fatvo savollariga javob bermaydi. Ulamolarga yoʻnaltiramiz: SeekersGuidance, Yaqeen Institute, AMJA.',
                   'AI көмекші пәтуа сұрақтарына жауап бермейді. Ғалымдарға жібереміз: SeekersGuidance, Yaqeen Institute, AMJA.',
                   'AI жардамчы фатва суроолоруна жооп бербейт. Аалымдарга багыттайбыз: SeekersGuidance, Yaqeen Institute, AMJA.');
  add('pr.faq.q5', 'Можно ли подарить подписку?',
                   'Оё обунаро ҳадя кардан мумкин?',
                   'Obunani sovgʻa qilish mumkinmi?',
                   'Жазылымды сыйға беруге бола ма?',
                   'Жазылууну белекке берсе болобу?');
  add('pr.faq.a5', 'Подарочные подписки появятся в течение трёх месяцев после запуска. Если нужно прямо сейчас — напиши на hello@sakeenly.com, оформим вручную.',
                   'Обунаҳои ҳадя дар се моҳ пайдо мешаванд. Агар ҳозир лозим бошад — нависед.',
                   'Sovgʻa obunalari uch oy ichida paydo boʻladi. Hozir kerak boʻlsa — yozing.',
                   'Сыйлық жазылымдары үш айда пайда болады. Қазір керек болса — жазыңыз.',
                   'Белек жазылуулары үч айда чыгат. Азыр керек болсо — жазыңыз.');
  add('pr.faq.q6', 'Если я не могу позволить себе Premium?',
                   'Агар Premium-ро дастрас карда натавонам?',
                   'Premiumni sotib ololmasam-chi?',
                   'Premium-ды ала алмасам ше?',
                   'Premium-ду сатып ала албасам эмне болот?');
  add('pr.faq.a6', 'Напиши на hello@sakeenly.com — мы открываем Premium бесплатно для студентов, имамов, людей в трудной ситуации. Раз в год обновляем доступ. Без вопросов.',
                   'Ба hello@sakeenly.com нависед — Premium ройгон барои донишҷӯён, имомҳо, шахсони ниёзманд.',
                   'hello@sakeenly.com ga yozing — Premium talabalar, imomlar, ehtiyojmandlar uchun bepul.',
                   'hello@sakeenly.com-ке жазыңыз — Premium студенттер, имамдар, мұқтаждар үшін тегін.',
                   'hello@sakeenly.com-ге жазыңыз — Premium студенттер, имамдар, муктаждар үчүн бекер.');

  // PRIVACY — most important sections
  add('priv.h1', 'Приватность как ритуал.', 'Махфият ҳамчун расм.', 'Maxfiylik marosim sifatida.', 'Құпиялылық рәсім ретінде.', 'Купуялык ырым катары.');
  add('priv.lede', 'Мы относимся к твоим данным как к аманат — то, что нам доверили на хранение. Никакой рекламы, никаких трекеров, никаких партнёров.',
                  'Мо ба маълумоти шумо ҳамчун амонат муносибат мекунем.',
                  'Maʼlumotlaringizga amanat sifatida munosabatdamiz.',
                  'Деректеріңізге аманат ретінде қараймыз.',
                  'Маалыматтарыңызга аманат катары мамиле кылабыз.');

  // KIDS extras (those not in original)
  add('kid.cta1', 'Учить буквы', 'Ҳарфҳоро омӯхтан', 'Harflarni oʻrganish', 'Әріптерді үйрену', 'Тамгаларды үйрөнүү');
  add('kid.cta2', 'Заучивать суры', 'Ёд кардани сураҳо', 'Suralarni yodlash', 'Сүрелерді жаттау', 'Сүрөлөрдү жаттоо');
  add('kid.cta3', 'Слушать истории', 'Шунидани достонҳо', 'Hikoyalarni tinglash', 'Әңгімелерді тыңдау', 'Окуяларды угуу');

  // LISTEN extras (Now playing controls and surah strip etc covered partly)
  add('ls.popular_eyebrow', 'Часто слушают', 'Зуд-зуд мешунаванд', 'Tez-tez tinglashadi', 'Жиі тыңдайды', 'Көп угушат');
  add('ls.popular_h', 'Суры, к которым возвращаются', 'Сураҳое, ки бармегарданд', 'Qaytib oʻqiladigan suralar', 'Қайтып оралатын сүрелер', 'Кайра-кайра окулган сүрөлөр');
  add('ls.all_114', 'Все 114 →', 'Ҳамаи 114 →', 'Hammasi 114 →', 'Барлығы 114 →', 'Бардыгы 114 →');

  // READER — comprehensive
  add('rd.lbl_translation', 'Перевод', 'Тарҷума', 'Tarjima', 'Аударма', 'Котормо');
  add('rd.side_all', 'Все суры', 'Ҳамаи сураҳо', 'Barcha suralar', 'Барлық сүрелер', 'Бардык сүрөлөр');
  add('rd.side_more', '+ ещё 101 сура', '+ боз 101 сура', '+ yana 101 sura', '+ тағы 101 сүре', '+ дагы 101 сүрө');
  add('rd.search_ph', 'Поиск суры...', 'Ҷустуҷӯи сура...', 'Sura qidirish...', 'Сүре іздеу...', 'Сүрө издөө...');
  // Info card 1 — О суре
  add('rd.about_h', 'О суре', 'Дар бораи сура', 'Sura haqida', 'Сүре туралы', 'Сүрө жөнүндө');
  add('rd.about_name', 'Название', 'Ном', 'Nomi', 'Атауы', 'Аталышы');
  add('rd.about_rev', 'Откровение', 'Ваҳй', 'Vahiy', 'Уахи', 'Аян');
  add('rd.about_order', 'Порядок ниспослания', 'Тартиби нузул', 'Nozil tartibi', 'Түсу тәртібі', 'Түшүү тартиби');
  add('rd.about_words', 'Слов', 'Калимаҳо', 'Soʻzlar', 'Сөздер', 'Сөздөр');
  add('rd.about_letters', 'Букв', 'Ҳарфҳо', 'Harflar', 'Әріптер', 'Тамгалар');
  // Info card — Чтец
  add('rd.reciter_h', 'Чтец', 'Қорӣ', 'Qori', 'Қари', 'Кары');
  add('rd.reciter_all', 'Все 30 чтецов →', 'Ҳамаи 30 қорӣ →', 'Barcha 30 qori →', 'Барлық 30 қари →', 'Бардык 30 кары →');
  // Info card — Bookmarks
  add('rd.bm_h', 'Закладки в этой суре', 'Нишонаҳо дар ин сура', 'Bu surada xatchoʻplar', 'Бұл сүредегі бетбелгілер', 'Бул сүрөдөгү кыстармалар');
  add('rd.bm_empty', 'Тапни по аяту → 💾 Закладка, чтобы сохранить.', 'Бар оят зер кун → 💾 Нишона.', 'Oyatga teging → 💾 Xatchoʻp.', 'Аятқа тигіңіз → 💾 Бетбелгі.', 'Аятка тий → 💾 Кыстарма.');
  // Info card — Hotkeys
  add('rd.hk_h', 'Горячие клавиши', 'Тугмаҳои тез', 'Tezkor tugmalar', 'Жылдам пернелер', 'Тез баскычтар');
  add('rd.hk_next', 'След. аят', 'Ояти оянда', 'Keyingi oyat', 'Келесі аят', 'Кийинки аят');
  add('rd.hk_prev', 'Пред. аят', 'Ояти гузашта', 'Oldingi oyat', 'Алдыңғы аят', 'Мурунку аят');
  add('rd.hk_play', 'Play / Pause', 'Бозӣ / Таваққуф', 'Play / Pause', 'Ойнату / Тоқтату', 'Ойнотуу / Токтотуу');
  add('rd.hk_bm', 'Закладка', 'Нишона', 'Xatchoʻp', 'Бетбелгі', 'Кыстарма');
  add('rd.bm_saved', 'Сохранено', 'Нигоҳ дошта шуд', 'Saqlandi', 'Сақталды', 'Сакталды');

  // Translation toggle generic labels
  add('rd.tt.label', 'Перевод', 'Тарҷума', 'Tarjima', 'Аударма', 'Котормо');

  // ─── 114 SURAH MEANINGS (sn.{n} = meaning of surah N) ─────────────────
  // The Russian Cyrillic transliteration (Аль-Фатиха etc.) stays the same;
  // only the MEANING after the dash needs translation. Compact 5-tuple array.
  const SURAH_MEANINGS = [
    ['Открывающая', 'Кушоянда', 'Ochuvchi', 'Ашушы', 'Ачуучу'],
    ['Корова', 'Гов', 'Sigir', 'Сиыр', 'Уй'],
    ['Семейство Имрана', 'Хонадони Имрон', 'Imron oilasi', 'Имран әулеті', 'Имран үй-бүлөсү'],
    ['Женщины', 'Занон', 'Ayollar', 'Әйелдер', 'Аялдар'],
    ['Трапеза', 'Хон', 'Dasturxon', 'Дастархан', 'Дасторкон'],
    ['Скот', 'Чорпо', 'Chorva', 'Мал', 'Мал'],
    ['Возвышенности', 'Баландиҳо', 'Aʼrof', 'Биіктіктер', 'Бийиктиктер'],
    ['Трофеи', 'Ғаниматҳо', 'Oʻljalar', 'Олжалар', 'Олжолор'],
    ['Покаяние', 'Тавба', 'Tavba', 'Тәубе', 'Тообо'],
    ['Юнус', 'Юнус', 'Yunus', 'Юнус', 'Юнус'],
    ['Худ', 'Ҳуд', 'Hud', 'Һұд', 'Худ'],
    ['Юсуф', 'Юсуф', 'Yusuf', 'Жүсіп', 'Юсуп'],
    ['Гром', 'Раъд', 'Momoqaldiroq', 'Күн күркіреуі', 'Күн күркүрөшү'],
    ['Ибрахим', 'Иброҳим', 'Ibrohim', 'Ибраһим', 'Ибрахим'],
    ['Хиджр', 'Ҳиҷр', 'Hijr', 'Хижр', 'Хижр'],
    ['Пчёлы', 'Занбӯр', 'Asalarilar', 'Аралар', 'Аарылар'],
    ['Ночной перенос', 'Сафари шабона', 'Tungi safar', 'Түнгі сапар', 'Түнкү сапар'],
    ['Пещера', 'Ғор', 'Gʻor', 'Үңгір', 'Үңкүр'],
    ['Марьям', 'Марям', 'Maryam', 'Мәриям', 'Марьям'],
    ['Та-Ха', 'Тоҳо', 'Toha', 'Таһа', 'Таха'],
    ['Пророки', 'Пайғамбарон', 'Paygʻambarlar', 'Пайғамбарлар', 'Пайгамбарлар'],
    ['Хадж', 'Ҳаҷ', 'Haj', 'Қажы', 'Ажы'],
    ['Верующие', 'Мӯъминон', 'Moʻminlar', 'Мүміндер', 'Момундар'],
    ['Свет', 'Нур', 'Nur', 'Нұр', 'Нур'],
    ['Различение', 'Фурқон', 'Furqon', 'Парасат', 'Парасат'],
    ['Поэты', 'Шоирон', 'Shoirlar', 'Ақындар', 'Акындар'],
    ['Муравьи', 'Мӯрчагон', 'Chumolilar', 'Құмырсқалар', 'Кумурскалар'],
    ['Рассказ', 'Қисса', 'Qissa', 'Хикая', 'Окуя'],
    ['Паук', 'Анкабут', 'Oʻrgimchak', 'Өрмекші', 'Жөргөмүш'],
    ['Римляне', 'Румиён', 'Rumlar', 'Римдіктер', 'Римдиктер'],
    ['Лукман', 'Луқмон', 'Luqmon', 'Лұқман', 'Лукман'],
    ['Поклон', 'Саҷда', 'Sajda', 'Сәжде', 'Сажда'],
    ['Союзники', 'Иттифоқчиён', 'Ittifoqdoshlar', 'Одақтастар', 'Союздаштар'],
    ['Саба', 'Сабаъ', 'Saba', 'Саба', 'Саба'],
    ['Создатель', 'Офаринанда', 'Yaratuvchi', 'Жаратушы', 'Жараткан'],
    ['Йа Син', 'Ё Син', 'Yasin', 'Йа Син', 'Йа Син'],
    ['Стоящие в ряд', 'Сафкашон', 'Saf tortganlar', 'Сап тізілгендер', 'Катар тургандар'],
    ['Сад', 'Сод', 'Sod', 'Сад', 'Сад'],
    ['Толпы', 'Гурӯҳҳо', 'Toʻdalar', 'Топтар', 'Топтор'],
    ['Прощающий', 'Бахшоянда', 'Kechiruvchi', 'Кешіруші', 'Кечирүүчү'],
    ['Разъяснены', 'Шарҳ дода шуд', 'Tafsillab berilgan', 'Түсіндірілген', 'Түшүндүрүлгөн'],
    ['Совет', 'Машварат', 'Maslahat', 'Кеңес', 'Кеңеш'],
    ['Украшения', 'Зебоиҳо', 'Bezaklar', 'Сәндіктер', 'Кооздуктар'],
    ['Дым', 'Дуд', 'Tutun', 'Түтін', 'Түтүн'],
    ['Преклонение', 'Зону задан', 'Choʻkka tushish', 'Тізе бүгу', 'Тизе бүгүү'],
    ['Барханы', 'Регзорҳо', 'Qum tepalari', 'Құм төбелер', 'Кум дөбөлөр'],
    ['Мухаммад', 'Муҳаммад', 'Muhammad', 'Мұхаммед', 'Мухаммед'],
    ['Победа', 'Фатҳ', 'Fath', 'Фатх', 'Фатх'],
    ['Комнаты', 'Ҳуҷраҳо', 'Hujralar', 'Бөлмелер', 'Бөлмөлөр'],
    ['Каф', 'Қоф', 'Qof', 'Қаф', 'Каф'],
    ['Рассеивающие', 'Парокандакунанда', 'Sochuvchilar', 'Шашушылар', 'Чачуучулар'],
    ['Гора', 'Кӯҳ', 'Togʻ', 'Тау', 'Тоо'],
    ['Звезда', 'Ситора', 'Yulduz', 'Жұлдыз', 'Жылдыз'],
    ['Луна', 'Моҳ', 'Oy', 'Ай', 'Ай'],
    ['Милостивый', 'Раҳмон', 'Rahmon', 'Рахман', 'Рахман'],
    ['Падающее', 'Воқеа', 'Tushuvchi', 'Болған оқиға', 'Болуп өткөн окуя'],
    ['Железо', 'Оҳан', 'Temir', 'Темір', 'Темир'],
    ['Препирающаяся', 'Муҷодалакунанда', 'Bahslashuvchi', 'Дауласушы', 'Талашуучу'],
    ['Сбор', 'Ҳашр', 'Hashr', 'Жинау', 'Жыюу'],
    ['Испытуемая', 'Имтиҳоншуда', 'Sinaluvchi', 'Сыналушы', 'Сыналуучу'],
    ['Ряды', 'Сафҳо', 'Saflar', 'Қатарлар', 'Катарлар'],
    ['Пятница', 'Ҷумъа', 'Juma', 'Жұма', 'Жума'],
    ['Лицемеры', 'Мунофиқон', 'Munofiqlar', 'Мұнафиқтер', 'Мунафыктар'],
    ['Взаимное обделение', 'Зиёнкорӣ', 'Bir-birini aldash', 'Бір-бірін алдау', 'Бири-бирин алдоо'],
    ['Развод', 'Талоқ', 'Taloq', 'Талақ', 'Талак'],
    ['Запрещение', 'Манъ', 'Taqiqlash', 'Тыйым', 'Тыюу'],
    ['Власть', 'Мулк', 'Mulk', 'Мүлік', 'Мүлк'],
    ['Калам', 'Қалам', 'Qalam', 'Қалам', 'Калем'],
    ['Неизбежное', 'Ҳаққа', 'Muqarrar', 'Болмай қоймас', 'Болмай койбос'],
    ['Ступени', 'Зинаҳо', 'Marjalar', 'Сатылар', 'Сатылар'],
    ['Нух', 'Нӯҳ', 'Nuh', 'Нұх', 'Нух'],
    ['Джинны', 'Ҷинниён', 'Jinlar', 'Жындар', 'Жиндер'],
    ['Закутавшийся', 'Бахудпечида', 'Oʻralgan', 'Қаптанған', 'Капталган'],
    ['Завернувшийся', 'Барпӯш', 'Burkangan', 'Бүркеулі', 'Жабылган'],
    ['Воскресение', 'Қиёмат', 'Qiyomat', 'Қиямет', 'Кыямат'],
    ['Человек', 'Инсон', 'Inson', 'Адам', 'Адам'],
    ['Посылаемые', 'Фиристодашудаҳо', 'Yuborilganlar', 'Жіберілгендер', 'Жиберилгендер'],
    ['Весть', 'Хабар', 'Xabar', 'Хабар', 'Кабар'],
    ['Исторгающие', 'Кашандагон', 'Tortib oluvchilar', 'Тартып алушылар', 'Тартып алуучулар'],
    ['Нахмурился', 'Чин кашид', 'Qovogʻini soldi', 'Қабағын түйді', 'Кабагын чытыды'],
    ['Скручивание', 'Печидан', 'Oʻralish', 'Оралу', 'Ороштуруу'],
    ['Раскалывание', 'Шикастан', 'Yorilish', 'Жарылу', 'Жарылуу'],
    ['Обвешивающие', 'Камфурӯшон', 'Tarozudan urguvchilar', 'Кем өлшеушілер', 'Кем өлчөгөндөр'],
    ['Разверзание', 'Кушодан', 'Ochilish', 'Ашылу', 'Ачылуу'],
    ['Созвездия', 'Бурҷҳо', 'Burjlar', 'Шоқжұлдыздар', 'Жылдыздар'],
    ['Идущий ночью', 'Шабсайр', 'Tunda yuruvchi', 'Түн жүруші', 'Түнкү жүрүүчү'],
    ['Высочайший', 'Аълотар', 'Aʼlo', 'Ең жоғары', 'Эң жогорку'],
    ['Покрывающее', 'Пӯшонанда', 'Qoplovchi', 'Жабушы', 'Каптоочу'],
    ['Заря', 'Сапеда', 'Tong', 'Таң', 'Таң'],
    ['Город', 'Шаҳр', 'Shahar', 'Қала', 'Шаар'],
    ['Солнце', 'Офтоб', 'Quyosh', 'Күн', 'Күн'],
    ['Ночь', 'Шаб', 'Tun', 'Түн', 'Түн'],
    ['Утро', 'Саҳар', 'Tong', 'Таң', 'Таң'],
    ['Раскрытие', 'Кушодан', 'Ochish', 'Ашу', 'Ачуу'],
    ['Смоковница', 'Анҷир', 'Anjir', 'Інжір', 'Инжир'],
    ['Сгусток', 'Лахта', 'Loy', 'Қан ұйығы', 'Кан уюткусу'],
    ['Предопределение', 'Қадр', 'Qadr', 'Қадір', 'Кадыр'],
    ['Ясное доказательство', 'Далели равшан', 'Aniq dalil', 'Айқын дәлел', 'Анык далил'],
    ['Сотрясение', 'Заминҷунбӣ', 'Zilzila', 'Жер сілкінісі', 'Жер титирөө'],
    ['Скачущие', 'Тозандаҳо', 'Choʻrtikkanlar', 'Шапқыншылар', 'Чабуул жасагандар'],
    ['Великое бедствие', 'Балои бузург', 'Buyuk falokat', 'Ұлы апат', 'Улуу кырсык'],
    ['Страсть к умножению', 'Бештараталабӣ', 'Koʻproqlikni xohlash', 'Көбейтуге құмарлық', 'Көбөйтүүгө кумарлык'],
    ['Время', 'Аср', 'Asr', 'Уақыт', 'Убакыт'],
    ['Хулитель', 'Айбҷӯй', 'Tuhmatchi', 'Жала жабушы', 'Жалаа жабуучу'],
    ['Слон', 'Фил', 'Fil', 'Піл', 'Пил'],
    ['Курайш', 'Қурайш', 'Quraysh', 'Құрайш', 'Курайш'],
    ['Подаяние', 'Хайр', 'Yordam', 'Көмек', 'Жардам'],
    ['Изобилие', 'Фаровонӣ', 'Moʻllik', 'Молшылық', 'Молчулук'],
    ['Неверующие', 'Кофирон', 'Kofirlar', 'Кәпірлер', 'Каапырлар'],
    ['Помощь', 'Ёрӣ', 'Yordam', 'Көмек', 'Жардам'],
    ['Пальмовые волокна', 'Лиф', 'Lif', 'Талшықтар', 'Талшыктар'],
    ['Искренность', 'Ихлос', 'Ixlos', 'Шынайылық', 'Ыйман'],
    ['Рассвет', 'Сапеда', 'Tong', 'Таң', 'Таң'],
    ['Люди', 'Мардум', 'Odamlar', 'Адамдар', 'Адамдар'],
  ];
  for (let i = 0; i < SURAH_MEANINGS.length; i++) {
    const m = SURAH_MEANINGS[i];
    add(`sn.${i + 1}`, m[0], m[1], m[2], m[3], m[4]);
  }

  // ─── PER-PAGE TAGGERS ────────────────────────────────────────────────
  const PAGE = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  function setText(sel, key, idx = -1) {
    document.querySelectorAll(sel).forEach((el, i) => {
      if (idx === -1 || i === idx) el.setAttribute('data-i18n', key);
    });
  }

  /** Wrap free-floating text nodes after the svg into a span and tag it. */
  function wrapAndTag(row, key) {
    if (!row || row.hasAttribute('data-i18n')) return;
    const svg = row.querySelector('svg');
    let wrapper = row.querySelector(':scope > span:not(.check)');
    if (!wrapper) {
      // Build a span around the trailing text/em/strong nodes.
      wrapper = document.createElement('span');
      const nodes = Array.from(row.childNodes).filter((c) => c !== svg);
      nodes.forEach((c) => wrapper.appendChild(c));
      row.appendChild(wrapper);
    }
    wrapper.setAttribute('data-i18n', key);
  }

  function tagPricing() {
    // Hero lede paragraph: the first <p> sibling of the h1 inside .pricing-hero.
    document.querySelectorAll('section.wrap > p, .pricing-hero p, .hero p').forEach((p) => {
      const t = (p.textContent || '').trim();
      if (t.startsWith('Бесплатный план даёт')) p.setAttribute('data-i18n', 'pr.lede');
    });

    const plans = document.querySelectorAll('.plans .plan');
    const setPlan = (n, prefix) => {
      const p = plans[n];
      if (!p) return;
      const h3 = p.querySelector('h3');
      const pitch = p.querySelector('.pitch');               // description
      const per = p.querySelector('.per');                   // /мес, /навсегда
      const priceSub = p.querySelector('.price-sub');        // hint under price
      const cta = p.querySelector('.plan-cta');
      const lbl = p.querySelector('.plan-features > .lbl');  // "Включено" / "Всё из ..."
      // Premium (index 1) keeps its English brand name in <h3>.
      if (h3 && n !== 1) h3.setAttribute('data-i18n', `${prefix}.name`);
      if (pitch) pitch.setAttribute('data-i18n', `${prefix}.sub`);
      if (per) per.setAttribute('data-i18n', `${prefix}.per`);
      if (priceSub) priceSub.setAttribute('data-i18n', `${prefix}.hint`);
      if (cta) {
        // CTA contains svg + text node — wrap text so translation doesn't drop the svg.
        wrapAndTag(cta, `${prefix}.cta`);
      }
      if (lbl) lbl.setAttribute('data-i18n', `${prefix}.lbl`);

      // Feature rows.
      p.querySelectorAll('.feat-row').forEach((row, i) => {
        wrapAndTag(row, `${prefix}.f${i + 1}`);
      });
    };
    setPlan(0, 'pr.p1');
    setPlan(1, 'pr.p2');
    setPlan(2, 'pr.p3');

    // Popular badge
    document.querySelectorAll('.plan-badge, .popular-badge').forEach((b) => {
      if (b.textContent.trim().toUpperCase().includes('ПОПУЛЯР')) {
        b.setAttribute('data-i18n', 'pr.popular');
      }
    });

    // Compare section heading + subtitle: section.compare > h2 + p.sub.
    const cmpSection = document.querySelector('section.compare, .compare-section');
    if (cmpSection) {
      const h = cmpSection.querySelector(':scope > h2');
      const sub = cmpSection.querySelector(':scope > p.sub, :scope > p');
      if (h) h.setAttribute('data-i18n', 'pr.cmp.h_title');
      if (sub) sub.setAttribute('data-i18n', 'pr.cmp.h_sub');
    } else {
      // Fallback by text content
      document.querySelectorAll('h2').forEach((h) => {
        if (h.textContent.trim() === 'Что входит куда') h.setAttribute('data-i18n', 'pr.cmp.h_title');
      });
      document.querySelectorAll('p.sub').forEach((p) => {
        if (p.textContent.trim() === 'Если хочется детально.') p.setAttribute('data-i18n', 'pr.cmp.h_sub');
      });
    }

    document.querySelectorAll('.eyebrow').forEach((eb) => {
      if (eb.textContent.trim().toLowerCase() === 'часто спрашивают') {
        eb.setAttribute('data-i18n', 'pr.faq.eyebrow');
      }
    });

    // Compare table headers (4 columns) — first row with class "head"
    const headRow = document.querySelector('.compare-row.head');
    if (headRow) {
      const cells = headRow.querySelectorAll(':scope > div');
      const keys = ['pr.cmp.col1', 'pr.cmp.col2', 'pr.cmp.col3', 'pr.cmp.col4'];
      cells.forEach((c, i) => { if (keys[i]) c.setAttribute('data-i18n', keys[i]); });
    }

    // Compare section dividers (.compare-row.section) — match by exact text.
    const sectionKeys = {
      'Чтение и аудио': 'pr.cmp.s1',
      'ИИ-помощник':    'pr.cmp.s2',
      'Темы и интерфейс': 'pr.cmp.s3',
      'Семья и дети':   'pr.cmp.s4',
    };
    document.querySelectorAll('.compare-row.section').forEach((s) => {
      const t = s.textContent.trim();
      if (sectionKeys[t]) s.setAttribute('data-i18n', sectionKeys[t]);
    });

    // Per-row labels — match first <div> child of each compare-row by exact text.
    const rowKeys = {
      '114 сур · 5 переводов':                     'pr.cmp.row.114',
      '30 чтецов · аудио на аят':                  'pr.cmp.row.30q',
      'Офлайн-режим':                              'pr.cmp.row.off',
      'Sleep-таймер · скорость 0.5×–2×':           'pr.cmp.row.sleep',
      'Вопросы с цитатами из Корана/хадисов':      'pr.cmp.row.aiq',
      'Расширенные тафсиры':                       'pr.cmp.row.tafsir',
      'Light · Dark · Sepia':                      'pr.cmp.row.lds',
      'Mushaf-paper тема':                         'pr.cmp.row.mushaf',
      'До 6 аккаунтов':                            'pr.cmp.row.6acc',
      'Детский режим · Икра · первые суры':        'pr.cmp.row.kids',
      'Дашборд для родителей':                     'pr.cmp.row.dash',
    };
    document.querySelectorAll('.compare-row:not(.head):not(.section)').forEach((row) => {
      const first = row.querySelector(':scope > div:first-child');
      if (!first) return;
      const t = (first.textContent || '').trim();
      if (rowKeys[t]) first.setAttribute('data-i18n', rowKeys[t]);
    });

    // Trust tiles at bottom.
    document.querySelectorAll('.pricing-trust .trust-tile').forEach((tile, i) => {
      const h = tile.querySelector('h4');
      const p = tile.querySelector('p');
      if (h) h.setAttribute('data-i18n', `pr.trust${i + 1}.t`);
      if (p) p.setAttribute('data-i18n', `pr.trust${i + 1}.p`);
    });

    // FAQ heading (section.faq > h2 contains "Частые вопросы")
    const faqSection = document.querySelector('section.faq, .faq');
    if (faqSection) {
      const h = faqSection.querySelector(':scope > h2');
      if (h) h.setAttribute('data-i18n', 'pr.faq.h');
    } else {
      document.querySelectorAll('h2').forEach((h) => {
        if (h.textContent.trim() === 'Частые вопросы') h.setAttribute('data-i18n', 'pr.faq.h');
      });
    }

    // FAQ items — 6 items, tag by index.
    document.querySelectorAll('details.faq-item, .faq-item').forEach((item, i) => {
      const summary = item.querySelector('summary');
      const body = item.querySelector('.body, .answer');
      const qKey = `pr.faq.q${i + 1}`;
      const aKey = `pr.faq.a${i + 1}`;
      if (E[qKey] && summary) summary.setAttribute('data-i18n', qKey);
      if (E[aKey] && body) body.setAttribute('data-i18n', aKey);
    });
  }

  function tagPrivacy() {
    document.querySelectorAll('h1').forEach((h) => {
      const t = h.textContent.trim();
      if (t.includes('Приватность как ритуал')) h.setAttribute('data-i18n', 'priv.h1');
    });
  }

  function tagReader() {
    // reader.html uses Babel/JSX rendered into the DOM at runtime.
    // We tag elements by their EXACT text content, then call apply().
    const textKeys = {
      'О суре': 'rd.about_h',
      'Название': 'rd.about_name',
      'Откровение': 'rd.about_rev',
      'Порядок ниспослания': 'rd.about_order',
      'Слов': 'rd.about_words',
      'Букв': 'rd.about_letters',
      'Чтец': 'rd.reciter_h',
      'Все 30 чтецов →': 'rd.reciter_all',
      'Закладки в этой суре': 'rd.bm_h',
      'Тапни по аяту → 💾 Закладка, чтобы сохранить.': 'rd.bm_empty',
      'Горячие клавиши': 'rd.hk_h',
      'След. аят': 'rd.hk_next',
      'Пред. аят': 'rd.hk_prev',
      'Play / Pause': 'rd.hk_play',
      'Закладка': 'rd.hk_bm',
      'Сохранено': 'rd.bm_saved',
      'Перевод': 'rd.lbl_translation',
      'Все суры': 'rd.side_all',
      '+ ещё 101 сура': 'rd.side_more',
    };

    // Build reverse lookup: Russian surah-meaning text → sn.{n} key.
    const surahMeaningKey = {};
    for (let i = 0; i < SURAH_MEANINGS.length; i++) {
      surahMeaningKey[SURAH_MEANINGS[i][0]] = `sn.${i + 1}`;
    }

    // Walk all leaf elements containing only text and try to tag by content.
    const elements = document.querySelectorAll('h4, .lbl, .side-label, .info-row span, .surah-meta, a, button, p, span');
    elements.forEach((el) => {
      if (el.hasAttribute('data-i18n')) return;
      const txt = (el.textContent || '').trim();
      if (textKeys[txt]) {
        el.setAttribute('data-i18n', textKeys[txt]);
        return;
      }
      // Match surah meaning if this is a leaf element.
      if (el.children.length === 0 && surahMeaningKey[txt]) {
        el.setAttribute('data-i18n', surahMeaningKey[txt]);
      }
    });

    // H1 has combined text "Аль-Фатиха · Открывающая" — split the meaning into
    // its own <span> with data-i18n so apply() can translate just that part.
    document.querySelectorAll('h1').forEach((h1) => {
      if (h1.querySelector('[data-i18n]')) return; // already split
      if (h1.children.length > 0) return;          // contains children — skip
      const txt = (h1.textContent || '').trim();
      const idx = txt.indexOf(' · ');
      if (idx <= 0) return;
      const prefix = txt.substring(0, idx + 3);
      const meaning = txt.substring(idx + 3).trim();
      const key = surahMeaningKey[meaning];
      if (!key) return;
      h1.innerHTML = prefix + `<span data-i18n="${key}">${meaning}</span>`;
    });

    // Search input placeholder.
    document.querySelectorAll('input[placeholder]').forEach((inp) => {
      if ((inp.getAttribute('placeholder') || '').includes('Поиск суры')) {
        inp.setAttribute('data-i18n-placeholder', 'rd.search_ph');
      }
    });

    // NOTE: do NOT call apply() here — caller is responsible for that.
    // Calling apply inside tagReader + MutationObserver caused an infinite
    // tag→apply→mutation→tag loop that visibly glitched the lang switcher.
  }

  function tagListen() {
    document.querySelectorAll('.strip-head .eyebrow').forEach((eb) => {
      if (eb.textContent.trim() === 'Часто слушают') eb.setAttribute('data-i18n', 'ls.popular_eyebrow');
    });
    document.querySelectorAll('.strip-head h2').forEach((h) => {
      if (h.textContent.includes('Суры, к которым')) h.setAttribute('data-i18n', 'ls.popular_h');
    });
    document.querySelectorAll('.surah-strip a').forEach((a) => {
      if (a.textContent.trim().startsWith('Все 114')) a.setAttribute('data-i18n', 'ls.all_114');
    });
  }

  // ─── EXEC ──────────────────────────────────────────────────────────
  function run() {
    // 1. Extend the shared DICT.
    if (window.SakeenlyI18n && window.SakeenlyI18n.DICT) {
      Object.assign(window.SakeenlyI18n.DICT, E);
    }
    // 2. Tag missing elements per page.
    if (PAGE.includes('pricing')) tagPricing();
    if (PAGE.includes('privacy')) tagPrivacy();
    if (PAGE.includes('listen')) tagListen();
    if (PAGE.includes('reader')) {
      // reader.html uses Babel JSX rendered at runtime — give it time and
      // re-tag at 80ms / 400ms after init. After each pass, the langchange
      // listener below re-applies translations (single call, no loop).
      const reTag = () => {
        try { tagReader(); } catch (e) {}
        try {
          if (window.SakeenlyI18n && window.SakeenlyI18n.apply) {
            window.SakeenlyI18n.apply(localStorage.getItem('sakeenly:lang') || 'ru');
          }
        } catch (e) {}
      };
      setTimeout(reTag, 80);
      setTimeout(reTag, 400);
    }
    // 3. Re-apply current language.
    if (window.SakeenlyI18n && window.SakeenlyI18n.apply) {
      try {
        const lang = localStorage.getItem('sakeenly:lang') || 'ru';
        window.SakeenlyI18n.apply(lang);
      } catch (e) {}
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  // Lang change handler.
  //
  // The originals' lang dropdown click already calls apply(lang) — and since
  // we Object.assign()'d our extras INTO their DICT, that single call already
  // translates everything (extras + originals). We only need to act here on
  // reader.html where JSX may have re-rendered and dropped our data-i18n
  // attributes; in that case we re-tag and apply once.
  window.addEventListener('sakeenly:langchange', (e) => {
    if (!PAGE.includes('reader')) return; // no double-apply elsewhere
    setTimeout(() => {
      try { tagReader(); } catch (err) {}
      try {
        if (window.SakeenlyI18n && window.SakeenlyI18n.apply) {
          window.SakeenlyI18n.apply(e.detail.lang);
        }
      } catch (err) {}
    }, 0);
  });
})();
