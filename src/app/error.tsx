"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Stage 6 replaces this with a report to the error tracker.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-(--measure) px-5 py-24 text-center">
      <p className="label text-ink-faint">Error</p>
      <h1 className="font-display mt-3 text-4xl font-semibold sm:text-5xl">
        Something went wrong at our end
      </h1>
      <p className="text-ink-muted mt-5 text-lg leading-relaxed">
        This is a fault in the site rather than anything you did. Trying again often works.
      </p>
      <p className="mt-8">
        <button type="button" onClick={reset} className="label underline underline-offset-4">
          Try again
        </button>
      </p>
    </div>
  );
}
