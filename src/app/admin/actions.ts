"use server";

import { revalidatePath } from "next/cache";
import { forbidden } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guards";
import { fromEditorTitle, type EditorRank, type EditorTitle } from "@/lib/editorial";
import { isRegionCode, type RegionCode } from "@/lib/lenses";
import { ensureProfileSlug } from "@/lib/profile-slug";
import { slugify, uniqueSlug } from "@/lib/slug";

/**
 * Administration.
 *
 * Only admins reach any of this, and the check is repeated in every action for
 * the same reason as in the studio: a server action is a public endpoint.
 */

const RANKS: EditorRank[] = ["founding", "senior", "junior", "guest"];

/**
 * Sets somebody's permission role.
 *
 * An admin cannot demote themselves. Without that rule the last administrator
 * can lock everybody out of the admin screens with one careless click, and the
 * only way back is a hand-written database update.
 */
export async function setUserRole(userId: string, role: string) {
  const admin = await requireAdmin();

  if (role !== "reader" && role !== "editor" && role !== "admin") forbidden();
  if (userId === admin.id && role !== "admin") {
    return { error: "You cannot remove your own administrator role." };
  }

  await prisma.user.update({ where: { id: userId }, data: { role } });

  // Anybody who can publish needs a profile address, and a role alone is enough
  // to publish. Without this, promoting somebody to editor without also giving
  // them a masthead title leaves them with bylines pointing at a UUID and a
  // profile editor that refuses to save.
  if (role === "editor" || role === "admin") await ensureProfileSlug(userId);

  revalidatePath("/admin");
  return {};
}

/**
 * Appoints somebody to the masthead.
 *
 * Giving a title also gives a profile page, so a slug is minted here if the
 * account does not have one. A byline that links nowhere is worse than no link.
 */
export async function setEditorTitle(userId: string, rank: string, beat: number | null) {
  await requireAdmin();

  if (!RANKS.includes(rank as EditorRank)) forbidden();
  if ((rank === "senior" || rank === "junior") && !isRegionCode(beat)) {
    return { error: "Senior and junior editors need a beat." };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, nickname: true, slug: true },
  });
  if (!user) return { error: "That account no longer exists." };

  const title: EditorTitle =
    rank === "senior" || rank === "junior"
      ? { rank, beat: beat as RegionCode }
      : { rank: rank as "founding" | "guest" };

  const slug =
    user.slug ??
    (await uniqueSlug(slugify(user.nickname ?? user.name), (candidate) =>
      prisma.user.findFirst({ where: { slug: candidate }, select: { id: true } }).then(Boolean),
    ));

  await prisma.user.update({
    where: { id: userId },
    data: { ...fromEditorTitle(title), slug },
  });

  revalidatePath("/admin");
  revalidatePath("/about");
  return {};
}

/** Hides or restores a comment. */
export async function setCommentStatus(commentId: string, status: string) {
  await requireAdmin();
  if (status !== "visible" && status !== "hidden") forbidden();

  await prisma.comment.update({ where: { id: commentId }, data: { status } });
  revalidatePath("/admin");
  return {};
}
