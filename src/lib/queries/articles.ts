import "server-only";

import { prisma } from "@/lib/db";
import type { Article } from "@/lib/content";
import type { Lens } from "@/lib/lenses";
import { toArticle, type ArticleRow } from "./map-row";

/**
 * Reads for the public site.
 *
 * These deliberately mirror the function names Stage 1 exported from
 * src/content/sample-articles.ts, so swapping the import in each page is the
 * whole migration. Every function here filters to published articles; drafts are
 * only ever reached through the studio queries, which check permissions first.
 */

const withAuthor = { author: true } as const;

export async function getPublishedArticles(limit?: number): Promise<Article[]> {
  const rows = await prisma.article.findMany({
    where: { status: "published" },
    include: withAuthor,
    orderBy: { publishedAt: "desc" },
    ...(limit ? { take: limit } : {}),
  });
  return rows.map((row: ArticleRow) => toArticle(row));
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const row = await prisma.article.findFirst({
    where: { slug, status: "published" },
    include: withAuthor,
  });
  return row ? toArticle(row) : null;
}

export async function getArticlesByAuthor(slug: string): Promise<Article[]> {
  const rows = await prisma.article.findMany({
    where: { status: "published", author: { slug } },
    include: withAuthor,
    orderBy: { publishedAt: "desc" },
  });
  return rows.map((row: ArticleRow) => toArticle(row));
}

/** Everything touching one lens, including the regions where it overlaps. */
export async function getArticlesByLens(lens: Lens): Promise<Article[]> {
  const rows = await prisma.article.findMany({
    where: { status: "published", lenses: { has: lens } },
    include: withAuthor,
    orderBy: { publishedAt: "desc" },
  });
  return rows.map((row: ArticleRow) => toArticle(row));
}

/** Slugs for generateStaticParams. */
export async function getPublishedSlugs(): Promise<string[]> {
  const rows = await prisma.article.findMany({
    where: { status: "published" },
    select: { slug: true },
  });
  return rows.map((row: { slug: string }) => row.slug);
}

/**
 * Which map square each published article occupies.
 *
 * Ordered by publication date so an article that has not yet been assigned a
 * square still lands in a stable position when the map fills the gaps.
 */
export async function getMapArticles(): Promise<Article[]> {
  const rows = await prisma.article.findMany({
    where: { status: "published" },
    include: withAuthor,
    orderBy: { publishedAt: "asc" },
  });
  return rows.map((row: ArticleRow) => toArticle(row));
}

/** How many articles each person has published, used for junior eligibility. */
export async function countPublishedByAuthor(authorId: string): Promise<number> {
  return prisma.article.count({ where: { authorId, status: "published" } });
}
