"use client";

import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInPage() {
  const t = useTranslations("si");
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <section className="auth-wrap">
      <aside className="auth-aside">
        <div className="geo-stars-soft"></div>
        <div>
          <span className="eyebrow">{t("aside_eyebrow")}</span>
          <h2>{t("aside_h")}</h2>
          <div className="arabic" dir="rtl">سَكِينَة</div>
          <p className="quote">{t("aside_q")}</p>
          <p className="cite">{t("aside_cite")}</p>
        </div>
        <ul className="auth-bullets">
          {(["bull1", "bull2", "bull3", "bull4"] as const).map((k) => (
            <li key={k}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12l5 5 9-11"/></svg>{" "}
              <span>{t(k)}</span>
            </li>
          ))}
        </ul>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <span className="eyebrow">{t("main_eyebrow")}</span>
          <h1 style={{ marginTop: 10 }}>{t("main_h")}</h1>
          <p className="lede">{t("main_lede")}</p>

          <div className="oauth-btns">
            <button
              className="oauth-btn"
              type="button"
              disabled={pending}
              onClick={() => { setPending(true); signIn("google"); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M21.6 12.2c0-.8-.07-1.6-.2-2.36H12v4.46h5.4a4.6 4.6 0 0 1-2 3.03v2.5h3.23c1.9-1.74 3-4.31 3-7.63z"/>
                <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.42l-3.23-2.5c-.9.6-2.04.95-3.4.95-2.6 0-4.8-1.76-5.6-4.12H3.07v2.6A10 10 0 0 0 12 22z"/>
                <path fill="#FBBC05" d="M6.4 13.9a6 6 0 0 1 0-3.8V7.5H3.07a10 10 0 0 0 0 9z"/>
                <path fill="#EA4335" d="M12 6c1.47 0 2.79.5 3.83 1.5l2.86-2.87C16.96 3.06 14.7 2 12 2A10 10 0 0 0 3.07 7.5L6.4 10.1C7.2 7.74 9.4 6 12 6z"/>
              </svg>
              <span>{t("btn_google")}</span>
            </button>
            <button className="oauth-btn" type="button" disabled>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.7 1.2c0 1-.4 2-1 2.7-.7.8-1.7 1.4-2.8 1.3-.1-1 .4-2 1-2.7.7-.7 1.7-1.3 2.8-1.3zM20.5 17c-.5 1.2-1 2.3-1.8 3.2-1 1.3-2.1 2.7-3.7 2.7-1.6 0-2-.9-3.9-.9s-2.4.9-3.8.9c-1.6 0-2.7-1.3-3.7-2.6-1.7-2.5-2.7-7-1.1-9.9.8-1.5 2.2-2.4 3.7-2.5 1.5 0 2.9 1 3.9 1s2.6-1.2 4.4-1c.7 0 2.8.3 4.1 2.2-1 .6-2.4 1.8-2.4 3.7 0 2.2 2 3 2.3 3.2z"/>
              </svg>
              <span>{t("btn_apple")}</span>
            </button>
          </div>

          <div className="divider-or">{t("or")}</div>

          <form
            className="magic-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!email) return;
              setPending(true);
              signIn("email", { email });
            }}
          >
            <div className="field">
              <label htmlFor="email">{t("label_email")}</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("email_placeholder")}
              />
            </div>
            <button className="magic-btn" type="submit" disabled={pending}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
              <span>{t("btn_magic")}</span>
            </button>
          </form>

          <p
            className="terms"
            dangerouslySetInnerHTML={{ __html: t.raw("terms_html") as string }}
          />
        </div>
      </main>
    </section>
  );
}
