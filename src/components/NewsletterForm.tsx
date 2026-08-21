"use client";

import { useId, useState } from "react";
import { subscribe } from "@/app/newsletter/actions";

/**
 * The newsletter sign-up.
 *
 * Appears twice: quietly in the footer, and with more weight under an article,
 * where somebody has just finished reading and is most likely to want the next
 * one. The `tone` prop is which of those two it is.
 */
export function NewsletterForm({ tone = "footer" }: { tone?: "footer" | "article" }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setState("sending");

    const result = await subscribe(email);

    if (!result.ok) {
      setState("idle");
      setError(result.error);
      return;
    }
    setState("sent");
  }

  if (state === "sent") {
    return (
      <p className={tone === "article" ? "text-base leading-relaxed" : "text-sm"}>
        Check your inbox for a confirmation link. Nothing is sent until you open it.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className={tone === "article" ? "" : "mt-3"}>
      <label htmlFor={id} className="label text-ink-muted block">
        {tone === "article" ? "Get the next one" : "Newsletter"}
      </label>

      {tone === "article" && (
        <p className="text-ink-muted mt-2 text-base leading-relaxed">
          One email a week, grouped by lens. No tracking pixels, and one click to leave.
        </p>
      )}

      <div className="mt-2 flex flex-wrap gap-2">
        <input
          id={id}
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          className="border-ink bg-paper text-ink min-w-0 flex-1 border px-3 py-2 text-base outline-none focus:ring-1 focus:ring-current"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="label bg-ink text-paper px-4 py-2.5 underline-offset-4 hover:underline disabled:opacity-60"
        >
          {state === "sending" ? "Sending" : "Subscribe"}
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-sm">
          {error}
        </p>
      )}
    </form>
  );
}
