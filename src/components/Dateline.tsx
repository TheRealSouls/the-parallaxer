"use client";

import { useSyncExternalStore } from "react";

/**
 * The masthead dateline: the reader's own date and time.
 *
 * This has to be read from the client's clock. Every page is statically
 * generated, so a date computed during the server render would be frozen at
 * build time, and a newspaper showing last month's date is worse than showing
 * none. Reading it on the server would also risk a hydration mismatch, since the
 * build machine and the reader are rarely in the same time zone.
 *
 * The snapshot is the current minute rather than the current millisecond. That
 * matters: useSyncExternalStore compares snapshots by identity and would loop
 * forever if this returned something new on every call. It also means the clock
 * re-renders sixty times an hour instead of once a second.
 */

const store = {
  // Polled rather than aligned to the minute boundary, which would need a
  // self-rescheduling timeout for a display that is never more than 15s stale.
  subscribe(onChange: () => void) {
    const id = setInterval(onChange, 15_000);
    return () => clearInterval(id);
  },
  getSnapshot: () => Math.floor(Date.now() / 60_000),
  // Zero marks "no clock yet", which is what the server and the hydration pass
  // both render, so the two always agree.
  getServerSnapshot: () => 0,
};

export function Dateline() {
  const minute = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);

  if (minute === 0) return <span suppressHydrationWarning>&nbsp;</span>;

  const now = new Date(minute * 60_000);
  const date = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const time = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return (
    <span suppressHydrationWarning>
      {date}
      <span aria-hidden="true"> &middot; </span>
      <time dateTime={now.toISOString()}>{time}</time>
    </span>
  );
}
