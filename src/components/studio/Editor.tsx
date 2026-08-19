"use client";

import Link from "@tiptap/extension-link";
import { EditorContent, useEditor, type Content, type Editor as TiptapEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import NextLink from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { publishArticle, saveDraft, saveRevision } from "@/app/studio/actions";
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
            {published ? "Published" : "Draft"}
            <span className="text-ink-faint block text-sm">
              {saving ? "Saving" : savedAt ? `Saved ${formatTime(savedAt)}` : "Not saved yet"}
            </span>
          </p>
        </div>

        <LensSelector value={lenses} onChange={setLenses} />

        <div>
          <p className="label text-ink-muted">Address</p>
          <p className="text-ink-faint mt-1 text-sm break-all">/article/{initial.slug}</p>
          {initial.publishedAt && (
            <p className="text-ink-faint mt-1 text-sm">Fixed, because it has been published.</p>
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
          <button
            type="button"
            onClick={onPublish}
            className="label bg-ink text-paper w-full px-4 py-3 underline-offset-4 hover:underline"
          >
            {published ? "Update" : "Publish"}
          </button>

          <NextLink
            href={`/studio/preview/${id}`}
            className="label border-ink block w-full border px-4 py-3 text-center underline-offset-4 hover:underline"
          >
            Preview
          </NextLink>

          {published && (
            <NextLink
              href={`/article/${initial.slug}`}
              className="label text-ink-muted block text-center underline underline-offset-4"
            >
              View on the site
            </NextLink>
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
