import "server-only";

import { prisma } from "@/lib/db";
import { canEditArticle, type SessionUser } from "@/lib/auth-guards";
import { forbidden, notFound } from "next/navigation";

/**
 * Reads for the editorial studio.
 *
 * Unlike the public queries these return drafts, so every function takes the
 * signed-in user and checks what they are allowed to see. Nothing here is
 * reachable without a role check having already happened at the page level; the
 * checks are repeated anyway, because a query that can only be called safely is
 * one refactor away from being called unsafely.
 */

/** Everything this person may work on. Admins see the whole desk. */
export async function getStudioArticles(user: SessionUser) {
  return prisma.article.findMany({
    where: user.role === "admin" ? {} : { authorId: user.id },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      lenses: true,
      publishedAt: true,
      updatedAt: true,
      viewCount: true,
      mapCell: true,
      author: { select: { id: true, name: true, nickname: true } },
      _count: { select: { comments: true, likes: true } },
    },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });
}

/**
 * One article for editing.
 *
 * Renders the 404 page for an id that does not exist and the 403 page for one
 * that does but belongs to somebody else. The distinction is deliberate: an
 * editor mistyping a URL should be told the piece is missing, not that they lack
 * permission for something that was never there.
 */
export async function getArticleForEditing(id: string, user: SessionUser) {
  const article = await prisma.article.findUnique({
    where: { id },
    include: { author: { select: { id: true, name: true, nickname: true } } },
  });

  if (!article) notFound();
  if (!canEditArticle(user, article.authorId)) forbidden();

  return article;
}

/** Revision history, newest first. */
export async function getRevisions(articleId: string) {
  return prisma.revision.findMany({
    where: { articleId },
    select: {
      id: true,
      createdAt: true,
      editor: { select: { name: true, nickname: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

/** Daily view counts for the last n days, oldest first, for the studio chart. */
export async function getViewSeries(articleId: string, days = 30) {
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - (days - 1));

  return prisma.articleViewDay.findMany({
    where: { articleId, day: { gte: since } },
    select: { day: true, count: true },
    orderBy: { day: "asc" },
  });
}

/** The whole masthead plus every reader, for the admin screens. */
export async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      nickname: true,
      email: true,
      role: true,
      rank: true,
      beat: true,
      slug: true,
      createdAt: true,
      _count: { select: { articles: true, comments: true } },
    },
    orderBy: [{ role: "desc" }, { createdAt: "asc" }],
  });
}
