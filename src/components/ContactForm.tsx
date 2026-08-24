"use client";

import { useState } from "react";

/**
 * The contact form.
 *
 * A real HTML form with a real action underneath, so with no script at all it
 * posts to Formspree the ordinary way and the reader lands on Formspree's own
 * confirmation page. That is the fallback, and it works.
 *
 * With script, the same submission goes by fetch and the reader stays here.
 * Formspree returns JSON when asked for it, so this needs no SDK: the official
 * React package would add a dependency to save about thirty lines and would take
 * the no-script fallback away, since its form only works once hydrated.
 */
export function ContactForm({
  formId,
  enquiriesEmail,
}: {
  formId: string;
  enquiriesEmail: string;
}) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    // Only take over once we know we can. If the fetch throws, the reader is
    // shown the address instead of losing what they wrote.
    event.preventDefault();
    const form = event.currentTarget;
    setState("sending");

    try {
      const response = await fetch(`https://formspree.io/f/${formId}`, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      setState(response.ok ? "sent" : "failed");
      if (response.ok) form.reset();
    } catch {
      setState("failed");
    }
  }

  if (state === "sent") {
    return (
      <div className="border-ink border-t-2 pt-6">
        <h2 className="font-display text-2xl font-semibold">Thank you</h2>
        <p className="text-ink-muted mt-3 text-base leading-relaxed">
          That has reached us. We read everything and answer most things within a few days.
        </p>
      </div>
    );
  }

  return (
    <form
      action={`https://formspree.io/f/${formId}`}
      method="POST"
      onSubmit={onSubmit}
      className="space-y-5"
    >
      <Field label="Your name" name="name" type="text" autoComplete="name" />
      <Field
        label="Your email address"
        name="email"
        type="email"
        autoComplete="email"
        hint="So we can write back. Nothing else is done with it."
      />

      <div>
        <label htmlFor="message" className="label text-ink block">
          Your message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={8}
          maxLength={4000}
          className="border-ink bg-paper text-ink mt-1.5 w-full border px-3 py-2.5 text-base outline-none focus:ring-1 focus:ring-current"
        />
      </div>

      {/*
        Bait for the kind of bot that fills in every input it finds. Hidden from
        readers and from screen readers, so nobody legitimate can put anything in
        it, and Formspree drops any submission that has.
      */}
      <input
        type="text"
        name="_gotcha"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      {state === "failed" && (
        <p role="alert" className="border-rule border-t pt-3 text-base">
          That did not send. Write to{" "}
          <a
            href={`mailto:${enquiriesEmail}`}
            className="underline decoration-1 underline-offset-4"
          >
            {enquiriesEmail}
          </a>{" "}
          instead and we will still get it.
        </p>
      )}

      <button
        type="submit"
        disabled={state === "sending"}
        className="label bg-ink text-paper w-full px-4 py-3.5 underline-offset-4 hover:underline disabled:opacity-60"
      >
        {state === "sending" ? "Sending" : "Send"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type,
  autoComplete,
  hint,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete: string;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="label text-ink block">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required
        autoComplete={autoComplete}
        aria-describedby={hint ? `${name}-hint` : undefined}
        className="border-ink bg-paper text-ink mt-1.5 w-full border px-3 py-2.5 text-base outline-none focus:ring-1 focus:ring-current"
      />
      {hint && (
        <p id={`${name}-hint`} className="text-ink-faint mt-1.5 text-sm leading-snug">
          {hint}
        </p>
      )}
    </div>
  );
}
