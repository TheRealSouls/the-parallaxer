import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { LensPixel } from "@/components/LensPixel";
import { LENSES, LENS_BIT, isLens, lensName, regionsWithLens, toRegionCode } from "@/lib/lenses";
import { getPublishedArticles } from "@/content/sample-articles";

type Params = { params: Promise<{ lens: string }> };

export function generateStaticParams() {
  return LENSES.map((lens) => ({ lens }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lens } = await params;
  if (!isLens(lens)) return {};
  return {
    title: lensName(lens),
    description: `Every Parallax article read wholly or partly through the ${lens} lens.`,
  };
}

export default async function LensPage({ params }: Params) {
  const { lens } = await params;
  if (!isLens(lens)) notFound();

  const bit = LENS_BIT[lens];
  const articles = getPublishedArticles().filter((a) => (toRegionCode(a.lenses) & bit) !== 0);
  const regions = regionsWithLens(lens);

  return (
    <div className="mx-auto w-full max-w-(--page) px-5 py-10">
      <header className="border-ink border-b-2 pb-6 text-center">
        <div className="flex items-center justify-center gap-3">
          <LensPixel lenses={[lens]} size="lg" />
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">{lensName(lens)}</h1>
        </div>
        <p className="text-ink-muted mx-auto mt-4 max-w-(--measure) text-lg leading-relaxed">
          Everything read wholly or partly through this lens, including the pieces where it meets
          the other two.
        </p>

        <ul className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2">
          {regions.map((region) => (
            <li key={region.code} className="label text-ink-muted flex items-center gap-1.5">
              <LensPixel lenses={region.lenses} size="sm" />
              {region.short}
              <span className="text-ink-faint tabular-nums">
                {articles.filter((a) => toRegionCode(a.lenses) === region.code).length}
              </span>
            </li>
          ))}
        </ul>
      </header>

      {articles.length === 0 ? (
        <p className="text-ink-muted mt-10 text-center">Nothing published here yet.</p>
      ) : (
        <div className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <div key={article.id} className="border-rule border-t pt-4">
              <ArticleCard article={article} variant="secondary" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
