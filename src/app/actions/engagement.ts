"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { forbidden } from "next/navigation";
import { auth } from "@/lib/auth";
import { canModerate, getSessionUser, requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/db";
import {
  COMMENT_EDIT_GRACE_MINUTES,
  COMMENT_IP_LIMIT,
  COMMENT_IP_WINDOW_MINUTES,
  COMMENT_MAX,
  COMMENT_RATE_LIMIT,
  COMMENT_RATE_WINDOW_MINUTES,
} from "@/lib/engagement-limits";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * Comments and likes.
 *
 * Every action re-reads the session. A server action is a public endpoint,
 * reachable by anyone who knows its id, so the fact that only a signed-in reader
 * ever sees the form is not a check.
 */

export type CommentResult = { ok: true } | { ok: false; error: string };

/**
 * The signed-in reader, plus the two things that decide whether they may post:
 * a confirmed address, and no live ban.
 *
 * Requiring confirmation is the cheapest spam control there is. It costs a
 * genuine reader one click and costs somebody running a script a working inbox
 * per account.
 */
async function requirePoster() {
  const user = await requireUser();
  const session = await auth.api.getSession({ headers: await headers() });

  const record = await prisma.user.findUnique({
    where: { id: user.id },
    select: { bannedUntil: true },
  });

  const banned = record?.bannedUntil ? record.bannedUntil > new Date() : false;

  return { user, verified: Boolean(session?.user?.emailVerified), banned };
}

export async function postComment(input: {
  articleId: string;
  parentId: string | null;
  body: string;
}): Promise<CommentResult> {
  const { user, verified, banned } = await requirePoster();

  if (banned) return { ok: false, error: "Your account cannot post at the moment." };
  if (!verified) {
    return { ok: false, error: "Confirm your email address before commenting." };
  }

  const body = input.body.trim();
  if (body.length === 0) return { ok: false, error: "Write something first." };
  if (body.length > COMMENT_MAX) {
    return { ok: false, error: `Comments are at most ${COMMENT_MAX} characters.` };
  }

  // Two limits, because they catch different things. The per-account count
  // catches one person flooding a thread; the per-address one catches somebody
  // spreading the same flood over several accounts.
  const since = new Date(Date.now() - COMMENT_RATE_WINDOW_MINUTES * 60_000);
  const recent = await prisma.comment.count({
    where: { authorId: user.id, createdAt: { gte: since } },
  });
  if (recent >= COMMENT_RATE_LIMIT) {
    return { ok: false, error: "You are commenting very quickly. Try again in a few minutes." };
  }

  const byAddress = await checkRateLimit("comment", COMMENT_IP_LIMIT, COMMENT_IP_WINDOW_MINUTES);
  if (!byAddress.allowed) {
    return { ok: false, error: "Too many comments from this connection. Try again shortly." };
  }

  const article = await prisma.article.findUnique({
    where: { id: input.articleId },
    select: { id: true, slug: true, status: true, commentsLocked: true },
  });
  if (!article || article.status !== "published") {
    return { ok: false, error: "That article is not open for comments." };
  }
  if (article.commentsLocked) {
    return { ok: false, error: "Comments are closed on this article." };
  }

  // Threads are one level deep, so a reply to a reply is attached to the parent
  // of the thread rather than being refused.
  let parentId: string | null = null;
  if (input.parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: input.parentId },
      select: { id: true, parentId: true, articleId: true },
    });
    if (!parent || parent.articleId !== article.id) {
      return { ok: false, error: "That comment no longer exists." };
    }
    parentId = parent.parentId ?? parent.id;
  }

  await prisma.comment.create({
    data: { articleId: article.id, authorId: user.id, parentId, body },
  });

  revalidatePath(`/article/${article.slug}`);
  return { ok: true };
}

/**
 * Rewrites a comment, within the grace window and by its author only.
 *
 * The window is what keeps this honest. Without it somebody could soften a
 * remark after five people had replied to it, and the thread would stop making
 * sense to anyone reading it later.
 */
export async function editComment(commentId: string, body: string): Promise<CommentResult> {
  const user = await requireUser();

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { article: { select: { slug: true } } },
  });
  if (!comment) return { ok: false, error: "That comment no longer exists." };
  if (comment.authorId !== user.id) forbidden();
  if (comment.status !== "visible") {
    return { ok: false, error: "That comment can no longer be edited." };
  }

  const age = Date.now() - comment.createdAt.getTime();
  if (age > COMMENT_EDIT_GRACE_MINUTES * 60_000) {
    return {
      ok: false,
      error: `Comments can only be edited within ${COMMENT_EDIT_GRACE_MINUTES} minutes of posting.`,
    };
  }

  const next = body.trim();
  if (next.length === 0) return { ok: false, error: "Write something first." };
  if (next.length > COMMENT_MAX) {
    return { ok: false, error: `Comments are at most ${COMMENT_MAX} characters.` };
  }

  await prisma.comment.update({
    where: { id: commentId },
    data: { body: next, editedAt: new Date() },
  });

  revalidatePath(`/article/${comment.article.slug}`);
  return { ok: true };
}

