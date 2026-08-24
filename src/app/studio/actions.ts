"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { forbidden } from "next/navigation";
import { prisma } from "@/lib/db";
import { canEditArticle, requireEditor } from "@/lib/auth-guards";
import { readingMinutes, type Doc } from "@/lib/content";
import { isLens, toRegionCode, type Lens } from "@/lib/lenses";
import { nextFreeMapCell } from "@/lib/map-cell";
import { slugify, uniqueSlug } from "@/lib/slug";
import { docToText, sanitiseDoc } from "@/lib/tiptap-doc";

/**
 * Every write the studio performs.
 *
 * Each action re-checks the session and re-checks ownership. Being reachable
 * only from a page that already checked is not the same as being safe: a server
 * action is a public endpoint, callable with any arguments by anyone who knows
 * its id, so the checks live here rather than at the page that renders the form.
 */

const slugTaken = (slug: string, exceptId?: string) =>
  prisma.article
    .findFirst({
      where: { slug, ...(exceptId ? { NOT: { id: exceptId } } : {}) },
      select: { id: true },
    })
    .then(Boolean);

/** Starts a new draft and opens it. */
export async function createArticle() {
  const user = await requireEditor();

  const article = await prisma.article.create({
    data: {
      slug: await uniqueSlug("untitled", (s) => slugTaken(s)),
      kicker: "",
      title: "Untitled",
      dek: "",
      excerpt: "",
      body: { type: "doc", content: [] },
      lenses: [],
      status: "draft",
      authorId: user.id,
    },
    select: { id: true },
  });

  redirect(`/studio/write/${article.id}`);
}

export type SaveResult = { savedAt: string } | { error: string };

/**
 * Autosave. Called on a debounce while the editor types, so it is deliberately
 * forgiving: it saves whatever is there, including an empty headline, and
 * leaves the completeness checks to publishing.
 */
export async function saveDraft(input: {
  id: string;
  title: string;
  kicker: string;
  dek: string;
  lenses: string[];
  body: unknown;
}): Promise<SaveResult> {
  const user = await requireEditor();

  const existing = await prisma.article.findUnique({
    where: { id: input.id },
    select: { authorId: true, status: true, slug: true },
  });
  if (!existing) return { error: "That article no longer exists." };
  if (!canEditArticle(user, existing.authorId)) forbidden();

  const body = sanitiseDoc(input.body);
  const lenses = input.lenses.filter(isLens);
  const text = docToText(body);

  await prisma.article.update({
    where: { id: input.id },
    data: {
      title: input.title.slice(0, 200),
      kicker: input.kicker.slice(0, 80),
      dek: input.dek.slice(0, 400),
      lenses,
      body,
      excerpt: input.dek.trim() || text.slice(0, 240),
      readingMinutes: readingMinutes(body),
    },
  });

  return { savedAt: new Date().toISOString() };
}

/** Snapshots the current body so it can be restored later. */
export async function saveRevision(articleId: string): Promise<void> {
  const user = await requireEditor();

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { authorId: true, body: true },
  });
  if (!article) return;
  if (!canEditArticle(user, article.authorId)) forbidden();

  await prisma.revision.create({
    data: { articleId, body: article.body as never, editorId: user.id },
  });
}

export type PublishResult = { ok: true; slug: string } | { ok: false; problems: string[] };


/**
 * Everything whose contents change when an article appears or disappears.
 *
 * The front page and the article itself are the obvious pair, but a piece also
 * joins a lens archive, its author's profile, the sitemap and both feeds. Miss
 * those and a newly published article is absent from the sitemap you handed to
 * Google, which is the one place it most needs to be.
 */
