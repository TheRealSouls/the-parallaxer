import { getPublishedArticles } from "@/lib/data";
import { feedHeaders, renderAtom } from "@/lib/feed";

/** The same archive as feed.xml, for readers whose software prefers Atom. */
export async function GET() {
  const articles = await getPublishedArticles(50);
  return new Response(renderAtom(articles), { headers: feedHeaders });
}
