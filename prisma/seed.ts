import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";
import { authors } from "../src/content/authors";
import { sampleArticles } from "../src/content/sample-articles";
import { buildGrid } from "../src/components/map/venn-geometry";
import { toRegionCode, type RegionCode } from "../src/lib/lenses";
import { fromEditorTitle } from "../src/lib/editorial";

/**
 * Fills an empty database with the Stage 1 sample archive.
 *
 * The point is to have something to look at and click through before any real
 * writing exists: ten pieces across all seven regions, so the map, the colour
 * system, the lens pages and search all have something to show.
 *
 * Everything it writes is placeholder. The four editors are invented and their
 * biographies say so. Delete them before the site is public, or promote your own
 * account and reassign the pieces you want to keep.
 *
 * Refuses to run against a database that already has articles, so it can never
 * quietly duplicate a real archive. Pass --force to seed anyway.
 */

const force = process.argv.includes("--force");

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set, so there is nothing to seed.");
    process.exit(1);
  }

  const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });

  const existing = await prisma.article.count();
  if (existing > 0 && !force) {
    console.error(
      [
        `This database already holds ${existing} article(s).`,
        "",
        "Seeding would add ten placeholder pieces alongside them. If that is",
        "really what you want, run it again with --force.",
      ].join("\n"),
    );
    process.exit(1);
  }

  // Squares are normally handed out at publication. Seeded articles are given
  // theirs the same way, so the map looks exactly as it would have if each had
  // been published through the studio in order.
  const grid = buildGrid();
  const nextCell = new Map<RegionCode, number>();

  function takeCell(region: RegionCode): number | null {
    const used = nextCell.get(region) ?? 0;
    const cell = grid.byRegion[region][used];
    nextCell.set(region, used + 1);
    return cell?.index ?? null;
  }

  for (const author of Object.values(authors)) {
    const { rank, beat } = fromEditorTitle(author.title);
    await prisma.user.upsert({
      where: { id: author.id },
      update: {},
      create: {
        id: author.id,
        name: author.name,
        nickname: author.slug.replace(/-/g, "_").slice(0, 24),
        // Placeholder addresses on a reserved domain that can never receive
        // mail, so a stray verification email cannot reach a real person.
        email: `${author.slug}@example.invalid`,
        emailVerified: true,
        role: author.role,
        rank,
        beat,
        slug: author.slug,
        bio: author.bio,
        links: [],
      },
    });
  }

  // Oldest first, so map squares fill in publication order.
  const ordered = [...sampleArticles].sort((a, b) => a.publishedAt.localeCompare(b.publishedAt));

  for (const article of ordered) {
    const region = toRegionCode(article.lenses);
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {},
      create: {
        id: article.id,
        slug: article.slug,
        kicker: article.kicker,
        title: article.title,
        dek: article.dek,
        excerpt: article.excerpt,
        body: article.body as never,
        lenses: [...article.lenses],
        status: "published",
        publishedAt: new Date(article.publishedAt),
        authorId: article.author.id,
        readingMinutes: article.readingMinutes,
        mapCell: takeCell(region),
      },
    });
  }

  const [users, articles] = await Promise.all([prisma.user.count(), prisma.article.count()]);
  console.log(`Seeded ${articles} articles by ${users} placeholder editors.`);
  console.log("All of them are placeholders. Remove them before the site is public.");

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
