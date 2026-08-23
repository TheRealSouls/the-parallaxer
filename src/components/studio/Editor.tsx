"use client";

import Link from "@tiptap/extension-link";
import { EditorContent, useEditor, type Content, type Editor as TiptapEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import NextLink from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { setCommentsLocked } from "@/app/actions/engagement";
import {
  archiveArticle,
  publishArticle,
  saveDraft,
  saveRevision,
  submitForReview,
  updateSlug,
} from "@/app/studio/actions";
import { LensSelector } from "@/components/studio/LensSelector";
import type { Doc } from "@/lib/content";
import type { Lens } from "@/lib/lenses";

/**
 * The writing surface.
 *
 * The feature set is deliberately narrow: two heading levels, bold, italic,
 * quote, lists, a rule, and links. Every one of those has a place in the article
 * template, and nothing else does. An editor that offers font colours and tables
 * produces articles that fight the design, and the renderer would silently drop
 * them anyway.
 *
 * The surface uses the same typography as a published article, so drafting looks
 * like reading rather than like filling in a form.
 */

const AUTOSAVE_DELAY = 1500;

type Props = {
  id: string;
  initial: {
    title: string;
    kicker: string;
    dek: string;
    lenses: Lens[];
    body: Doc;
    slug: string;
    status: string;
    publishedAt: string | null;
    commentsLocked: boolean;
    canPublishDirectly: boolean;
  };
};

export function Editor({ id, initial }: Props) {
  const [title, setTitle] = useState(initial.title === "Untitled" ? "" : initial.title);
  const [kicker, setKicker] = useState(initial.kicker);
  const [dek, setDek] = useState(initial.dek);
  const [lenses, setLenses] = useState<Lens[]>(initial.lenses);

  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [problems, setProblems] = useState<string[]>([]);
  const [published, setPublished] = useState(initial.status === "published");
  const [locked, setLocked] = useState(initial.commentsLocked);
  const [status, setStatus] = useState(initial.status);
  const [slug, setSlug] = useState(initial.slug);
  const [slugError, setSlugError] = useState<string | null>(null);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef({ title, kicker, dek, lenses, body: initial.body });

  const editor = useEditor({
    // Tiptap must not render during SSR; the DOM it needs does not exist yet.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        // Not in the article template, so not offered.
        code: false,
        codeBlock: false,
        strike: false,
      }),
      Link.configure({ openOnClick: false, autolink: false }),
    ],
    // Our Doc type is deeply readonly, which Tiptap's Content is not. The cast
    // is at the boundary and one way only; nothing mutates the original.
    content: initial.body.content.length ? (initial.body as unknown as Content) : "",
    editorProps: {
      attributes: {
        class: "prose-article min-h-[26rem] outline-none",
        "aria-label": "Article body",
      },
    },
  });

  const scheduleSave = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSaving(true);
      const result = await saveDraft({
        id,
        title: latest.current.title,
        kicker: latest.current.kicker,
        dek: latest.current.dek,
        lenses: latest.current.lenses,
        body: latest.current.body,
      });
      setSaving(false);
      if ("savedAt" in result) setSavedAt(result.savedAt);
    }, AUTOSAVE_DELAY);
  }, [id]);

  // Keep the ref in step with the fields, then debounce a save. The ref exists
  // so the timeout always sends the newest values rather than the ones that were
  // current when it was scheduled.
  useEffect(() => {
    latest.current = { ...latest.current, title, kicker, dek, lenses };
    scheduleSave();
  }, [title, kicker, dek, lenses, scheduleSave]);

  useEffect(() => {
    if (!editor) return;
    const onUpdate = ({ editor: e }: { editor: TiptapEditor }) => {
      latest.current = { ...latest.current, body: e.getJSON() as Doc };
      scheduleSave();
    };
    editor.on("update", onUpdate);
    return () => {
      editor.off("update", onUpdate);
    };
  }, [editor, scheduleSave]);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  async function onPublish() {
    if (timer.current) clearTimeout(timer.current);
    // Flush before publishing, or the checks run against a stale row.
    await saveDraft({
      id,
      title: latest.current.title,
      kicker: latest.current.kicker,
      dek: latest.current.dek,
      lenses: latest.current.lenses,
      body: latest.current.body,
    });
    await saveRevision(id);

    const result = await publishArticle(id);
    if (result.ok) {
      setProblems([]);
      setPublished(true);
    } else {
      setProblems(result.problems);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-(--page) gap-10 px-5 py-8 lg:grid-cols-[1fr_18rem]">
      <div className="min-w-0">
        <input
          value={kicker}
          onChange={(e) => setKicker(e.target.value)}
          placeholder="Kicker"
          aria-label="Kicker"
          className="label text-ink-faint placeholder:text-ink-faint/60 w-full border-none bg-transparent outline-none"
        />

        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Headline"
          aria-label="Headline"
          rows={2}
          className="font-display placeholder:text-ink-faint/50 mt-2 w-full resize-none border-none bg-transparent text-4xl leading-tight font-semibold outline-none"
        />

        <textarea
          value={dek}
          onChange={(e) => setDek(e.target.value)}
          placeholder="Standfirst: one or two sentences saying what the argument is."
          aria-label="Standfirst"
          rows={2}
          className="text-ink-muted placeholder:text-ink-faint/60 mt-3 w-full resize-none border-none bg-transparent text-xl leading-relaxed outline-none"
        />

        <div className="border-rule mt-5 border-t pt-3">
          {editor && <Toolbar editor={editor} />}
        </div>

        <div className="mt-6">
          <EditorContent editor={editor} />
        </div>
      </div>

      <aside className="lg:border-rule space-y-7 lg:border-l lg:pl-8">
        <div>
          <p className="label text-ink-muted">Status</p>
          <p className="mt-1 text-base">
            {published
              ? "Published"
              : status === "in_review"
                ? "With the editors"
                : status === "archived"
                  ? "Off the site"
                  : "Draft"}
            <span className="text-ink-faint block text-sm">
              {saving ? "Saving" : savedAt ? `Saved ${formatTime(savedAt)}` : "Not saved yet"}
            </span>
          </p>
        </div>

        <LensSelector value={lenses} onChange={setLenses} />

        {published && (
          <div>
            <p className="label text-ink-muted">Comments</p>
            <p className="mt-1 text-base">
              {locked ? "Closed" : "Open"}
              <button
                type="button"
                onClick={async () => {
                  const next = !locked;
                  setLocked(next);
                  await setCommentsLocked(id, next);
                }}
                className="label text-ink-muted ml-3 underline underline-offset-4"
              >
                {locked ? "Reopen" : "Close"}
              </button>
            </p>
            <p className="text-ink-faint mt-1 text-sm">
              Closing hides nothing already posted; it only stops new comments.
            </p>
          </div>
        )}

        <div>
          <label htmlFor="slug" className="label text-ink-muted block">
            Address
          </label>

          {initial.publishedAt ? (
            <>
              <p className="text-ink-faint mt-1 text-sm break-all">/article/{slug}</p>
              <p className="text-ink-faint mt-1 text-sm">
                Fixed once published, so links people have shared keep working.
              </p>
            </>
          ) : (
            <>
              <div className="mt-1.5 flex items-baseline gap-1">
                <span className="text-ink-faint text-sm">/article/</span>
                <input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  onBlur={async () => {
                    if (slug === initial.slug) return;
                    const result = await updateSlug(id, slug);
                    setSlugError(result.error ?? null);
                  }}
                  className="border-rule bg-paper text-ink focus:border-ink min-w-0 flex-1 border px-2 py-1 text-sm outline-none"
                />
              </div>
              {slugError && (
                <p role="alert" className="mt-1 text-sm">
                  {slugError}
                </p>
              )}
            </>
          )}
        </div>

        {problems.length > 0 && (
          <div role="alert" className="border-ink border-t-2 pt-3">
            <p className="label">Not ready yet</p>
            <ul className="marker:text-ink-faint mt-2 list-disc space-y-1 pl-5 text-sm">
              {problems.map((problem) => (
                <li key={problem}>{problem}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-3">
          {initial.canPublishDirectly ? (
            <button
              type="button"
              onClick={onPublish}
              className="label bg-ink text-paper w-full px-4 py-3 underline-offset-4 hover:underline"
            >
              {published ? "Update" : "Publish"}
            </button>
          ) : (
            <button
              type="button"
              onClick={async () => {
                const result = await submitForReview(id);
                if (result.ok) {
                  setProblems([]);
                  setStatus("in_review");
                } else {
                  setProblems(result.problems);
                }
              }}
              disabled={status === "in_review"}
              className="label bg-ink text-paper w-full px-4 py-3 underline-offset-4 hover:underline disabled:opacity-60"
            >
              {status === "in_review" ? "With the editors" : "Submit for review"}
            </button>
          )}

          <NextLink
            href={`/studio/preview/${id}`}
            className="label border-ink block w-full border px-4 py-3 text-center underline-offset-4 hover:underline"
          >
            Preview
          </NextLink>

          {published && (
            <NextLink
              href={`/article/${slug}`}
              className="label text-ink-muted block text-center underline underline-offset-4"
            >
              View on the site
            </NextLink>
          )}

          {published && (
            <button
              type="button"
              onClick={async () => {
                if (!window.confirm("Take this off the site? It keeps its square on the map.")) {
                  return;
                }
                await archiveArticle(id);
                setPublished(false);
                setStatus("archived");
              }}
              className="label text-ink-muted block w-full text-center underline underline-offset-4"
            >
              Take off the site
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function Toolbar({ editor }: { editor: TiptapEditor }) {
  const button = (label: string, active: boolean, action: () => void) => (
    <button
      key={label}
      type="button"
      onClick={action}
      aria-pressed={active}
      className={`label px-2 py-1 underline-offset-4 hover:underline ${
        active ? "bg-ink text-paper" : "text-ink-muted"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-1">
      {button("Bold", editor.isActive("bold"), () => editor.chain().focus().toggleBold().run())}
      {button("Italic", editor.isActive("italic"), () =>
        editor.chain().focus().toggleItalic().run(),
      )}
      {button("H2", editor.isActive("heading", { level: 2 }), () =>
        editor.chain().focus().toggleHeading({ level: 2 }).run(),
      )}
      {button("H3", editor.isActive("heading", { level: 3 }), () =>
        editor.chain().focus().toggleHeading({ level: 3 }).run(),
      )}
      {button("Quote", editor.isActive("blockquote"), () =>
        editor.chain().focus().toggleBlockquote().run(),
      )}
      {button("List", editor.isActive("bulletList"), () =>
        editor.chain().focus().toggleBulletList().run(),
      )}
      {button("Numbered", editor.isActive("orderedList"), () =>
        editor.chain().focus().toggleOrderedList().run(),
      )}
      {button("Rule", false, () => editor.chain().focus().setHorizontalRule().run())}
      {button("Link", editor.isActive("link"), () => {
        if (editor.isActive("link")) {
          editor.chain().focus().unsetLink().run();
          return;
        }
        const href = window.prompt("Address to link to");
        if (!href) return;
        editor.chain().focus().setLink({ href }).run();
      })}
    </div>
  );
}
