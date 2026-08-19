import type { Metadata } from "next";
import Link from "next/link";
import { Editor } from "@/components/studio/Editor";
import { requireEditor } from "@/lib/auth-guards";
import type { Doc } from "@/lib/content";
import type { Lens } from "@/lib/lenses";
import { getArticleForEditing, getRevisions } from "@/lib/queries/studio";
import { RevisionList } from "@/components/studio/RevisionList";

export const metadata: Metadata = { title: "Writing", robots: { index: false } };

export default async function WritePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireEditor();
  const article = await getArticleForEditing(id, user);
  const revisions = await getRevisions(id);

  return (
    <div>
      <Editor
        id={article.id}
        initial={{
          title: article.title,
          kicker: article.kicker,
          dek: article.dek,
          lenses: article.lenses as Lens[],
          body: article.body as unknown as Doc,
          slug: article.slug,
          status: article.status,
          publishedAt: article.publishedAt?.toISOString() ?? null,
        }}
      />

      <div className="mx-auto w-full max-w-(--page) px-5 pb-16">
        <RevisionList
          revisions={revisions.map((revision) => ({
            id: revision.id,
            createdAt: revision.createdAt.toISOString(),
            editor: revision.editor.nickname ?? revision.editor.name,
          }))}
        />

        <p className="label text-ink-faint mt-10">
          <Link href="/studio" className="underline underline-offset-4">
            Back to the studio
          </Link>
        </p>
      </div>
    </div>
  );
}
