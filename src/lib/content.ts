/**
 * Content types for The Parallaxer.
 *
 * These mirror the Prisma models planned for Stage 2 exactly, and the article
 * body is stored as Tiptap document JSON rather than a bespoke block format.
 * That means the renderer written here keeps working unchanged once the Stage 3
 * editor starts producing real documents, and swapping the sample array for
 * database queries touches no component.
 */

import type { EditorTitle } from "@/lib/editorial";
import type { Lens } from "@/lib/lenses";

export type ArticleStatus = "draft" | "in_review" | "published" | "archived";

export type UserRole = "reader" | "editor" | "admin";

export type ProfileLink = {
  label: string;
  url: string;
};

export type Author = {
  id: string;
  slug: string;
  name: string;
  /** What the account may do. Distinct from the masthead title below. */
  role: UserRole;
  /** Editorial position, printed under the byline. See lib/editorial.ts. */
  title: EditorTitle;
  bio: string;
  image: string | null;
  links: readonly ProfileLink[];
};

/* Tiptap document JSON. Only the node types the editor will be allowed to
   produce are modelled, which keeps the renderer exhaustive and type safe. */

export type TextNode = {
  type: "text";
  text: string;
  marks?: readonly { type: "bold" | "italic" | "link"; attrs?: { href: string } }[];
};

export type BlockNode =
  | { type: "paragraph"; content?: readonly TextNode[] }
  | { type: "heading"; attrs: { level: 2 | 3 }; content: readonly TextNode[] }
  | { type: "blockquote"; content: readonly { type: "paragraph"; content: readonly TextNode[] }[] }
  | { type: "bulletList"; content: readonly ListItemNode[] }
  | { type: "orderedList"; content: readonly ListItemNode[] }
  | { type: "horizontalRule" };

export type ListItemNode = {
  type: "listItem";
  content: readonly { type: "paragraph"; content: readonly TextNode[] }[];
};

export type Doc = {
  type: "doc";
  content: readonly BlockNode[];
};

export type Article = {
  id: string;
  slug: string;
  /** Short standing label above the headline, e.g. "The Long View". */
  kicker: string;
  title: string;
  /** Deck: the standfirst under the headline. */
  dek: string;
  lenses: readonly Lens[];
  excerpt: string;
  body: Doc;
  status: ArticleStatus;
  /** ISO 8601. */
  publishedAt: string;
  author: Author;
  readingMinutes: number;
  /** An uploaded cover. Null means the generated cover art is used instead. */
  coverImage: string | null;
  /** Required whenever coverImage is set. Stage 3 enforces this in the editor. */
  coverAlt: string | null;
  coverCredit: string | null;
};

/* Authoring helpers. They exist so the sample content stays readable, and they
   emit exactly the shape Tiptap produces. */

export const t = (text: string): TextNode => ({ type: "text", text });

export const em = (text: string): TextNode => ({
  type: "text",
  text,
  marks: [{ type: "italic" }],
});

export const p = (...content: TextNode[]): BlockNode => ({ type: "paragraph", content });

export const h2 = (text: string): BlockNode => ({
  type: "heading",
  attrs: { level: 2 },
  content: [t(text)],
});

export const quote = (text: string): BlockNode => ({
  type: "blockquote",
  content: [{ type: "paragraph", content: [t(text)] }],
});

export const doc = (...content: BlockNode[]): Doc => ({ type: "doc", content });

/** Roughly 240 words per minute, floored at one. */
export function readingMinutes(body: Doc): number {
  const words = countWords(body);
  return Math.max(1, Math.round(words / 240));
}

function countWords(body: Doc): number {
  let n = 0;
  const walk = (nodes: readonly unknown[]) => {
    for (const node of nodes) {
      const obj = node as { text?: string; content?: readonly unknown[] };
      if (typeof obj.text === "string") n += obj.text.trim().split(/\s+/).length;
      if (obj.content) walk(obj.content);
    }
  };
  walk(body.content);
  return n;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
