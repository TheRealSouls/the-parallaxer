import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Ask ${site.name} a question, correct something we published or say what you think.`,
  alternates: { canonical: "/contact" },
};

/**
 * A question, a correction or a complaint.
 *
 * The form posts to Formspree, which forwards to the enquiries address and
 * needs no mail-receiving code of ours.
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
          <ContactForm formId={formId} enquiriesEmail={site.enquiriesEmail} />
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
            <Link href="/submit" className="underline decoration-1 underline-offset-4">
              submissions page
            </Link>{" "}
            explains what we look for and how long we take.
          </p>
        </div>
      </div>
    </div>
  );
}
