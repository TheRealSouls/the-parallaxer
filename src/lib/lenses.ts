/**
 * The single source of truth for the Parallax colour system.
 *
 * Three lenses behave as subtractive primaries. An article carries one, two, or
 * all three of them, and the resulting region colour is the mix: yellow and red
 * give orange, red and blue give aubergine, all three give a near-black ink.
 *
 * The seven colours were generated in OKLCH at near-constant lightness so they
 * read as one family of printer's spot inks rather than as a rainbow. Their hues
 * run monotonically around the colour wheel, which means every mixed region sits
 * between its two parents. Do not hand-edit a hex here without re-checking the
 * lightness band and the contrast ratio against paper.
 */

export const LENSES = ["philosophy", "politics", "economics"] as const;

export type Lens = (typeof LENSES)[number];

/** Bit position per lens. A region code is the OR of its members' bits. */
export const LENS_BIT: Record<Lens, number> = {
  philosophy: 1,
  politics: 2,
  economics: 4,
};

/** 1 through 7. Zero would mean "no lens", which is never a valid article. */
export type RegionCode = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type Region = {
  code: RegionCode;
  lenses: readonly Lens[];
  /** Full name, used in prose, page titles, and aria labels. */
  name: string;
  /** Condensed uppercase form for kickers and the map key. */
  short: string;
  /** Fill colour. Text is never set in this colour; see the note below. */
  hex: string;
  /** Matching CSS custom property. */
  cssVar: string;
};

/**
 * Contrast note: every fill clears 3:1 against paper, the WCAG bar for
 * graphical objects. Only philosophy sits below 4.5:1, because a yellow cannot
 * be dark enough to pass as small text and still read as yellow. The site works
 * around this by never setting text in a lens colour. Colour appears as a
 * square; the words next to it are always ink.
 */
export const REGIONS: Record<RegionCode, Region> = {
  1: {
    code: 1,
    lenses: ["philosophy"],
    name: "Philosophy",
    short: "PHILOSOPHY",
    hex: "#8F7532",
    cssVar: "--lens-1",
  },
  2: {
    code: 2,
    lenses: ["politics"],
    name: "Politics",
    short: "POLITICS",
    hex: "#944B40",
    cssVar: "--lens-2",
  },
  3: {
    code: 3,
    lenses: ["philosophy", "politics"],
    name: "Philosophy and Politics",
    short: "PHIL\u00B7POL",
    hex: "#8E5E3B",
    cssVar: "--lens-3",
  },
  4: {
    code: 4,
    lenses: ["economics"],
    name: "Economics",
    short: "ECONOMICS",
    hex: "#3A6799",
    cssVar: "--lens-4",
  },
  5: {
    code: 5,
    lenses: ["philosophy", "economics"],
    name: "Philosophy and Economics",
    short: "PHIL\u00B7ECON",
    hex: "#44763E",
    cssVar: "--lens-5",
  },
  6: {
    code: 6,
    lenses: ["politics", "economics"],
    name: "Politics and Economics",
    short: "POL\u00B7ECON",
    hex: "#78538E",
    cssVar: "--lens-6",
  },
  7: {
    code: 7,
    lenses: ["philosophy", "politics", "economics"],
    name: "Philosophy, Politics and Economics",
    short: "PPE",
    hex: "#3F362F",
    cssVar: "--lens-7",
  },
};

export const ALL_REGIONS: readonly Region[] = [1, 2, 3, 4, 5, 6, 7].map(
  (c) => REGIONS[c as RegionCode],
);

/** Collapse a set of lenses into its region code. */
export function toRegionCode(lenses: readonly Lens[]): RegionCode {
  const code = lenses.reduce((acc, l) => acc | LENS_BIT[l], 0);
  if (code < 1 || code > 7) {
    throw new Error(`An article must carry at least one lens (got [${lenses.join(", ")}])`);
  }
  return code as RegionCode;
}

export function regionOf(lenses: readonly Lens[]): Region {
  return REGIONS[toRegionCode(lenses)];
}

/** Expand a region code back into its lenses. */
export function lensesOf(code: RegionCode): readonly Lens[] {
  return REGIONS[code].lenses;
}

/** Every region that includes the given lens, used by the /lens/[lens] pages. */
export function regionsWithLens(lens: Lens): readonly Region[] {
  return ALL_REGIONS.filter((r) => (r.code & LENS_BIT[lens]) !== 0);
}

export function isLens(value: string): value is Lens {
  return (LENSES as readonly string[]).includes(value);
}

/** Title case for a single lens, e.g. "philosophy" to "Philosophy". */
export function lensName(lens: Lens): string {
  return lens.charAt(0).toUpperCase() + lens.slice(1);
}
