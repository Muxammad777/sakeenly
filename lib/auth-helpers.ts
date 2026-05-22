import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

/**
 * Returns the current user with their database role attached.
 * Null if not logged in.
 */
export async function getCurrentUserWithRole() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const row = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, image: true, role: true },
  });
  return row;
}

/**
 * Server-side gate for admin-only pages and route handlers. Redirects to
 * /signin when unauthenticated, and to / when logged in but not an admin
 * (never reveals admin existence to non-admins).
 */
export async function requireAdmin() {
  const user = await getCurrentUserWithRole();
  if (!user) redirect("/signin?callbackUrl=/admin");
  if (user.role !== "admin") redirect("/");
  return user;
}
