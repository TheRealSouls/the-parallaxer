import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${site.name} handles your data.`,
};

/** Shown at the top of the page. Update whenever the policy changes. */
const LAST_UPDATED = "19 August 2026";

/**
 * Privacy policy written against what the site will actually do by the end of
 * Stage 4, and no more. It describes no advertising cookies and no third-party
 * tracking, because Stages 1 to 5 introduce neither. Revisit before Stage 6 adds
 * any ad network, which will also require a consent banner.
 *
 * Ireland is an EU member state, so the GDPR applies in full and the supervisory
 * authority is the Data Protection Commission. Written by a non-lawyer and not
 * legal advice; have it reviewed before the site takes its first account.
 *
 * No postal address is given. Article 13 requires the controller's identity and
 * contact details, which an email address satisfies, and publishing a home
 * address would be a real risk for a sole operator. Irish e-commerce rules do
 * require a geographic address once the site becomes commercial, so this needs
 * revisiting alongside the terms in Stage 6.
 */
export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-(--page) px-5 py-10">
      <header className="border-ink mx-auto max-w-(--measure) border-b-2 pb-6 text-center">
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">Privacy policy</h1>
        <p className="label text-ink-faint mt-3">Last updated {LAST_UPDATED}</p>
      </header>

      <div className="mx-auto mt-10 max-w-(--measure)">
        <p className="mt-6">
          This policy explains what {site.name} collects, why, and what you can do about it. It is
          written to be read rather than to be survived.
        </p>

        <h2 className="mt-12 text-2xl">Who is responsible</h2>
        <p className="mt-6">
          {site.publisher.name}, based in {site.publisher.jurisdiction}, is the controller of
          personal data collected through this site. Contact us about anything in this policy at{" "}
          <a href={`mailto:${site.contactEmail}`} className="underline underline-offset-2">
            {site.contactEmail}
          </a>
          . Because we are established in {site.publisher.jurisdiction}, an EU member state, the
          General Data Protection Regulation applies to everything described here.
        </p>

        <h2 className="mt-12 text-2xl">What we collect</h2>
        <p className="mt-6">
          <strong>If you only read:</strong> our host records standard server logs, including your
          IP address, the pages requested, and your browser type. These keep the site running and
          protect it from abuse, and are retained for a short period.
        </p>
        <p className="mt-6">
          <strong>If you create an account:</strong> your email address, your display name, and a
          hashed password. If you sign in with Google we receive your name, email address, and
          profile picture from Google. We never receive your Google password.
        </p>
        <p className="mt-6">
          <strong>If you comment or like:</strong> the content of your comment, which articles you
          liked, and the times of both.
        </p>
        <p className="mt-6">
          <strong>If you write for us:</strong> the profile information you choose to publish, such
          as your biography, portrait, and links to your work elsewhere. This is public by design.
        </p>
        <p className="mt-6">
          <strong>To stop abuse:</strong> when you sign up or post a comment we store a one-way hash
          of your network address in a counter, so that one machine cannot register dozens of
          accounts or flood a thread. The address itself is never written down, the hash cannot be
          reversed to recover it, the rows hold nothing else, and they are discarded within the
          hour. Nothing in that counter can be linked to your account.
        </p>

        <h2 className="mt-12 text-2xl">What we do not do</h2>
        <ul className="marker:text-ink-faint mt-6 list-disc space-y-2 pl-6">
          <li>We do not sell or rent your personal data.</li>
          <li>We do not run third-party advertising or tracking pixels.</li>
          <li>We do not build advertising profiles or track you across other sites.</li>
          <li>We do not use analytics that identify you individually.</li>
        </ul>

        <h2 className="mt-12 text-2xl">Our lawful basis</h2>
        <p className="mt-6">
          We process account data to perform the service you asked for when you registered, which is
          the contract basis under Article 6(1)(b). We process server logs and the abuse counters
          described above on the basis of our legitimate interest in keeping the site available and
          free of abuse, under Article 6(1)(f). Where we rely on consent, such as for a newsletter,
          you may withdraw it at any time without affecting what came before.
        </p>

        <h2 className="mt-12 text-2xl">Cookies</h2>
        <p className="mt-6">
          We set one cookie, to keep you signed in. It is strictly necessary for the account system
          to work, so it does not require consent, and it is removed when you sign out. We set no
          advertising or tracking cookies. If that ever changes, this page will change first and we
          will ask for your consent before setting them.
        </p>

        <h2 className="mt-12 text-2xl">Who else sees your data</h2>
        <p className="mt-6">
          We use a small number of providers to run the site: a hosting provider, a database
          provider, and, if you choose it, Google for sign-in. They act as processors on our
          instructions. Some may store or process data outside the European Economic Area, in which
          case the transfer relies on the European Commission&rsquo;s standard contractual clauses
          or an adequacy decision. We may also disclose data where the law requires it.
        </p>

        <h2 className="mt-12 text-2xl">How long we keep it</h2>
        <p className="mt-6">
          Account data is kept while your account exists. If you delete your account we remove your
          personal data within 30 days, except where we must keep something to meet a legal
          obligation. Server logs are kept for a short period and then discarded.
        </p>
        <p className="mt-6">
          Published articles remain on the site, since removing them would misrepresent the archive,
          but we will remove your byline on request and replace it with an anonymous credit.
        </p>

        <h2 className="mt-12 text-2xl">Your rights</h2>
        <p className="mt-6">
          Under the GDPR you have the right to see the data we hold about you, to correct it, to
          have it erased, to restrict or object to how we use it, and to receive a copy in a
          portable form. Write to {site.contactEmail} and we will respond within one month.
        </p>
        <p className="mt-6">
          If you are unhappy with our response you may complain to the Data Protection Commission,
          the supervisory authority in {site.publisher.jurisdiction}, or to the authority in your
          own EU country.
        </p>

        <h2 className="mt-12 text-2xl">Children</h2>
        <p className="mt-6">
          The site is not intended for children, and you must be at least 16 to create an account.
          We do not knowingly collect data from anyone younger. If you believe a child has given us
          personal data, contact {site.contactEmail} and we will delete it.
        </p>

        <h2 className="mt-12 text-2xl">Changes</h2>
        <p className="mt-6">
          If this policy changes we will update the date at the top and, for anything significant,
          say so on the site.
        </p>

        <p className="border-rule mt-12 border-t pt-6">
          See also our{" "}
          <Link href="/terms" className="underline underline-offset-2">
            terms of service
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
