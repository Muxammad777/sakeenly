"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

const Check = () => (
  <svg className="check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const X = () => (
  <svg className="check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m18 6-12 12M6 6l12 12" />
  </svg>
);
const CmpCheck = () => (
  <svg className="check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export function PricingClient() {
  const t = useTranslations("pr");
  const [yearly, setYearly] = useState(false);

  return (
    <>
      {/* HERO */}
      <section className="wrap pricing-hero">
        <div className="geo-stars-fade" aria-hidden />
        <span className="tag">
          <span className="tag-dot" />
          <span>{t("badge")}</span>
        </span>
        <h1>
          <span>{t("h1")}</span>
          <br />
          <span>{t("h2")}</span>
        </h1>
        <p>{t("lede")}</p>

        <div className="billing-toggle" role="group" aria-label="Период">
          <button className={!yearly ? "active" : ""} onClick={() => setYearly(false)}>
            <span>{t("month")}</span>
          </button>
          <button className={yearly ? "active" : ""} onClick={() => setYearly(true)}>
            <span>{t("year")}</span> <span className="save-badge">−33%</span>
          </button>
        </div>
      </section>

      {/* PLANS */}
      <section className="wrap">
        <div className="plans">
          {/* Free */}
          <div className="plan">
            <h3>{t("p1.name")}</h3>
            <p className="pitch">{t("p1.sub")}</p>
            <div className="price-block">
              <span className="currency">₽</span>
              <span className="amount">0</span>
              <span className="per">{t("p1.per")}</span>
            </div>
            <p className="price-sub">{t("p1.hint")}</p>
            <button className="btn btn-soft plan-cta">{t("p1.cta")}</button>
            <div className="plan-features">
              <div className="lbl">{t("p1.lbl")}</div>
              <div className="feat-row"><Check />{t("p1.f1")}</div>
              <div className="feat-row"><Check />{t("p1.f2")}</div>
              <div className="feat-row"><Check />{t("p1.f3")}</div>
              <div className="feat-row"><Check />{t("p1.f4")}</div>
              <div className="feat-row"><Check />{t("p1.f5")}</div>
              <div className="feat-row muted"><X />{t("p1.f6")}</div>
              <div className="feat-row muted"><X />{t("p1.f7")}</div>
            </div>
          </div>

          {/* Premium */}
          <div className="plan featured">
            <span className="plan-badge">{t("popular")}</span>
            <h3>Premium</h3>
            <p className="pitch">{t("p2.sub")}</p>
            <div className="price-block">
              <span className="currency">$</span>
              <span className="amount">{yearly ? "3.33" : "4.99"}</span>
              <span className="per">{t("p2.per")}</span>
            </div>
            <p className="price-sub">{t("p2.hint")}</p>
            <button className="btn btn-primary plan-cta">
              {t("p2.cta")}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
            <div className="plan-features">
              <div className="lbl">{t("p2.lbl")}</div>
              <div className="feat-row"><Check />{t("p2.f1")}</div>
              <div className="feat-row"><Check />{t("p2.f2")}</div>
              <div className="feat-row"><Check />{t("p2.f3")}</div>
              <div className="feat-row"><Check />{t("p2.f4")}</div>
              <div className="feat-row"><Check />{t("p2.f5")}</div>
              <div className="feat-row"><Check />{t("p2.f6")}</div>
            </div>
          </div>

          {/* Family */}
          <div className="plan">
            <h3>{t("p3.name")}</h3>
            <p className="pitch">{t("p3.sub")}</p>
            <div className="price-block">
              <span className="currency">$</span>
              <span className="amount">{yearly ? "6.66" : "9.99"}</span>
              <span className="per">{t("p3.per")}</span>
            </div>
            <p className="price-sub">{t("p3.hint")}</p>
            <button className="btn btn-ghost plan-cta">{t("p3.cta")}</button>
            <div className="plan-features">
              <div className="lbl">{t("p3.lbl")}</div>
              <div className="feat-row"><Check />{t("p3.f1")}</div>
              <div className="feat-row"><Check />{t("p3.f2")}</div>
              <div className="feat-row"><Check />{t("p3.f3")}</div>
              <div className="feat-row"><Check />{t("p3.f4")}</div>
              <div className="feat-row"><Check />{t("p3.f5")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARE */}
      <section className="wrap compare">
        <h2>{t("cmp.h_title")}</h2>
        <p className="sub">{t("cmp.h_sub")}</p>

        <div className="compare-table">
          <div className="compare-row head">
            <div>{t("cmp.col1")}</div>
            <div className="compare-cell center">{t("cmp.col2")}</div>
            <div className="compare-cell center">{t("cmp.col3")}</div>
            <div className="compare-cell center">{t("cmp.col4")}</div>
          </div>

          <div className="compare-row section">{t("cmp.s1")}</div>

          <div className="compare-row">
            <div>{t("cmp.row.114")}</div>
            <div className="compare-cell center"><CmpCheck /></div>
            <div className="compare-cell center"><CmpCheck /></div>
            <div className="compare-cell center"><CmpCheck /></div>
          </div>
          <div className="compare-row">
            <div>{t("cmp.row.30q")}</div>
            <div className="compare-cell center"><CmpCheck /></div>
            <div className="compare-cell center"><CmpCheck /></div>
            <div className="compare-cell center"><CmpCheck /></div>
          </div>
          <div className="compare-row">
            <div>{t("cmp.row.off")}</div>
            <div className="compare-cell center"><span className="x">—</span></div>
            <div className="compare-cell center"><span className="v">10 сур</span></div>
            <div className="compare-cell center"><span className="v">Все 114</span></div>
          </div>
          <div className="compare-row">
            <div>{t("cmp.row.sleep")}</div>
            <div className="compare-cell center"><span className="v">0.75×–1.5×</span></div>
            <div className="compare-cell center"><CmpCheck /></div>
            <div className="compare-cell center"><CmpCheck /></div>
          </div>

          <div className="compare-row section">{t("cmp.s2")}</div>

          <div className="compare-row">
            <div>{t("cmp.row.aiq")}</div>
            <div className="compare-cell center"><span className="v">5 / {t("per_day")}</span></div>
            <div className="compare-cell center"><span className="v">∞</span></div>
            <div className="compare-cell center"><span className="v">∞ × 6</span></div>
          </div>
          <div className="compare-row">
            <div>{t("cmp.row.tafsir")}</div>
            <div className="compare-cell center"><span className="x">—</span></div>
            <div className="compare-cell center"><CmpCheck /></div>
            <div className="compare-cell center"><CmpCheck /></div>
          </div>

          <div className="compare-row section">{t("cmp.s3")}</div>

          <div className="compare-row">
            <div>{t("cmp.row.lds")}</div>
            <div className="compare-cell center"><CmpCheck /></div>
            <div className="compare-cell center"><CmpCheck /></div>
            <div className="compare-cell center"><CmpCheck /></div>
          </div>
          <div className="compare-row">
            <div>{t("cmp.row.mushaf")}</div>
            <div className="compare-cell center"><span className="x">—</span></div>
            <div className="compare-cell center"><CmpCheck /></div>
            <div className="compare-cell center"><CmpCheck /></div>
          </div>

          <div className="compare-row section">{t("cmp.s4")}</div>

          <div className="compare-row">
            <div>{t("cmp.row.6acc")}</div>
            <div className="compare-cell center"><span className="x">—</span></div>
            <div className="compare-cell center"><span className="x">—</span></div>
            <div className="compare-cell center"><CmpCheck /></div>
          </div>
          <div className="compare-row">
            <div>{t("cmp.row.kids")}</div>
            <div className="compare-cell center"><span className="x">—</span></div>
            <div className="compare-cell center"><span className="x">—</span></div>
            <div className="compare-cell center"><CmpCheck /></div>
          </div>
          <div className="compare-row">
            <div>{t("cmp.row.dash")}</div>
            <div className="compare-cell center"><span className="x">—</span></div>
            <div className="compare-cell center"><span className="x">—</span></div>
            <div className="compare-cell center"><CmpCheck /></div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="wrap">
        <div className="pricing-trust">
          {[1, 2, 3].map((n) => (
            <div key={n} className="trust-tile">
              <div className="ic">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h4>{t(`trust${n}.t` as `trust1.t`)}</h4>
              <p>{t(`trust${n}.p` as `trust1.p`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="wrap faq">
        <h2>{t("faq.h")}</h2>
        <div className="faq-list">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <details key={n} className="faq-item" open={n === 1}>
              <summary>{t(`faq.q${n}` as `faq.q1`)}</summary>
              <div className="body">{t(`faq.a${n}` as `faq.a1`)}</div>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
