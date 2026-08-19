"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";

/**
 * The account control in the top rule of the masthead.
 *
 * Renders nothing while the session is still being fetched, so the masthead
 * never flickers between "Sign in" and a nickname on every page load. If the
 * session lookup fails outright, which is what happens before the database is
 * connected, it falls back to the signed-out state rather than showing an error
 * in the masthead of a public site.
 */
export function AccountControl() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  if (isPending) return <span aria-hidden="true">&nbsp;</span>;

  if (!session?.user) {
    return (
      <Link href="/sign-in" className="text-ink underline-offset-4 hover:underline">
        Sign in
      </Link>
    );
  }

  const nickname = (session.user as { nickname?: string }).nickname ?? session.user.name;

  return (
    <span className="flex items-center gap-3">
      <Link href="/account" className="text-ink underline-offset-4 hover:underline">
        {nickname}
      </Link>
      <button
        type="button"
        onClick={async () => {
          await signOut();
          router.refresh();
        }}
        className="text-ink-faint underline-offset-4 hover:underline"
      >
        Sign out
      </button>
    </span>
  );
}
