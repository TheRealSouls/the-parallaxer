"use client";

import { useEffect } from "react";

/**
 * Records one view of an article.
 *
 * Counted from the browser rather than during the server render, and that is the
 * important part: incrementing a counter while rendering would make every
 * article page dynamic, and the whole site is statically generated. A small POST
 * after paint keeps the pages static and costs the reader nothing.
 *
 * sessionStorage stops a refresh or a back-button return being counted again
 * within the same tab session. It holds a slug, not an identifier, so nothing
 * here can be tied back to a person. Crawlers that do not run scripts are never
 * counted, which is a fair approximation of "read by a human".
 */
export function ViewBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `viewed:${slug}`;

    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Private browsing can refuse storage. Counting the view is still fine;
      // only the deduplication is lost.
    }

    // keepalive so the request survives the reader navigating away immediately.
    void fetch(`/api/views/${encodeURIComponent(slug)}`, {
      method: "POST",
      keepalive: true,
    }).catch(() => {
      // A missed view is not worth surfacing to the reader.
    });
  }, [slug]);

  return null;
}
