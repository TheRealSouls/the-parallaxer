import { getPublishedArticles } from "@/lib/data";
import { feedHeaders, renderRss } from "@/lib/feed";

/** The whole publication, most recent first. */
export async function GET() {
  const articles = await getPublishedArticles(50);
  return new Response(renderRss(articles), { headers: feedHeaders });
}
