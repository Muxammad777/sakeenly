// Sakeenly — shared client.
//   1. Theme switcher (4 themes, localStorage).
//   2. Nav + footer injection into #nav-root / #footer-root.
//   3. Lang dropdown (ru / tg / uz / kk / ky) + i18n apply over [data-i18n].
//
// Translation dictionary is loaded from i18n-data.js (window.SakeenlyDict).
// New pages MUST load i18n-data.js BEFORE shared.js for translations to work,
// but theme + nav/footer injection still works without it.

(function () {
  // ── THEME ─────────────────────────────────────────────────────────────
  const THEMES = ['dark', 'light', 'sepia', 'mushaf'];
  const THEME_KEY = 'sakeenly:theme';

  function applyTheme(t) {
    if (!THEMES.includes(t)) t = 'dark';
    document.documentElement.setAttribute('data-theme', t);
    document.querySelectorAll('.theme-switch button').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.theme === t));
    });
    try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
  }
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored && THEMES.includes(stored)) {
      document.documentElement.setAttribute('data-theme', stored);
    }
  } catch (e) {}

  // ── LANG ──────────────────────────────────────────────────────────────
  const LANGS = {
    ru: { native: 'Русский', short: 'РУС', htmlLang: 'ru' },
    tg: { native: 'Тоҷикӣ',  short: 'ТҶК', htmlLang: 'tg' },
    uz: { native: 'Oʻzbek',  short: 'UZB', htmlLang: 'uz' },
    kk: { native: 'Қазақ',   short: 'ҚАЗ', htmlLang: 'kk' },
    ky: { native: 'Кыргыз',  short: 'КЫР', htmlLang: 'ky' },
  };
  const LANG_KEY = 'sakeenly:lang';

  // URL override — write ?_lang= to localStorage ONCE and strip from URL via
  // history.replaceState so the user's subsequent dropdown picks don't get
  // clobbered on page reload.
  try {
    const m = location.search.match(/[?&]_lang=([a-z]{2})/);
    if (m && LANGS[m[1]]) {
      localStorage.setItem(LANG_KEY, m[1]);
      const cleanSearch = location.search
        .replace(/[?&]_lang=[a-z]{2}/, '')
        .replace(/^&/, '?')
        .replace(/^\?$/, '');
      history.replaceState(null, '', location.pathname + cleanSearch + location.hash);
    }
  } catch (e) {}

  function currentLang() {
    try {
      const s = localStorage.getItem(LANG_KEY);
      return (s && LANGS[s]) ? s : 'ru';
    } catch (e) { return 'ru'; }
  }

  function getEntry(key, lang) {
    const dict = window.SakeenlyDict;
    if (!dict) return null;
    const e = dict[key];
    if (!e) return null;
    return e[lang] || e.ru || null;
  }

  function applyI18n(lang) {
    document.documentElement.setAttribute('lang', LANGS[lang].htmlLang);
    document.documentElement.setAttribute('data-lang', lang);
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const v = getEntry(el.getAttribute('data-i18n'), lang);
      if (v !== null) el.textContent = v;
    });
    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const v = getEntry(el.getAttribute('data-i18n-html'), lang);
      if (v !== null) el.innerHTML = v;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const v = getEntry(el.getAttribute('data-i18n-placeholder'), lang);
      if (v !== null) el.setAttribute('placeholder', v);
    });
    document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      // data-i18n-attr="attrName:key"
      const spec = el.getAttribute('data-i18n-attr') || '';
      const [attr, key] = spec.split(':');
      if (attr && key) {
        const v = getEntry(key, lang);
        if (v !== null) el.setAttribute(attr, v);
      }
    });
    // Reflect choice in lang switcher.
    document.querySelectorAll('.lang-switch .lang-current').forEach((el) => {
      el.textContent = LANGS[lang].short;
    });
    document.querySelectorAll('.lang-menu button[data-lang]').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
    });
  }

  function setLang(lang) {
    if (!LANGS[lang]) lang = 'ru';
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    applyI18n(lang);
    window.dispatchEvent(new CustomEvent('sakeenly:langchange', { detail: { lang } }));
  }

  // Pre-paint: set html[lang]+data-lang as soon as possible.
  try {
    const s = currentLang();
    document.documentElement.setAttribute('lang', LANGS[s].htmlLang);
    document.documentElement.setAttribute('data-lang', s);
  } catch (e) {}

  // ── NAV / FOOTER markup ───────────────────────────────────────────────
  function navHtml(active) {
    const link = (href, key, label) => {
      const a = href === active ? ' class="active"' : '';
      return `<a href="${href}"${a} data-i18n="${key}">${label}</a>`;
    };
    return `
<nav class="nav">
  <div class="nav-inner">
    <a class="brand" href="index.html">
      <span class="brand-mark">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
          <path d="M12 2 L14.2 9.8 L22 12 L14.2 14.2 L12 22 L9.8 14.2 L2 12 L9.8 9.8 Z" />
        </svg>
      </span>
      <span>Sakeenly</span>
    </a>
    <div class="nav-links">
      ${link('reader.html',  'nav.read',    'Чтение')}
      ${link('listen.html',  'nav.listen',  'Слушать')}
      ${link('ask.html',     'nav.ask',     'Спросить')}
      ${link('ayat.html',    'nav.ayat',    'Аяты')}
      ${link('kids.html',    'nav.kids',    'Для детей')}
      ${link('pricing.html', 'nav.pricing', 'Тарифы')}
    </div>
    <div class="nav-right">
      <div class="lang-switch">
        <button class="lang-trigger" type="button" aria-expanded="false" aria-label="Язык / Language">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>
          <span class="lang-current">РУС</span>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <div class="lang-menu" role="menu">
          <button data-lang="ru" role="menuitem" aria-pressed="true"><span>Русский</span><span class="code">РУС</span></button>
          <button data-lang="tg" role="menuitem"><span>Тоҷикӣ</span><span class="code">ТҶК</span></button>
          <button data-lang="uz" role="menuitem"><span>Oʻzbek</span><span class="code">UZB</span></button>
          <button data-lang="kk" role="menuitem"><span>Қазақ</span><span class="code">ҚАЗ</span></button>
          <button data-lang="ky" role="menuitem"><span>Кыргыз</span><span class="code">КЫР</span></button>
        </div>
      </div>
      <div class="theme-switch" role="group" aria-label="Тема">
        <button data-theme="light" title="Светлая"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg></button>
        <button data-theme="sepia" title="Сепия"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19V5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2Z"/><path d="M8 7h7M8 11h7M8 15h5"/></svg></button>
        <button data-theme="mushaf" title="Мусхаф"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3 L13.5 10 L20 12 L13.5 14 L12 21 L10.5 14 L4 12 L10.5 10 Z"/></svg></button>
        <button data-theme="dark" title="Ночь"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg></button>
      </div>
      <a href="signin.html" class="btn btn-soft btn-sm" data-i18n="nav.signin">Войти</a>
    </div>
  </div>
</nav>`;
  }

  function footerHtml() {
    return `
<footer class="footer">
  <div class="footer-inner">
    <div>
      <div class="brand" style="margin-bottom:14px">
        <span class="brand-mark">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
            <path d="M12 2 L14.2 9.8 L22 12 L14.2 14.2 L12 22 L9.8 14.2 L2 12 L9.8 9.8 Z" />
          </svg>
        </span>
        <span>Sakeenly</span>
      </div>
      <p style="max-width:36ch;line-height:1.55" data-i18n="foot.tagline">Quran-companion для тебя. Без рекламы. Без трекеров. Никогда.</p>
    </div>
    <div class="footer-col">
      <h4 data-i18n="foot.product">Продукт</h4>
      <a href="reader.html" data-i18n="foot.reader">Ридер</a>
      <a href="listen.html" data-i18n="foot.reciters">Чтецы</a>
      <a href="ask.html" data-i18n="nav.ask">Спросить</a>
      <a href="ayat.html" data-i18n="foot.ayat">Аяты по темам</a>
      <a href="pricing.html" data-i18n="nav.pricing">Тарифы</a>
    </div>
    <div class="footer-col">
      <h4 data-i18n="foot.company">Компания</h4>
      <a href="about.html" data-i18n="foot.about">О нас</a>
      <a href="scholars.html" data-i18n="foot.scholars">Scholar board</a>
      <a href="privacy.html" data-i18n="foot.privacy">Приватность</a>
      <a href="#" data-i18n="foot.terms">Условия</a>
    </div>
    <div class="footer-col">
      <h4 data-i18n="foot.help">Помощь</h4>
      <a href="#">FAQ</a>
      <a href="#" data-i18n="foot.report">Сообщить об ошибке</a>
      <a href="#">English</a>
    </div>
  </div>
  <div class="footer-bottom">
    <span>SAKEENLY · سكينة · 2026</span>
    <span data-i18n="foot.bottom_made">Made with نية · sakeenly.com</span>
  </div>
</footer>`;
  }

  // ── INIT ──────────────────────────────────────────────────────────────
  function init() {
    const navRoot = document.getElementById('nav-root');
    if (navRoot) {
      const active = navRoot.getAttribute('data-active') || '';
      navRoot.outerHTML = navHtml(active);
    }
    const footerRoot = document.getElementById('footer-root');
    if (footerRoot) footerRoot.outerHTML = footerHtml();

    let t = 'dark';
    try { t = localStorage.getItem(THEME_KEY) || 'dark'; } catch (e) {}
    applyTheme(t);
    document.querySelectorAll('.theme-switch button').forEach((b) => {
      b.addEventListener('click', () => applyTheme(b.dataset.theme));
    });

    // Wire lang dropdown.
    document.querySelectorAll('.lang-switch').forEach((sw) => {
      const btn = sw.querySelector('.lang-trigger');
      const menu = sw.querySelector('.lang-menu');
      if (!btn || !menu) return;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const op = menu.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(op));
      });
      menu.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-lang]');
        if (!b) return;
        setLang(b.dataset.lang);
        menu.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('click', () => {
      document.querySelectorAll('.lang-menu.open').forEach((m) => m.classList.remove('open'));
      document.querySelectorAll('.lang-trigger').forEach((b) =>
        b.setAttribute('aria-expanded', 'false'),
      );
    });

    // Apply current lang now that everything is mounted.
    applyI18n(currentLang());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API for pages that need to apply translations after dynamic DOM changes.
  window.SakeenlyShared = { applyI18n, setLang, currentLang, LANGS, themes: THEMES, applyTheme };
})();
