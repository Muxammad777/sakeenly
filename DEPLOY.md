# Sakeenly — Deploy

Шаг-за-шагом, от пустого Vercel-аккаунта до прод-домена `sakeenly.com`.

## 0. Перед стартом

- Git репозиторий запушен на GitHub
- Куплен домен `sakeenly.com` (любой регистратор)
- Аккаунты: [Vercel](https://vercel.com), [Supabase](https://supabase.com),
  [Stripe](https://dashboard.stripe.com), [Anthropic](https://console.anthropic.com),
  [Voyage AI](https://dash.voyageai.com), [Resend](https://resend.com) (или
  любой SMTP), [Google Cloud Console](https://console.cloud.google.com)

### Минимум для первого импорта в Vercel (на чём ничего не сломается)

Чтобы импортировать репо и получить рабочий preview-URL, обязательны только:

| ENV | Зачем | Без него |
|---|---|---|
| `DATABASE_URL` | Prisma, NextAuth-adapter, /profile, /admin | /signin, /profile, /admin, /api/bookmarks → 500 |
| `NEXTAUTH_SECRET` | подпись session-токенов | NextAuth откажется стартовать |
| `NEXTAUTH_URL` | OAuth/email-callback URLs | Magic-link и Google вернут на localhost |
| `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` **или** `EMAIL_SERVER` + `EMAIL_FROM` | хотя бы один способ входа | страница /signin покажет кнопки, но они не сработают |

Без этого минимума **главная (`/`), `/reader/*`, `/listen`, `/ayat/*`, `/kids/*`, `/about`, `/privacy`, `/scholars`, `/pricing` всё равно работают** — это контентные страницы без user-state. Можно сначала залить «витрину» с этим минимумом, а Stripe/Anthropic/Voyage подключать позже когда дойдут до соответствующих фич.

## 1. База данных — Supabase

1. **New project** → имя `sakeenly`, регион ближайший (Europe / Frankfurt). Сохрани password.
2. **Settings → Database → Connection string → URI** — это `DATABASE_URL`.
   Для миграций Prisma используй "Direct connection"; для прод-runtime —
   "Connection pooling" (Transaction mode).
3. Локально применить миграции:
   ```powershell
   cd sakeenly
   $env:DATABASE_URL = "postgresql://..."
   npm run db:migrate -- --name init
   ```
   Это создаст таблицы User / Account / Session / Bookmark / Streak / AskHistory / Subscription.

## 2. Auth — Google OAuth + Email

### Google
1. [Cloud Console](https://console.cloud.google.com) → **APIs & Services → Credentials**
   → **Create credentials → OAuth client ID** → Web application.
2. Authorised redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://sakeenly.com/api/auth/callback/google` (prod)
   - `https://*.vercel.app/api/auth/callback/google` (preview deployments)
3. Скопируй `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.

### Email magic-link
1. [Resend](https://resend.com) → Domains → добавь `sakeenly.com`. Подтверди DNS.
2. API Keys → создай sending key.
3. `EMAIL_SERVER = smtp://resend:<key>@smtp.resend.com:465`
4. `EMAIL_FROM = "Sakeenly <hello@sakeenly.com>"`

## 3. AI — Anthropic + Voyage

1. [Anthropic Console](https://console.anthropic.com/settings/keys) → создай key →
   `ANTHROPIC_API_KEY`. Накинь usage limit (например, $50/мес для старта).
2. [Voyage AI](https://dash.voyageai.com) → API keys → `VOYAGE_API_KEY`.
   Free tier 50M токенов — хватит для всех embeddings.

## 4. Stripe

1. [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys) → переключи на **Test mode**.
2. **Products → Create product**:
   - **Premium**
     - Price 1: `$4.99 / month` → recurring
     - Price 2: `$39.99 / year` → recurring
   - **Family**
     - Price 1: `$9.99 / month` → recurring · до 6 seats (управляется на стороне нашего приложения)
3. Скопируй Price IDs:
   - `STRIPE_PRICE_PREMIUM_MONTHLY`
   - `STRIPE_PRICE_PREMIUM_YEARLY`
   - `STRIPE_PRICE_FAMILY_MONTHLY`
4. [API Keys](https://dashboard.stripe.com/test/apikeys) → `STRIPE_SECRET_KEY`.
5. **Webhooks → Add endpoint**:
   - URL: `https://sakeenly.com/api/stripe/webhook` (после деплоя)
   - Events: `checkout.session.completed`, `customer.subscription.created`,
     `customer.subscription.updated`, `customer.subscription.deleted`
   - Скопируй **Signing secret** → `STRIPE_WEBHOOK_SECRET`
6. Для локального тестирования webhook:
   ```powershell
   stripe login
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   CLI выдаст ещё один webhook secret — используй его в `.env.local`.

## 5. Vercel

1. **New Project** → импортируй GitHub репо.
2. Framework preset: Next.js (auto). Root directory: `sakeenly`.
3. **Environment Variables** — добавь ВСЕ ключи из `.env.example`. Не забудь:
   - `NEXTAUTH_URL=https://sakeenly.com`
   - `DATABASE_URL` (pooled connection URL)
   - `NEXTAUTH_SECRET` — `openssl rand -base64 32`
4. **Build & Development** — оставь defaults (`npm run build`).
5. Первый деплой → preview-домен типа `sakeenly-xyz.vercel.app`.

## 6. Domain → sakeenly.com

1. Vercel → Project → **Settings → Domains → Add** `sakeenly.com` (и `www.sakeenly.com`).
2. Vercel покажет DNS-записи; в панели регистратора добавь:
   - A: `76.76.21.21`
   - CNAME `www`: `cname.vercel-dns.com`
3. Дождись HTTPS-сертификата (≤ 5 мин). Vercel сам выпускает Let's Encrypt.

## 6.5. Первый администратор

После первого деплоя в БД нет ни одного админа (поле `role` дефолтится в `user`). Чтобы получить доступ к `/admin/*`:

1. Зайди на прод-сайт и залогинься своим рабочим email (Google или magic-link). Это создаст запись `User` с `role: "user"`.
2. Из локальной машины с правильным `DATABASE_URL` в окружении прогони:
   ```powershell
   $env:DATABASE_URL = "<production-pooled-url>"
   npm run admin:promote you@example.com
   ```
   Скрипт ([scripts/promote-admin.ts](scripts/promote-admin.ts)) идемпотентен: повторный запуск ничего не ломает.
3. Перезагрузи страницу `https://sakeenly.com/admin` — увидишь дашборд.

**Альтернатива** через Supabase SQL Editor:
```sql
UPDATE "User" SET role = 'admin' WHERE email = 'you@example.com';
```

`/admin` **не локализован** (исключён из i18n-middleware) — открывается всегда на `/admin`, не на `/ru/admin`. Также `robots: noindex` — поисковики не индексируют админку.

## 7. Post-deploy checklist

- [ ] `/` главная грузится и переключаются темы
- [ ] `/reader/1/1` рендерит Аль-Фатиху и Mishari играет
- [ ] `/signin` принимает Google и шлёт magic-link
- [ ] `/ayat` показывает 30 подборок; каждая `/ayat/<slug>` отдаёт SEO-meta
- [ ] `/ask` принимает вопрос, фатва-shape → refusal; обычный → ответ с цитатами
- [ ] `/pricing` → checkout button → Stripe → success_url возвращает на `/profile?upgraded=1`
- [ ] После checkout webhook прописал `Subscription.plan = "premium"` (см. Prisma Studio)
- [ ] AI квота снимается после 5 вопросов на Free
- [ ] `/admin` отдаёт 307 на `/signin` для гостя, 307 на `/` для не-админа
- [ ] После `npm run admin:promote` `/admin` открывается и показывает реальные метрики
- [ ] Sitemap (TODO в Task 5+) индексируется в [Google Search Console](https://search.google.com/search-console)

## 8. Stripe live mode

Когда test mode зелёный:
1. Stripe → toggle **Live mode**, повтори шаги 4.2 – 4.5 (новые priceIds + webhook).
2. На Vercel замени `STRIPE_*` переменные на production.
3. Redeploy.

## 9. Бэкапы и наблюдаемость

- Supabase автоматически делает daily backups на бесплатном тарифе (7 дней retention).
- Vercel logs → Settings → Log Drains → подключи Logflare / Axiom (опционально).
- Stripe → Developers → Events — журнал всех webhook-ов.
