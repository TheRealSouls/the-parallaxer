/**
 * The masthead: who holds which title, and how someone earns one.
 *
 * A title is separate from a permission role. `UserRole` in content.ts decides
 * what an account may do (comment, publish, administer). The title here is the
 * editorial position printed under a byline. A guest contributor has reader
 * permissions and still appears on the site.
 */

import { isRegionCode, REGIONS, type RegionCode } from "./lenses";

export type EditorRank = "founding" | "senior" | "junior" | "guest";

/**
 * How each lens region is named inside a title. These are the seven beats, so
 * the masthead maps one to one onto the map on the front page.
 */
export const BEAT_NAME: Record<RegionCode, string> = {
  1: "Philosophy",
  2: "Politics",
  3: "Phil-Pol",
  4: "Economics",
  5: "Phil-Econ",
  6: "Pol-Econ",
  7: "PPE",
};

/**
 * A senior or junior editor always holds a beat; the founding editor and guest
 * contributors never do. Modelling it as a union makes the invalid states
 * unrepresentable rather than merely discouraged.
 */
export type EditorTitle =
  | { rank: "founding" }
  | { rank: "senior"; beat: RegionCode }
  | { rank: "junior"; beat: RegionCode }
  | { rank: "guest" };

export function formatEditorTitle(title: EditorTitle): string {
  switch (title.rank) {
    case "founding":
      return "Founding Editor";
    case "senior":
      return `Senior ${BEAT_NAME[title.beat]} Editor`;
    case "junior":
      return `Junior ${BEAT_NAME[title.beat]} Editor`;
    case "guest":
      return "Guest Article";
  }
}

/** Longer form for a profile page, where the beat deserves spelling out. */
export function describeEditorTitle(title: EditorTitle): string {
  switch (title.rank) {
    case "founding":
      return "Founding editor of the publication.";
    case "senior":
      return `Appointed to lead coverage of ${REGIONS[title.beat].name.toLowerCase()}.`;
    case "junior":
      return `Writes on ${REGIONS[title.beat].name.toLowerCase()}.`;
    case "guest":
      return "Published here as a guest contributor.";
  }
}

/** Ranks that may write and publish. Guests submit through the form instead. */
export function isStaff(title: EditorTitle): boolean {
  return title.rank !== "guest";
}

/**
 * A contributor's first two pieces run as guest articles. After the second they
 * may apply for a junior editorship. Senior editorships are not applied for;
 * they are appointed.
 */
export const MIN_ARTICLES_FOR_JUNIOR = 2;

export function canApplyForJunior(title: EditorTitle, publishedCount: number): boolean {
  return title.rank === "guest" && publishedCount >= MIN_ARTICLES_FOR_JUNIOR;
}

/** How many more pieces a guest needs before they can apply. */
export function articlesUntilEligible(publishedCount: number): number {
  return Math.max(0, MIN_ARTICLES_FOR_JUNIOR - publishedCount);
}

/** Every senior post, for the about page and the admin appointment UI. */
export const SENIOR_POSTS: readonly EditorTitle[] = ([1, 2, 4, 3, 5, 6, 7] as RegionCode[]).map(
  (beat) => ({ rank: "senior" as const, beat }),
);

/**
 * Rebuild a title from the two columns the database stores.
 *
 * A senior or junior row without a valid beat is inconsistent data rather than a
 * new kind of editor, so it degrades to guest instead of throwing. That keeps a
 * single bad row from taking down the front page.
 */
export function toEditorTitle(
  rank: string | null | undefined,
  beat: number | null | undefined,
): EditorTitle {
  if (rank === "founding") return { rank: "founding" };
  if ((rank === "senior" || rank === "junior") && isRegionCode(beat)) {
    return { rank, beat };
  }
  return { rank: "guest" };
}

/** The inverse, for writing a title back to the database. */
export function fromEditorTitle(title: EditorTitle): { rank: EditorRank; beat: number | null } {
  return title.rank === "senior" || title.rank === "junior"
    ? { rank: title.rank, beat: title.beat }
    : { rank: title.rank, beat: null };
}
