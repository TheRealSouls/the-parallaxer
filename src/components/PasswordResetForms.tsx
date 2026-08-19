"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useId, useState } from "react";
import { authClient } from "@/lib/auth-client";

/**
 * The two halves of a password reset: asking for the email, and setting the new
 * password once the link has been opened.
 *
 * The request form always reports success, whether or not the address exists.
 * Saying "no account with that email" would turn this page into a way to test
 * whether somebody has an account here, which is not ours to disclose.
 */
export function ForgotPasswordForm() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    await authClient.requestPasswordReset({ email, redirectTo: "/reset-password" });
    setBusy(false);
    setDone(true);
  }

  if (done) {
    return (
      <div className="border-ink mx-auto w-full max-w-sm border-t-2 pt-6">
        <h2 className="font-display text-2xl font-semibold">Check your email</h2>
        <p className="text-ink-muted mt-3 text-base leading-relaxed">
          If an account exists for <strong>{email}</strong>, a reset link is on its way. It expires
          in an hour.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-sm space-y-5">
      <div>
        <label htmlFor={id} className="label text-ink block">
          Email address
        </label>
        <input
          id={id}
          type="email"
          required
          value={email}
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
          className="border-ink bg-paper text-ink mt-1.5 w-full border px-3 py-2.5 text-base outline-none focus:ring-1 focus:ring-current"
        />
      </div>

      <button
        type="submit"
        disabled={busy}
        className="label bg-ink text-paper w-full px-4 py-3.5 underline-offset-4 hover:underline disabled:opacity-60"
      >
        {busy ? "Working" : "Send reset link"}
      </button>

      <p className="border-rule text-ink-muted border-t pt-5 text-center text-base">
        <Link href="/sign-in" className="underline underline-offset-2">
          Back to log in
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm() {
  const id = useId();
  const router = useRouter();
  const token = useSearchParams().get("token");

  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <div className="mx-auto w-full max-w-sm text-center">
        <p className="text-ink-muted text-base leading-relaxed">
          This reset link is incomplete or has expired.
        </p>
        <p className="mt-4">
          <Link href="/forgot-password" className="label underline underline-offset-4">
            Request a new one
          </Link>
        </p>
      </div>
    );
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    const result = await authClient.resetPassword({ newPassword: password, token: token! });

    setBusy(false);

    if (result.error) {
      setError(result.error.message ?? "That link is no longer valid. Please request another.");
      return;
    }

    router.push("/sign-in");
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-sm space-y-5">
      <div>
        <label htmlFor={id} className="label text-ink block">
          New password
        </label>
        <input
          id={id}
          type="password"
          required
          minLength={10}
          value={password}
          autoComplete="new-password"
          onChange={(event) => setPassword(event.target.value)}
          aria-describedby={`${id}-hint`}
          className="border-ink bg-paper text-ink mt-1.5 w-full border px-3 py-2.5 text-base outline-none focus:ring-1 focus:ring-current"
        />
        <p id={`${id}-hint`} className="text-ink-faint mt-1.5 text-sm">
          At least 10 characters.
        </p>
      </div>

      {error && (
        <p role="alert" className="border-rule border-t pt-3 text-base">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="label bg-ink text-paper w-full px-4 py-3.5 underline-offset-4 hover:underline disabled:opacity-60"
      >
        {busy ? "Working" : "Set new password"}
      </button>
    </form>
  );
}
