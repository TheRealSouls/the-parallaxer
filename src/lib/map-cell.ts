import "server-only";

import { buildGrid } from "@/components/map/venn-geometry";
import { prisma } from "@/lib/db";
import type { RegionCode } from "@/lib/lenses";

/**
 * Choosing an article's square on the front page map.
 *
 * Squares are handed out at publication and never reassigned, so the diagram is
 * a record of what was published in what order rather than something that
 * reshuffles whenever the archive changes. Within a region they fill outward
 * from its centre of mass, which is the order buildGrid already puts them in.
 */

/**
 * The first unoccupied square in a region, or null when the region is full.
 *
 * A full region is the signal to switch the map to density mode, where one
 * square stands for several articles. Until that exists, an article published
 * into a full region simply has no square: it still appears everywhere else on
 * the site, which is a better failure than refusing to publish it.
 */
export async function nextFreeMapCell(region: RegionCode): Promise<number | null> {
  const candidates = buildGrid().byRegion[region].map((cell) => cell.index);
  if (candidates.length === 0) return null;

  const occupied = await prisma.article.findMany({
    where: { mapCell: { in: candidates } },
    select: { mapCell: true },
  });

  const taken = new Set(occupied.map((row: { mapCell: number | null }) => row.mapCell));
  return candidates.find((index) => !taken.has(index)) ?? null;
}

/** How full each region is, for the studio and for deciding when density mode is due. */
export async function regionOccupancy(): Promise<
  Record<RegionCode, { used: number; capacity: number }>
> {
  const grid = buildGrid();
  const occupied = await prisma.article.findMany({
    where: { mapCell: { not: null } },
    select: { mapCell: true },
  });
  const taken = new Set(occupied.map((row: { mapCell: number | null }) => row.mapCell));

  const entries = ([1, 2, 3, 4, 5, 6, 7] as RegionCode[]).map((code) => {
    const cells = grid.byRegion[code];
    return [
      code,
      {
        used: cells.filter((cell) => taken.has(cell.index)).length,
        capacity: cells.length,
      },
    ] as const;
  });

  return Object.fromEntries(entries) as Record<RegionCode, { used: number; capacity: number }>;
}
