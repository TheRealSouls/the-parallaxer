import Image from "next/image";
import { CoverArt } from "@/components/CoverArt";
import type { Article } from "@/lib/content";

/**
 * An article's cover.
 *
 * Uses the uploaded image when there is one and falls back to generated art in
 * the article's lens colours otherwise, so every article has a cover without
 * anybody having to find one. See CoverArt for why the fallback is drawn rather
 * than photographic.
 */
export function Cover({
  article,
  className = "",
  priority = false,
}: {
  article: Article;
  className?: string;
  priority?: boolean;
}) {
  if (!article.coverImage) {
    return <CoverArt slug={article.slug} lenses={article.lenses} className={className} />;
  }

  return (
    <Image
      src={article.coverImage}
      alt={article.coverAlt ?? ""}
      width={1600}
      height={900}
      priority={priority}
      className={`block h-auto w-full ${className}`}
    />
  );
}

/** The credit line under a cover. Renders nothing when there is no credit. */
export function CoverCredit({ article }: { article: Article }) {
  if (!article.coverCredit) return null;
  return <p className="label text-ink-faint mt-2">{article.coverCredit}</p>;
}
