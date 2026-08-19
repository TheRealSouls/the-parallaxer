"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { RegionCode } from "@/lib/lenses";
import { useIsHydrated } from "@/lib/use-is-hydrated";

export type MapEntry = {
  cellIndex: number;
  col: number;
  row: number;
  x: number;
  y: number;
  code: RegionCode;
  article: {
    slug: string;
    title: string;
    regionName: string;
    date: string;
    author: string;
  } | null;
};

export type MapLabel = { lens: string; x: number; y: number; icon: string };

/** Height of a circle's icon, in map cell units. */
const ICON_SIZE = 1.15;

type Props = {
  entries: readonly MapEntry[];
  labels: readonly MapLabel[];
  viewBox: { minX: number; minY: number; width: number; height: number };
  /** Fallback caption shown before any square is hovered or focused. */
  hint: string;
};

/**
 * The map's interactive shell.
 *
 * Everything meaningful is present in the server-rendered HTML: each published
 * article is a real anchor around a real rect, so the diagram is legible and
 * clickable with JavaScript disabled. Script only adds two things on top, a
 * caption that reports whichever square you are pointing at, and a roving tab
 * index so a keyboard reaches the map in one stop and then walks it with the
 * arrow keys instead of tabbing through every article on the page.
 */
export function VennMapCanvas({ entries, labels, viewBox, hint }: Props) {
  const [active, setActive] = useState<number | null>(null);
  // React types an SVG anchor as HTMLAnchorElement; only focus() is ever used.
  const refs = useRef(new Map<number, { focus: () => void }>());
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Without script every square is tabbable, which is the correct fallback.
  // The roving tab index only takes over once there is script to run it.
  const enhanced = useIsHydrated();

  /**
   * Focus reporting cannot use React's onFocus and onBlur here. Chrome makes an
   * SVG anchor the activeElement without dispatching a focus event for it, so
   * the synthetic handlers never run and a keyboard reader would get a caption
   * that never changes, then one that never clears.
   *
   * A single focusin listener on the document sidesteps all of it: whatever
   * gains focus, the caption follows if it is a square and clears if it is not.
   */
  useEffect(() => {
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as Element | null;
      const cell = target?.closest?.("[data-cell]")?.getAttribute("data-cell");
      setActive(cell ? Number(cell) : null);
    };

    document.addEventListener("focusin", onFocusIn);
    return () => document.removeEventListener("focusin", onFocusIn);
  }, []);

  const filled = useMemo(
    () => entries.filter((e) => e.article !== null).sort((a, b) => a.row - b.row || a.col - b.col),
    [entries],
  );

  const [rovingIndex, setRovingIndex] = useState(0);
  const caption = active !== null ? entries.find((e) => e.cellIndex === active) : null;

  function focusAt(position: number) {
    const target = filled[Math.max(0, Math.min(filled.length - 1, position))];
    if (!target) return;
    setRovingIndex(filled.indexOf(target));
    setActive(target.cellIndex);
    refs.current.get(target.cellIndex)?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent<SVGSVGElement>) {
    if (!filled.length) return;
    const current = filled[rovingIndex];
    if (!current) return;

    // Left and right walk reading order. Up and down jump to the nearest filled
    // square in the neighbouring occupied row, which keeps movement spatial.
    switch (event.key) {
      case "ArrowRight":
        focusAt(rovingIndex + 1);
        break;
      case "ArrowLeft":
        focusAt(rovingIndex - 1);
        break;
      case "Home":
        focusAt(0);
        break;
      case "End":
        focusAt(filled.length - 1);
        break;
      case "ArrowDown":
      case "ArrowUp": {
        const direction = event.key === "ArrowDown" ? 1 : -1;
        const candidates = filled.filter((c) =>
          direction === 1 ? c.row > current.row : c.row < current.row,
        );
        if (!candidates.length) return;
        const targetRow = candidates.reduce(
          (best, c) =>
            Math.abs(c.row - current.row) < Math.abs(best - current.row) ? c.row : best,
          candidates[0]!.row,
        );
        const nearest = candidates
          .filter((c) => c.row === targetRow)
          .reduce((best, c) =>
            Math.abs(c.col - current.col) < Math.abs(best.col - current.col) ? c : best,
          );
        focusAt(filled.indexOf(nearest));
        break;
      }
      default:
        return;
    }
    event.preventDefault();
  }

  return (
    <figure className="m-0">
      <svg
        ref={svgRef}
        viewBox={`${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}`}
        className="block h-auto w-full"
        role="group"
        // Chrome treats an svg root as focusable. Without this, tabbing into the
        // map stops on the diagram as a whole before reaching any article.
        tabIndex={-1}
        aria-label="Map of every published article, arranged by the lenses it uses"
        onKeyDown={onKeyDown}
        onMouseLeave={() => setActive(null)}
      >
        {entries.map((entry) => {
          const fill = entry.article
            ? `var(--lens-${entry.code})`
            : `var(--lens-${entry.code}-tint)`;

          const rect = (
            <rect
              x={entry.col + 0.08}
              y={entry.row + 0.08}
              width={0.84}
              height={0.84}
              fill={fill}
              stroke="var(--cell-keyline)"
              strokeWidth={0.035}
            />
          );

          if (!entry.article) {
            return <g key={entry.cellIndex}>{rect}</g>;
          }

          const position = filled.indexOf(entry);
          return (
            <a
              key={entry.cellIndex}
              href={`/article/${entry.article.slug}`}
              ref={(node) => {
                if (node) refs.current.set(entry.cellIndex, node);
                else refs.current.delete(entry.cellIndex);
              }}
              tabIndex={enhanced ? (position === rovingIndex ? 0 : -1) : 0}
              data-cell={entry.cellIndex}
              aria-label={`${entry.article.title}. ${entry.article.regionName}. ${entry.article.date}.`}
              onMouseEnter={() => setActive(entry.cellIndex)}
            >
              {rect}
            </a>
          );
        })}

        {labels.map((label) => (
          <g key={label.lens}>
            {/* Font Awesome glyphs are drawn on a 512 unit grid, so the scale
                factor converts one into map cell units. */}
            <g
              transform={`translate(${label.x - ICON_SIZE / 2} ${label.y - ICON_SIZE - 0.5}) scale(${ICON_SIZE / 512})`}
              aria-hidden="true"
            >
              <path d={label.icon} fill="var(--ink-faint)" />
            </g>
            <text
              x={label.x}
              y={label.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="var(--ink-faint)"
              style={{
                fontFamily: "var(--font-label)",
                fontSize: 0.62,
                fontWeight: 600,
                letterSpacing: 0.07,
              }}
            >
              {label.lens.toUpperCase()}
            </text>
          </g>
        ))}
      </svg>

      {/* Fixed height, so swapping the text never nudges the page. */}
      <figcaption className="border-rule mt-4 flex min-h-14 items-start justify-center border-t pt-3 text-center">
        {caption?.article ? (
          <span className="max-w-lg">
            <span className="font-display text-lg leading-snug font-semibold">
              {caption.article.title}
            </span>
            <span className="label text-ink-faint mt-1 block">
              {caption.article.regionName} &middot; {caption.article.author} &middot;{" "}
              {caption.article.date}
            </span>
          </span>
        ) : (
          <span className="label text-ink-faint max-w-sm">{hint}</span>
        )}
      </figcaption>
    </figure>
  );
}
