import { getArticlesByLens } from "@/lib/data";
import { feedHeaders, renderRss } from "@/lib/feed";
import { isLens, lensName } from "@/lib/lenses";
import { site } from "@/lib/site";

/**
 * One feed per lens, so a reader who only wants economics can subscribe to it
 * without muting the rest. Includes the overlaps, matching what the lens page
 * shows.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ lens: string }> }) {
  const { lens } = await params;
  if (!isLens(lens)) return new Response("Not found", { status: 404 });

  const articles = await getArticlesByLens(lens);

  return new Response(
    renderRss(articles.slice(0, 50), {
      title: `${site.name}: ${lensName(lens)}`,
      path: `/lens/${lens}/feed.xml`,
    }),
    { headers: feedHeaders },
  );
}
