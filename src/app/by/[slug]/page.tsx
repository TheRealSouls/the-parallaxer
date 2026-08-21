import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { Avatar } from "@/components/Avatar";
import { PersonJsonLd } from "@/components/StructuredData";
import { VennMap } from "@/components/map/VennMap";
import { getAuthorBySlug, getArticlesByAuthor, getProfileSlugs } from "@/lib/data";
import { describeEditorTitle, formatEditorTitle } from "@/lib/editorial";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getProfileSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) return {};
  return {
    title: author.name,
    description: author.bio,
    alternates: { canonical: `/by/${author.slug}` },
  };
}

/**
 * Editor profile. Stage 4 adds the portrait, the external links, and a personal
 * lens map. The shape of the page is settled here so that work stays additive.
 */
export default async function AuthorPage({ params }: Params) {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) notFound();

  const articles = await getArticlesByAuthor(slug);

  return (
    <div className="mx-auto w-full max-w-(--page) px-5 py-10">
      <PersonJsonLd author={author} articleCount={articles.length} />

      <header className="border-ink mx-auto max-w-(--measure) border-b-2 pb-6 text-center">
        <Avatar author={author} size="lg" className="mx-auto mb-5" />
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">{author.name}</h1>
        <p className="label text-ink-faint mt-2">{formatEditorTitle(author.title)}</p>
        <p className="text-ink-muted mt-1 text-sm">{describeEditorTitle(author.title)}</p>
        <p className="text-ink-muted mt-4 text-lg leading-relaxed">{author.bio}</p>

        {author.links.length > 0 && (
          <ul className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2">
            {author.links.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  rel="nofollow noopener"
                  className="label underline underline-offset-4"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </header>

      {articles.length > 0 && (
        <div className="mt-12">
          {/* The same diagram as the front page, filled only with this writer's
              work, so a profile shows at a glance which lenses they reach for. */}
          <VennMap articles={articles} heading="Their field" />
        </div>
      )}

      <h2 className="label text-ink-faint mt-14">
        {articles.length} {articles.length === 1 ? "article" : "articles"}
      </h2>

      <div className="mt-5 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <div key={article.id} className="border-rule border-t pt-4">
            <ArticleCard article={article} variant="secondary" />
          </div>
        ))}
      </div>
    </div>
  );
}
