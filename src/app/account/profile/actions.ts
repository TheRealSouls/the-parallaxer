"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/db";
import { BIO_MAX, LINK_LABEL_MAX, LINKS_MAX } from "@/lib/profile-limits";

/**
 * Editing your own public profile.
 *
 * Open to anybody who has one, which includes guest contributors: they hold
 * reader permissions and cannot reach the studio, but they have a byline and a
 * profile page, so they need somewhere to maintain it.
 */

export type ProfileResult = { ok: true } | { ok: false; error: string };

export async function updateProfile(input: {
  bio: string;
  links: { label: string; url: string }[];
}): Promise<ProfileResult> {
  const user = await requireUser();

  const record = await prisma.user.findUnique({
    where: { id: user.id },
    select: { slug: true },
  });
  if (!record?.slug) {
    return { ok: false, error: "You do not have a public profile yet." };
  }

  const bio = input.bio.trim();
  if (bio.length > BIO_MAX) {
    return { ok: false, error: `Biographies are at most ${BIO_MAX} characters.` };
  }

  if (input.links.length > LINKS_MAX) {
    return { ok: false, error: `You can list at most ${LINKS_MAX} links.` };
  }

  const links: { label: string; url: string }[] = [];
  for (const link of input.links) {
    const label = link.label.trim().slice(0, LINK_LABEL_MAX);
    const url = link.url.trim();
    if (!label && !url) continue;

    // Only ordinary web addresses. A javascript: or data: URL here would end up
    // in an href on a public page, and these are rendered with rel="nofollow"
    // precisely because they are reader-supplied.
    if (!/^https?:\/\/\S+$/i.test(url)) {
      return { ok: false, error: `"${label || url}" is not a valid web address.` };
    }
    if (!label) {
      return { ok: false, error: "Every link needs a label." };
    }
    links.push({ label, url });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { bio: bio || null, links },
  });

  revalidatePath(`/by/${record.slug}`);
  revalidatePath("/about");
  revalidatePath("/account/profile");
  return { ok: true };
}
