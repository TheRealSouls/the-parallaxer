"use client";

import { faHeart } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  deleteComment,
  editComment,
  moderateComment,
  postComment,
  reportComment,
  toggleLike,
} from "@/app/actions/engagement";
import { COMMENT_EDIT_GRACE_MINUTES, COMMENT_MAX } from "@/lib/engagement-limits";
import type { CommentView } from "@/lib/queries/engagement";
import { formatEditorTitle, type EditorTitle } from "@/lib/editorial";

/**
 * Likes and the comment thread, loaded after the article renders.
 *
 * This is a client island on purpose. Article pages are statically generated,
 * and both the like state and the moderator controls are per reader, so drawing
 * them on the server would make every article page dynamic for the sake of a
 * section below the fold.
 */

type Viewer = { id: string; nickname: string; canModerate: boolean } | null;

type Payload = {
  articleId: string;
  commentsLocked: boolean;
  comments: CommentView[];
  likes: { count: number; liked: boolean };
  viewer: Viewer;
};

export function ArticleEngagement({ slug }: { slug: string }) {
  const [data, setData] = useState<Payload | null>(null);
  const [failed, setFailed] = useState(false);
  // Captured when the thread loads rather than read during render, which would
  // be impure. The server is authoritative on the edit window regardless; this
  // only decides whether the control is worth offering.
  const [loadedAt, setLoadedAt] = useState(0);

  // Bumped to re-run the fetch after a comment is posted or removed.
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((n) => n + 1), []);

  useEffect(() => {
    // Guards against a response arriving after the reader has navigated away,
    // and against an earlier request resolving after a later one.
    let cancelled = false;

    async function fetchEngagement() {
      try {
        const response = await fetch(`/api/articles/${encodeURIComponent(slug)}/engagement`);
        if (!response.ok) throw new Error(String(response.status));
        const payload = (await response.json()) as Payload;
        if (!cancelled) {
          setData(payload);
          setLoadedAt(Date.now());
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    }

    void fetchEngagement();
    return () => {
      cancelled = true;
    };
  }, [slug, revision]);

  if (failed) {
    return (
      <section className="mx-auto mt-14 w-full max-w-(--measure)">
        <p className="text-ink-faint border-rule border-t pt-4 text-base">
          Comments could not be loaded.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="discussion-heading"
      className="mx-auto mt-14 w-full max-w-(--measure)"
    >
      <div className="border-ink flex items-center justify-between border-t-2 pt-3">
        <h2 id="discussion-heading" className="label">
          Discussion {data && <span className="text-ink-faint">{countAll(data.comments)}</span>}
        </h2>
        {data && (
          <LikeButton articleId={data.articleId} initial={data.likes} signedIn={!!data.viewer} />
        )}
      </div>

      {!data ? (
        <p className="text-ink-faint mt-5 text-base">Loading</p>
      ) : (
        <>
          {data.commentsLocked ? (
            <p className="text-ink-muted border-rule mt-5 border-b pb-5 text-base">
              Comments are closed on this article. What is already here stays.
            </p>
          ) : (
            <CommentForm
              articleId={data.articleId}
              parentId={null}
              viewer={data.viewer}
              onPosted={reload}
            />
          )}

          {data.comments.length === 0 ? (
            <p className="text-ink-faint mt-8 text-base">
              No comments yet. Disagreement welcome, rudeness not.
            </p>
          ) : (
            <ul className="mt-8 space-y-8">
              {data.comments.map((comment) => (
                <li key={comment.id}>
                  <Comment
                    comment={comment}
                    articleId={data.articleId}
                    viewer={data.viewer}
                    locked={data.commentsLocked}
                    now={loadedAt}
                    onChanged={reload}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

function countAll(comments: CommentView[]): number {
  return comments.reduce((total, comment) => total + 1 + comment.replies.length, 0);
}

function LikeButton({
  articleId,
  initial,
  signedIn,
}: {
  articleId: string;
  initial: { count: number; liked: boolean };
  signedIn: boolean;
}) {
  const [state, setState] = useState(initial);
  const [busy, setBusy] = useState(false);

  if (!signedIn) {
    return (
      <span className="label text-ink-faint inline-flex items-center gap-1.5">
        <Glyph icon={faHeart} />
        {state.count}
      </span>
    );
  }

  async function onClick() {
    setBusy(true);
    // Drawn immediately, then reconciled against whatever the server returns.
    setState((current) => ({
      count: current.count + (current.liked ? -1 : 1),
      liked: !current.liked,
    }));

    const result = await toggleLike(articleId);
    setBusy(false);
    if ("error" in result) {
      setState(initial);
      return;
    }
    setState(result);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-pressed={state.liked}
      className={`label inline-flex items-center gap-1.5 underline-offset-4 hover:underline ${
        state.liked ? "text-ink" : "text-ink-faint"
      }`}
    >
      <Glyph icon={faHeart} filled={state.liked} />
      {state.count}
      <span className="sr-only">{state.liked ? "Remove your like" : "Like this article"}</span>
    </button>
  );
}

function Comment({
  comment,
  articleId,
  viewer,
  locked,
  now,
  onChanged,
}: {
  comment: CommentView;
  articleId: string;
  viewer: Viewer;
  locked: boolean;
  /** Timestamp captured when the thread loaded. See ArticleEngagement. */
  now: number;
  onChanged: () => void;
}) {
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);

  const own = viewer?.id === comment.author.id;
  const withinGrace =
    now - new Date(comment.createdAt).getTime() < COMMENT_EDIT_GRACE_MINUTES * 60_000;

  return (
    <article>
      <Byline author={comment.author} createdAt={comment.createdAt} edited={comment.edited} />

      {editing ? (
        <EditForm
          comment={comment}
          onDone={() => {
            setEditing(false);
            onChanged();
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <div className="mt-1.5 space-y-3 text-base leading-relaxed">
          {comment.body.split(/\n{2,}/).map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      )}

      {!editing && (
        <div className="label text-ink-faint mt-2 flex flex-wrap gap-4">
          {viewer && !locked && (
            <button
              type="button"
              onClick={() => setReplying((current) => !current)}
              className="underline-offset-4 hover:underline"
            >
              {replying ? "Cancel" : "Reply"}
            </button>
          )}

          {own && withinGrace && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="underline-offset-4 hover:underline"
            >
              Edit
            </button>
          )}

          <CommentControls comment={comment} viewer={viewer} onChanged={onChanged} />
        </div>
      )}

      {replying && (
        <CommentForm
          articleId={articleId}
          parentId={comment.id}
          viewer={viewer}
          onPosted={() => {
            setReplying(false);
            onChanged();
          }}
        />
      )}

      {comment.replies.length > 0 && (
        <ul className="border-rule mt-5 space-y-5 border-l pl-5">
          {comment.replies.map((reply) => (
            <li key={reply.id}>
              <Comment
                comment={reply}
                articleId={articleId}
                viewer={viewer}
                locked={locked}
                now={now}
                onChanged={onChanged}
              />
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function EditForm({
  comment,
  onDone,
  onCancel,
}: {
  comment: CommentView;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [body, setBody] = useState(comment.body);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const result = await editComment(comment.id, body);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onDone();
  }

  return (
    <form onSubmit={onSubmit} className="mt-2">
      <label htmlFor={`edit-${comment.id}`} className="sr-only">
        Edit your comment
      </label>
      <textarea
        id={`edit-${comment.id}`}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        maxLength={COMMENT_MAX}
        rows={4}
        className="border-rule bg-paper text-ink focus:border-ink w-full border px-3 py-2.5 text-base outline-none"
      />
      {error && (
        <p role="alert" className="mt-2 text-base">
          {error}
        </p>
      )}
      <div className="mt-2 flex gap-3">
        <button
          type="submit"
          disabled={busy || body.trim().length === 0}
          className="label bg-ink text-paper px-4 py-2 underline-offset-4 hover:underline disabled:opacity-50"
        >
          {busy ? "Saving" : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="label text-ink-muted underline underline-offset-4"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function CommentControls({
  comment,
  viewer,
  onChanged,
}: {
  comment: CommentView;
  viewer: Viewer;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  if (!viewer) return null;

  const own = viewer.id === comment.author.id;

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    await action();
    setBusy(false);
    onChanged();
  }

  return (
    <>
      {own && (
        <button
          type="button"
          disabled={busy}
          onClick={() => run(() => deleteComment(comment.id))}
          className="underline-offset-4 hover:underline"
        >
          Delete
        </button>
      )}

      {!own && (
        <button
          type="button"
          disabled={busy || note !== null}
          onClick={async () => {
            const reason = window.prompt("What is wrong with this comment? (optional)") ?? "";
            setBusy(true);
            const result = await reportComment(comment.id, reason);
            setBusy(false);
            setNote(result.ok ? "Reported" : result.error);
          }}
          className="underline-offset-4 hover:underline"
        >
          Report
        </button>
      )}

      {!own && viewer.canModerate && (
        <button
          type="button"
          disabled={busy}
          onClick={() => run(() => moderateComment(comment.id, "hidden"))}
          className="underline-offset-4 hover:underline"
        >
          Hide
        </button>
      )}

      {note && <span>{note}</span>}
    </>
  );
}

function CommentForm({
  articleId,
  parentId,
  viewer,
  onPosted,
}: {
  articleId: string;
  parentId: string | null;
  viewer: Viewer;
  onPosted: () => void;
}) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!viewer) {
    return parentId ? null : (
      <p className="text-ink-muted border-rule mt-5 border-b pb-5 text-base">
        <Link href="/sign-in" className="underline underline-offset-2">
          Sign in
        </Link>{" "}
        to join the discussion. Reading needs no account.
      </p>
    );
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    const result = await postComment({ articleId, parentId, body });

    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setBody("");
    onPosted();
  }

  return (
    <form onSubmit={onSubmit} className={parentId ? "mt-4" : "border-rule mt-5 border-b pb-6"}>
      <label htmlFor={`comment-${parentId ?? "root"}`} className="sr-only">
        {parentId ? "Your reply" : "Your comment"}
      </label>
      <textarea
        id={`comment-${parentId ?? "root"}`}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        maxLength={COMMENT_MAX}
        rows={parentId ? 3 : 4}
        placeholder={parentId ? "Reply" : "Say something worth reading."}
        className="border-rule bg-paper text-ink focus:border-ink w-full border px-3 py-2.5 text-base outline-none"
      />

      {error && (
        <p role="alert" className="mt-2 text-base">
          {error}
        </p>
      )}

      <div className="mt-2 flex items-center justify-between gap-4">
        <span className="label text-ink-faint tabular-nums">
          {body.length} / {COMMENT_MAX}
        </span>
        <button
          type="submit"
          disabled={busy || body.trim().length === 0}
          className="label bg-ink text-paper px-4 py-2.5 underline-offset-4 hover:underline disabled:opacity-50"
        >
          {busy ? "Posting" : parentId ? "Post reply" : "Post comment"}
        </button>
      </div>
    </form>
  );
}

function Byline({
  author,
  createdAt,
  edited,
}: {
  author: CommentView["author"];
  createdAt: string;
  edited: boolean;
}) {
  return (
    <p className="label text-ink-faint flex flex-wrap items-center gap-x-2.5">
      <span className="text-ink">
        {author.slug ? (
          <Link href={`/by/${author.slug}`} className="underline-offset-4 hover:underline">
            {author.nickname}
          </Link>
        ) : (
          author.nickname
        )}
      </span>
      {author.title && <Badge title={author.title} />}
      <time dateTime={createdAt}>
        {new Date(createdAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </time>
      {edited && <span>edited</span>}
    </p>
  );
}

/** Marks a comment written by somebody on the masthead. */
function Badge({ title }: { title: EditorTitle }) {
  return (
    <span className="bg-ink text-paper px-1.5 py-0.5 text-[0.65rem]">
      {formatEditorTitle(title)}
    </span>
  );
}

function Glyph({ icon, filled = true }: { icon: { icon: readonly unknown[] }; filled?: boolean }) {
  const width = icon.icon[0] as number;
  const path = icon.icon[4] as string;
  return (
    <svg
      viewBox={`0 0 ${width} 512`}
      className="h-3.5 w-3.5"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 36}
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}
