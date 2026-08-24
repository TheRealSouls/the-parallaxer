import "server-only";

import { prisma } from "@/lib/db";
import { slugify, uniqueSlug } from "@/lib/slug";

/**
 * Gives an account a profile address if it does not have one.
 *
 * Anybody who can publish needs one. A byline is a link to /by/<slug>, the
 * profile editor refuses to save without it, and the map falls back to the raw
 * account id, which turns a writer's page into a URL with a UUID in it.
 *
 * Called from every route that can turn a reader into staff: the admin screens,
 * and the ADMIN_EMAIL bootstrap that mints the founding editor before any admin
 * exists to do it by hand.
 *
 * Returns the existing slug untouched when there is one. A profile address is
 * public and may already be linked from elsewhere, so it is never reissued.
 */
export async function ensureProfileSlug(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { slug: true, nickname: true, name: true },
  });
  if (!user) return null;
  if (user.slug) return user.slug;

  const slug = await uniqueSlug(slugify(user.nickname ?? user.name), (candidate) =>
    prisma.user.findFirst({ where: { slug: candidate }, select: { id: true } }).then(Boolean),
  );

  await prisma.user.update({ where: { id: userId }, data: { slug } });
  return slug;
}
