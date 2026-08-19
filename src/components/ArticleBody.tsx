import type { BlockNode, Doc, ListItemNode, TextNode } from "@/lib/content";

/**
 * Bodies are sanitised before they are stored, but this is the last point before
 * a string becomes an href attribute, and a `javascript:` URL here would be a
 * cross-site scripting hole. Checking in both places costs nothing and means
 * neither one is the single thing standing between a draft and an exploit.
 */
const SAFE_HREF = /^(https?:\/\/|mailto:|\/)/i;

/**
 * Renders Tiptap document JSON.
 *
 * The sample content in Stage 1 and the output of the Stage 3 editor are the
 * same shape, so this renderer is written once and never revisited. Any node
 * type the editor is not permitted to produce is simply not handled here.
 */
export function ArticleBody({ body }: { body: Doc }) {
  // The drop cap belongs to the first paragraph in the document, which is not
  // necessarily the first node. Resolved once, up front, rather than by tracking
  // a flag across the map callback.
  const openerIndex = body.content.findIndex((node) => node.type === "paragraph");

  return (
    <div className="mx-auto w-full max-w-(--measure)">
      {body.content.map((node, i) => (
        <Block key={i} node={node} opener={i === openerIndex} />
      ))}
    </div>
  );
}

function Block({ node, opener }: { node: BlockNode; opener: boolean }) {
  switch (node.type) {
    case "paragraph":
      return (
        <p
          className={
            opener
              ? // The drop cap marks the start of the piece, the way a printed
                // feature does. Only ever on the first paragraph.
                "[&::first-letter]:font-display mt-6 first:mt-0 [&::first-letter]:float-left [&::first-letter]:mr-2 [&::first-letter]:text-[3.6rem] [&::first-letter]:leading-[0.82] [&::first-letter]:font-semibold"
              : "mt-6"
          }
        >
          <Inline content={node.content ?? []} />
        </p>
      );

    case "heading":
      return node.attrs.level === 2 ? (
        <h2 className="mt-11 text-2xl">
          <Inline content={node.content} />
        </h2>
      ) : (
        <h3 className="mt-9 text-xl">
          <Inline content={node.content} />
        </h3>
      );

    case "blockquote":
      return (
        <blockquote className="border-rule my-9 border-t border-b py-5">
          {node.content.map((para, i) => (
            <p key={i} className="font-display text-2xl leading-snug font-medium text-balance">
              <Inline content={para.content} />
            </p>
          ))}
        </blockquote>
      );

    case "bulletList":
      return (
        <ul className="marker:text-ink-faint mt-6 list-disc space-y-2 pl-6">
          <Items items={node.content} />
        </ul>
      );

    case "orderedList":
      return (
        <ol className="marker:text-ink-faint mt-6 list-decimal space-y-2 pl-6">
          <Items items={node.content} />
        </ol>
      );

    case "horizontalRule":
      return <hr className="border-rule my-10 border-0 border-t" />;
  }
}

function Items({ items }: { items: readonly ListItemNode[] }) {
  return (
    <>
      {items.map((item, i) => (
        <li key={i}>
          {item.content.map((para, j) => (
            <Inline key={j} content={para.content} />
          ))}
        </li>
      ))}
    </>
  );
}

function Inline({ content }: { content: readonly TextNode[] }) {
  return (
    <>
      {content.map((node, i) => {
        let element: React.ReactNode = node.text;
        for (const mark of node.marks ?? []) {
          if (mark.type === "bold") element = <strong>{element}</strong>;
          if (mark.type === "italic") element = <em>{element}</em>;
          if (mark.type === "link" && mark.attrs && SAFE_HREF.test(mark.attrs.href)) {
            element = (
              <a
                href={mark.attrs.href}
                className="underline underline-offset-2"
                rel="nofollow noopener"
              >
                {element}
              </a>
            );
          }
        }
        return <span key={i}>{element}</span>;
      })}
    </>
  );
}
