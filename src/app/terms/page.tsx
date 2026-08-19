import type { Metadata } from "next";
import Link from "next/link";
import { MIN_ARTICLES_FOR_JUNIOR } from "@/lib/editorial";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of service",
  description: `The terms governing use of ${site.name}.`,
};

/** Shown at the top of the page. Update whenever the terms change. */
const LAST_UPDATED = "19 August 2026";

/**
 * Baseline terms covering what the site will do by the end of Stage 4: accounts,
 * comments, likes, and guest submissions.
 *
 * Written by a non-lawyer and not legal advice. Have it reviewed before the site
 * takes its first account. Two clauses in particular deserve a professional eye:
 * the liability wording in section 8, and the model-training restriction in
 * section 6, which is easy to state and harder to enforce.
 *
 * No postal address appears here. Irish e-commerce rules require a geographic
 * address once a site is a commercial service, so this page needs revisiting in
 * Stage 6 before any advertising goes live.
 */
export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-(--page) px-5 py-10">
      <header className="border-ink mx-auto max-w-(--measure) border-b-2 pb-6 text-center">
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">Terms of service</h1>
        <p className="label text-ink-faint mt-3">Last updated {LAST_UPDATED}</p>
      </header>

      <div className="mx-auto mt-10 max-w-(--measure)">
        <p className="mt-6">
          These terms govern your use of {site.name} at {site.domain}. By using the site or creating
          an account you agree to them. If you do not agree, please do not use the site.
        </p>

        <h2 className="mt-12 text-2xl">1. Who we are</h2>
        <p className="mt-6">
          {site.name} is a publication operated by {site.publisher.name} in{" "}
          {site.publisher.jurisdiction}. You can reach us at{" "}
          <a href={`mailto:${site.contactEmail}`} className="underline underline-offset-2">
            {site.contactEmail}
          </a>
          .
        </p>

        <h2 className="mt-12 text-2xl">2. Accounts</h2>
        <p className="mt-6">
          You may read {site.name} without an account. To comment or to like an article you need
          one, which you can create with an email address and password or by signing in with Google.
        </p>
        <p className="mt-6">
          You are responsible for keeping your credentials secure and for activity that happens
          under your account. You must be at least 16 years old to create an account. Tell us at{" "}
          {site.contactEmail} if you believe your account has been used without your permission.
        </p>
        <p className="mt-6">
          Accounts carry a role. Readers may comment and like. Editors may additionally write and
          publish articles. Roles are assigned by us and may be changed or removed at any time.
        </p>

        <h2 className="mt-12 text-2xl">3. Contributors and the masthead</h2>
        <p className="mt-6">
          Anyone may submit an article. Your first and second accepted pieces run as guest articles.
          Once {MIN_ARTICLES_FOR_JUNIOR} of your pieces have been published you may apply for a
          junior editorship, which we may grant or refuse at our discretion. Senior editorships are
          appointed by us and cannot be applied for.
        </p>
        <p className="mt-6">
          A title describes your position here. It is not a contract of employment and carries no
          salary, fee, or guarantee of continued publication. We may withdraw a title at any time,
          in which case your published articles remain on the site unless you ask otherwise.
        </p>

        <h2 className="mt-12 text-2xl">4. Comments and conduct</h2>
        <p className="mt-6">You agree not to post content that:</p>
        <ul className="marker:text-ink-faint mt-6 list-disc space-y-2 pl-6">
          <li>is unlawful, defamatory, or harassing;</li>
          <li>attacks a person or group on the basis of who they are;</li>
          <li>infringes anyone else&rsquo;s copyright or other rights;</li>
          <li>is advertising, spam, or automated in origin;</li>
          <li>discloses private information about another person.</li>
        </ul>
        <p className="mt-6">
          We may hide, edit, or delete any comment, and suspend or close any account, at our
          discretion. We are under no obligation to monitor comments, and a comment appearing on the
          site is not an endorsement of it.
        </p>

        <h2 className="mt-12 text-2xl">5. Your content</h2>
        <p className="mt-6">
          You keep ownership of everything you post. By posting a comment you grant us a
          non-exclusive, worldwide, royalty-free licence to host, store, and display it as part of
          the site. You can withdraw this by deleting your comment, though copies may persist in
          backups for a period.
        </p>
        <p className="mt-6">
          Articles are covered separately. You keep copyright in your article, you grant us the
          right to publish and keep publishing it here, and you may republish it elsewhere two weeks
          after we run it, with an acknowledgement of first publication. See the{" "}
          <Link href="/submit" className="underline underline-offset-2">
            submission page
          </Link>
          .
        </p>
        <p className="mt-6">
          You confirm that anything you send us is your own work, that it has not been published
          elsewhere, and that it does not infringe anyone else&rsquo;s rights.
        </p>

        <h2 className="mt-12 text-2xl">6. Our content</h2>
        <p className="mt-6">
          Articles, the name {site.name}, and the design of the site belong to us or to our
          contributors. You may quote briefly with attribution and a link. You may not republish
          whole articles, or use the material to train a machine learning model, without written
          permission.
        </p>

        <h2 className="mt-12 text-2xl">7. Nothing here is advice</h2>
        <p className="mt-6">
          {site.name} publishes analysis and opinion. Nothing on this site is financial, investment,
          legal, or professional advice, and you should not treat it as a basis for a decision
          without taking advice of your own.
        </p>

        <h2 className="mt-12 text-2xl">8. Availability and liability</h2>
        <p className="mt-6">
          The site is provided as it is. We do not promise it will be available without interruption
          or free of error. To the fullest extent the law allows, we are not liable for indirect or
          consequential loss arising from your use of the site. Nothing here limits liability that
          cannot lawfully be limited, including liability for death or personal injury caused by
          negligence, or for fraud.
        </p>
        <p className="mt-6">
          If you are a consumer, these terms do not affect your statutory rights under Irish or EU
          consumer law.
        </p>

        <h2 className="mt-12 text-2xl">9. Changes</h2>
        <p className="mt-6">
          We may update these terms. If a change is significant we will say so on the site. The date
          at the top of this page shows when it was last revised, and continuing to use the site
          after a change means you accept it.
        </p>

        <h2 className="mt-12 text-2xl">10. Governing law</h2>
        <p className="mt-6">
          These terms are governed by the law of {site.publisher.jurisdiction}, and the courts of{" "}
          {site.publisher.jurisdiction} have jurisdiction over any dispute. If you are a consumer
          resident elsewhere in the EU, you keep the right to bring proceedings in your own country.
        </p>

        <p className="border-rule mt-12 border-t pt-6">
          See also our{" "}
          <Link href="/privacy" className="underline underline-offset-2">
            privacy policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
