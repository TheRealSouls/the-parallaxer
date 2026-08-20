import Image from "next/image";
import { REGIONS, isRegionCode } from "@/lib/lenses";
import type { Author } from "@/lib/content";

const SIZES = {
  sm: { box: "h-12 w-12", px: 48, text: "text-sm" },
  md: { box: "h-20 w-20", px: 80, text: "text-xl" },
  lg: { box: "h-32 w-32", px: 128, text: "text-3xl" },
} as const;

/**
 * An editor's portrait, or a placeholder standing in for one.
 *
 * Portraits are optional and most will be missing for a while, so the fallback
 * has to be something the masthead can wear rather than a grey blank. It is a
 * square, matching the pixel motif, tinted with the editor's own beat colour and
 * carrying their initials. A page of them reads as a deliberate set.
 *
 * Files live in public/editors, named after the profile slug. See the README
 * there.
 */
export function Avatar({
  author,
  size = "md",
  className = "",
}: {
  author: Pick<Author, "name" | "image" | "title">;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const spec = SIZES[size];

  if (author.image) {
    return (
      <Image
        src={author.image}
        alt=""
        width={spec.px}
        height={spec.px}
        className={`${spec.box} shrink-0 object-cover ${className}`}
        style={{ boxShadow: "inset 0 0 0 1px var(--cell-keyline)" }}
      />
    );
  }

  const beat =
    author.title.rank === "senior" || author.title.rank === "junior" ? author.title.beat : null;
  const tint = isRegionCode(beat)
    ? `color-mix(in srgb, var(${REGIONS[beat].cssVar}) 22%, var(--paper))`
    : "var(--paper-sunk)";

  return (
    <span
      aria-hidden="true"
      className={`${spec.box} ${spec.text} label text-ink-muted flex shrink-0 items-center justify-center ${className}`}
      style={{ backgroundColor: tint, boxShadow: "inset 0 0 0 1px var(--cell-keyline)" }}
    >
      {initials(author.name)}
    </span>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
