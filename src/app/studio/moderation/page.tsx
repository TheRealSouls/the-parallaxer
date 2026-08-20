import type { Metadata } from "next";
import Link from "next/link";
import { ModerationQueue } from "@/components/studio/ModerationQueue";
import { requireEditor } from "@/lib/auth-guards";
import { getModerationQueue } from "@/lib/queries/engagement";

export const metadata: Metadata = { title: "Moderation", robots: { index: false } };

export default async function ModerationPage() {
  await requireEditor();
  const comments = await getModerationQueue();

  return (
    <div className="mx-auto w-full max-w-(--page) px-5 py-10">
      <header className="border-ink border-b-2 pb-5">
        <h1 className="font-display text-4xl font-semibold">Moderation</h1>
        <p className="text-ink-muted mt-1 max-w-(--measure) text-base leading-relaxed">
          Every comment, newest first. Hiding one removes it from the article but keeps it here, so
          a decision can be reversed.
        </p>
      </header>

      {comments.length === 0 ? (
        <p className="text-ink-faint mt-8 text-base">No comments yet.</p>
      ) : (
        <ModerationQueue comments={comments} />
      )}

      <p className="label text-ink-faint mt-10">
        <Link href="/studio" className="underline underline-offset-4">
          Back to the studio
        </Link>
      </p>
    </div>
  );
}
