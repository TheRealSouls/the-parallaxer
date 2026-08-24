import { MiniMap } from "@/components/map/MiniMap";
import { SearchBox } from "@/components/SearchBox";
import { FrontPage } from "@/components/FrontPage";
import { getPublishedArticles } from "@/lib/data";

export default async function Home() {
  const articles = await getPublishedArticles();

  return (
    <div className="mx-auto w-full max-w-(--page) px-5 py-10">
      {/*
        A way in on the left, the map reduced to a signature on the right.

        The full diagram used to open the page at full width, unlabelled, above
        the lead story. Read cold that is an illustration belonging to the
        article beneath it, which is how more than one person took it. It has
        its own page now, and what stays here is small enough to read as a mark
        rather than a claim, next to the thing a reader actually arrived to do.
      */}
      <section className="border-ink grid gap-8 border-b-2 pb-10 sm:grid-cols-[1fr_auto] sm:gap-10">
        <div className="min-w-0">
          <SearchBox />
        </div>
        <div className="sm:w-56">
          <MiniMap articles={articles} />
        </div>
      </section>

      <div className="mt-10">
        <FrontPage articles={articles} />
      </div>
    </div>
  );
}
