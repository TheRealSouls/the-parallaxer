import type { Metadata } from "next";
import Link from "next/link";
import { VennMap } from "@/components/map/VennMap";
import { LensPixel } from "@/components/LensPixel";
import { getPublishedArticles } from "@/lib/data";
import { DISPLAY_REGIONS, LENSES, lensName } from "@/lib/lenses";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "The Pixels",
  description: `Every article ${site.name} has published, placed by the lenses it reads through. One square for each.`,
  alternates: { canonical: "/pixels" },
};

/**
 * The map, given the room it needs and the explanation it never had.
 *
 * On the front page the diagram sat unlabelled above the articles, where a
 * first-time reader could reasonably take it for an illustration attached to
 * the story underneath. The problem was never the diagram; it was that nothing
 * said what it was. Here the explanation comes first and the map follows it.
 */
export default async function PixelsPage() {
  const articles = await getPublishedArticles();

  return (
    <div className="mx-auto w-full max-w-(--page) px-5 py-10">
      <header className="border-ink border-b-2 pb-6">
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">The Pixels</h1>
        <p className="text-ink-muted mt-3 max-w-(--measure) text-lg leading-relaxed">
          Every article we publish claims one square. Where the square sits depends on which of the
          three lenses the piece reads through and its colour is those lenses mixed the way inks mix
          on paper.
        </p>
      </header>

      <div className="mt-10">
        <VennMap articles={articles} heading="Every article, placed" />
      </div>

      <section className="border-rule mx-auto mt-14 max-w-(--measure) border-t pt-8">
        <h2 className="font-display text-2xl font-semibold">How to read it</h2>

        <p className="mt-3 leading-relaxed">
          The three circles are philosophy, politics and economics. An article that reads through
          one lens sits in that circle alone. An article that needs two sits where those two overlap
          and takes the colour they make together. A piece that needs all three sits in the middle.
        </p>

        <p className="mt-3 leading-relaxed">
          Squares fill outward from the centre of each region in the order things were published, so
          an article never moves once it has been placed. The pale squares are the ones still
          waiting. As the archive grows, the shape fills in.
        </p>

        <ul className="mt-6 space-y-2">
          {LENSES.map((lens) => (
            <li key={lens} className="flex items-baseline gap-2.5">
              <span className="translate-y-1">
                <LensPixel lenses={[lens]} size="lg" />
              </span>
              <Link href={`/lens/${lens}`} className="underline-offset-4 hover:underline">
                Everything through {lensName(lens).toLowerCase()}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-rule mx-auto mt-10 max-w-(--measure) border-t pt-8">
        <h2 className="font-display text-2xl font-semibold">The seven colours</h2>
        <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
          {DISPLAY_REGIONS.map((region) => (
            <li key={region.code} className="flex items-baseline gap-2.5">
              <span className="translate-y-1">
                <LensPixel lenses={region.lenses} size="lg" />
              </span>
              <span className="text-base">{region.name}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
