import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Records a view. Called once per tab session by ViewBeacon.
 *
 * Writes two things in one transaction: the running total on the article, which
 * is what the studio and any "most read" list sort by, and a row in the daily
 * bucket, which is what a chart over time needs. Neither stores anything about
 * who was reading.
 */
export async function POST(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const article = await prisma.article.findFirst({
    where: { slug, status: "published" },
    select: { id: true },
  });

  // Unknown or unpublished slugs are ignored rather than reported, so this
  // cannot be used to probe which drafts exist.
  if (!article) return new NextResponse(null, { status: 204 });

  // Midnight UTC, so a day means the same thing wherever the reader is.
  const day = new Date();
  day.setUTCHours(0, 0, 0, 0);

  await prisma.$transaction([
    prisma.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    }),
    prisma.articleViewDay.upsert({
      where: { articleId_day: { articleId: article.id, day } },
      create: { articleId: article.id, day, count: 1 },
      update: { count: { increment: 1 } },
    }),
  ]);

  return new NextResponse(null, { status: 204 });
}
