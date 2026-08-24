"use client";

import { useState } from "react";
import { updateProfile } from "@/app/account/profile/actions";
import { BIO_MAX, LINKS_MAX } from "@/lib/profile-limits";

type Link = { label: string; url: string };

/**
 * The public half of an account: the biography and the links that appear under
 * a byline.
 *
 * No nickname field, because a nickname is fixed once chosen and no portrait
 * upload, because portraits are files dropped into public/editors for now. A
 * disabled control for each would imply both are closer than they are.
 */
export function ProfileForm({
  initialBio,
  initialLinks,
  profileHref,
}: {
  initialBio: string;
  initialLinks: Link[];
  profileHref: string;
}) {
  const [bio, setBio] = useState(initialBio);
  const [links, setLinks] = useState<Link[]>(
    initialLinks.length ? initialLinks : [{ label: "", url: "" }],
  );
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  function setLink(index: number, patch: Partial<Link>) {
    setLinks((current) => current.map((link, i) => (i === index ? { ...link, ...patch } : link)));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setStatus("saving");

    const result = await updateProfile({ bio, links });

    if (!result.ok) {
      setStatus("idle");
      setError(result.error);
      return;
    }
    setStatus("saved");
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-8 max-w-(--measure)">
      <div>
        <label htmlFor="bio" className="label text-ink block">
          Biography
        </label>
        <p id="bio-hint" className="text-ink-faint mt-1 text-sm">
          A few sentences on what you write about. Shown on your profile and beside your name on the
          about page.
        </p>
        <textarea
          id="bio"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          maxLength={BIO_MAX}
          rows={5}
          aria-describedby="bio-hint"
          className="border-ink bg-paper text-ink mt-2 w-full border px-3 py-2.5 text-base outline-none focus:ring-1 focus:ring-current"
        />
        <p className="label text-ink-faint mt-1 tabular-nums">
          {bio.length} / {BIO_MAX}
        </p>
      </div>

      <fieldset className="border-rule mt-8 border-t pt-5">
        <legend className="label text-ink px-0">Links</legend>
        <p className="text-ink-faint mt-1 text-sm">
          Your own site, Substack, X, LinkedIn or an academic profile. At most {LINKS_MAX}. These
          carry a nofollow attribute, so they pass no search ranking.
        </p>

        <ul className="mt-4 space-y-3">
          {links.map((link, index) => (
            <li key={index} className="grid gap-2 sm:grid-cols-[10rem_1fr_auto]">
              <label className="sr-only" htmlFor={`link-label-${index}`}>
                Label for link {index + 1}
              </label>
              <input
                id={`link-label-${index}`}
                value={link.label}
                onChange={(event) => setLink(index, { label: event.target.value })}
                placeholder="Substack"
                className="border-rule bg-paper text-ink focus:border-ink border px-3 py-2 text-base outline-none"
              />

              <label className="sr-only" htmlFor={`link-url-${index}`}>
                Address for link {index + 1}
              </label>
              <input
                id={`link-url-${index}`}
                type="url"
                value={link.url}
                onChange={(event) => setLink(index, { url: event.target.value })}
                placeholder="https://example.com"
                className="border-rule bg-paper text-ink focus:border-ink border px-3 py-2 text-base outline-none"
              />

              <button
                type="button"
                onClick={() => setLinks((current) => current.filter((_, i) => i !== index))}
                className="label text-ink-muted px-2 underline underline-offset-4"
              >
                Remove
                <span className="sr-only"> link {index + 1}</span>
              </button>
            </li>
          ))}
        </ul>

        {links.length < LINKS_MAX && (
          <button
            type="button"
            onClick={() => setLinks((current) => [...current, { label: "", url: "" }])}
            className="label mt-3 underline underline-offset-4"
          >
            Add another link
          </button>
        )}
      </fieldset>

      {error && (
        <p role="alert" className="border-ink mt-6 border-t-2 pt-3 text-base">
          {error}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-5">
        <button
          type="submit"
          disabled={status === "saving"}
          className="label bg-ink text-paper px-5 py-3 underline-offset-4 hover:underline disabled:opacity-60"
        >
          {status === "saving" ? "Saving" : "Save profile"}
        </button>

        <a href={profileHref} className="label underline underline-offset-4">
          View your profile
        </a>

        {status === "saved" && <span className="label text-ink-faint">Saved</span>}
      </div>
    </form>
  );
}
