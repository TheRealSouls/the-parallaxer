import "server-only";

import type { Article } from "@/lib/content";
import { REGIONS, toRegionCode } from "@/lib/lenses";
import { site } from "@/lib/site";

/**
 * RSS and Atom.
 *
 * Written by hand rather than pulled from a library, because a feed is a few
 * hundred bytes of well-specified XML and the dependency would be larger than
 * the code. The only real hazard is escaping, which is handled in one place
 * below.
 *
 * Both formats are offered because readers are split between them and neither
 * costs anything to keep. Each carries the whole standfirst, not the whole
 * article: a feed that reprints the piece gives nobody a reason to arrive.
 */

/** Escapes the five characters XML cares about. Everything else is safe. */
function escape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function articleUrl(article: Article): string {
  return `${site.url}/article/${article.slug}`;
}

function summary(article: Article): string {
  const region = REGIONS[toRegionCode(article.lenses)];
  return `${article.dek || article.excerpt} (${region.name})`;
}

export function renderRss(
  articles: readonly Article[],
  options?: { title?: string; path?: string },
): string {
  const title = options?.title ?? site.name;
  const self = `${site.url}${options?.path ?? "/feed.xml"}`;
  const updated = articles[0]?.publishedAt ?? new Date().toISOString();

  const items = articles
    .map((article) =>
      [
        "    <item>",
        `      <title>${escape(article.title)}</title>`,
        `      <link>${escape(articleUrl(article))}</link>`,
        `      <guid isPermaLink="true">${escape(articleUrl(article))}</guid>`,
        `      <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>`,
        `      <dc:creator>${escape(article.author.name)}</dc:creator>`,
        `      <category>${escape(REGIONS[toRegionCode(article.lenses)].name)}</category>`,
        `      <description>${escape(summary(article))}</description>`,
        "    </item>",
      ].join("\n"),
    )
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escape(title)}</title>`,
    `    <link>${escape(site.url)}</link>`,
    `    <description>${escape(site.description)}</description>`,
    "    <language>en</language>",
    `    <lastBuildDate>${new Date(updated).toUTCString()}</lastBuildDate>`,
    `    <atom:link href="${escape(self)}" rel="self" type="application/rss+xml"/>`,
    items,
    "  </channel>",
    "</rss>",
  ].join("\n");
}

export function renderAtom(articles: readonly Article[]): string {
  const updated = articles[0]?.publishedAt ?? new Date().toISOString();

  const entries = articles
    .map((article) =>
      [
        "  <entry>",
        `    <title>${escape(article.title)}</title>`,
        `    <link href="${escape(articleUrl(article))}"/>`,
        `    <id>${escape(articleUrl(article))}</id>`,
        `    <updated>${new Date(article.publishedAt).toISOString()}</updated>`,
        `    <published>${new Date(article.publishedAt).toISOString()}</published>`,
        `    <author><name>${escape(article.author.name)}</name></author>`,
        `    <category term="${escape(REGIONS[toRegionCode(article.lenses)].name)}"/>`,
        `    <summary>${escape(summary(article))}</summary>`,
        "  </entry>",
      ].join("\n"),
    )
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    `  <title>${escape(site.name)}</title>`,
    `  <subtitle>${escape(site.statement)}</subtitle>`,
    `  <link href="${escape(site.url)}"/>`,
    `  <link href="${escape(`${site.url}/atom.xml`)}" rel="self"/>`,
    `  <id>${escape(site.url)}/</id>`,
    `  <updated>${new Date(updated).toISOString()}</updated>`,
    entries,
    "</feed>",
  ].join("\n");
}

/** One hour of shared caching, so a popular feed does not hit the database per reader. */
export const feedHeaders = {
  "content-type": "application/xml; charset=utf-8",
  "cache-control": "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400",
} as const;
