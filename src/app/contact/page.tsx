import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { SocialLinks } from "@/components/SocialLinks";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Ask ${site.name} a question, correct something we published or say what you think.`,
  alternates: { canonical: "/contact" },
};

/**
 * A question, a correction or a complaint.
 *
 * Two columns: the form, and every other way of reaching us beside it. Somebody
 * who would rather use their own mail client should not have to submit a form
 * to find out an address exists, so the address is in the open from the start.
 *
 * The form posts to Formspree, which forwards to the enquiries address and
 * needs no mail-receiving code of ours. Without FORMSPREE_FORM_ID it is not
 * rendered at all and the column widens to the address instead. A form that
 * silently posts nowhere is worse than no form: somebody writes out a real
 * question and it goes in the bin.
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

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-14">
        <div className="max-w-(--measure) min-w-0">
          {formId ? (
            <ContactForm formId={formId} enquiriesEmail={site.enquiriesEmail} />
          ) : (
            <>
              <h2 className="font-display text-2xl font-semibold">Write to us</h2>
              <p className="mt-3 text-lg leading-relaxed">
                The form here is not connected yet. In the meantime{" "}
                <MailLink className="font-medium" /> reaches the same place.
              </p>
            </>
          )}
        </div>

        {/*
          A rule rather than a box. The design uses hairlines to divide, and a
          bordered panel floating beside the form would be the one card on the
          site.
        */}
        <aside className="border-rule lg:border-ink border-t pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
          <section>
            <h2 className="label text-ink-muted">By email</h2>
            <p className="mt-3">
              <MailLink className="font-display text-xl" />
            </p>
            <p className="text-ink-faint mt-2 text-sm leading-snug">
              Straight to the editors. We answer most things within a few days.
            </p>
          </section>

          <section className="border-rule mt-8 border-t pt-6">
            <h2 className="label text-ink-muted">Elsewhere</h2>
            <SocialLinks variant="list" className="mt-3" />
          </section>

          <section className="border-rule mt-8 border-t pt-6">
            <h2 className="label text-ink-muted">Writing for us</h2>
            <p className="mt-3 text-base leading-relaxed">
              Pitching an article rather than asking a question? The{" "}
              <Link href="/submit" className="underline decoration-1 underline-offset-4">
                submissions page
              </Link>{" "}
              explains what we look for and how long we take to answer.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function MailLink({ className = "" }: { className?: string }) {
  return (
    <a
      href={`mailto:${site.enquiriesEmail}`}
      className={`underline decoration-1 underline-offset-4 ${className}`}
    >
      {site.enquiriesEmail}
    </a>
  );
}
