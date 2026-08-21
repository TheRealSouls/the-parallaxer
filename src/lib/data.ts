import "server-only";

import type { Article, Author } from "@/lib/content";
import { isLens, type Lens } from "@/lib/lenses";
import * as sample from "@/content/sample-articles";
import { authors as sampleAuthors } from "@/content/authors";
import * as articleQueries from "@/lib/queries/articles";
import * as authorQueries from "@/lib/queries/authors";

/**
 * The single seam between the site and wherever its articles come from.
 *
 * Every public page reads through here. When `DATABASE_URL` is set the real
 * queries run; otherwise the Stage 1 sample content stands in. That is what
 * lets the project be cloned and run with no database at all, and it means the
 * database can be introduced without a flag day where the site is empty until
 * content is migrated.
 *
 * Everything is async regardless of source, so switching over changes nothing
 * at any call site. Delete the sample branch once the archive is real.
 */

const useDatabase = Boolean(process.env.DATABASE_URL);

/** Shown in the studio so it is never a mystery which source is live. */
export const contentSource: "database" | "sample" = useDatabase ? "database" : "sample";

export async function getPublishedArticles(limit?: number): Promise<readonly Article[]> {
  if (useDatabase) return articleQueries.getPublishedArticles(limit);
  const all = sample.getPublishedArticles();
  return limit ? all.slice(0, limit) : all;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (useDatabase) return articleQueries.getArticleBySlug(slug);
  return sample.getArticleBySlug(slug) ?? null;
}

export async function getArticlesByAuthor(slug: string): Promise<readonly Article[]> {
  if (useDatabase) return articleQueries.getArticlesByAuthor(slug);
  return sample.getArticlesByAuthor(slug);
}

export async function getArticlesByLens(lens: Lens): Promise<readonly Article[]> {
  if (useDatabase) return articleQueries.getArticlesByLens(lens);
  const { toRegionCode, LENS_BIT } = await import("@/lib/lenses");
  return sample
    .getPublishedArticles()
    .filter((article) => (toRegionCode(article.lenses) & LENS_BIT[lens]) !== 0);
}

export async function getPublishedSlugs(): Promise<string[]> {
  if (useDatabase) return articleQueries.getPublishedSlugs();
  return sample.getPublishedArticles().map((article) => article.slug);
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  if (useDatabase) return authorQueries.getAuthorBySlug(slug);
  return Object.values(sampleAuthors).find((author) => author.slug === slug) ?? null;
}

export async function getMasthead(): Promise<readonly Author[]> {
  if (useDatabase) return authorQueries.getMasthead();
  return Object.values(sampleAuthors);
}

export async function getProfileSlugs(): Promise<string[]> {
  if (useDatabase) return authorQueries.getProfileSlugs();
  return Object.values(sampleAuthors).map((author) => author.slug);
}

/**
 * Search.
 *
 * Postgres full text search once there is a database, because it is free,
 * needs no extra service, and is more than enough below a few hundred articles.
 * Against the sample content it degrades to a plain substring match, which is
 * fine for ten pieces and keeps the page working before the database exists.
 *
 * A lens filter can be combined with the query, or used on its own to browse
 * one region.
 */
export async function searchArticles(query: string, lens?: string): Promise<readonly Article[]> {
  const term = query.trim();
  const filterLens = lens && isLens(lens) ? lens : undefined;

  const pool = filterLens ? await getArticlesByLens(filterLens) : await getPublishedArticles();
  if (!term) return pool;

  if (useDatabase) {
    const matches = await articleQueries.searchPublished(term);
    const allowed = new Set(pool.map((article) => article.id));
    return matches.filter((article) => allowed.has(article.id));
  }

  const needle = term.toLowerCase();
  return pool.filter((article) =>
    [article.title, article.dek, article.kicker, article.excerpt, article.author.name]
      .join(" ")
      .toLowerCase()
      .includes(needle),
  );
}
