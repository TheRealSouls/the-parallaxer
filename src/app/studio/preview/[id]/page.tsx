import type { Metadata } from "next";
import Link from "next/link";
import { ArticleBody } from "@/components/ArticleBody";
import { Cover, CoverCredit } from "@/components/Cover";
import { LensTag } from "@/components/LensPixel";
import { requireEditor } from "@/lib/auth-guards";
import { formatDate, type Article, type Doc } from "@/lib/content";
import type { Lens } from "@/lib/lenses";
import { getArticleForEditing } from "@/lib/queries/studio";

export const metadata: Metadata = { title: "Preview", robots: { index: false } };

/**
 * A draft rendered through the real article template.
 *
 * Uses the same components as the published page rather than an approximation of
 * it, so what an editor checks here is what a reader gets. The only difference is
 * the bar at the top.
 */
export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireEditor();
  const row = await getArticleForEditing(id, user);

  const article: Article = {
    id: row.id,
    slug: row.slug,
    kicker: row.kicker,
    title: row.title,
    dek: row.dek,
    lenses: row.lenses as Lens[],
    excerpt: row.excerpt,
    body: row.body as unknown as Doc,
    status: row.status,
    publishedAt: (row.publishedAt ?? row.createdAt).toISOString(),
    author: {
      id: row.author.id,
      slug: "",
      name: row.author.nickname ?? row.author.name,
      role: "editor",
      title: { rank: "guest" },
      bio: "",
      image: null,
      links: [],
    },
    readingMinutes: row.readingMinutes,
    coverImage: row.coverImage,
    coverAlt: row.coverAlt,
    coverCredit: row.coverCredit,
  };

  return (
    <div>
      <div className="bg-ink text-paper">
        <div className="label mx-auto flex w-full max-w-(--page) flex-wrap items-center justify-between gap-4 px-5 py-2.5">
          <span>Preview of a {row.status.replace("_", " ")}</span>
          <Link href={`/studio/write/${id}`} className="underline underline-offset-4">
            Back to editing
          </Link>
        </div>
      </div>

      <div className="mx-auto w-full max-w-(--page) px-5 py-10">
        <article>
          <header className="mx-auto w-full max-w-(--measure-wide) text-center">
            <p className="label text-ink-faint">{article.kicker || "No kicker"}</p>
            <h1 className="font-display mt-3 text-4xl leading-[1.08] font-semibold sm:text-5xl">
              {article.title}
            </h1>
            <p className="text-ink-muted mx-auto mt-5 max-w-(--measure) text-xl leading-relaxed">
              {article.dek}
            </p>
            <div className="border-rule mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-t border-b py-3">
              {article.lenses.length > 0 && <LensTag lenses={article.lenses} />}
              <span className="label text-ink-muted">By {article.author.name}</span>
              <span className="label text-ink-faint">{formatDate(article.publishedAt)}</span>
              <span className="label text-ink-faint">{article.readingMinutes} min read</span>
            </div>
          </header>

          <figure className="mx-auto mt-10 w-full max-w-(--measure-wide)">
            <Cover article={article} />
            <CoverCredit article={article} />
          </figure>

          <div className="mt-12">
            <ArticleBody body={article.body} />
          </div>
        </article>
      </div>
    </div>
  );
}