/**
 * Removes a comment.
 *
 * Soft delete, because a hard delete would take any replies with it and leave
 * the thread unreadable. Moderators may remove anyone's; readers only their own.
 */
export async function deleteComment(commentId: string): Promise<CommentResult> {
  const user = await requireUser();

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { article: { select: { slug: true } } },
  });
  if (!comment) return { ok: false, error: "That comment no longer exists." };

  const own = comment.authorId === user.id;
  if (!own && !canModerate(user)) forbidden();

  await prisma.comment.update({
    where: { id: commentId },
    data: { status: "deleted", body: own ? "[removed by the author]" : "[removed by a moderator]" },
  });

  revalidatePath(`/article/${comment.article.slug}`);
  return { ok: true };
}

/**
 * Flags a comment for a moderator.
 *
 * One report per person per comment, enforced by the compound key, so reporting
 * repeatedly cannot push something up the queue. Reporting your own comment is
 * refused because the delete button is right there.
 */
export async function reportComment(commentId: string, reason: string): Promise<CommentResult> {
  const user = await requireUser();

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { id: true, authorId: true },
  });
  if (!comment) return { ok: false, error: "That comment no longer exists." };
  if (comment.authorId === user.id) {
    return { ok: false, error: "You can delete your own comment instead." };
  }

  await prisma.commentReport.upsert({
    where: { commentId_reporterId: { commentId, reporterId: user.id } },
    create: { commentId, reporterId: user.id, reason: reason.trim().slice(0, 300) || null },
    update: { reason: reason.trim().slice(0, 300) || null },
  });

  revalidatePath("/studio/moderation");
  return { ok: true };
}

/** Hides or restores a comment. Editors and admins only. */
export async function moderateComment(
  commentId: string,
  status: "visible" | "hidden",
): Promise<CommentResult> {
  const user = await requireUser();
  if (!canModerate(user)) forbidden();

  const comment = await prisma.comment.update({
    where: { id: commentId },
    data: { status },
    include: { article: { select: { slug: true } } },
  });

  revalidatePath(`/article/${comment.article.slug}`);
  revalidatePath("/studio/moderation");
  return { ok: true };
}

/**
 * Suspends an account for a number of days, or lifts a suspension with 0.
 *
 * A ban, not a deletion: their published articles and the bylines on them stay
 * exactly where they are. Removing somebody's work because they were rude in a
 * comment thread would misrepresent the archive.
 */
export async function banUser(
  userId: string,
  days: number,
  reason: string,
): Promise<CommentResult> {
  const moderator = await requireUser();
  if (!canModerate(moderator)) forbidden();
  if (userId === moderator.id) {
    return { ok: false, error: "You cannot suspend your own account." };
  }

  const target = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!target) return { ok: false, error: "That account no longer exists." };

  // Only an admin may suspend another member of staff, so one editor cannot
  // lock another out during a disagreement.
  if (target.role !== "reader" && moderator.role !== "admin") forbidden();

  await prisma.user.update({
    where: { id: userId },
    data: {
      bannedUntil: days > 0 ? new Date(Date.now() + days * 86_400_000) : null,
      bannedReason: days > 0 ? reason.trim().slice(0, 300) || null : null,
    },
  });

  revalidatePath("/studio/moderation");
  return { ok: true };
}

/** Closes or reopens the thread on one article. */
export async function setCommentsLocked(
  articleId: string,
  locked: boolean,
): Promise<CommentResult> {
  const user = await requireUser();
  if (!canModerate(user)) forbidden();

  const article = await prisma.article.update({
    where: { id: articleId },
    data: { commentsLocked: locked },
    select: { slug: true },
  });

  revalidatePath(`/article/${article.slug}`);
  return { ok: true };
}

/**
 * Adds or removes this reader's like.
 *
 * Returns the new state so the button can reconcile against the server rather
 * than trusting whatever it optimistically drew.
 */
export async function toggleLike(
  articleId: string,
): Promise<{ count: number; liked: boolean } | { error: string }> {
  const user = await getSessionUser();
  if (!user) return { error: "Sign in to like an article." };

  const record = await prisma.user.findUnique({
    where: { id: user.id },
    select: { bannedUntil: true },
  });
  if (record?.bannedUntil && record.bannedUntil > new Date()) {
    return { error: "Your account cannot do that at the moment." };
  }

  const existing = await prisma.like.findUnique({
    where: { userId_articleId: { userId: user.id, articleId } },
    select: { userId: true },
  });

  if (existing) {
    await prisma.like.delete({ where: { userId_articleId: { userId: user.id, articleId } } });
  } else {
    await prisma.like.create({ data: { userId: user.id, articleId } });
  }

  const count = await prisma.like.count({ where: { articleId } });
  return { count, liked: !existing };
}
