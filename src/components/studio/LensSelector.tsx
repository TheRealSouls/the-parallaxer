"use client";

import { LENSES, lensName, regionOf, type Lens } from "@/lib/lenses";

/**
 * The three lens toggles, with a live preview of the colour they mix to.
 *
 * This is the control that explains the publication to a new editor. Turning on
 * philosophy and economics together and watching the square turn from ochre to
 * moss teaches the colour system faster than any note beside it could.
 */
export function LensSelector({
  value,
  onChange,
}: {
  value: readonly Lens[];
  onChange: (next: Lens[]) => void;
}) {
  const region = value.length > 0 ? regionOf(value) : null;

  function toggle(lens: Lens) {
    onChange(value.includes(lens) ? value.filter((l) => l !== lens) : [...value, lens]);
  }

  return (
    <div>
      <p className="label text-ink-muted">Lenses</p>

      <div className="mt-2 flex flex-wrap gap-2">
        {LENSES.map((lens) => {
          const on = value.includes(lens);
          return (
            <button
              key={lens}
              type="button"
              onClick={() => toggle(lens)}
              aria-pressed={on}
              className={`label border-ink border px-3 py-2 underline-offset-4 hover:underline ${
                on ? "bg-ink text-paper" : "text-ink"
              }`}
            >
              {lensName(lens)}
            </button>
          );
        })}
      </div>

      <div className="border-rule mt-3 flex items-center gap-2.5 border-t pt-3">
        {region ? (
          <>
            <span
              aria-hidden="true"
              className="inline-block h-5 w-5 shrink-0"
              style={{
                backgroundColor: `var(${region.cssVar})`,
                boxShadow: "inset 0 0 0 1px var(--cell-keyline)",
              }}
            />
            <span className="label text-ink-muted">
              {region.short}
              <span className="text-ink-faint"> &middot; this is its square on the map</span>
            </span>
          </>
        ) : (
          <span className="label text-ink-faint">Choose at least one lens before publishing</span>
        )}
      </div>
    </div>
  );
}
