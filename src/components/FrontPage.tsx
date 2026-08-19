import type { Article } from "@/lib/content";
import { ArticleCard } from "@/components/ArticleCard";

/**
 * The newspaper grid.
 *
 * One lead story, a column of two beside it, then a river of everything else.
 * Deliberately asymmetric: an even row of equal cards is the thing that makes a
 * page look generated rather than edited. Columns are separated by rules, and
 * nothing here is a box.
 */
export function FrontPage({ articles }: { articles: readonly Article[] }) {
  const [lead, ...rest] = articles;
  if (!lead) return null;

  const column = rest.slice(0, 2);
  const river = rest.slice(2);

  return (
    <div>
      <div className="border-ink grid gap-8 border-t-2 pt-8 lg:grid-cols-3 lg:gap-10">
        <div className="lg:border-rule lg:col-span-2 lg:border-r lg:pr-10">
          <ArticleCard article={lead} variant="lead" />
        </div>

        <div className="divide-rule border-rule divide-y border-t lg:border-t-0">
          {column.map((article) => (
            <div key={article.id} className="py-6 first:pt-0 lg:first:pt-0">
              <ArticleCard article={article} variant="secondary" />
            </div>
          ))}
        </div>
      </div>

      {river.length > 0 && (
        <section aria-labelledby="more-heading" className="mt-12">
          <h2 id="more-heading" className="label border-ink border-t-2 pt-2">
            More from the archive
          </h2>
          <div className="mt-6 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {river.map((article) => (
              <div
                key={article.id}
                className="border-rule sm:border-rule border-t pt-4 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6 sm:first:border-l-0 sm:first:pl-0 lg:nth-[3n+1]:border-l-0 lg:nth-[3n+1]:pl-0"
              >
                <ArticleCard article={article} variant="river" />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
