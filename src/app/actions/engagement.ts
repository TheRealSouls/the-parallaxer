"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { forbidden } from "next/navigation";
import { auth } from "@/lib/auth";
import { canModerate, getSessionUser, requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/db";
import {
  COMMENT_MAX,
  COMMENT_RATE_LIMIT,
  COMMENT_RATE_WINDOW_MINUTES,
} from "@/lib/engagement-limits";

/**
 * Comments and likes.
 *
 * Every action re-reads the session. A server action is a public endpoint,
 * reachable by anyone who knows its id, so the fact that only a signed-in reader
 * ever sees the form is not a check.
 */

export type CommentResult = { ok: true } | { ok: false; error: string };

/**
 * Requires a signed-in reader with a confirmed email address.
 *
 * The confirmation requirement is the cheapest spam control there is: it costs a
 * genuine reader one click and costs somebody running a script a working inbox
 * per account.
 */
async function requireVerifiedReader() {
  const user = await requireUser();
  const session = await auth.api.getSession({ headers: await headers() });
  const verified = Boolean(session?.user?.emailVerified);
  return { user, verified };
}

export async function postComment(input: {
  articleId: string;
  parentId: string | null;
  body: string;
}): Promise<CommentResult> {
  const { user, verified } = await requireVerifiedReader();
  if (!verified) {
    return { ok: false, error: "Confirm your email address before commenting." };
  }

  const body = input.body.trim();
  if (body.length === 0) return { ok: false, error: "Write something first." };
  if (body.length > COMMENT_MAX) {
    return { ok: false, error: `Comments are at most ${COMMENT_MAX} characters.` };
  }

  // Rate limiting straight from the comments table. A dedicated store would be
  // faster, but this needs no extra service and the query is indexed.
  const since = new Date(Date.now() - COMMENT_RATE_WINDOW_MINUTES * 60_000);
  const recent = await prisma.comment.count({
    where: { authorId: user.id, createdAt: { gte: since } },
  });
  if (recent >= COMMENT_RATE_LIMIT) {
    return { ok: false, error: "You are commenting very quickly. Try again in a few minutes." };
  }

  const article = await prisma.article.findUnique({
    where: { id: input.articleId },
    select: { id: true, slug: true, status: true },
  });
  if (!article || article.status !== "published") {
    return { ok: false, error: "That article is not open for comments." };
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
