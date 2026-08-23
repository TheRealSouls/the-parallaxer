import { regionOf, type Lens } from "@/lib/lenses";

/**
 * Daily views for one article over the last month.
 *
 * A bar per day rather than a line, because the underlying data is a count per
 * day and a line would imply a continuous quantity measured between them. Days
 * with no views are drawn as an empty slot rather than skipped, so a quiet
 * stretch reads as a gap instead of being compressed away.
 *
 * Pure SVG on the server: the studio should not ship a charting library to draw
 * thirty rectangles.
 */
export function ViewSparkline({
  series,
  lenses,
  days = 30,
}: {
  series: readonly { day: Date; count: number }[];
  lenses: readonly Lens[];
  days?: number;
}) {
  const region = regionOf(lenses);

  // The query returns only days that saw traffic, so the axis is rebuilt here
  // to keep the spacing honest.
  const byDay = new Map(series.map((row) => [row.day.toISOString().slice(0, 10), row.count]));
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const buckets: { key: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(today);
    day.setUTCDate(day.getUTCDate() - i);
    const key = day.toISOString().slice(0, 10);
    buckets.push({ key, count: byDay.get(key) ?? 0 });
  }

  const peak = Math.max(1, ...buckets.map((bucket) => bucket.count));
  const total = buckets.reduce((sum, bucket) => sum + bucket.count, 0);

  return (
    <div>
      <p className="label text-ink-muted">Views</p>

      <svg
        viewBox={`0 0 ${days * 3} 24`}
        className="mt-2 block h-12 w-full"
        role="img"
        aria-label={`${total} views over the last ${days} days, peaking at ${peak} in a day`}
        preserveAspectRatio="none"
      >
        {buckets.map((bucket, i) => {
          const height = bucket.count === 0 ? 0.6 : (bucket.count / peak) * 22;
          return (
            <rect
              key={bucket.key}
              x={i * 3}
              y={24 - height}
              width={2}
              height={height}
              fill={bucket.count === 0 ? "var(--rule)" : `var(${region.cssVar})`}
            />
          );
        })}
      </svg>

      <p className="text-ink-faint mt-1 text-sm tabular-nums">
        {total} in {days} days &middot; peak {peak}
      </p>
    </div>
  );
}
