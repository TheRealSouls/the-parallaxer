import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/ArticleBody";
import { Cover, CoverCredit } from "@/components/Cover";
import { NewsletterForm } from "@/components/NewsletterForm";
import { ReadingProgress } from "@/components/ReadingProgress";
import { ViewBeacon } from "@/components/ViewBeacon";
import { ArticleEngagement } from "@/components/engagement/ArticleEngagement";
import { ArticleCard } from "@/components/ArticleCard";
import { LensTag } from "@/components/LensPixel";
import { ArticleJsonLd } from "@/components/StructuredData";
import { site } from "@/lib/site";
import { formatDate } from "@/lib/content";
import { formatEditorTitle } from "@/lib/editorial";
import { regionOf, toRegionCode } from "@/lib/lenses";
import {
  getArticleBySlug,
  getArticlesByAuthor,
  getPublishedArticles,
  getPublishedSlugs,
} from "@/lib/data";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getPublishedSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};
  const url = `/article/${article.slug}`;
  return {
    title: article.title,
    description: article.excerpt,
    authors: [{ name: article.author.name, url: `${site.url}/by/${article.author.slug}` }],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      url,
      publishedTime: article.publishedAt,
      authors: [article.author.name],
    },
  };
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const region = regionOf(article.lenses);

  // Related reading shares at least one lens, with exact region matches first.
  const code = toRegionCode(article.lenses);
  const related = (await getPublishedArticles())
    .filter((a) => a.id !== article.id && (toRegionCode(a.lenses) & code) !== 0)
    .sort(
      (a, b) => Number(toRegionCode(b.lenses) === code) - Number(toRegionCode(a.lenses) === code),
    )
    .slice(0, 3);

  // Everything else by the same writer, so a reader who liked this piece has
  // somewhere obvious to go next.
  const alsoByAuthor = (await getArticlesByAuthor(article.author.slug))
    .filter((a) => a.id !== article.id)
    .slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-(--page) px-5 py-10">
      <ReadingProgress lenses={article.lenses} />
      <ArticleJsonLd article={article} />
      <ViewBeacon slug={article.slug} />

      <article>
        <header className="mx-auto w-full max-w-(--measure-wide) text-center">
          <p className="label text-ink-faint">{article.kicker}</p>

          <h1 className="font-display mt-3 text-4xl leading-[1.08] font-semibold sm:text-5xl">
            {article.title}
          </h1>

          <p className="text-ink-muted mx-auto mt-5 max-w-(--measure) text-xl leading-relaxed">
            {article.dek}
          </p>

          <div className="border-rule mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-t border-b py-3">
            <LensTag lenses={article.lenses} />
            <span aria-hidden="true" className="text-ink-faint">
              &middot;
            </span>
            <p className="label text-ink-muted">
              By{" "}
              <Link
                href={`/by/${article.author.slug}`}
                className="underline-offset-4 hover:underline"
              >
                {article.author.name}
              </Link>
            </p>
            <span aria-hidden="true" className="text-ink-faint">
              &middot;
            </span>
            <time dateTime={article.publishedAt} className="label text-ink-faint">
              {formatDate(article.publishedAt)}
            </time>
            <span aria-hidden="true" className="text-ink-faint">
              &middot;
            </span>
            <span className="label text-ink-faint">{article.readingMinutes} min read</span>
          </div>
        </header>

        <figure className="mx-auto mt-10 w-full max-w-(--measure-wide)">
          <Cover article={article} priority />
          <CoverCredit article={article} />
        </figure>

        <div className="mt-12">
          <ArticleBody body={article.body} />
        </div>
      </article>

      <section className="border-rule mx-auto mt-14 w-full max-w-(--measure) border-t pt-6">
        <NewsletterForm tone="article" />
      </section>

      <ArticleEngagement slug={article.slug} />

      <section
        aria-labelledby="author-heading"
        className="border-rule mx-auto mt-14 w-full max-w-(--measure) border-t pt-5"
      >
        <h2 id="author-heading" className="label text-ink-faint">
          About the writer
        </h2>
        <p className="font-display mt-3 text-xl font-semibold">
          <Link href={`/by/${article.author.slug}`} className="underline-offset-4 hover:underline">
            {article.author.name}
          </Link>
        </p>
        <p className="label text-ink-faint mt-1">{formatEditorTitle(article.author.title)}</p>
        <p className="text-ink-muted mt-2 text-base leading-relaxed">{article.author.bio}</p>
      </section>

      {alsoByAuthor.length > 0 && (
        <section aria-labelledby="more-by-heading" className="mt-14">
          <h2 id="more-by-heading" className="label border-ink border-t-2 pt-2">
            More from {article.author.name}
          </h2>
          <div className="mt-6 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {alsoByAuthor.map((a) => (
              <ArticleCard key={a.id} article={a} variant="river" />
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="mt-14">
          <h2 id="related-heading" className="label border-ink border-t-2 pt-2">
            Also through the {region.name.toLowerCase()} lens
          </h2>
          <div className="mt-6 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a) => (
              <ArticleCard key={a.id} article={a} variant="river" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
