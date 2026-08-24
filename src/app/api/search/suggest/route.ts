import { NextResponse } from "next/server";
import { searchArticles } from "@/lib/data";
import { REGIONS, toRegionCode } from "@/lib/lenses";

/**
 * Titles for the search box's suggestion list.
 *
 * Deliberately thin: headline, address and which region the piece sits in.
 * Enough to recognise an article and go straight to it, but not so much that
 * the endpoint becomes a second way to read the archive.
 *
 * Only published work is reachable, because `searchArticles` reads from the
 * published pool and nothing here widens it. A draft cannot leak through a
 * suggestion.
 */

const LIMIT = 6;

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = (params.get("q") ?? "").slice(0, 120).trim();
  const lens = params.get("lens") ?? undefined;

  // One character matches most of the archive and tells the reader nothing.
  if (query.length < 2) return NextResponse.json({ results: [] });

  const matches = await searchArticles(query, lens);

  const results = matches.slice(0, LIMIT).map((article) => ({
    slug: article.slug,
    title: article.title,
    region: REGIONS[toRegionCode(article.lenses)].name,
    lenses: article.lenses,
  }));

  return NextResponse.json(
    { results },
    {
      // Cheap to recompute and changes only when something is published, but a
      // few seconds of shared caching absorbs the burst of requests one person
      // makes while typing a single word.
      headers: { "cache-control": "public, s-maxage=10, stale-while-revalidate=60" },
    },
  );
}
