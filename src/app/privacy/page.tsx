import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${site.name} handles your data.`,
};

/**
 * Baseline privacy policy written against what the site will actually do by the
 * end of Stage 4, and no more. It deliberately describes no advertising cookies
 * and no third-party tracking, because Stage 1 through 5 introduce neither.
 * Revisit this page in Stage 6 before any ad network is added.
 *
 * The bracketed placeholders must be filled in, and the document reviewed by
 * someone qualified, before launch. Google requires a working link to this page
 * on the OAuth consent screen in Stage 2.
 */
export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-(--page) px-5 py-10">
      <header className="border-ink mx-auto max-w-(--measure) border-b-2 pb-6 text-center">
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">Privacy policy</h1>
        <p className="label text-ink-faint mt-3">Last updated [DATE]</p>
      </header>

      <div className="mx-auto mt-10 max-w-(--measure)">
        <p className="mt-6">
          This policy explains what {site.name} collects, why, and what you can do about it. It is
          written to be read rather than to be survived.
        </p>

        <h2 className="mt-12 text-2xl">Who is responsible</h2>
        <p className="mt-6">
          [LEGAL ENTITY OR INDIVIDUAL NAME] of [ADDRESS], [JURISDICTION], is the controller of
          personal data collected through this site. Contact us at [CONTACT EMAIL] about anything in
          this policy.
        </p>

        <h2 className="mt-12 text-2xl">What we collect</h2>
        <p className="mt-6">
          <strong>If you only read:</strong> our host records standard server logs, including your
          IP address, the pages requested, and your browser type. These are used to keep the site
          running and secure, and are retained for a short period.
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
          <strong>If you are an editor:</strong> the profile information you choose to publish, such
          as your biography, portrait, and links to your work elsewhere.
        </p>

        <h2 className="mt-12 text-2xl">What we do not do</h2>
        <ul className="marker:text-ink-faint mt-6 list-disc space-y-2 pl-6">
          <li>We do not sell or rent your personal data.</li>
          <li>We do not run third-party advertising or tracking pixels.</li>
          <li>We do not build advertising profiles or track you across other sites.</li>
          <li>We do not use analytics that identify you individually.</li>
        </ul>

        <h2 className="mt-12 text-2xl">Why we are allowed to hold it</h2>
        <p className="mt-6">
          We process account data to perform the service you asked for when you registered. We
          process logs and security data on the basis of our legitimate interest in keeping the site
          available and free of abuse. Where we rely on consent, such as for a newsletter, you can
          withdraw it at any time.
        </p>

        <h2 className="mt-12 text-2xl">Cookies</h2>
        <p className="mt-6">
          We set a cookie to keep you signed in. It is necessary for the account system to work and
          is removed when you sign out. We do not set advertising or tracking cookies. If that
          changes, this page will change first, and we will ask for your consent where required.
        </p>

        <h2 className="mt-12 text-2xl">Who else sees your data</h2>
        <p className="mt-6">
          We use a small number of providers to run the site: a hosting provider, a database
          provider, and, if you choose it, Google for sign-in. They process data on our instructions
          only. We may also disclose data where the law requires it.
        </p>

        <h2 className="mt-12 text-2xl">How long we keep it</h2>
        <p className="mt-6">
          Account data is kept while your account exists. If you delete your account we remove your
          personal data within 30 days, except where we must keep something to meet a legal
          obligation. Published articles remain on the site, since removing them would misrepresent
          the archive, though we will remove your byline on request.
        </p>

        <h2 className="mt-12 text-2xl">Your rights</h2>
        <p className="mt-6">
          Depending on where you live, you may have the right to see the data we hold about you, to
          correct it, to delete it, to receive a copy in a portable form, or to object to how we use
          it. Write to [CONTACT EMAIL] and we will respond within one month. If you are in the UK or
          EU and are unhappy with our response, you may complain to your data protection authority.
        </p>

        <h2 className="mt-12 text-2xl">Children</h2>
        <p className="mt-6">
          The site is not intended for children under 13, and we do not knowingly collect their
          data. If you believe a child has given us personal data, contact [CONTACT EMAIL] and we
          will delete it.
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
