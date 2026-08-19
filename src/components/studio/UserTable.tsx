"use client";

import { useState, useTransition } from "react";
import { setEditorTitle, setUserRole } from "@/app/admin/actions";
import { BEAT_NAME } from "@/lib/editorial";
import { DISPLAY_REGIONS } from "@/lib/lenses";

type Row = {
  id: string;
  name: string;
  email: string;
  role: string;
  rank: string | null;
  beat: number | null;
  articles: number;
  comments: number;
};

/**
 * The account table.
 *
 * Both controls save on change rather than behind a submit button, because
 * nothing here is a multi-field edit that needs to be applied at once, and a
 * form that silently forgets an unsaved dropdown is worse than one that saves
 * immediately. Errors from the server are reported inline against the row.
 */
export function UserTable({ users }: { users: Row[] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<{ id: string; message: string } | null>(null);

  return (
    <div className="mt-8 overflow-x-auto">
      <table className="w-full min-w-3xl border-collapse text-base">
        <thead>
          <tr className="border-ink label text-ink-muted border-b text-left">
            <th className="py-2 pr-4 font-semibold">Account</th>
            <th className="py-2 pr-4 font-semibold">Role</th>
            <th className="py-2 pr-4 font-semibold">Masthead title</th>
            <th className="py-2 pr-4 text-right font-semibold">Articles</th>
            <th className="py-2 text-right font-semibold">Comments</th>
          </tr>
        </thead>
        <tbody className="divide-rule divide-y">
          {users.map((user) => (
            <tr key={user.id} className="align-top">
              <td className="py-3 pr-4">
                <span className="block">{user.name}</span>
                <span className="text-ink-faint block text-sm">{user.email}</span>
                {error?.id === user.id && (
                  <span role="alert" className="mt-1 block text-sm">
                    {error.message}
                  </span>
                )}
              </td>

              <td className="py-3 pr-4">
                <select
                  aria-label={`Role for ${user.name}`}
                  defaultValue={user.role}
                  disabled={pending}
                  onChange={(event) => {
                    const role = event.target.value;
                    startTransition(async () => {
                      const result = await setUserRole(user.id, role);
                      setError(result.error ? { id: user.id, message: result.error } : null);
                    });
                  }}
                  className="border-rule bg-paper border px-2 py-1.5"
                >
                  <option value="reader">reader</option>
                  <option value="editor">editor</option>
                  <option value="admin">admin</option>
                </select>
              </td>

              <td className="py-3 pr-4">
                <TitleControl user={user} pending={pending} onError={setError} />
              </td>

              <td className="py-3 pr-4 text-right tabular-nums">{user.articles}</td>
              <td className="py-3 text-right tabular-nums">{user.comments}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TitleControl({
  user,
  pending,
  onError,
}: {
  user: Row;
  pending: boolean;
  onError: (error: { id: string; message: string } | null) => void;
}) {
  const [rank, setRank] = useState(user.rank ?? "");
  const [beat, setBeat] = useState(user.beat ?? "");
  const [, startTransition] = useTransition();

  const needsBeat = rank === "senior" || rank === "junior";

  function save(nextRank: string, nextBeat: number | string) {
    if (!nextRank) return;
    startTransition(async () => {
      const result = await setEditorTitle(
        user.id,
        nextRank,
        nextBeat === "" ? null : Number(nextBeat),
      );
      onError(result.error ? { id: user.id, message: result.error } : null);
    });
  }

  return (
    <span className="flex flex-wrap gap-2">
      <select
        aria-label={`Masthead rank for ${user.name}`}
        value={rank}
        disabled={pending}
        onChange={(event) => {
          setRank(event.target.value);
          if (event.target.value !== "senior" && event.target.value !== "junior") {
            save(event.target.value, "");
          } else if (beat !== "") {
            save(event.target.value, beat);
          }
        }}
        className="border-rule bg-paper border px-2 py-1.5"
      >
        <option value="">none</option>
        <option value="founding">Founding Editor</option>
        <option value="senior">Senior</option>
        <option value="junior">Junior</option>
        <option value="guest">Guest Article</option>
      </select>

      {needsBeat && (
        <select
          aria-label={`Beat for ${user.name}`}
          value={beat}
          disabled={pending}
          onChange={(event) => {
            setBeat(event.target.value);
            save(rank, event.target.value);
          }}
          className="border-rule bg-paper border px-2 py-1.5"
        >
          <option value="">choose a beat</option>
          {DISPLAY_REGIONS.map((region) => (
            <option key={region.code} value={region.code}>
              {BEAT_NAME[region.code]}
            </option>
          ))}
        </select>
      )}
    </span>
  );
}
