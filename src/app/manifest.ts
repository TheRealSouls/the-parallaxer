import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * Replaces the site.webmanifest that came with the favicon set, which shipped
 * with empty names and a white theme colour. Written in TypeScript so the name
 * and palette stay in step with the rest of the site.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.shortName,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f7f4ec",
    theme_color: "#f7f4ec",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
