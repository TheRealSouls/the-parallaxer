import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";
import { googleEnabled } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create an account to comment and to like articles.",
};

export default function SignUpPage() {
  return (
    <div className="mx-auto w-full max-w-(--page) px-5 py-16">
      <header className="mx-auto max-w-sm text-center">
        <h1 className="font-display text-4xl font-semibold">Create an account</h1>
        <p className="text-ink-muted mt-3 text-base leading-relaxed">
          You need an account to comment and to like articles. Reading needs nothing.
        </p>
      </header>

      <div className="mt-10">
        {/* useSearchParams needs a boundary, since the shell is prerendered. */}
        <Suspense fallback={null}>
          <AuthForm mode="sign-up" googleEnabled={googleEnabled} />
        </Suspense>
      </div>

      <p className="label text-ink-faint mx-auto mt-10 max-w-sm text-center">
        By creating an account you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-2">
          terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline underline-offset-2">
          privacy policy
        </Link>
        .
      </p>
    </div>
  );
}
