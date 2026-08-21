import "server-only";

import { prisma } from "@/lib/db";
import { toEditorTitle, type EditorTitle } from "@/lib/editorial";

/**
 * Reads for comments and likes.
 *
 * Threads are one level deep by design, so a whole discussion is one query and
 * an array group rather than a recursive walk. Deep threads on an argumentative
 * site turn into two people talking to each other in a column six indents wide;
 * a flat reply list keeps the conversation legible to everyone else.
 */

export type CommentView = {
  id: string;
  body: string;
  createdAt: string;
  /** Set only when the author rewrote it, never when a moderator acted. */
  edited: boolean;
  author: {
    id: string;
    nickname: string;
    slug: string | null;
    title: EditorTitle | null;
  };
  replies: CommentView[];
};

const authorSelect = {
  select: { id: true, name: true, nickname: true, slug: true, rank: true, beat: true },
} as const;

type AuthorRow = {
  id: string;
  name: string;
  nickname: string | null;
  slug: string | null;
  rank: string | null;
  beat: number | null;
};

function toCommentAuthor(row: AuthorRow) {
  return {
    id: row.id,
    nickname: row.nickname ?? row.name,
    slug: row.slug,
    // Readers have no rank, and should not be shown as guest contributors.
    title: row.rank ? toEditorTitle(row.rank, row.beat) : null,
  };
}

/** Every visible comment on an article, oldest first, with replies attached. */
export async function getComments(articleId: string): Promise<CommentView[]> {
  const rows = await prisma.comment.findMany({
    where: { articleId, status: "visible" },
    include: { author: authorSelect },
    orderBy: { createdAt: "asc" },
  });

  type Row = (typeof rows)[number];

  const byParent = new Map<string, Row[]>();
  const roots: Row[] = [];

  for (const row of rows) {
    if (row.parentId) {
      const siblings = byParent.get(row.parentId) ?? [];
      siblings.push(row);
      byParent.set(row.parentId, siblings);
    } else {
      roots.push(row);
    }
  }

  const view = (row: Row): CommentView => ({
    id: row.id,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
    edited: row.editedAt !== null,
    author: toCommentAuthor(row.author),
    replies: (byParent.get(row.id) ?? []).map(view),
  });

  return roots.map(view);
}

/** Total comments on an article, for the heading. */
export async function countComments(articleId: string): Promise<number> {
  return prisma.comment.count({ where: { articleId, status: "visible" } });
}

/**
 * Likes on an article, and whether this reader is one of them.
 *
 * Returns `liked: false` for signed-out readers rather than hiding the count.
 * The number is public; only the act of liking needs an account.
 */
export async function getLikes(
  articleId: string,
  userId: string | null,
): Promise<{ count: number; liked: boolean }> {
  const [count, mine] = await Promise.all([
    prisma.like.count({ where: { articleId } }),
    userId
      ? prisma.like.findUnique({
          where: { userId_articleId: { userId, articleId } },
          select: { userId: true },
        })
      : Promise.resolve(null),
  ]);

  return { count, liked: Boolean(mine) };
}

/** Comments awaiting a moderator's attention, newest first. */
export async function getModerationQueue(limit = 100) {
  const rows = await prisma.comment.findMany({
    where: { status: { in: ["visible", "hidden"] } },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          nickname: true,
          slug: true,
          rank: true,
          beat: true,
          role: true,
          bannedUntil: true,
        },
      },
      article: { select: { slug: true, title: true } },
      reports: { select: { reason: true }, take: 10 },
      _count: { select: { reports: true } },
    },
    // Reported comments first, because those are the ones somebody is waiting on.
    orderBy: [{ reports: { _count: "desc" } }, { createdAt: "desc" }],
    take: limit,
  });

  const now = new Date();

  return rows.map((row) => ({
    id: row.id,
    body: row.body,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    reportCount: row._count.reports,
    reasons: row.reports.map((report) => report.reason).filter((r): r is string => Boolean(r)),
    author: {
      ...toCommentAuthor(row.author),
      role: row.author.role,
      banned: row.author.bannedUntil ? row.author.bannedUntil > now : false,
    },
    article: row.article,
  }));
}