function revalidateArticleSurfaces(article: {
  slug: string;
  lenses: readonly string[];
  authorSlug: string | null;
}): void {
  revalidatePath("/");
  revalidatePath(`/article/${article.slug}`);
  for (const lens of article.lenses) revalidatePath(`/lens/${lens}`);
  if (article.authorSlug) revalidatePath(`/by/${article.authorSlug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/feed.xml");
  revalidatePath("/atom.xml");
}

/**
 * Publishes, assigning the article its square on the map.
 *
 * The completeness checks live here rather than in the form, because publishing
 * is the moment the piece becomes public and an incomplete one would break the
 * front page rather than merely look unfinished.
 */
export async function publishArticle(id: string): Promise<PublishResult> {
  const user = await requireEditor();

  const article = await prisma.article.findUnique({
    where: { id },
    include: { author: { select: { slug: true } } },
  });
  if (!article) return { ok: false, problems: ["That article no longer exists."] };
  if (!canEditArticle(user, article.authorId)) forbidden();

  const body = sanitiseDoc(article.body);
  const problems: string[] = [];

  if (!article.title.trim() || article.title === "Untitled") problems.push("It needs a headline.");
  if (!article.dek.trim()) problems.push("It needs a standfirst.");
  if (article.lenses.length === 0) problems.push("Choose at least one lens.");
  if (body.content.length === 0) problems.push("The body is empty.");
  if (problems.length) return { ok: false, problems };

  // Frozen at first publication so shared links keep working.
  const slug = article.publishedAt
    ? article.slug
    : await uniqueSlug(slugify(article.title), (s) => slugTaken(s, id));

  // Keeps its original square if it has one, so unpublishing and republishing
  // does not move it.
  const mapCell =
    article.mapCell ?? (await nextFreeMapCell(toRegionCode(article.lenses as Lens[])));

  await prisma.article.update({
    where: { id },
    data: {
      slug,
      status: "published",
      publishedAt: article.publishedAt ?? new Date(),
      mapCell,
      readingMinutes: readingMinutes(body),
    },
  });

  revalidateArticleSurfaces({
    slug,
    lenses: article.lenses,
    authorSlug: article.author.slug,
  });
  return { ok: true, slug };
}

/**
 * Hands a draft to the editors for a decision.
 *
 * The step exists so a junior editor or a guest contributor has a way to say
 * "this is finished" without publishing it themselves. An admin then publishes
 * or sends it back.
 */
export async function submitForReview(id: string): Promise<PublishResult> {
  const user = await requireEditor();

  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) return { ok: false, problems: ["That article no longer exists."] };
  if (!canEditArticle(user, article.authorId)) forbidden();
  if (article.status === "published") {
    return { ok: false, problems: ["This is already published."] };
  }

  // The same completeness bar as publishing. Handing over something unfinished
  // just moves the work to somebody with less context.
  const body = sanitiseDoc(article.body);
  const problems: string[] = [];
  if (!article.title.trim() || article.title === "Untitled") problems.push("It needs a headline.");
  if (!article.dek.trim()) problems.push("It needs a standfirst.");
  if (article.lenses.length === 0) problems.push("Choose at least one lens.");
  if (body.content.length === 0) problems.push("The body is empty.");
  if (problems.length) return { ok: false, problems };

  await prisma.article.update({ where: { id }, data: { status: "in_review" } });
  revalidatePath("/studio");
  return { ok: true, slug: article.slug };
}

/** Puts an article back into the writer's hands. */
export async function returnToDraft(id: string): Promise<void> {
  const user = await requireEditor();
  const article = await prisma.article.findUnique({
    where: { id },
    select: { authorId: true },
  });
  if (!article) return;
  if (!canEditArticle(user, article.authorId)) forbidden();

  await prisma.article.update({ where: { id }, data: { status: "draft" } });
  revalidatePath("/studio");
}

/** Takes a published article off the site without deleting it. */
export async function archiveArticle(id: string): Promise<void> {
  const user = await requireEditor();

  const article = await prisma.article.findUnique({
    where: { id },
    select: { authorId: true, slug: true, lenses: true, author: { select: { slug: true } } },
  });
  if (!article) return;
  if (!canEditArticle(user, article.authorId)) forbidden();

  // mapCell is left in place: the square stays reserved so restoring the piece
  // puts it back where readers last saw it.
  await prisma.article.update({ where: { id }, data: { status: "archived" } });

  revalidateArticleSurfaces({
    slug: article.slug,
    lenses: article.lenses,
    authorSlug: article.author.slug,
  });
}

/** Puts an earlier revision back into the editor as the current body. */
export async function restoreRevision(revisionId: string): Promise<void> {
  const user = await requireEditor();

  const revision = await prisma.revision.findUnique({
    where: { id: revisionId },
    include: { article: { select: { id: true, authorId: true } } },
  });
  if (!revision) return;
  if (!canEditArticle(user, revision.article.authorId)) forbidden();

  // The current body is snapshotted first, so restoring is itself undoable.
  await saveRevision(revision.article.id);

  await prisma.article.update({
    where: { id: revision.article.id },
    data: { body: revision.body as never },
  });

  revalidatePath(`/studio/write/${revision.article.id}`);
}

/** Sets the slug by hand. Refused once published, to protect existing links. */
export async function updateSlug(id: string, next: string): Promise<{ error?: string }> {
  const user = await requireEditor();

  const article = await prisma.article.findUnique({
    where: { id },
    select: { authorId: true, publishedAt: true },
  });
  if (!article) return { error: "That article no longer exists." };
  if (!canEditArticle(user, article.authorId)) forbidden();
  if (article.publishedAt) {
    return { error: "The address is fixed once an article has been published." };
  }

  const candidate = slugify(next);
  if (!candidate) return { error: "That is not a usable address." };
  if (await slugTaken(candidate, id))
    return { error: "Another article already uses that address." };

  await prisma.article.update({ where: { id }, data: { slug: candidate } });
  return {};
}

/** Body type re-exported so the editor and the actions cannot drift apart. */
export type ArticleBodyDoc = Doc;
