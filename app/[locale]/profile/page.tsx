import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { SignOutButton } from "@/components/profile/SignOutButton";
import type { Locale } from "@/i18n/routing";

interface PageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ upgraded?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pf" });
  return { title: t("eyebrow"), alternates: { canonical: "/profile" } };
}

interface BookmarkRow {
  id: string;
  ayahKey: string;
  note: string | null;
  createdAt: Date;
}

interface ProfileUser {
  id: string;
  name: string | null;
  email: string | null;
}

export default async function ProfilePage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/signin?callbackUrl=/${locale}/profile`);

  const bookmarks = await db.bookmark.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, ayahKey: true, note: true, createdAt: true },
  });

  const sp = await searchParams;
  return (
    <Content
      user={user as ProfileUser}
      bookmarks={bookmarks as BookmarkRow[]}
      upgraded={sp.upgraded === "1"}
    />
  );
}

function Content({
  user,
  bookmarks,
  upgraded,
}: {
  user: ProfileUser;
  bookmarks: BookmarkRow[];
  upgraded: boolean;
}) {
  const t = useTranslations("pf");
  const initial = (user.name ?? user.email ?? "S").charAt(0).toUpperCase();

  return (
    <section className="wrap">
      {upgraded && (
        <div style={{
          marginTop: 24,
          padding: 16,
          borderRadius: 14,
          border: "1px solid var(--accent)",
          background: "var(--accent-soft)",
          color: "var(--text)",
          fontSize: 14,
        }}>
          ✓ Подписка активирована.
        </div>
      )}

      {/* HEAD */}
      <div className="profile-head">
        <div className="avatar-big">{initial}</div>
        <div className="profile-meta">
          <span className="eyebrow">{t("eyebrow")}</span>
          <h1 style={{ marginTop: 8 }}>{user.name ?? "Гость"}</h1>
          <div className="email">{user.email}</div>
        </div>
        <div className="profile-actions">
          <Link className="btn btn-soft btn-sm" href="/profile">{t("actions.export")}</Link>
          <SignOutButton />
        </div>
      </div>

      {/* STATS */}
      <div className="profile-stats-grid">
        <div className="stat-card">
          <span className="eyebrow">{t("stat_streak")}</span>
          <span className="v">17</span>
          <span className="d">{t("stat_streak_d")}</span>
          <svg className="corner" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M12 2 L14.2 9.8 L22 12 L14.2 14.2 L12 22 L9.8 14.2 L2 12 L9.8 9.8 Z" />
          </svg>
        </div>
        <div className="stat-card">
          <span className="eyebrow">{t("stat_bookmarks")}</span>
          <span className="v">{bookmarks.length}</span>
          <span className="d">{t("stat_bookmarks_d")}</span>
          <svg className="corner" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16l7-3 7 3z" />
          </svg>
        </div>
      </div>

      {/* SETTINGS */}
      <div className="sec-head">
        <div>
          <span className="eyebrow">{t("settings_eyebrow")}</span>
          <h2 style={{ marginTop: 8 }}>{t("settings_h")}</h2>
        </div>
      </div>
      <div className="settings-grid">
        <div className="setting">
          <span className="lab">{t("label_translation")}</span>
          <select defaultValue="kuliev">
            <option value="kuliev">{t("t.kuliev")}</option>
            <option value="abu">{t("t.abu")}</option>
            <option value="awqaf">{t("t.awqaf")}</option>
            <option value="sahih">{t("t.sahih")}</option>
            <option value="pickthall">{t("t.pickthall")}</option>
          </select>
        </div>
        <div className="setting">
          <span className="lab">{t("label_reciter")}</span>
          <select defaultValue="abdulbaset-mujawwad">
            <option value="abdulbaset-mujawwad">{t("r.basit")}</option>
            <option value="sudais">{t("r.sudais")}</option>
            <option value="husary">{t("r.husary")}</option>
          </select>
        </div>
        <div className="setting">
          <span className="lab">{t("label_theme")}</span>
          <select defaultValue="dark">
            <option value="dark">{t("th.dark")}</option>
            <option value="light">{t("th.light")}</option>
            <option value="sepia">{t("th.sepia")}</option>
            <option value="mushaf">{t("th.mushaf")}</option>
          </select>
        </div>
      </div>

      {/* BOOKMARKS */}
      <div className="sec-head">
        <div>
          <span className="eyebrow">{t("bm_eyebrow")}</span>
          <h2 style={{ marginTop: 8 }}>{t("bm_h")}</h2>
        </div>
        <Link href="/profile">{t("bm_all")}</Link>
      </div>
      <div className="bm-list">
        {bookmarks.length === 0 && (
          <div style={{ padding: 24, color: "var(--text-2)", fontSize: 14 }}>
            Пока пусто — сохрани аят в Reader.
          </div>
        )}
        {bookmarks.slice(0, 5).map((b) => {
          const [s, a] = b.ayahKey.split(":");
          return (
            <Link key={b.id} className="bm" href={`/reader/${s}/${a}`}>
              <span className="key">{b.ayahKey}</span>
              <span className="preview">{b.note ?? "—"}</span>
              <span className="ago">{new Date(b.createdAt).toLocaleDateString()}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
