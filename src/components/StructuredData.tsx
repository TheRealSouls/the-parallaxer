import type { Article, Author } from "@/lib/content";
import { REGIONS, toRegionCode } from "@/lib/lenses";
import { formatEditorTitle } from "@/lib/editorial";
import { site } from "@/lib/site";

/**
 * Schema.org descriptions of the page, for search engines.
 *
 * Emitted as a script tag rather than through the metadata API because Next has
 * no first-class support for JSON-LD, and this is the shape Google documents.
 *
 * The content is generated from the same records the page renders, so the two
 * cannot drift. Describing an article one way to a reader and another way to a
 * crawler is what gets a site treated as spam.
 */
function Ld({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // The payload is built here from typed records, never from reader input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function OrganisationJsonLd() {
  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: site.name,
        url: site.url,
        logo: `${site.url}/logo.png`,
        email: site.contactEmail,
        foundingDate: String(site.founded),
        description: site.description,
        sameAs: [],
      }}
    />
  );
}

export function WebSiteJsonLd() {
  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: site.name,
        url: site.url,
        description: site.description,
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${site.url}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

export function ArticleJsonLd({ article }: { article: Article }) {
  const region = REGIONS[toRegionCode(article.lenses)];

  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: article.title,
        description: article.dek || article.excerpt,
        url: `${site.url}/article/${article.slug}`,
        mainEntityOfPage: `${site.url}/article/${article.slug}`,
        datePublished: article.publishedAt,
        dateModified: article.publishedAt,
        image: `${site.url}/article/${article.slug}/opengraph-image`,
        articleSection: region.name,
        keywords: article.lenses.join(", "),
        wordCount: article.readingMinutes * 240,
        inLanguage: "en",
        author: {
          "@type": "Person",
          name: article.author.name,
          url: `${site.url}/by/${article.author.slug}`,
          jobTitle: formatEditorTitle(article.author.title),
        },
        publisher: {
          "@type": "Organization",
          name: site.name,
          url: site.url,
          logo: { "@type": "ImageObject", url: `${site.url}/logo.png` },
        },
      }}
    />
  );
}

export function PersonJsonLd({ author, articleCount }: { author: Author; articleCount: number }) {
  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "Person",
        name: author.name,
        url: `${site.url}/by/${author.slug}`,
        jobTitle: formatEditorTitle(author.title),
        description: author.bio || undefined,
        image: author.image ? `${site.url}${author.image}` : undefined,
        sameAs: author.links.map((link) => link.url),
        worksFor: { "@type": "Organization", name: site.name, url: site.url },
        // Not a schema.org property, but harmless, and it records the figure the
        // page itself shows.
        knowsAbout:
          author.title.rank === "senior" || author.title.rank === "junior"
            ? REGIONS[author.title.beat].name
            : undefined,
        interactionStatistic: {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/WriteAction",
          userInteractionCount: articleCount,
        },
      }}
    />
  );
}
