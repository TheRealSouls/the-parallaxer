import type { Author } from "@/lib/content";

/**
 * Placeholder masthead for Stage 1.
 *
 * These records exist so the layouts can be judged with real names, bylines,
 * and profile pages in place. Stage 2 replaces this file with the User table.
 * Replace or delete every entry before the site goes live.
 *
 * Note the split between `role` and `title`. The role decides permissions; the
 * title is the position on the masthead. A guest contributor keeps reader
 * permissions and still gets a byline and a profile.
 */
export const authors: Record<string, Author> = {
  roda: {
    id: "u_roda",
    slug: "matas-roda",
    name: "Matas Roda",
    role: "admin",
    title: { rank: "founding" },
    bio: "Founded The Parallaxer on the conviction that no single discipline explains a news cycle. Writes mostly on political economy and the philosophy of institutions.",
    image: null,
    links: [],
  },
  hale: {
    id: "u_hale",
    slug: "j-hale",
    name: "J. Hale",
    role: "editor",
    title: { rank: "senior", beat: 1 },
    bio: "Placeholder editor record. Writes on ethics, personal identity, and the uses and misuses of thought experiments in public argument.",
    image: null,
    links: [],
  },
  okonjo: {
    id: "u_okonjo",
    slug: "a-okonjo",
    name: "A. Okonjo",
    role: "editor",
    title: { rank: "senior", beat: 6 },
    bio: "Placeholder editor record. Covers macroeconomic policy, industrial strategy, and the gap between what models predict and what governments do.",
    image: null,
    links: [],
  },
  lindqvist: {
    id: "u_lindqvist",
    slug: "e-lindqvist",
    name: "E. Lindqvist",
    role: "editor",
    title: { rank: "senior", beat: 2 },
    bio: "Placeholder editor record. Reports on coalition politics, electoral systems, and the slow business of governing without a majority.",
    image: null,
    links: [],
  },
  mbeki: {
    id: "u_mbeki",
    slug: "t-mbeki",
    name: "T. Mbeki",
    role: "editor",
    title: { rank: "junior", beat: 5 },
    bio: "Placeholder editor record. Junior editor covering where moral philosophy meets economic method, including valuation and cost-benefit analysis.",
    image: null,
    links: [],
  },
  ferrer: {
    id: "u_ferrer",
    slug: "n-ferrer",
    name: "N. Ferrer",
    role: "reader",
    title: { rank: "guest" },
    bio: "Placeholder guest contributor. Two pieces published, and therefore eligible to apply for a junior editorship.",
    image: null,
    links: [],
  },
};
