import Link from "next/link";
import { toRegionCode, type RegionCode } from "@/lib/lenses";
import type { Article } from "@/lib/content";
import { buildGrid } from "./venn-geometry";

/**
 * The map at a glance.
 *
 * The full diagram earns a page of its own. What belongs on the front page is
 * the shape of it: enough to show that articles are placed rather than listed,
 * and enough to be recognised again once you have seen the real one.
 *
 * Deliberately inert. At this size a single square is a four pixel tap target,
 * so making each one a link would be a hit area nobody can hit and a tab stop
 * nobody wants. The whole diagram is one link to /pixels instead, where the
 * squares are big enough to aim at.
 *
 * No labels either. The three lens names need room to sit clear of the grid,
 * and cramming them in at this scale is what made the old front page read as an
 * unexplained diagram rather than a map.
 */
export function MiniMap({ articles }: { articles: readonly Article[] }) {
  const grid = buildGrid();

  const published = articles.filter((article) => article.status === "published");

  const counts = new Map<RegionCode, number>();
  for (const article of published) {
    const code = toRegionCode(article.lenses);
    counts.set(code, (counts.get(code) ?? 0) + 1);
  }

  // Which squares read as filled. The full map places a specific article in a
  // specific square; here only the count per region matters, so squares fill
  // from the start of each region's list.
  const filled = new Set<number>();
  for (const [code, total] of counts) {
    for (const cell of grid.byRegion[code].slice(0, total)) filled.add(cell.index);
  }

  // Cropped to the diagram itself. The full map's viewBox reserves room around
  // the edges for the lens labels, which this one does not draw.
  const cols = grid.cells.map((cell) => cell.col);
  const rows = grid.cells.map((cell) => cell.row);
  const minCol = Math.min(...cols);
  const minRow = Math.min(...rows);
  const viewBox = [
    minCol,
    minRow,
    Math.max(...cols) - minCol + 1,
    Math.max(...rows) - minRow + 1,
  ].join(" ");

  const total = published.length;

  return (
    <Link
      href="/pixels"
      className="border-ink block border p-4 no-underline focus:ring-1 focus:ring-current focus:outline-none"
    >
      <p className="label text-ink-muted">The Pixels</p>

      <svg
        viewBox={viewBox}
        className="mx-auto mt-3 block w-full max-w-40"
        role="img"
        aria-hidden="true"
      >
        {grid.cells.map((cell) => (
          <rect
            key={cell.index}
            x={cell.col + 0.08}
            y={cell.row + 0.08}
            width={0.84}
            height={0.84}
            fill={
              filled.has(cell.index) ? `var(--lens-${cell.code})` : `var(--lens-${cell.code}-tint)`
            }
          />
        ))}
      </svg>

      <p className="text-ink-faint mt-3 text-sm leading-snug">
        {total === 0
          ? "Every article we publish claims one square, coloured by the lenses it reads through."
          : `${total} ${total === 1 ? "article" : "articles"}, each holding one square. See the whole map.`}
      </p>
    </Link>
  );
}
