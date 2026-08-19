import type { Metadata } from "next";
import Link from "next/link";
import { createArticle } from "@/app/studio/actions";
import { LensPixel } from "@/components/LensPixel";
import { requireEditor } from "@/lib/auth-guards";
import { formatDate } from "@/lib/content";
import { regionOccupancy } from "@/lib/map-cell";
import { DISPLAY_REGIONS } from "@/lib/lenses";
import { getStudioArticles } from "@/lib/queries/studio";

export const metadata: Metadata = { title: "Studio", robots: { index: false } };

export default async function StudioPage() {
  const user = await requireEditor();
  const [articles, occupancy] = await Promise.all([getStudioArticles(user), regionOccupancy()]);

  const drafts = articles.filter((a) => a.status !== "published");
  const live = articles.filter((a) => a.status === "published");

  return (
    <div className="mx-auto w-full max-w-(--page) px-5 py-10">
      <header className="border-ink flex flex-wrap items-end justify-between gap-4 border-b-2 pb-5">
        <div>
          <h1 className="font-display text-4xl font-semibold">Studio</h1>
          <p className="text-ink-muted mt-1 text-base">
            {user.role === "admin" ? "Every article on the desk." : "Your articles."}
          </p>
        </div>
        <form action={createArticle}>
          <button
            type="submit"
            className="label bg-ink text-paper px-5 py-3 underline-offset-4 hover:underline"
          >
            Start an article
          </button>
        </form>
      </header>

      <Section title="In progress" articles={drafts} empty="Nothing in progress." />
      <Section title="Published" articles={live} empty="Nothing published yet." />

      <section className="mt-14">
        <h2 className="label border-ink border-t-2 pt-2">Map occupancy</h2>
        <p className="text-ink-muted mt-3 max-w-(--measure) text-base leading-relaxed">
          How many squares each region has left. When a region fills, further articles publish
          normally but are not placed on the map until it switches to density mode.
        </p>
        <ul className="mt-5 grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
          {DISPLAY_REGIONS.map((region) => {
            const { used, capacity } = occupancy[region.code];
            return (
              <li key={region.code} className="border-rule flex items-center gap-2 border-t py-2">
                <LensPixel lenses={region.lenses} size="sm" />
                <span className="label text-ink-muted flex-1">{region.short}</span>
                <span className="label text-ink-faint tabular-nums">
                  {used} / {capacity}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

type Row = Awaited<ReturnType<typeof getStudioArticles>>[number];

function Section({ title, articles, empty }: { title: string; articles: Row[]; empty: string }) {
  return (
    <section className="mt-12">
      <h2 className="label border-ink border-t-2 pt-2">
        {title} <span className="text-ink-faint">{articles.length}</span>
      </h2>

      {articles.length === 0 ? (
        <p className="text-ink-faint mt-4 text-base">{empty}</p>
      ) : (
        <ul className="divide-rule border-rule mt-2 divide-y border-b">
          {articles.map((article) => (
            <li key={article.id} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3">
              {article.lenses.length > 0 && <LensPixel lenses={article.lenses} size="sm" />}

              <Link
                href={`/studio/write/${article.id}`}
                className="font-display flex-1 text-lg font-semibold underline-offset-4 hover:underline"
              >
                {article.title}
              </Link>

              <span className="label text-ink-faint">
                {article.author.nickname ?? article.author.name}
              </span>

              {article.status === "published" ? (
                <span className="label text-ink-faint tabular-nums">
                  {article.viewCount} views &middot; {article._count.comments} comments &middot;{" "}
                  {article._count.likes} likes
                </span>
              ) : (
                <span className="label text-ink-faint">{article.status.replace("_", " ")}</span>
              )}

              <span className="label text-ink-faint">
                {article.publishedAt
                  ? formatDate(article.publishedAt.toISOString())
                  : `edited ${formatDate(article.updatedAt.toISOString())}`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
