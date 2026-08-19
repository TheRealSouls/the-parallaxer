"use client";

import { useState, useTransition } from "react";
import { restoreRevision } from "@/app/studio/actions";

/**
 * Revision history.
 *
 * Restoring snapshots the current body first, so an accidental restore is itself
 * undoable. Without that, one click could lose an afternoon's work with no way
 * back, which is the sort of thing that stops an editor trusting the tool.
 */
export function RevisionList({
  revisions,
}: {
  revisions: { id: string; createdAt: string; editor: string }[];
}) {
  const [pending, startTransition] = useTransition();
  const [restored, setRestored] = useState<string | null>(null);

  if (revisions.length === 0) {
    return (
      <section className="mt-10">
        <h2 className="label border-ink border-t-2 pt-2">History</h2>
        <p className="text-ink-faint mt-3 text-base">
          A snapshot is kept each time the article is published.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-10">
      <h2 className="label border-ink border-t-2 pt-2">History</h2>
      <ul className="divide-rule border-rule mt-2 divide-y border-b">
        {revisions.map((revision) => (
          <li key={revision.id} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3">
            <span className="text-base">
              {new Date(revision.createdAt).toLocaleString("en-GB", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
            <span className="label text-ink-faint flex-1">{revision.editor}</span>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await restoreRevision(revision.id);
                  setRestored(revision.id);
                })
              }
              className="label text-ink underline underline-offset-4 disabled:opacity-60"
            >
              {restored === revision.id ? "Restored" : "Restore"}
            </button>
          </li>
        ))}
      </ul>
      {restored && (
        <p className="text-ink-muted mt-3 text-sm">
          Reload the page to see the restored text in the editor.
        </p>
      )}
    </section>
  );
}
