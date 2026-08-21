import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth-guards";
import { formatEditorTitle, toEditorTitle } from "@/lib/editorial";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false },
};

/**
 * The reader's own account.
 *
 * Deliberately thin. There is no nickname field to edit because a nickname is
 * fixed once chosen, and no avatar upload because profile pictures do not exist
 * yet. Showing an empty settings page with disabled controls would suggest both
 * are coming sooner than they are.
 */
export default async function AccountPage() {
  const user = await requireUser();
  const title = toEditorTitle(user.rank, user.beat);

  return (
    <div className="mx-auto w-full max-w-(--page) px-5 py-12">
      <header className="border-ink mx-auto max-w-(--measure) border-b-2 pb-6">
        <h1 className="font-display text-4xl font-semibold">Your account</h1>
      </header>

      <dl className="divide-rule border-rule mx-auto max-w-(--measure) divide-y border-b">
        <Row term="Nickname" detail="Chosen when you signed up, and fixed.">
          {user.nickname ?? user.name}
        </Row>
        <Row term="Email">{user.email}</Row>
        <Row term="Role" detail="What your account may do on the site.">
          {user.role}
        </Row>
        {user.rank && <Row term="Masthead">{formatEditorTitle(title)}</Row>}
      </dl>

      <div className="mx-auto mt-8 max-w-(--measure) space-y-3 text-base">
        <p>
          <Link href="/account/profile" className="underline underline-offset-2">
            Edit your public profile
          </Link>
        </p>
        <p>
          <Link href="/forgot-password" className="underline underline-offset-2">
            Change your password
          </Link>
        </p>
        <p className="text-ink-muted">
          To close your account or correct anything held about you, write to{" "}
          <a href={`mailto:${site.contactEmail}`} className="underline underline-offset-2">
            {site.contactEmail}
          </a>
          . See the{" "}
          <Link href="/privacy" className="underline underline-offset-2">
            privacy policy
          </Link>{" "}
          for what we keep and for how long.
        </p>
      </div>
    </div>
  );
}

function Row({
  term,
  detail,
  children,
}: {
  term: string;
  detail?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1 py-4 sm:grid-cols-3">
      <dt className="label text-ink-muted">{term}</dt>
      <dd className="sm:col-span-2">
        <span className="text-base">{children}</span>
        {detail && <span className="text-ink-faint mt-0.5 block text-sm">{detail}</span>}
      </dd>
    </div>
  );
}
