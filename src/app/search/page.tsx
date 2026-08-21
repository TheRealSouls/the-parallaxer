import type { Metadata } from "next";
import { ArticleCard } from "@/components/ArticleCard";
import { LensPixel } from "@/components/LensPixel";
import { searchArticles } from "@/lib/data";
import { DISPLAY_REGIONS, LENSES, isLens, lensName } from "@/lib/lenses";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Search",
  description: `Search every article published by ${site.name}.`,
  alternates: { canonical: "/search" },
};

type Params = { searchParams: Promise<{ q?: string; lens?: string }> };

/**
 * Search across the archive.
 *
 * A plain form with a GET action, so a search is a real URL that can be shared,
 * bookmarked, and read by a crawler. No JavaScript is involved on the way in or
 * on the way out.
 */
export default async function SearchPage({ searchParams }: Params) {
  const { q = "", lens = "" } = await searchParams;
  const query = q.slice(0, 120);
  const activeLens = isLens(lens) ? lens : undefined;

  const results = await searchArticles(query, activeLens);
  const searched = query.trim().length > 0 || activeLens !== undefined;

  return (
    <div className="mx-auto w-full max-w-(--page) px-5 py-10">
      <header className="border-ink border-b-2 pb-6">
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">Search</h1>

        <form method="get" action="/search" className="mt-6 flex flex-wrap items-end gap-3">
          <div className="min-w-0 flex-1">
            <label htmlFor="q" className="label text-ink-muted block">
              Words
            </label>
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Housing, central banks, virtue"
              className="border-ink bg-paper text-ink mt-1.5 w-full border px-3 py-2.5 text-base outline-none focus:ring-1 focus:ring-current"
            />
          </div>

          <div>
            <label htmlFor="lens" className="label text-ink-muted block">
              Lens
            </label>
            <select
              id="lens"
              name="lens"
              defaultValue={activeLens ?? ""}
              className="border-ink bg-paper text-ink mt-1.5 border px-3 py-2.5 text-base outline-none"
            >
              <option value="">Any</option>
              {LENSES.map((option) => (
                <option key={option} value={option}>
                  {lensName(option)}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="label bg-ink text-paper px-5 py-3 underline-offset-4 hover:underline"
          >
            Search
          </button>
        </form>
      </header>

      {searched ? (
        <>
          <p className="label text-ink-faint mt-6">
            {results.length} {results.length === 1 ? "result" : "results"}
            {query.trim() && <> for &ldquo;{query.trim()}&rdquo;</>}
            {activeLens && <> in {lensName(activeLens)}</>}
          </p>

          {results.length === 0 ? (
            <p className="text-ink-muted mt-6 max-w-(--measure) text-base leading-relaxed">
              Nothing matched. Search covers headlines, standfirsts, and bylines rather than the
              full text of every article, so a broader word usually finds more.
            </p>
          ) : (
            <div className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((article) => (
                <div key={article.id} className="border-rule border-t pt-4">
                  <ArticleCard article={article} variant="secondary" />
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <section className="mt-10">
          <h2 className="label text-ink-faint">Or browse by region</h2>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
            {DISPLAY_REGIONS.map((region) => (
              <li key={region.code}>
                <a
                  href={`/search?lens=${region.lenses[0]}`}
                  className="label text-ink-muted inline-flex items-center gap-2 underline-offset-4 hover:underline"
                >
                  <LensPixel lenses={region.lenses} size="sm" />
                  {region.short}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
