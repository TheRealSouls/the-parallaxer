"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { moderateComment } from "@/app/actions/engagement";

type Row = {
  id: string;
  body: string;
  status: string;
  createdAt: string;
  author: { nickname: string; slug: string | null };
  article: { slug: string; title: string };
};

/**
 * The moderation queue.
 *
 * Shows hidden comments alongside visible ones rather than filtering them out,
 * because the common mistake is hiding the wrong comment and the fix has to be
 * one click away.
 */
export function ModerationQueue({ comments }: { comments: Row[] }) {
  const [pending, startTransition] = useTransition();
  const [statuses, setStatuses] = useState<Record<string, string>>(
    Object.fromEntries(comments.map((comment) => [comment.id, comment.status])),
  );

  return (
    <ul className="divide-rule border-rule mt-8 divide-y border-b">
      {comments.map((comment) => {
        const status = statuses[comment.id] ?? comment.status;
        const hidden = status === "hidden";

        return (
          <li key={comment.id} className="py-4">
            <div className="label text-ink-faint flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-ink">{comment.author.nickname}</span>
              <span>
                on{" "}
                <Link
                  href={`/article/${comment.article.slug}`}
                  className="underline underline-offset-4"
                >
                  {comment.article.title}
                </Link>
              </span>
              <time dateTime={comment.createdAt}>
                {new Date(comment.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </time>
              {hidden && <span className="bg-ink text-paper px-1.5 py-0.5">Hidden</span>}
            </div>

            <p className={`mt-2 max-w-(--measure) text-base ${hidden ? "text-ink-faint" : ""}`}>
              {comment.body}
            </p>

            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const next = hidden ? "visible" : "hidden";
                  await moderateComment(comment.id, next);
                  setStatuses((current) => ({ ...current, [comment.id]: next }));
                })
              }
              className="label mt-2 underline underline-offset-4 disabled:opacity-60"
            >
              {hidden ? "Restore" : "Hide"}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
