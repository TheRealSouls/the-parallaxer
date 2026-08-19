import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-(--measure) px-5 py-24 text-center">
      <p className="label text-ink-faint">Error 404</p>
      <h1 className="font-display mt-3 text-4xl font-semibold sm:text-5xl">
        There is nothing at this address
      </h1>
      <p className="text-ink-muted mt-5 text-lg leading-relaxed">
        The page may have moved, or the link may have been mistyped. The front page carries
        everything currently in print.
      </p>
      <p className="mt-8">
        <Link href="/" className="label underline underline-offset-4">
          Return to the front page
        </Link>
      </p>
    </div>
  );
}
