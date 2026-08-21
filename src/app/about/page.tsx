import type { Metadata } from "next";
import Link from "next/link";
import { DISPLAY_REGIONS } from "@/lib/lenses";
import { formatEditorTitle, type EditorTitle } from "@/lib/editorial";
import { Avatar } from "@/components/Avatar";
import { LensPixel } from "@/components/LensPixel";
import { getMasthead } from "@/lib/data";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: site.description,
};

/** Founding editor first, then seniors, then juniors, then guests. */
const RANK_ORDER: Record<EditorTitle["rank"], number> = {
  founding: 0,
  senior: 1,
  junior: 2,
  guest: 3,
};

export default async function AboutPage() {
  const masthead = (await getMasthead())
    .slice()
    .sort(
      (a, b) => RANK_ORDER[a.title.rank] - RANK_ORDER[b.title.rank] || a.name.localeCompare(b.name),
    );

  return (
    <div className="mx-auto w-full max-w-(--page) px-5 py-10">
      <header className="border-ink mx-auto max-w-(--measure) border-b-2 pb-6 text-center">
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">About The Parallaxer</h1>
        <p className="text-ink-muted mt-4 text-xl leading-relaxed">{site.statement}</p>
      </header>

      <div className="mx-auto mt-10 max-w-(--measure)">
        <p className="mt-6">
          A parallax is the apparent shift in an object when you view it from a different position.
          Nothing about the object changes. What changes is where you are standing, and that turns
          out to be enough to tell you something you could not otherwise measure.
        </p>
        <p className="mt-6">
          This publication takes that seriously as a method. A housing shortage is a supply problem,
          a question about who holds power in local government, and an argument about what a home is
          for. A central bank decision is a technical judgement, a democratic question about who
          decides, and a claim about whose losses count. Reading any of these through one discipline
          gives a clean answer to the wrong question.
        </p>

        <h2 className="mt-12 text-2xl">How the colours work</h2>
        <p className="mt-6">
          Every article carries one, two, or all three lenses, and its colour is the mix. Philosophy
          is yellow, politics is red, economics is blue. Where two lenses meet, their inks combine.
          Where all three meet, the result is near black. The map on the front page arranges every
          published piece into the region it belongs to, so you can see at a glance where the
          publication has been paying attention and where it has not.
        </p>

        <ul className="divide-rule border-rule mt-8 divide-y border-t border-b">
          {DISPLAY_REGIONS.map((region) => (
            <li key={region.code} className="flex items-center gap-3 py-3">
              <LensPixel lenses={region.lenses} size="lg" />
              <span className="label text-ink-muted w-28 shrink-0">{region.short}</span>
              <span className="text-ink-muted text-base">{region.name}</span>
            </li>
          ))}
        </ul>

        <h2 className="mt-12 text-2xl">The masthead</h2>
        <p className="mt-6">
          The Parallaxer is edited by a small group. There are seven beats, one for each region of
          the map: the three single lenses, the three pairs, and the centre where all three meet.
          Each beat has a senior editor, appointed by the publication, and may have junior editors
          writing alongside them.
        </p>
        <p className="mt-6">
          Guest contributors are not on the masthead but keep a profile and a byline. A first and
          second piece run as guest articles. After a second, a contributor may apply for a junior
          editorship. Senior editorships are not applied for.
        </p>
      </div>

      <ul className="mx-auto mt-8 grid max-w-(--measure-wide) gap-x-10 gap-y-8 sm:grid-cols-2">
        {masthead.map((author) => (
          <li key={author.id} className="border-rule flex gap-4 border-t pt-4">
            <Avatar author={author} size="md" />
            <div>
              <h3 className="font-display text-xl font-semibold">
                <Link href={`/by/${author.slug}`} className="underline-offset-4 hover:underline">
                  {author.name}
                </Link>
              </h3>
              <p className="label text-ink-faint mt-1">{formatEditorTitle(author.title)}</p>
              <p className="text-ink-muted mt-2 text-base leading-relaxed">{author.bio}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="border-rule mx-auto mt-12 max-w-(--measure) border-t pt-6">
        <h2 className="text-2xl">Write for us</h2>
        <p className="mt-4">
          The Parallaxer accepts guest articles, and actively wants them. If you have an argument
          that needs more than one discipline to make, see the{" "}
          <Link href="/submit" className="underline underline-offset-2">
            submission page
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
