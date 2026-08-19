"use client";

import { useIsHydrated } from "@/lib/use-is-hydrated";

/**
 * The masthead dateline.
 *
 * This has to be read from the client's own clock. Every page on the site is
 * statically generated, so a date computed during the server render would be
 * frozen at build time, and a newspaper showing last month's date is worse than
 * showing none. Computing it on the server would also risk a hydration mismatch,
 * since the build machine and the reader are rarely in the same time zone.
 *
 * The server renders an empty slot and the date appears on hydration, which
 * costs nothing visually because the slot sits in a fixed-height rule.
 */
export function Dateline() {
  const hydrated = useIsHydrated();

  if (!hydrated) return <span suppressHydrationWarning>{" "}</span>;

  return (
    <span suppressHydrationWarning>
      {new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })}
    </span>
  );
}
