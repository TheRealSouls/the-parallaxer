import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * Everything readable is crawlable. The exclusions are the parts of the site
 * that are either private or per-reader, so indexing them would put a sign-in
 * page or somebody's account screen into search results.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/studio", "/studio/", "/admin", "/account", "/reset-password"],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
