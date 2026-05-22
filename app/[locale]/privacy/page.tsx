import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

interface PageProps { params: Promise<{ locale: Locale }>; }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "priv" });
  return { title: t("h1"), description: t("lede"), alternates: { canonical: "/privacy" } };
}

export default async function PrivacyPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Content />;
}

function Content() {
  const t = useTranslations("priv");

  return (
    <>
      <section className="wrap priv-hero">
        <span className="tag"><span className="tag-dot"></span>Отчёт о прозрачности · Q2 2026</span>
        <h1 style={{ marginTop: 18 }}>{t("h1")}</h1>
        <p className="lede">{t("lede")}</p>
        <div className="updated">
          <span>ОБНОВЛЕНО: 18 МАЯ 2026</span>
          <span>ВЕРСИЯ ДОКУМЕНТА: 2.4.0</span>
          <span>Коммит: <span className="commit-id">a3f1c8d</span></span>
        </div>
      </section>

      <section className="wrap">
        <div className="pledges">
          <div className="pledge">
            <div className="v">0</div>
            <div className="l">Рекламных сетей</div>
            <div className="desc">Google Ads, Facebook Pixel, AppsFlyer, AdSense — не подключены и не будут.</div>
          </div>
          <div className="pledge">
            <div className="v">0</div>
            <div className="l">Аналитических трекеров</div>
            <div className="desc">Никакого Google Analytics, Yandex.Metrica, Mixpanel или Amplitude. Только self-hosted Plausible.</div>
          </div>
          <div className="pledge">
            <div className="v">3</div>
            <div className="l">SDK всего</div>
            <div className="desc">Только три: Stripe (платежи), Plausible (агрегированная аналитика без cookies), Sentry (отчёты об ошибках, без PII).</div>
          </div>
          <div className="pledge">
            <div className="v">AES-256</div>
            <div className="l">Шифрование данных</div>
            <div className="desc">Заметки и закладки шифрованы в покое. Ключи изолированы от приложения.</div>
          </div>
        </div>
      </section>

      <section className="wrap section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Глава 1 · sdk</span>
            <h2 style={{ marginTop: 10 }}>Все сторонние сервисы.</h2>
            <p>Полный список всего, что грузится в твой браузер или работает на нашем сервере с твоими данными.</p>
          </div>
        </div>

        <div className="sdk-table">
          <div className="sdk-row head">
            <div>Сервис</div>
            <div>Зачем используется</div>
            <div>Какие данные</div>
            <div>Статус</div>
          </div>
          <div className="sdk-row">
            <div className="sdk-name">Stripe<span className="vendor">stripe.com · США/ЕС</span></div>
            <div className="sdk-purpose">Обработка платежей за Premium и Семейный планы. Применяется только при оформлении подписки.</div>
            <div className="sdk-data"><b>Передаётся:</b> email, имя на карте, номер карты (через Stripe Elements — Sakeenly не видит сам номер), сумма платежа.</div>
            <div><span className="sdk-status required">Обязателен · Premium</span></div>
          </div>
          <div className="sdk-row">
            <div className="sdk-name">Plausible<span className="vendor">self-hosted · Германия</span></div>
            <div className="sdk-purpose">Агрегированная аналитика: какие страницы открывают, какие переводы выбирают. Без cookies, без отпечатка устройства.</div>
            <div className="sdk-data"><b>Передаётся:</b> URL страницы, referrer, ОС-категория, агрегированная страна. <b>Не передаётся:</b> IP (анонимизируется на сервере).</div>
            <div><span className="sdk-status required">Обязателен · все</span></div>
          </div>
          <div className="sdk-row">
            <div className="sdk-name">Sentry<span className="vendor">self-hosted · Германия</span></div>
            <div className="sdk-purpose">Сбор ошибок JavaScript и серверных исключений. PII и тексты заметок отсекаются на клиенте.</div>
            <div className="sdk-data"><b>Передаётся:</b> stack trace, URL, версия браузера, ID сессии (анонимный). <b>Не передаётся:</b> email, заметки.</div>
            <div><span className="sdk-status optional">Можно отключить</span></div>
          </div>
          <div className="sdk-row">
            <div className="sdk-name">Anthropic API<span className="vendor">anthropic.com · США</span></div>
            <div className="sdk-purpose">LLM для ответов на вопросы в /ask. Не сохраняются у них для обучения (zero-retention).</div>
            <div className="sdk-data"><b>Передаётся:</b> текст вопроса + извлечённые цитаты. <b>Не передаётся:</b> email, имя, ID пользователя.</div>
            <div><span className="sdk-status optional">Только при /ask</span></div>
          </div>
          <div className="sdk-row">
            <div className="sdk-name">Quran.com API<span className="vendor">quran.com · публичный</span></div>
            <div className="sdk-purpose">Получение текста аятов, переводов, аудио и тафсиров. Публичный read-only API.</div>
            <div className="sdk-data"><b>Передаётся:</b> только номер суры и аята. <b>Не передаётся:</b> идентификаторы пользователя.</div>
            <div><span className="sdk-status zero">Анонимный</span></div>
          </div>
          <div className="sdk-row">
            <div className="sdk-name">Supabase<span className="vendor">supabase.com · ЕС-Frankfurt</span></div>
            <div className="sdk-purpose">Хост базы данных и аутентификации. На европейском регионе.</div>
            <div className="sdk-data"><b>Хранится:</b> email, хеш пароля, закладки (шифрованы), заметки (шифрованы), streak, подписка.</div>
            <div><span className="sdk-status required">Обязателен · авториз.</span></div>
          </div>
          <div className="sdk-row">
            <div className="sdk-name">Vercel<span className="vendor">vercel.com · США/ЕС</span></div>
            <div className="sdk-purpose">Хостинг сайта (CDN + serverless функции).</div>
            <div className="sdk-data"><b>Логи:</b> IP, URL, время ответа — 30 дней. <b>Не хранится:</b> тело запросов с PII.</div>
            <div><span className="sdk-status required">Хостинг</span></div>
          </div>
        </div>
      </section>

      <section className="wrap section">
        <span className="eyebrow">Глава 2 · данные</span>
        <h2 style={{ marginTop: 10 }}>Что мы храним. И чего — нет.</h2>
        <p style={{ color: "var(--text-2)", maxWidth: "56ch", marginTop: 8 }}>
          Каждая строка — реальный столбец в базе данных. Schema опубликован на GitHub.
        </p>

        <div className="collect-grid" style={{ marginTop: 28 }}>
          <div className="collect-card yes">
            <div className="collect-head"><span className="dot"></span> ХРАНИМ</div>
            <h3>Аккаунт</h3>
            <div className="list">
              <span>Email (для входа и восстановления)</span>
              <span>Имя (опционально)</span>
              <span>Хеш пароля (bcrypt)</span>
              <span>Дата регистрации</span>
              <span>Часовой пояс (для streak)</span>
              <span>Язык интерфейса</span>
            </div>
          </div>
          <div className="collect-card yes">
            <div className="collect-head"><span className="dot"></span> ХРАНИМ ШИФРОВАННО</div>
            <h3>Активность</h3>
            <div className="list">
              <span>Закладки на аяты — AES-256</span>
              <span>Личные заметки (текст) — AES-256</span>
              <span>Streak счётчик · дата последнего захода</span>
              <span>Предпочитаемый перевод и чтец</span>
              <span>Тема (light / dark / sepia / mushaf)</span>
            </div>
          </div>
          <div className="collect-card no">
            <div className="collect-head"><span className="dot"></span> НЕ ХРАНИМ</div>
            <h3>Не собирается</h3>
            <div className="list">
              <span>Точные IP (анонимизируются)</span>
              <span>Геолокация (только страны)</span>
              <span>История браузера, fingerprint устройства</span>
              <span>Контакты, фото, микрофон, камера</span>
              <span>Тексты вопросов в /ask дольше 30 дней</span>
              <span>Реклама-релевантные сигналы — никогда</span>
            </div>
          </div>
        </div>
      </section>

      {/* Глава 3 — шифрование */}
      <section className="wrap section">
        <span className="eyebrow">Глава 3 · шифрование</span>
        <h2 style={{ marginTop: 10 }}>Как заметка попадает в базу.</h2>
        <p style={{ color: "oklch(var(--text-2))", maxWidth: "56ch", marginTop: 8 }}>
          Цепочка из четырёх шагов, на каждом из которых данные не читаемы посторонним сервисом.
        </p>

        <div className="encryption">
          <div className="enc-flow">
            <div className="enc-step">
              <span className="lbl">01 · Браузер</span>
              <span className="title">Ты пишешь заметку</span>
              <span className="meta">Текст существует только в твоём браузере. Никуда не отправлен.</span>
            </div>
            <div className="enc-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </div>
            <div className="enc-step">
              <span className="lbl">02 · TLS</span>
              <span className="title">Передача по HTTPS</span>
              <span className="meta">TLS 1.3 (Vercel Edge). Между тобой и сервером — никто не читает.</span>
            </div>
            <div className="enc-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </div>
            <div className="enc-step">
              <span className="lbl">03 · Сервер</span>
              <span className="title">AES-256 шифрование</span>
              <span className="meta">Текст заметки шифруется ключом из envelope-encryption. Ключ хранится в Vercel KV, не в Supabase.</span>
            </div>
          </div>
        </div>

        <div className="data-stats">
          <div className="stat">
            <div className="v">AES-256-GCM</div>
            <div className="l">Алгоритм</div>
            <div className="sub">Стандарт NIST. Без поломанных режимов.</div>
          </div>
          <div className="stat">
            <div className="v">90 дн</div>
            <div className="l">Ротация ключей</div>
            <div className="sub">Каждые 90 дней основной ключ перевыпускается. Старые сохраняются для дешифровки.</div>
          </div>
          <div className="stat">
            <div className="v">2-сервиса</div>
            <div className="l">Разделение</div>
            <div className="sub">Данные — в Supabase. Ключи — в Vercel KV. Один сервис не видит другого.</div>
          </div>
          <div className="stat">
            <div className="v">30 дн</div>
            <div className="l">Удаление</div>
            <div className="sub">При удалении аккаунта данные стираются за 30 дней. Бэкапы — за 90.</div>
          </div>
        </div>
      </section>

      {/* Глава 4 — запросы от властей */}
      <section className="wrap section">
        <span className="eyebrow">Глава 4 · запросы от властей</span>
        <h2 style={{ marginTop: 10 }}>Сколько раз нас просили выдать данные.</h2>
        <p style={{ color: "oklch(var(--text-2))", maxWidth: "56ch", marginTop: 8 }}>
          Этот лог обновляется ежеквартально. Мы публикуем абсолютно каждый запрос, в рамках разрешённого законом.
        </p>

        <div className="gov-log">
          <div className="gov-row">
            <span>Период</span><span>Источник запроса</span><span>Запросов</span><span>Выдано</span>
          </div>
          {(["Q1 2026", "Q4 2025", "Q3 2025", "Q2 2025"] as const).map((period) => (
            <div className="gov-row" key={period}>
              <span>{period}</span><span>—</span><span>0</span><span className="status">0</span>
            </div>
          ))}
        </div>

        <p style={{ marginTop: 16, color: "oklch(var(--text-3))", fontSize: 13, lineHeight: 1.55, maxWidth: "64ch" }}>
          Sakeenly зарегистрирована в ЕС. Российский 152-ФЗ не применим напрямую, но мы соблюдаем GDPR. Подробнее — в полном тексте политики.
        </p>
      </section>

      {/* Глава 5 — твои права */}
      <section className="wrap section">
        <span className="eyebrow">Глава 5 · твои права</span>
        <h2 style={{ marginTop: 10 }}>Что ты можешь сделать со своими данными.</h2>

        <div className="collect-grid" style={{ marginTop: 28 }}>
          <div className="collect-card">
            <h3>Экспорт всего</h3>
            <p style={{ color: "oklch(var(--text-2))", fontSize: 14, lineHeight: 1.6 }}>
              JSON-файл со всеми твоими закладками, заметками, streak и историей вопросов. Один клик в профиле.
            </p>
            <a className="btn btn-soft btn-sm" style={{ alignSelf: "flex-start", marginTop: "auto" }}>
              Скачать архив
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            </a>
          </div>
          <div className="collect-card">
            <h3>Удаление аккаунта</h3>
            <p style={{ color: "oklch(var(--text-2))", fontSize: 14, lineHeight: 1.6 }}>
              Полное стирание данных за 30 дней. Без вопросов, без удержания, без писем-возвратов.
            </p>
            <a className="btn btn-soft btn-sm" style={{ alignSelf: "flex-start", marginTop: "auto" }}>
              Удалить аккаунт
            </a>
          </div>
          <div className="collect-card">
            <h3>Запрос на конкретное</h3>
            <p style={{ color: "oklch(var(--text-2))", fontSize: 14, lineHeight: 1.6 }}>
              Хочешь узнать всё, что мы знаем о конкретном email? Напиши на{" "}
              <a href="mailto:privacy@sakeenly.com" className="mono" style={{ color: "oklch(var(--accent))" }}>privacy@sakeenly.com</a>{" "}
              — ответим в течение 7 дней.
            </p>
            <a className="btn btn-soft btn-sm" href="mailto:privacy@sakeenly.com" style={{ alignSelf: "flex-start", marginTop: "auto" }}>
              Написать
            </a>
          </div>
        </div>
      </section>

      <section className="wrap section">
        <div className="quote-block geo-frame">
          {(["tl", "tr", "bl", "br"] as const).map((p) => (
            <span key={p} className={`corner ${p}`}>
              <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="0.9">
                <path d="M2 18 Q2 2 18 2"/>
                <path d="M8 2 Q8 8 2 8" opacity="0.7"/>
                <circle cx="18" cy="18" r="3"/>
                <path d="M18 14 L19 17 L22 18 L19 19 L18 22 L17 19 L14 18 L17 17 Z" fill="currentColor" opacity="0.8" stroke="none"/>
              </svg>
            </span>
          ))}
          <span className="eyebrow">Принцип, на котором основан Sakeenly</span>
          <div className="ar arabic" lang="ar" dir="rtl" style={{ marginTop: 16 }}>
            وَلَا تَجَسَّسُوا
          </div>
          <p className="ru">«И не следите [за чужими делами]…»</p>
          <p className="cite">Сура «Комнаты» · 49:12</p>
        </div>
      </section>

      <section className="wrap">
        <div className="priv-cta">
          <span className="eyebrow">Открытость · полностью</span>
          <h2 style={{ marginTop: 14 }}>Каждая строка кода — открыта.</h2>
          <p>Sakeenly работает на open-source стеке. Schema базы, политика отказов ИИ и refusal-tests — всё на GitHub.</p>
          <div style={{ marginTop: 32, display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <a className="btn btn-primary" href="#">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.8.1-.7.1-.7 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.9 1.3 3.6 1 .1-.8.4-1.3.8-1.7-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.6.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.7-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.3v3.4c0 .3.2.7.8.6A12 12 0 0 0 12 0Z"/></svg>
              Посмотреть на GitHub
            </a>
            <a className="btn btn-ghost" href="mailto:hello@sakeenly.com">hello@sakeenly.com</a>
          </div>
        </div>
      </section>
    </>
  );
}
