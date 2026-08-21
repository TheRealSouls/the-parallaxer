import { VennMap } from "@/components/map/VennMap";
import { FrontPage } from "@/components/FrontPage";
import { getPublishedArticles } from "@/lib/data";

export default async function Home() {
  const articles = await getPublishedArticles();

  return (
    <div className="mx-auto w-full max-w-(--page) px-5 py-10">
      <VennMap articles={articles} />
      <div className="mt-14">
        <FrontPage articles={articles} />
      </div>
    </div>
  );
}
