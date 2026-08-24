import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";
import { authors } from "../src/content/authors";
import { sampleArticles } from "../src/content/sample-articles";

/**
 * Removes exactly what `npm run seed` created, and nothing else.
 *
 * The placeholder archive is useful for looking at an empty site and actively
 * harmful once the site is public: six invented editors whose biographies say
 * so, and ten articles nobody wrote. Search engines classify a domain on what
 * they find the first time, and fabricated author pages are the single clearest
 * signal of a site not worth ranking.
 *
 * Deliberately narrow. It deletes articles whose slug appears in
 * src/content/sample-articles, and users whose address is the
 * `@example.invalid` placeholder built by the seed. A real editor, a real
 * article, or an account that merely shares a name is never matched. Anything
 * unrecognised is left alone and reported rather than guessed at.
 *
 * Dry run by default. Pass --confirm to actually delete.
 */

const confirmed = process.argv.includes("--confirm");

/** The seed's own convention. Reserved by RFC 2606, so it can never be real. */
const PLACEHOLDER_DOMAIN = "@example.invalid";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set, so there is nothing to clear.");
    process.exit(1);
  }

  const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });

  const seededSlugs = sampleArticles.map((article) => article.slug);
  const seededEmails = Object.values(authors).map((a) => `${a.slug}${PLACEHOLDER_DOMAIN}`);

  const articles = await prisma.article.findMany({
    where: { slug: { in: seededSlugs } },
    select: { slug: true, title: true },
  });

  // Both conditions must hold: a known seed address *and* the placeholder
  // domain. Neither alone is enough to delete somebody's account over.
  const users = await prisma.user.findMany({
    where: { AND: [{ email: { in: seededEmails } }, { email: { endsWith: PLACEHOLDER_DOMAIN } }] },
    select: { id: true, email: true, _count: { select: { articles: true } } },
  });

  if (articles.length === 0 && users.length === 0) {
    console.log("Nothing to remove. The placeholder archive is already gone.");
    await prisma.$disconnect();
    return;
  }

  console.log(`Articles to delete (${articles.length}):`);
  for (const a of articles) console.log(`  ${a.slug}  ${a.title}`);
  console.log(`\nAccounts to delete (${users.length}):`);
  for (const u of users) console.log(`  ${u.email}`);

  // Anything still attached to a placeholder author that this script does not
  // recognise. Deleting the author would cascade it away unseen, so it is
  // surfaced first and the run stops.
  const strays = await prisma.article.findMany({
    where: { authorId: { in: users.map((u) => u.id) }, slug: { notIn: seededSlugs } },
    select: { slug: true, status: true },
  });
  if (strays.length > 0) {
    console.error(`\nStopping. ${strays.length} article(s) belong to a placeholder editor but`);
    console.error("were not created by the seed, so they may be real work:");
    for (const s of strays) console.error(`  ${s.slug} (${s.status})`);
    console.error("\nReassign them to a real account, then run this again.");
    process.exit(1);
  }

  if (!confirmed) {
    console.log("\nDry run. Nothing was deleted. Run again with --confirm to proceed.");
    await prisma.$disconnect();
    return;
  }

  // Articles first: Article.author has no cascade, so a user holding one cannot
  // be removed. Comments, likes, revisions and view rows cascade from the
  // article and need no separate pass.
  const removedArticles = await prisma.article.deleteMany({ where: { slug: { in: seededSlugs } } });
  const removedUsers = await prisma.user.deleteMany({ where: { id: { in: users.map((u) => u.id) } } });

  console.log(`\nDeleted ${removedArticles.count} articles and ${removedUsers.count} accounts.`);

  const [remainingArticles, remainingUsers] = await Promise.all([
    prisma.article.count(),
    prisma.user.count(),
  ]);
  console.log(`Remaining: ${remainingArticles} articles, ${remainingUsers} accounts.`);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
