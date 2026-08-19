/**
 * Grid mathematics for the Parallax map.
 *
 * Three equal circles sit on the vertices of an equilateral triangle whose side
 * equals their radius. That spacing is what guarantees all three pairwise
 * overlaps and the central triple region exist and are large enough to hold
 * articles. A square grid is laid over them and each cell is assigned to the
 * region containing its centre, giving the diagram its pixelated edge.
 *
 * All coordinates are in abstract cell units (one cell is 1.0 wide). The SVG
 * scales them through its viewBox, so the map is resolution independent and the
 * component never needs to know about pixels.
 */

import { LENS_BIT, type RegionCode } from "@/lib/lenses";

/**
 * Circle radius in cell units. Chosen so the union of the three circles holds
 * roughly 234 cells: sparse and deliberate at launch, comfortably full after a
 * year of weekly publishing. See `describeCapacity` for the live figure.
 */
export const RADIUS = 6;

const SQRT3 = Math.sqrt(3);

/** Circle centres, with the whole figure centred on the origin. */
export const CENTRES: Record<"philosophy" | "politics" | "economics", { x: number; y: number }> = {
  philosophy: { x: -RADIUS / 2, y: -RADIUS / (2 * SQRT3) },
  politics: { x: RADIUS / 2, y: -RADIUS / (2 * SQRT3) },
  economics: { x: 0, y: RADIUS / SQRT3 },
};

export type Cell = {
  /** Stable identifier, also the value stored in Article.mapCell later. */
  index: number;
  col: number;
  row: number;
  /** Centre point in cell units. */
  x: number;
  y: number;
  code: RegionCode;
};

/** Which region contains this point, or 0 for outside every circle. */
function regionAt(x: number, y: number): number {
  let code = 0;
  for (const [lens, c] of Object.entries(CENTRES)) {
    const dx = x - c.x;
    const dy = y - c.y;
    if (dx * dx + dy * dy <= RADIUS * RADIUS) {
      code |= LENS_BIT[lens as keyof typeof LENS_BIT];
    }
  }
  return code;
}

export type VennGrid = {
  cells: readonly Cell[];
  /** Cells grouped by region, each ordered centroid-outward. */
  byRegion: Record<RegionCode, readonly Cell[]>;
  viewBox: { minX: number; minY: number; width: number; height: number };
};

/**
 * Build the grid. Pure and deterministic, so the server and any future client
 * render agree and the map never reshuffles between page loads.
 */
export function buildGrid(): VennGrid {
  const halfWidth = 1.5 * RADIUS;
  const top = -RADIUS / (2 * SQRT3) - RADIUS;
  const bottom = RADIUS / SQRT3 + RADIUS;

  const colMin = Math.floor(-halfWidth);
  const colMax = Math.ceil(halfWidth);
  const rowMin = Math.floor(top);
  const rowMax = Math.ceil(bottom);

  const cells: Cell[] = [];
  for (let row = rowMin; row <= rowMax; row++) {
    for (let col = colMin; col <= colMax; col++) {
      const x = col + 0.5;
      const y = row + 0.5;
      const code = regionAt(x, y);
      if (code === 0) continue;
      cells.push({ index: 0, col, row, x, y, code: code as RegionCode });
    }
  }

  const byRegion = {} as Record<RegionCode, Cell[]>;
  for (const code of [1, 2, 3, 4, 5, 6, 7] as RegionCode[]) {
    const group = cells.filter((c) => c.code === code);
    // Fill outward from each region's own centre of mass, so early articles
    // cluster at the heart of their region instead of clinging to an edge.
    const cx = group.reduce((s, c) => s + c.x, 0) / (group.length || 1);
    const cy = group.reduce((s, c) => s + c.y, 0) / (group.length || 1);
    group.sort((a, b) => {
      const da = (a.x - cx) ** 2 + (a.y - cy) ** 2;
      const db = (b.x - cx) ** 2 + (b.y - cy) ** 2;
      // Row and column break ties so the order is total, never arbitrary.
      return da - db || a.row - b.row || a.col - b.col;
    });
    byRegion[code] = group;
  }

  // Index cells by region then position, so a cell index is stable for as long
  // as RADIUS is unchanged. Article.mapCell will store this value in Stage 2.
  let n = 0;
  for (const code of [1, 2, 3, 4, 5, 6, 7] as RegionCode[]) {
    for (const cell of byRegion[code]) cell.index = n++;
  }

  // Room outside the rim for the three circle labels.
  const pad = 3;
  return {
    cells,
    byRegion,
    viewBox: {
      minX: colMin - pad,
      minY: rowMin - pad,
      width: colMax - colMin + 1 + pad * 2,
      height: rowMax - rowMin + 1 + pad * 2,
    },
  };
}

/**
 * Where to print each circle's name. Each label sits on the ray running from the
 * centre of the figure out through its circle's centre, just beyond the rim, so
 * no label ever lands on top of a cell.
 */
export function labelAnchors() {
  const reach = RADIUS + 1.5;
  return (Object.keys(CENTRES) as (keyof typeof CENTRES)[]).map((lens) => {
    const c = CENTRES[lens];
    const mag = Math.hypot(c.x, c.y) || 1;
    return {
      lens,
      x: c.x + (c.x / mag) * reach,
      y: c.y + (c.y / mag) * reach,
    };
  });
}

/** Capacity per region and in total. Used by the calibration check. */
export function describeCapacity(grid: VennGrid) {
  const per = Object.fromEntries(
    ([1, 2, 3, 4, 5, 6, 7] as RegionCode[]).map((c) => [c, grid.byRegion[c].length]),
  ) as Record<RegionCode, number>;
  return { per, total: grid.cells.length };
}
