"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LENSES, lensName, type Lens } from "@/lib/lenses";
import { LensPixel } from "@/components/LensPixel";

/**
 * The front page's way in to the archive.
 *
 * A real form with a GET action underneath, so it submits to /search and works
 * with no script at all. The suggestion list is an enhancement layered on top:
 * if the fetch fails, or script never runs, pressing enter still performs the
 * search it always would have.
 *
 * Suggestions appear below the field rather than replacing anything, and
 * nothing moves as they arrive. A list that reflows the page under the cursor
 * while somebody is typing into it is worse than no list.
 */

type Suggestion = { slug: string; title: string; region: string; lenses: Lens[] };

export function SearchBox() {
  const router = useRouter();
  const listId = useId();
  const inputId = useId();

  const [query, setQuery] = useState("");
  const [lens, setLens] = useState<Lens | "">("");
  const [results, setResults] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);

  const boxRef = useRef<HTMLDivElement | null>(null);

  // Debounced, and every in-flight request is abandoned when the next keystroke
  // arrives. Without the abort an earlier, slower response can land after a
  // later one and repopulate the list with results for a prefix of what the
  // reader has now typed.
  useEffect(() => {
    const term = query.trim();
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      // One character matches most of the archive, so the list stays shut until
      // there are two. Clearing happens here rather than in the effect body so
      // a delete back to one character does not drop the list mid-render.
      if (term.length < 2) {
        setResults([]);
        return;
      }

      try {
        const params = new URLSearchParams({ q: term });
        if (lens) params.set("lens", lens);
        const response = await fetch(`/api/search/suggest?${params}`, {
          signal: controller.signal,
        });
        if (!response.ok) return;
        const data = (await response.json()) as { results: Suggestion[] };
        setResults(data.results);
        setHighlighted(-1);
      } catch {
        // An aborted or failed request simply leaves the previous list alone.
        // The form underneath still works, so there is nothing to report.
      }
    }, 180);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, lens]);

  // Close on a click anywhere else. Pointerdown rather than click, so the list
  // is gone before a click on the page behind it resolves.
  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const visible = open && results.length > 0;

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!visible) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setHighlighted((current) => {
        const next = current + step;
        if (next < 0) return results.length - 1;
        if (next >= results.length) return 0;
        return next;
      });
      return;
    }

    if (event.key === "Enter" && highlighted >= 0) {
      const choice = results[highlighted];
      if (choice) {
        event.preventDefault();
        router.push(`/article/${choice.slug}`);
      }
      return;
    }

    if (event.key === "Escape") setOpen(false);
  }

  return (
    <div ref={boxRef} className="relative">
      <form method="get" action="/search" className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1">
          <label htmlFor={inputId} className="label text-ink-muted block">
            Search the archive
          </label>
          <input
            id={inputId}
            name="q"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            autoComplete="off"
            role="combobox"
            aria-expanded={visible}
            aria-controls={visible ? listId : undefined}
            aria-autocomplete="list"
            // Without this the arrow keys move a highlight a screen reader
            // never announces: focus stays in the input, so nothing tells the
            // reader which suggestion is current.
            aria-activedescendant={
              visible && highlighted >= 0 ? `${listId}-${highlighted}` : undefined
            }
            placeholder="Housing, central banks, virtue"
            className="border-ink bg-paper text-ink mt-1.5 w-full border px-3 py-2.5 text-base outline-none focus:ring-1 focus:ring-current"
          />
        </div>

        <div>
          <label htmlFor={`${inputId}-lens`} className="label text-ink-muted block">
            Lens
          </label>
          <select
            id={`${inputId}-lens`}
            name="lens"
            value={lens}
            onChange={(event) => setLens(event.target.value as Lens | "")}
            className="border-ink bg-paper text-ink mt-1.5 border px-3 py-2.5 text-base outline-none focus:ring-1 focus:ring-current"
          >
            <option value="">Any</option>
            {LENSES.map((one) => (
              <option key={one} value={one}>
                {lensName(one)}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="label border-ink border px-4 py-2.5 underline-offset-4 hover:underline"
        >
          Search
        </button>
      </form>

      {visible && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Matching articles"
          className="border-ink bg-paper absolute inset-x-0 top-full z-20 mt-1 border"
        >
          {results.map((result, index) => (
            <li
              key={result.slug}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === highlighted}
            >
              <a
                href={`/article/${result.slug}`}
                onMouseEnter={() => setHighlighted(index)}
                className={`border-rule flex items-baseline gap-2.5 border-b px-3 py-2.5 no-underline last:border-b-0 ${
                  index === highlighted ? "bg-ink/5" : ""
                }`}
              >
                <span className="translate-y-0.5">
                  <LensPixel lenses={result.lenses} size="sm" />
                </span>
                <span className="min-w-0">
                  <span className="font-display block truncate text-base">{result.title}</span>
                  <span className="label text-ink-faint">{result.region}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
