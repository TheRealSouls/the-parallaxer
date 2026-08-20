import { NextResponse } from "next/server";
import { getSessionUser, canModerate } from "@/lib/auth-guards";
import { prisma } from "@/lib/db";
import { getComments, getLikes } from "@/lib/queries/engagement";

/**
 * Everything the comment and like island needs, in one request.
 *
 * Comments are fetched from the browser rather than rendered on the server so
 * article pages stay static. The same reasoning as the view beacon: one piece of
 * per-reader state would otherwise make every article page dynamic, and the
 * discussion is not what search engines come for.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const article = await prisma.article.findFirst({
    where: { slug, status: "published" },
    select: { id: true },
  });
  if (!article) return NextResponse.json({ error: "not found" }, { status: 404 });

  const viewer = await getSessionUser();
  const [comments, likes] = await Promise.all([
    getComments(article.id),
    getLikes(article.id, viewer?.id ?? null),
  ]);

  return NextResponse.json(
    {
      articleId: article.id,
      comments,
      likes,
      viewer: viewer
        ? {
            id: viewer.id,
            nickname: viewer.nickname ?? viewer.name,
            canModerate: canModerate(viewer),
          }
        : null,
    },
    // Per-reader state, so it must never be cached by a CDN.
    { headers: { "cache-control": "private, no-store" } },
  );
}
