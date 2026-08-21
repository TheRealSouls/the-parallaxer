import type { Metadata } from "next";
import Link from "next/link";
import { ProfileForm } from "@/components/ProfileForm";
import { requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Your profile", robots: { index: false } };

/**
 * Editing your own public profile.
 *
 * Lives under /account rather than /studio, because guest contributors have a
 * byline and a profile page but only reader permissions, so the studio is
 * closed to them. Putting it here means everybody with a profile can maintain
 * one.
 */
export default async function ProfileSettingsPage() {
  const user = await requireUser();

  const record = await prisma.user.findUnique({
    where: { id: user.id },
    select: { slug: true, bio: true, links: true },
  });

  if (!record?.slug) {
    return (
      <div className="mx-auto w-full max-w-(--measure) px-5 py-16 text-center">
        <h1 className="font-display text-3xl font-semibold">No public profile yet</h1>
        <p className="text-ink-muted mt-4 text-base leading-relaxed">
          A profile page is created when your first article is published. Until then there is
          nothing here to edit.
        </p>
        <p className="mt-6">
          <Link href="/submit" className="label underline underline-offset-4">
            Submit an article
          </Link>
        </p>
      </div>
    );
  }

  const links = Array.isArray(record.links)
    ? (record.links as unknown[]).flatMap((entry) => {
        if (typeof entry !== "object" || entry === null) return [];
        const { label, url } = entry as Record<string, unknown>;
        if (typeof label !== "string" || typeof url !== "string") return [];
        return [{ label, url }];
      })
    : [];

  return (
    <div className="mx-auto w-full max-w-(--page) px-5 py-12">
      <header className="border-ink mx-auto max-w-(--measure) border-b-2 pb-6">
        <h1 className="font-display text-4xl font-semibold">Your profile</h1>
        <p className="text-ink-muted mt-2 text-base leading-relaxed">
          What readers see at /by/{record.slug}. Portraits are added by the editors for now; see the
          note in the repository if you want yours changed.
        </p>
      </header>

      <ProfileForm
        initialBio={record.bio ?? ""}
        initialLinks={links}
        profileHref={`/by/${record.slug}`}
      />

      <p className="label text-ink-faint mx-auto mt-10 max-w-(--measure)">
        <Link href="/account" className="underline underline-offset-4">
          Back to your account
        </Link>
      </p>
    </div>
  );
}
