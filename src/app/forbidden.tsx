import Link from "next/link";

/** Rendered by forbidden() when a signed-in account lacks the required role. */
export default function Forbidden() {
  return (
    <div className="mx-auto w-full max-w-(--measure) px-5 py-24 text-center">
      <p className="label text-ink-faint">Error 403</p>
      <h1 className="font-display mt-3 text-4xl font-semibold sm:text-5xl">
        Your account cannot open this page
      </h1>
      <p className="text-ink-muted mt-5 text-lg leading-relaxed">
        You are signed in, but this area is limited to editors. If you think that is wrong, write to
        us and we will look.
      </p>
      <p className="mt-8">
        <Link href="/" className="label underline underline-offset-4">
          Return to the front page
        </Link>
      </p>
    </div>
  );
}
