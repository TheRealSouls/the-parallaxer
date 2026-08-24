export const site = {
  name: "The Parallaxer",
  /** Used where the definite article reads badly, e.g. mid-sentence. */
  shortName: "Parallaxer",
  domain: "theparallaxer.com",
  url: "https://theparallaxer.com",
  /** Used in the masthead, under the wordmark. */
  statement: "Current affairs read through philosophy, politics and economics.",
  description:
    "The Parallaxer reads current affairs through three lenses at once: philosophy, politics and economics. Each article is coloured by the lenses it uses.",
  contactEmail: "contact@theparallaxer.com",
  /** Shown on the contact page and where readers are invited to write in. */
  enquiriesEmail: "hello@theparallaxer.com",
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

/**
 * Social accounts, shown in the footer.
 *
 * Placeholder handles: replace each `url` with the real account before launch.
 * An icon that leads to a dead page costs more credibility than a missing one,
 * so delete any row you have not actually claimed yet.
 */
export const socials = [
  { key: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/company/theparallaxer" },
  { key: "x", label: "X", url: "https://x.com/theparallaxer" },
  { key: "instagram", label: "Instagram", url: "https://www.instagram.com/theparallaxer" },
  { key: "substack", label: "Substack", url: "https://theparallaxer.substack.com" },
] as const;

export type SocialKey = (typeof socials)[number]["key"];

export const nav = [
  { href: "/lens/philosophy", label: "Philosophy" },
  { href: "/lens/politics", label: "Politics" },
  { href: "/lens/economics", label: "Economics" },
  { href: "/pixels", label: "Pixels" },
  { href: "/about", label: "About" },
  { href: "/search", label: "Search" },
  { href: "/submit", label: "Submit" },
] as const;
