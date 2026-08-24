import type { MetadataRoute } from "next";
import { getProfileSlugs, getPublishedArticles } from "@/lib/data";
import { LENSES } from "@/lib/lenses";
import { site } from "@/lib/site";

/**
 * Every public address, generated from the archive rather than maintained by
 * hand, so a new article is discoverable the moment it is published.
 *
 * Priorities are relative to each other and nothing else. Articles carry the
 * most weight because they are what anyone is looking for; the legal pages are
 * listed so they can be found, not so they can rank.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getPublishedArticles();
  const profiles = await getProfileSlugs();

  const latest = articles[0]?.publishedAt ?? new Date().toISOString();

  return [
    { url: site.url, lastModified: latest, changeFrequency: "daily", priority: 1 },
    { url: `${site.url}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${site.url}/submit`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${site.url}/search`, changeFrequency: "weekly", priority: 0.3 },
    { url: `${site.url}/pixels`, lastModified: latest, changeFrequency: "weekly", priority: 0.7 },

    ...LENSES.map((lens) => ({
      url: `${site.url}/lens/${lens}`,
      lastModified: latest,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),

    ...articles.map((article) => ({
      url: `${site.url}/article/${article.slug}`,
      lastModified: article.publishedAt,
      changeFrequency: "yearly" as const,
      priority: 0.9,
    })),

    ...profiles.map((slug) => ({
      url: `${site.url}/by/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),

    { url: `${site.url}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${site.url}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
