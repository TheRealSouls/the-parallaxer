import { ALL_REGIONS, REGIONS, toRegionCode, type RegionCode } from "@/lib/lenses";
import { formatDate, type Article } from "@/lib/content";
import { LensPixel } from "@/components/LensPixel";
import { buildGrid, labelAnchors } from "./venn-geometry";
import { VennMapCanvas, type MapEntry } from "./VennMapCanvas";

/**
 * The front page centrepiece.
 *
 * Every published article claims one square inside the region matching its
 * lenses. Squares fill outward from each region's centre of mass in publication
 * order, so the arrangement is deterministic and an article never moves once it
 * has been placed. Unclaimed squares sit at a 22% tint, which keeps the shape of
 * the diagram readable even when very little has been published.
 */
export function VennMap({ articles }: { articles: readonly Article[] }) {
  const grid = buildGrid();

  const published = articles
    .filter((a) => a.status === "published")
    .slice()
    .sort((a, b) => a.publishedAt.localeCompare(b.publishedAt));

  const byRegion = new Map<RegionCode, Article[]>();
  for (const article of published) {
    const code = toRegionCode(article.lenses);
    const list = byRegion.get(code) ?? [];
    list.push(article);
    byRegion.set(code, list);
  }

  // cellIndex to article. Once the archive outgrows a region the extras are
  // simply not placed; that is the trigger to switch the map to density mode.
  const placement = new Map<number, Article>();
  for (const [code, list] of byRegion) {
    const cells = grid.byRegion[code];
    list.forEach((article, i) => {
      const cell = cells[i];
      if (cell) placement.set(cell.index, article);
    });
  }

  const entries: MapEntry[] = grid.cells.map((cell) => {
    const article = placement.get(cell.index) ?? null;
    return {
      cellIndex: cell.index,
      col: cell.col,
      row: cell.row,
      x: cell.x,
      y: cell.y,
      code: cell.code,
      article: article
        ? {
            slug: article.slug,
            title: article.title,
            regionName: REGIONS[toRegionCode(article.lenses)].name,
            date: formatDate(article.publishedAt),
            author: article.author.name,
          }
        : null,
    };
  });

  const counts = new Map<RegionCode, number>();
  for (const [code, list] of byRegion) counts.set(code, list.length);

  return (
    <section aria-labelledby="map-heading" className="mx-auto w-full max-w-xl">
      <h2 id="map-heading" className="label border-ink border-b pb-2 text-center">
        The field
      </h2>

      <div className="mt-6">
        <VennMapCanvas
          entries={entries}
          labels={labelAnchors().map((l) => ({ lens: l.lens, x: l.x, y: l.y }))}
          viewBox={grid.viewBox}
          hint="Each square is one article. Point at a square to read its headline."
        />
      </div>

      <ul className="border-rule mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 border-t pt-4">
        {ALL_REGIONS.map((region) => {
          const n = counts.get(region.code) ?? 0;
          return (
            <li key={region.code} className="label text-ink-muted flex items-center gap-1.5">
              <LensPixel lenses={region.lenses} size="sm" />
              <span>{region.short}</span>
              <span className="text-ink-faint tabular-nums">{n}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
