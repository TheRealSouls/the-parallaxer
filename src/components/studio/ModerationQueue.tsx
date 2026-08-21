"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { banUser, moderateComment } from "@/app/actions/engagement";

type Row = {
  id: string;
  body: string;
  status: string;
  createdAt: string;
  reportCount: number;
  reasons: string[];
  author: { id: string; nickname: string; slug: string | null; role: string; banned: boolean };
  article: { slug: string; title: string };
};

/** Suspension lengths offered. Zero lifts an existing suspension. */
const BAN_OPTIONS = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 3650, label: "Indefinitely" },
] as const;

/**
 * The moderation queue.
 *
 * Reported comments come first, because those are the ones somebody is waiting
 * on. Hidden comments stay in the list rather than being filtered out: the
 * common mistake is hiding the wrong one, and the fix has to be one click away.
 */
export function ModerationQueue({ comments }: { comments: Row[] }) {
  const [pending, startTransition] = useTransition();
  const [statuses, setStatuses] = useState<Record<string, string>>(
    Object.fromEntries(comments.map((comment) => [comment.id, comment.status])),
  );
  const [banned, setBanned] = useState<Record<string, boolean>>(
    Object.fromEntries(comments.map((comment) => [comment.author.id, comment.author.banned])),
  );
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      {error && (
        <p role="alert" className="border-ink mt-6 border-t-2 pt-3 text-base">
          {error}
        </p>
      )}

      <ul className="divide-rule border-rule mt-8 divide-y border-b">
        {comments.map((comment) => {
          const status = statuses[comment.id] ?? comment.status;
          const hidden = status === "hidden";
          const isBanned = banned[comment.author.id] ?? comment.author.banned;

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
                {comment.reportCount > 0 && (
                  <span className="bg-ink text-paper px-1.5 py-0.5 tabular-nums">
                    {comment.reportCount} {comment.reportCount === 1 ? "report" : "reports"}
                  </span>
                )}
                {hidden && <span className="border-ink border px-1.5 py-0.5">Hidden</span>}
                {isBanned && <span className="border-ink border px-1.5 py-0.5">Suspended</span>}
              </div>

              <p className={`mt-2 max-w-(--measure) text-base ${hidden ? "text-ink-faint" : ""}`}>
                {comment.body}
              </p>

              {comment.reasons.length > 0 && (
                <ul className="text-ink-muted mt-2 max-w-(--measure) space-y-1 text-sm">
                  {comment.reasons.map((reason, i) => (
                    <li key={i}>Reported: {reason}</li>
                  ))}
                </ul>
              )}

              <div className="label mt-2 flex flex-wrap items-center gap-4">
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
                  className="underline underline-offset-4 disabled:opacity-60"
                >
                  {hidden ? "Restore" : "Hide"}
                </button>

                {isBanned ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        const result = await banUser(comment.author.id, 0, "");
                        if (!result.ok) return setError(result.error);
                        setError(null);
                        setBanned((current) => ({ ...current, [comment.author.id]: false }));
                      })
                    }
                    className="underline underline-offset-4 disabled:opacity-60"
                  >
                    Lift suspension
                  </button>
                ) : (
                  <span className="text-ink-faint flex flex-wrap items-center gap-3">
                    Suspend
                    {BAN_OPTIONS.map((option) => (
                      <button
                        key={option.days}
                        type="button"
                        disabled={pending}
                        onClick={() =>
                          startTransition(async () => {
                            const reason =
                              window.prompt(`Why is ${comment.author.nickname} being suspended?`) ??
                              "";
                            const result = await banUser(comment.author.id, option.days, reason);
                            if (!result.ok) return setError(result.error);
                            setError(null);
                            setBanned((current) => ({ ...current, [comment.author.id]: true }));
                          })
                        }
                        className="text-ink underline underline-offset-4 disabled:opacity-60"
                      >
                        {option.label}
                      </button>
                    ))}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
