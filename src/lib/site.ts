export const site = {
  name: "The Parallaxer",
  /** Used where the definite article reads badly, e.g. mid-sentence. */
  shortName: "Parallaxer",
  domain: "theparallaxer.com",
  url: "https://theparallaxer.com",
  /** Used in the masthead, under the wordmark. */
  statement: "Current affairs read through philosophy, politics, and economics.",
  description:
    "The Parallaxer reads current affairs through three lenses at once: philosophy, politics, and economics. Each article is coloured by the lenses it uses.",
  contactEmail: "contact@theparallaxer.com",
  submissionFormUrl: "https://forms.gle/AZLaktvd95HBR4G66",
  founded: 2026,

  /**
   * Publisher details, used by the terms and privacy pages. Ireland is an EU
   * member state, so the GDPR applies in full and the privacy policy is written
   * on that basis.
   */
  publisher: {
    name: "Matas Roda",
    jurisdiction: "Ireland",
    inEu: true,
  },
} as const;

export const nav = [
  { href: "/lens/philosophy", label: "Philosophy" },
  { href: "/lens/politics", label: "Politics" },
  { href: "/lens/economics", label: "Economics" },
  { href: "/about", label: "About" },
  { href: "/submit", label: "Submit" },
] as const;
