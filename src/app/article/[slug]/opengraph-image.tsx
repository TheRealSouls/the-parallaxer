import { ImageResponse } from "next/og";
import { getArticleBySlug } from "@/lib/data";
import { REGIONS, toRegionCode, tintTowardPaper } from "@/lib/lenses";
import { formatEditorTitle } from "@/lib/editorial";
import { loadGoogleFont } from "@/lib/og-font";
import { site } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Article share image";

/**
 * The image that represents an article when it is shared.
 *
 * Built from the article's own lens colour, so a link posted anywhere carries
 * the same information the map does: the region tells you what kind of piece it
 * is before the headline is read. A row of squares along the foot repeats the
 * pixel motif.
 *
 * Deliberately typographic rather than photographic. The publication has no
 * photography, and a stock image here would say nothing true about the article.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  const region = article ? REGIONS[toRegionCode(article.lenses)] : REGIONS[7];
  const paper = "#f7f4ec";

  const [display, label] = await Promise.all([
    loadGoogleFont("Newsreader", 600),
    loadGoogleFont("Archivo Narrow", 600),
  ]);

  // Long headlines need to step down or they overflow the frame.
  const headline = article?.title ?? site.name;
  const headlineSize = headline.length > 70 ? 62 : headline.length > 45 ? 74 : 88;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: region.hex,
        padding: "64px 72px",
        fontFamily: "Newsreader",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "Archivo Narrow",
          fontSize: 24,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: tintTowardPaper(region.hex, 0.12),
        }}
      >
        <span>{site.name}</span>
        <span>{region.short}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {article?.kicker ? (
          <span
            style={{
              fontFamily: "Archivo Narrow",
              fontSize: 26,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: tintTowardPaper(region.hex, 0.2),
              marginBottom: 18,
            }}
          >
            {article.kicker}
          </span>
        ) : null}

        <span
          style={{
            fontSize: headlineSize,
            lineHeight: 1.08,
            color: paper,
            letterSpacing: -1,
          }}
        >
          {headline}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          fontFamily: "Archivo Narrow",
          fontSize: 24,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: tintTowardPaper(region.hex, 0.15),
        }}
      >
        <span style={{ display: "flex", flexDirection: "column" }}>
          <span>{article?.author.name ?? site.statement}</span>
          {article ? <span>{formatEditorTitle(article.author.title)}</span> : null}
        </span>

        {/* The pixel motif, in tints of this article's own colour. Every step
            stays lighter than the ground; a square at full strength would be
            the same colour as the background and simply vanish. */}
        <span style={{ display: "flex", gap: 8 }}>
          {[0.14, 0.28, 0.42, 0.56, 0.72].map((tint) => (
            <span
              key={tint}
              style={{ width: 26, height: 26, background: tintTowardPaper(region.hex, tint) }}
            />
          ))}
        </span>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Newsreader", data: display, style: "normal", weight: 600 },
        { name: "Archivo Narrow", data: label, style: "normal", weight: 600 },
      ],
    },
  );
}
