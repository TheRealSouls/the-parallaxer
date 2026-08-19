import Link from "next/link";
import { formatDate, type Article } from "@/lib/content";
import { Cover } from "@/components/Cover";
import { LensTag } from "@/components/LensPixel";

type Variant = "lead" | "secondary" | "river";

const HEADLINE: Record<Variant, string> = {
  lead: "text-4xl sm:text-5xl",
  secondary: "text-2xl",
  river: "text-lg",
};

/**
 * One story on the front page. Hierarchy is carried by type size and by the
 * rules around it, never by a card, a border box, or a shadow.
 */
export function ArticleCard({
  article,
  variant = "river",
}: {
  article: Article;
  variant?: Variant;
}) {
  return (
    <article className="flex flex-col">
      {variant !== "river" && (
        <Link
          href={`/article/${article.slug}`}
          className="mb-4 block"
          tabIndex={-1}
          aria-hidden="true"
        >
          <Cover article={article} priority={variant === "lead"} />
        </Link>
      )}

      <LensTag lenses={article.lenses} size={variant === "lead" ? "md" : "sm"} />

      <h3 className={`font-display mt-2 font-semibold ${HEADLINE[variant]}`}>
        <Link href={`/article/${article.slug}`} className="underline-offset-4 hover:underline">
          {article.title}
        </Link>
      </h3>

      {variant !== "river" && (
        <p
          className={`text-ink-muted mt-2 ${variant === "lead" ? "text-xl leading-relaxed" : "text-base leading-relaxed"}`}
        >
          {article.dek}
        </p>
      )}

      <p className="label text-ink-faint mt-3">
        <Link href={`/by/${article.author.slug}`} className="underline-offset-4 hover:underline">
          {article.author.name}
        </Link>
        <span aria-hidden="true"> &middot; </span>
        <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
        <span aria-hidden="true"> &middot; </span>
        {article.readingMinutes} min
      </p>
    </article>
  );
}
