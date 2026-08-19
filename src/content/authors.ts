import type { Author } from "@/lib/content";

/**
 * Placeholder masthead for Stage 1.
 *
 * These records exist so the layouts can be judged with real names, bylines,
 * and profile pages in place. Stage 2 replaces this file with the User table.
 * Replace or delete every entry before the site goes live.
 */
export const authors: Record<string, Author> = {
  roda: {
    id: "u_roda",
    slug: "matas-roda",
    name: "Matas Roda",
    role: "admin",
    title: "Founding editor",
    bio: "Founded Parallax on the conviction that no single discipline explains a news cycle. Writes mostly on political economy and the philosophy of institutions.",
    image: null,
    links: [],
  },
  hale: {
    id: "u_hale",
    slug: "j-hale",
    name: "J. Hale",
    role: "editor",
    title: "Philosophy editor",
    bio: "Placeholder editor record. Writes on ethics, personal identity, and the uses and misuses of thought experiments in public argument.",
    image: null,
    links: [],
  },
  okonjo: {
    id: "u_okonjo",
    slug: "a-okonjo",
    name: "A. Okonjo",
    role: "editor",
    title: "Economics editor",
    bio: "Placeholder editor record. Covers macroeconomic policy, industrial strategy, and the gap between what models predict and what governments do.",
    image: null,
    links: [],
  },
  lindqvist: {
    id: "u_lindqvist",
    slug: "e-lindqvist",
    name: "E. Lindqvist",
    role: "editor",
    title: "Politics editor",
    bio: "Placeholder editor record. Reports on coalition politics, electoral systems, and the slow business of governing without a majority.",
    image: null,
    links: [],
  },
};
