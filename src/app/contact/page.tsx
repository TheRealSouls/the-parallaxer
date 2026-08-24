import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Ask ${site.name} a question, correct something we published or say what you think.`,
  alternates: { canonical: "/contact" },
};

/**
 * A question, a correction or a complaint.
 *
 * Posts straight to Formspree, which forwards to the enquiries address and
 * needs no server of ours. A plain HTML form with a real action, so it works
 * with no script at all and nothing about it can break in a browser we have not
 * tested.
 *
 * Without FORMSPREE_FORM_ID the form is not rendered at all and the address is
 * shown instead. A form that silently posts nowhere is worse than no form:
 * somebody writes out a real question and it goes in the bin.
 */

const formId = process.env.FORMSPREE_FORM_ID;

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-(--page) px-5 py-10">
      <header className="border-ink border-b-2 pb-6">
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">Contact</h1>
        <p className="text-ink-muted mt-3 max-w-(--measure) text-lg leading-relaxed">
          Questions, corrections, complaints. All of it reaches the same inbox and one of us reads
          everything that arrives.
        </p>
      </header>

      <div className="mx-auto mt-10 max-w-(--measure)">
        {formId ? (
          <form action={`https://formspree.io/f/${formId}`} method="POST" className="space-y-5">
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
              Bait for the kind of bot that fills in every input it finds. Hidden
              from readers and from screen readers, so nobody legitimate can put
              anything in it, and Formspree drops any submission that has.
            */}
            <input
              type="text"
              name="_gotcha"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
            />

            <button
              type="submit"
              className="label bg-ink text-paper w-full px-4 py-3.5 underline-offset-4 hover:underline"
            >
              Send
            </button>
          </form>
        ) : (
          <p className="text-lg leading-relaxed">
            Write to{" "}
            <a
              href={`mailto:${site.enquiriesEmail}`}
              className="underline decoration-1 underline-offset-4"
            >
              {site.enquiriesEmail}
            </a>{" "}
            and we will get back to you.
          </p>
        )}

        <div className="border-rule mt-10 border-t pt-6">
          <h2 className="label text-ink-muted">Other ways</h2>
          {/* Only worth saying when the form is the main route. Without it the
              address is already the whole page. */}
          {formId && (
            <p className="mt-3 text-base leading-relaxed">
              Prefer your own mail client? Write to{" "}
              <a
                href={`mailto:${site.enquiriesEmail}`}
                className="underline decoration-1 underline-offset-4"
              >
                {site.enquiriesEmail}
              </a>
              .
            </p>
          )}
          <p className="mt-3 text-base leading-relaxed">
            Pitching an article instead? The{" "}
            <a href="/submit" className="underline decoration-1 underline-offset-4">
              submissions page
            </a>{" "}
            explains what we look for and how long we take.
          </p>
        </div>
      </div>
    </div>
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
