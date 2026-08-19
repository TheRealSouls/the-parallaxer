import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { authors } from "@/content/authors";
import { getArticlesByAuthor } from "@/content/sample-articles";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return Object.values(authors).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const author = Object.values(authors).find((a) => a.slug === slug);
  if (!author) return {};
  return { title: author.name, description: author.bio };
}

/**
 * Editor profile. Stage 4 adds the portrait, the external links, and a personal
 * lens map. The shape of the page is settled here so that work stays additive.
 */
export default async function AuthorPage({ params }: Params) {
  const { slug } = await params;
  const author = Object.values(authors).find((a) => a.slug === slug);
  if (!author) notFound();

  const articles = getArticlesByAuthor(slug);

  return (
    <div className="mx-auto w-full max-w-(--page) px-5 py-10">
      <header className="border-ink mx-auto max-w-(--measure) border-b-2 pb-6 text-center">
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">{author.name}</h1>
        <p className="label text-ink-faint mt-2">{author.title}</p>
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

      <h2 className="label text-ink-faint mt-8">
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
