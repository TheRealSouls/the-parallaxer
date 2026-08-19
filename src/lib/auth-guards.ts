import "server-only";

import { headers } from "next/headers";
import { forbidden, unauthorized } from "next/navigation";
import { auth } from "@/lib/auth";
import type { UserRole } from "@/generated/prisma/enums";

/**
 * Server-side access control.
 *
 * Every guard here re-reads the session from the database on each call. Nothing
 * trusts a role sent from the client, and middleware is treated as a hint rather
 * than a check: it only sees whether a session cookie exists, not whether it is
 * valid or what role it carries. A route is protected because it calls one of
 * these, not because middleware matched its path.
 *
 * Import this only from server components, route handlers, and server actions.
 * The "server-only" import above turns a mistake into a build error.
 */

export type SessionUser = {
  id: string;
  name: string;
  /** The public identity. Falls back to name for accounts predating nicknames. */
  nickname: string | null;
  email: string;
  image: string | null;
  role: UserRole;
  /** Masthead position, null for readers. Pair with beat via toEditorTitle. */
  rank: string | null;
  beat: number | null;
};

const RANK: Record<UserRole, number> = { reader: 0, editor: 1, admin: 2 };

/** The signed-in user, or null. Never throws, for pages that adapt to both. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;

  const user = session.user as typeof session.user & {
    role?: string;
    nickname?: string | null;
    rank?: string | null;
    beat?: number | null;
  };
  return {
    id: user.id,
    name: user.name,
    nickname: user.nickname ?? null,
    email: user.email,
    image: user.image ?? null,
    rank: user.rank ?? null,
    beat: user.beat ?? null,
    // Anything unrecognised is treated as the least privileged role rather than
    // trusted, so a bad value fails closed.
    role: (user.role === "admin" || user.role === "editor" ? user.role : "reader") as UserRole,
  };
}

/** Requires any signed-in account. Renders the 401 page otherwise. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) unauthorized();
  return user;
}

/** Requires at least the given role. Renders 401 or 403 as appropriate. */
export async function requireRole(minimum: UserRole): Promise<SessionUser> {
  const user = await requireUser();
  if (RANK[user.role] < RANK[minimum]) forbidden();
  return user;
}

export const requireEditor = () => requireRole("editor");
export const requireAdmin = () => requireRole("admin");

/** Non-throwing checks, for deciding whether to render a control at all. */
export function canPublish(user: SessionUser | null): boolean {
  return user !== null && RANK[user.role] >= RANK.editor;
}

export function canModerate(user: SessionUser | null): boolean {
  return user !== null && RANK[user.role] >= RANK.editor;
}

export function canAdminister(user: SessionUser | null): boolean {
  return user !== null && user.role === "admin";
}

/**
 * Whether this user may edit this specific article. Editors own their drafts;
 * admins may edit anything.
 */
export function canEditArticle(user: SessionUser | null, authorId: string): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  return user.role === "editor" && user.id === authorId;
}
