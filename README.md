# Sakeenly

> **Find your sakeena. Каждый день.**

Современный Quran-companion для русскоязычных мусульман. Чтение, прослушивание,
AI-вопросы с обязательными цитатами — без рекламы, без трекеров.

- 🌐 Стек: **Next.js 14** (App Router) · **TypeScript** · **Tailwind** · **Prisma 6** · **Postgres** · **NextAuth** · **Anthropic Claude** · **Voyage AI** · **Stripe**
- 🌍 Источники данных: [Quran.com API v4](https://api-docs.quran.com/), [Sunnah.com API](https://sunnah.api-docs.io)
- 🔒 Приватность: zero third-party ads, никаких GA / Pixel; bookmarks/notes шифруются at rest
- 📜 Полное ТЗ — см. brief в корне репо

---

## 1. Что должно быть установлено

| Tool   | Версия         | Проверка                |
| ------ | -------------- | ----------------------- |
| Node   | ≥ 20.x         | `node --version`        |
| npm    | ≥ 10.x         | `npm --version`         |
| git    | любая          | `git --version`         |
| Docker | (опционально)  | для локального Postgres |

> **⚠ Внимание:** На текущей машине `git` не найден в PATH.
> Поставь его из <https://git-scm.com/download/win> и перезапусти терминал —
> после этого выполни команды из секции **6. Git init** ниже.

## 2. Установка

```powershell
cd sakeenly
npm install
Copy-Item .env.example .env.local
```

Заполни `.env.local` (см. секцию **3. Что нужно от тебя**).

## 3. Что нужно от тебя (чек-лист ключей)

Без этих секретов проект **не запустится в полной функциональности**.
Можно получать постепенно — пометь каждый ключ когда он у тебя на руках.

- [ ] **`ANTHROPIC_API_KEY`** — <https://console.anthropic.com/settings/keys>.
      Нужен с момента Task 4 (AI Q&A).
- [ ] **`VOYAGE_API_KEY`** — <https://dash.voyageai.com/>. Free tier 50M токенов.
- [ ] **`DATABASE_URL`** — Supabase free tier
      ([supabase.com](https://supabase.com) → New project → Settings → Database →
      Connection string → URI). После этого:
      ```powershell
      npm run db:migrate
      ```
- [ ] **`NEXTAUTH_SECRET`** — сгенерируй любой 32+ символьный токен,
      например через PowerShell:
      ```powershell
      [Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Maximum 256) }))
      ```
- [ ] **`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`** —
      <https://console.cloud.google.com/apis/credentials> → OAuth client →
      Authorised redirect URI: `http://localhost:3000/api/auth/callback/google`
      (для прода — `https://sakeenly.com/api/auth/callback/google`).
- [ ] **`APPLE_CLIENT_ID` / `APPLE_CLIENT_SECRET`** — для прода
      (<https://developer.apple.com/account/resources/identifiers/list/serviceId>).
      Можно отложить до Task 5 monetization.
- [ ] **`EMAIL_SERVER` / `EMAIL_FROM`** — для magic-link логина.
      Рекомендую Resend (<https://resend.com>, 3000 писем/мес бесплатно).
- [ ] **`STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`** — <https://dashboard.stripe.com/test/apikeys>.
      Нужно с Task 5.
- [ ] **`STRIPE_PRICE_PREMIUM_MONTHLY` / `_YEARLY` / `STRIPE_PRICE_FAMILY_MONTHLY`** —
      ID цен из Stripe Dashboard → Products. Создай:
      - Premium Monthly — $4.99/мес
      - Premium Yearly — $39.99/год
      - Family Monthly — $9.99/мес (до 6 seats)
- [ ] **`SUNNAH_API_KEY`** — <https://sunnah.api-docs.io/v1/getting-started>
      (нужно подать заявку, free).
- [ ] **Шрифт KFGQPC Hafs** — скачать с
      <https://qurancomplex.gov.sa/en/techquran/dev/> и положить в `public/fonts/KFGQPC-Hafs.ttf`.
      Fallback Amiri — <https://github.com/aliftype/amiri/releases> →
      `public/fonts/Amiri-Regular.ttf`. См. `public/fonts/README.md`.
- [ ] **Домен `sakeenly.com`** — для прод-деплоя (Vercel → Add domain). Можно отложить.

## 4. Локальный запуск

```powershell
npm run dev            # http://localhost:3000
npm run lint           # ESLint
npm run format         # Prettier
npm test               # Vitest
npm run db:studio      # Prisma Studio (GUI к БД)
```

## 5. Структура проекта

```
sakeenly/
├── app/                # Next.js App Router (страницы + API routes)
├── components/         # React-компоненты (UI primitives, ArabicText, AudioPlayer …)
├── lib/
│   ├── db.ts           # Prisma singleton
│   ├── utils.ts        # cn() helper
│   ├── ai/             # claude, voyage, rag, refusal_policy, citations  (Task 4)
│   └── api/            # quran.ts, sunnah.ts  (Task 3)
├── prisma/
│   └── schema.prisma   # User, Subscription, Bookmark, Streak, AskHistory + NextAuth
├── public/
│   └── fonts/          # KFGQPC-Hafs.ttf, Amiri-Regular.ttf (положить вручную)
├── tests/              # Vitest. CRITICAL: tests/refusal_policy.test.ts (100% pass)
└── .env.example        # шаблон секретов
```

## 6. Git init

После установки git:

```powershell
cd sakeenly
git init
git add .
git commit -m "Task 1: Sakeenly project setup (Next.js 14 + Prisma + NextAuth deps)"
git branch -M main
# git remote add origin git@github.com:<you>/sakeenly.git
# git push -u origin main
```

`.gitignore` уже создан create-next-app'ом и игнорирует `node_modules/`,
`.env*` (кроме `.env.example`), `.next/`.

## 7. Что сделано в Task 1 ✅

- Scaffolded Next.js 14 (App Router, TS, Tailwind, ESLint).
- Установлены: `next-auth@4`, `@next-auth/prisma-adapter`, `@anthropic-ai/sdk`,
  `voyageai`, `stripe`, `@prisma/client@6`, `prisma@6`, `zod`, `lucide-react`,
  `@radix-ui/*` (dialog/dropdown/popover/slot/toast/tooltip/tabs/switch/label),
  `class-variance-authority`, `clsx`, `tailwind-merge`. Dev: `vitest`, `prettier`.
- `prisma/schema.prisma` — модели User, Subscription, Bookmark, Streak, AskHistory + NextAuth.
  Прошёл `prisma format` и `prisma generate`.
- `lib/db.ts` — Prisma client singleton (Next.js-safe).
- `lib/utils.ts` — `cn()` для Tailwind.
- `.env.example` — все секреты с комментариями откуда брать.
- `vitest.config.ts`, `.prettierrc`, `tests/smoke.test.ts`.
- npm scripts: `dev`, `build`, `lint`, `format`, `test`, `prisma:generate`, `db:migrate`, `db:studio`.

## 8. Дальше: Task 2 — Auth + базовый layout

1. NextAuth route handler (`app/api/auth/[...nextauth]/route.ts`) с email + Google.
2. `app/layout.tsx` — header (logo + nav: Reader / Listen / Ask / Kids) + footer.
3. Темы (light / dark / sepia / mushaf-paper) через CSS variables + `localStorage`.
4. Hero на главной с слоганом «Find your sakeena. Каждый день.»

Поехали как будешь готов — `Task 2` запустит работу.
