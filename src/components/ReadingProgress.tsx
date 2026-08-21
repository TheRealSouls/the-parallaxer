import { regionOf, type Lens } from "@/lib/lenses";

/**
 * A bar across the top of an article showing how far through it you are.
 *
 * A server component with no behaviour: the movement comes from a CSS
 * scroll-driven animation, so this adds nothing to the JavaScript the article
 * route ships. See .reading-progress in globals.css.
 *
 * Coloured with the article's own lens, so the bar says which kind of piece
 * this is while you read it.
 */
export function ReadingProgress({ lenses }: { lenses: readonly Lens[] }) {
  const region = regionOf(lenses);
  return (
    <div
      aria-hidden="true"
      className="reading-progress"
      style={{ backgroundColor: `var(${region.cssVar})` }}
    />
  );
}
