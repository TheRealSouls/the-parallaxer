import "server-only";

import { prisma } from "@/lib/db";
import type { Author } from "@/lib/content";
import { toAuthor } from "./map-row";

/**
 * Reads for profiles and the masthead.
 *
 * Only people with a slug are addressable. A plain reader has no profile page,
 * which keeps commenter accounts out of the public directory entirely.
 */

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  const row = await prisma.user.findUnique({ where: { slug } });
  return row ? toAuthor(row) : null;
}

/**
 * The masthead: everyone holding an editorial title, founding first, then
 * seniors, then juniors. Guests are excluded; they have profiles but are not on
 * the masthead.
 */
export async function getMasthead(): Promise<Author[]> {
  const rows = await prisma.user.findMany({
    where: { slug: { not: null }, rank: { in: ["founding", "senior", "junior"] } },
    orderBy: [{ rank: "asc" }, { beat: "asc" }, { name: "asc" }],
  });
  return rows.map(toAuthor);
}

/** Slugs for generateStaticParams on /by/[slug]. */
export async function getProfileSlugs(): Promise<string[]> {
  const rows = await prisma.user.findMany({
    where: { slug: { not: null } },
    select: { slug: true },
  });
  return rows.flatMap((row: { slug: string | null }) => (row.slug ? [row.slug] : []));
}
