export const site = {
  name: "Parallax",
  /** Used in the masthead, under the wordmark. */
  statement: "Current affairs read through philosophy, politics, and economics.",
  description:
    "Parallax reads current affairs through three lenses at once: philosophy, politics, and economics. Each article is coloured by the lenses it uses.",
  url: "https://parallax.example",
  /** Replace with the live Google Form before launch. See /submit. */
  submissionFormUrl: "https://forms.gle/REPLACE_WITH_YOUR_FORM",
  founded: 2026,
} as const;

export const nav = [
  { href: "/lens/philosophy", label: "Philosophy" },
  { href: "/lens/politics", label: "Politics" },
  { href: "/lens/economics", label: "Economics" },
  { href: "/about", label: "About" },
  { href: "/submit", label: "Submit" },
] as const;
