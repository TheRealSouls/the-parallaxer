import { regionOf, tintTowardPaper, type Lens } from "@/lib/lenses";

/**
 * Generated cover art.
 *
 * Every article needs a cover, and stock photography would undo the design: it
 * is expensive to licence, generic by nature, and carries none of the colour
 * information the rest of the site is built on. Instead each cover is drawn from
 * the article's own lens colours in the same square-pixel language as the map,
 * so a cover states the article's region before a word is read.
 *
 * The image is a pure function of the slug, so it is stable forever and
 * identical on the server and the client. When an editor uploads a real cover in
 * Stage 3 it takes precedence and this is not rendered.
 */

const COLS = 32;
const ROWS = 18;

/** Tint ladder, from nearly bare paper to the full lens colour. */
const LEVELS = [0.08, 0.24, 0.44, 0.68, 1] as const;

/** Deterministic 32-bit hash, so a slug always yields the same picture. */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Seeded generator, used only to pick the wave parameters. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function CoverArt({
  slug,
  lenses,
  className = "",
}: {
  slug: string;
  lenses: readonly Lens[];
  className?: string;
}) {
  const region = regionOf(lenses);
  const rand = mulberry32(hash(slug));

  // Three interfering waves at low frequency. Low frequency is the whole point:
  // it produces broad strata that read as deliberate banding rather than noise.
  const waves = [0, 1, 2].map(() => ({
    fx: 0.08 + rand() * 0.26,
    fy: 0.08 + rand() * 0.26,
    phase: rand() * Math.PI * 2,
    tilt: rand() < 0.5 ? -1 : 1,
  }));

  const cells: { x: number; y: number; fill: string }[] = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      let v = 0;
      for (const w of waves) {
        v += Math.sin(x * w.fx + y * w.fy * w.tilt + w.phase);
      }
      // Three summed sines span -3 to 3.
      const normalised = (v + 3) / 6;
      const level = Math.min(LEVELS.length - 1, Math.floor(normalised * LEVELS.length));
      cells.push({ x, y, fill: tintTowardPaper(region.hex, LEVELS[level]!) });
    }
  }

  return (
    <svg
      viewBox={`0 0 ${COLS} ${ROWS}`}
      className={`block h-auto w-full ${className}`}
      role="img"
      aria-label={`Cover illustration in the ${region.name.toLowerCase()} colours`}
      preserveAspectRatio="xMidYMid slice"
    >
      {cells.map((cell) => (
        <rect
          key={`${cell.x}-${cell.y}`}
          x={cell.x}
          y={cell.y}
          width={1.02}
          height={1.02}
          fill={cell.fill}
        />
      ))}
    </svg>
  );
}
