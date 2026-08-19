import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { toEditorTitle } from "@/lib/editorial";
import type { Article, Author, Doc, ProfileLink, UserRole } from "@/lib/content";

/**
 * Translation between database rows and the types the components already use.
 *
 * Keeping this in one file is what lets Stage 2 be a drop-in: every page was
 * written in Stage 1 against `Article` and `Author`, and none of them needs to
 * learn what a Prisma row looks like.
 */

/** An article row with its author joined, which every page needs. */
export type ArticleRow = Prisma.ArticleModel & { author: Prisma.UserModel };

export function toAuthor(row: Prisma.UserModel): Author {
  return {
    id: row.id,
    // Readers have no profile page, so they have no slug. Falling back to the id
    // keeps the type non-null; such a byline is never rendered as a link target
    // because only people with articles appear as authors.
    slug: row.slug ?? row.id,
    name: row.name,
    role: normaliseRole(row.role),
    title: toEditorTitle(row.rank, row.beat),
    bio: row.bio ?? "",
    image: row.image ?? null,
    links: parseLinks(row.links),
  };
}

export function toArticle(row: ArticleRow): Article {
  return {
    id: row.id,
    slug: row.slug,
    kicker: row.kicker,
    title: row.title,
    dek: row.dek,
    lenses: row.lenses,
    excerpt: row.excerpt,
    // Written by the editor, whose output is validated against the permitted
    // node types before it is ever stored. See Stage 3.
    body: row.body as unknown as Doc,
    status: row.status,
    publishedAt: (row.publishedAt ?? row.createdAt).toISOString(),
    author: toAuthor(row.author),
    readingMinutes: row.readingMinutes,
    coverImage: row.coverImage,
    coverAlt: row.coverAlt,
    coverCredit: row.coverCredit,
  };
}

function normaliseRole(role: string): UserRole {
  return role === "admin" || role === "editor" ? role : "reader";
}

/**
 * Profile links are stored as JSON, so they are whatever was written. Anything
 * that is not a well-formed { label, url } pair is dropped rather than rendered.
 */
function parseLinks(value: Prisma.JsonValue | null): ProfileLink[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) return [];
    const { label, url } = entry as Record<string, unknown>;
    if (typeof label !== "string" || typeof url !== "string") return [];
    if (!/^https?:\/\//i.test(url)) return [];
    return [{ label, url }];
  });
}
