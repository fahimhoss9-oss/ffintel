import { redirect } from "next/navigation";
import { db } from "./db";
import { createServerSupabaseClient } from "./supabase";

/**
 * Guards admin routes and server actions. Requires:
 *  1. A Supabase session (redirects to /login otherwise).
 *  2. The user's email listed in ADMIN_EMAILS (redirects to /login otherwise).
 *  3. Ensures a matching User row with role ADMIN exists in the database.
 *
 * Returns the admin's User row for audit logging.
 */
export async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) redirect("/login?next=/admin");

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!adminEmails.includes(user.email.toLowerCase())) {
    redirect("/login?error=not-admin");
  }

  const admin = await db().user.upsert({
    where: { id: user.id },
    update: { email: user.email, role: "ADMIN" },
    create: { id: user.id, email: user.email, role: "ADMIN" },
  });
  return admin;
}

/** Writes an audit-log entry for an admin action. */
export async function logAudit(
  action: string,
  entityType: string,
  entityId: string,
  details?: string,
  userId?: string
) {
  await db().auditLog.create({
    data: {
      action,
      entityType,
      entityId,
      details: details ?? null,
      userId: userId ?? null,
    },
  });
}

/**
 * The game all admin-created content belongs to. Prefers the "free-fire"
 * game; falls back to the oldest game. Throws a clear error when the
 * database has no games yet (e.g. seed not run).
 */
export async function getAdminGame() {
  const game =
    (await db().game.findFirst({ where: { slug: "free-fire" } })) ??
    (await db().game.findFirst({ orderBy: { createdAt: "asc" } }));
  if (!game) {
    throw new Error(
      "No game found in the database yet. Seed the database first (npm run db:seed) or add a game record."
    );
  }
  return game;
}
