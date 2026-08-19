import { regionOf, type Lens } from "@/lib/lenses";

const SIZES = {
  sm: "h-2 w-2",
  md: "h-2.5 w-2.5",
  lg: "h-4 w-4",
} as const;

/**
 * The site's atom: one square of the mixed lens colour.
 *
 * It is the same mark that fills a cell of the map, which is what ties an
 * individual headline back to the diagram at the top of the front page. It is
 * always decorative, because the lens is named in words beside it.
 */
export function LensPixel({
  lenses,
  size = "md",
  className = "",
}: {
  lenses: readonly Lens[];
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const region = regionOf(lenses);
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 ${SIZES[size]} ${className}`}
      style={{
        backgroundColor: `var(${region.cssVar})`,
        boxShadow: "inset 0 0 0 1px var(--cell-keyline)",
      }}
    />
  );
}

/** The pixel plus its name, the standard kicker unit above a headline. */
export function LensTag({
  lenses,
  size = "md",
  className = "",
}: {
  lenses: readonly Lens[];
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const region = regionOf(lenses);
  return (
    <span className={`label text-ink-muted inline-flex items-center gap-1.5 ${className}`}>
      <LensPixel lenses={lenses} size={size} />
      {region.short}
    </span>
  );
}
