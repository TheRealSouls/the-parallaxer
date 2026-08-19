import Link from "next/link";

/** Rendered by unauthorized() when a protected route has no signed-in user. */
export default function Unauthorized() {
  return (
    <div className="mx-auto w-full max-w-(--measure) px-5 py-24 text-center">
      <p className="label text-ink-faint">Error 401</p>
      <h1 className="font-display mt-3 text-4xl font-semibold sm:text-5xl">
        You need to be signed in
      </h1>
      <p className="text-ink-muted mt-5 text-lg leading-relaxed">
        This page is for signed-in members of the publication.
      </p>
      <p className="mt-8">
        <Link href="/sign-in" className="label underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}
