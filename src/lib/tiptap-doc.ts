import type { BlockNode, Doc, ListItemNode, TextNode } from "@/lib/content";

/**
 * Validation for article bodies.
 *
 * The editor is configured to produce only a handful of node types, but what
 * arrives at the server is whatever was posted, and the result is stored as JSON
 * and later rendered. So the document is rebuilt here from scratch rather than
 * trusted and passed through: anything unrecognised is dropped instead of being
 * carried into the database and surfacing later as a rendering bug.
 *
 * The link check is the part that matters most. `javascript:` in an href is a
 * cross-site scripting hole, and React will not save you: it renders whatever
 * string it is given into the attribute.
 */

const SAFE_HREF = /^(https?:\/\/|mailto:|\/)/i;

export function sanitiseDoc(input: unknown): Doc {
  const content = isRecord(input) && Array.isArray(input.content) ? input.content : [];
  return { type: "doc", content: content.flatMap(sanitiseBlock) };
}

function sanitiseBlock(node: unknown): BlockNode[] {
  if (!isRecord(node) || typeof node.type !== "string") return [];

  switch (node.type) {
    case "paragraph":
      return [{ type: "paragraph", content: inlineOf(node) }];

    case "heading": {
      // Only two heading levels exist in the design. Anything else becomes the
      // nearer of the two rather than being thrown away with its text.
      const attrs = isRecord(node.attrs) ? node.attrs : {};
      const level = attrs.level === 3 ? 3 : 2;
      return [{ type: "heading", attrs: { level }, content: inlineOf(node) }];
    }

    case "blockquote": {
      const paragraphs = childArray(node)
        .filter(isRecord)
        .map((child) => ({ type: "paragraph" as const, content: inlineOf(child) }))
        .filter((p) => p.content.length > 0);
      return paragraphs.length ? [{ type: "blockquote", content: paragraphs }] : [];
    }

    case "bulletList":
    case "orderedList": {
      const items = childArray(node).flatMap(sanitiseListItem);
      return items.length ? [{ type: node.type, content: items }] : [];
    }

    case "horizontalRule":
      return [{ type: "horizontalRule" }];

    default:
      return [];
  }
}

function sanitiseListItem(node: unknown): ListItemNode[] {
  if (!isRecord(node) || node.type !== "listItem") return [];
  const paragraphs = childArray(node)
    .filter(isRecord)
    .map((child) => ({ type: "paragraph" as const, content: inlineOf(child) }))
    .filter((p) => p.content.length > 0);
  return paragraphs.length ? [{ type: "listItem", content: paragraphs }] : [];
}

function inlineOf(node: Record<string, unknown>): TextNode[] {
  return childArray(node).flatMap(sanitiseText);
}

function sanitiseText(node: unknown): TextNode[] {
  if (!isRecord(node) || node.type !== "text" || typeof node.text !== "string") return [];
  if (node.text.length === 0) return [];

  const marks = (Array.isArray(node.marks) ? node.marks : []).flatMap(sanitiseMark);
  return [
    marks.length ? { type: "text", text: node.text, marks } : { type: "text", text: node.text },
  ];
}

function sanitiseMark(mark: unknown): NonNullable<TextNode["marks"]>[number][] {
  if (!isRecord(mark) || typeof mark.type !== "string") return [];

  if (mark.type === "bold" || mark.type === "italic") return [{ type: mark.type }];

  if (mark.type === "link") {
    const attrs = isRecord(mark.attrs) ? mark.attrs : {};
    const href = typeof attrs.href === "string" ? attrs.href.trim() : "";
    // Anything that is not plainly a web address, a mail link, or an internal
    // path is dropped. The text survives; only the link is removed.
    if (!SAFE_HREF.test(href)) return [];
    return [{ type: "link", attrs: { href } }];
  }

  return [];
}

function childArray(node: Record<string, unknown>): unknown[] {
  return Array.isArray(node.content) ? node.content : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Plain text of a document, used for the excerpt and the reading time. */
export function docToText(doc: Doc): string {
  const parts: string[] = [];
  const walk = (nodes: readonly unknown[]) => {
    for (const node of nodes) {
      const obj = node as { text?: string; content?: readonly unknown[] };
      if (typeof obj.text === "string") parts.push(obj.text);
      if (obj.content) walk(obj.content);
    }
  };
  walk(doc.content);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}
