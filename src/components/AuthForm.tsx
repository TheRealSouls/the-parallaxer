"use client";

import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useId, useState } from "react";
import { signIn, signUp } from "@/lib/auth-client";
import { NICKNAME_MAX, NICKNAME_MIN, validateNickname } from "@/lib/nickname";
import { PASSWORD_HINT, validatePassword } from "@/lib/password";

/**
 * The sign-in and sign-up form.
 *
 * One component for both, because they differ by one field and one call. Google
 * is deliberately absent: `googleEnabled` is false while the publication runs on
 * email alone, and the server passes it down so a button never appears before
 * the credentials behind it exist.
 *
 * Signing up ends on a "check your email" panel rather than a redirect, because
 * an account is not usable until the address is confirmed and sending somebody
 * to the front page would leave them wondering whether it had worked.
 */
export function AuthForm({
  mode,
  googleEnabled,
}: {
  mode: "sign-in" | "sign-up";
  googleEnabled: boolean;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/";

  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (mode === "sign-up") {
      const problem = validateNickname(nickname) ?? validatePassword(password);
      if (problem) {
        setError(problem);
        return;
      }
    }

    setBusy(true);

    const result =
      mode === "sign-up"
        ? await signUp.email({
            // Better Auth requires a name; the nickname is the only identity
            // this site has, so it fills both.
            name: nickname.trim(),
            nickname: nickname.trim(),
            email,
            password,
          })
        : await signIn.email({ email, password, rememberMe: remember });

    setBusy(false);

    if (result.error) {
      setError(readableError(result.error.message, result.error.status));
      return;
    }

    if (mode === "sign-up") {
      setSent(true);
      return;
    }

    router.push(next);
    router.refresh();
  }

  if (sent) {
    return (
      <div className="border-ink mx-auto w-full max-w-sm border-t-2 pt-6">
        <h2 className="font-display text-2xl font-semibold">Check your email</h2>
        <p className="text-ink-muted mt-3 text-base leading-relaxed">
          We have sent a confirmation link to <strong>{email}</strong>. Open it and your account is
          ready. The link expires in an hour.
        </p>
        <p className="text-ink-muted mt-3 text-base leading-relaxed">
          Nothing arrived? Check the spam folder before trying again.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      {googleEnabled && (
        <>
          <button
            type="button"
            onClick={() => signIn.social({ provider: "google", callbackURL: next })}
            className="label border-ink w-full border px-4 py-3 underline-offset-4 hover:underline"
          >
            Continue with Google
          </button>
          <p className="label text-ink-faint my-6 text-center">or</p>
        </>
      )}

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        {mode === "sign-up" && (
          <Field
            label="Nickname"
            type="text"
            value={nickname}
            onChange={setNickname}
            // Not "username": browsers and password managers treat that as the
            // login identifier and fill it with the email address, which is
            // exactly what a nickname must not be. "nickname" is the spec token
            // for this field, and the data-* opt-outs cover the managers that
            // ignore it and fill the first text input regardless.
            autoComplete="nickname"
            ignoreManagers
            maxLength={NICKNAME_MAX}
            hint={`${NICKNAME_MIN} to ${NICKNAME_MAX} characters. Use letters, numbers, hyphens, and underscores, starting and ending with a letter or number. This is how you appear on the site, and it cannot be changed later.`}
          />
        )}

        <Field
          label="Email address"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
        />

        <PasswordField
          value={password}
          onChange={setPassword}
          mode={mode}
          hint={mode === "sign-up" ? PASSWORD_HINT : undefined}
        />

        {mode === "sign-in" && (
          <label className="flex items-center gap-2 text-base">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="accent-ink h-4 w-4"
            />
            Keep me signed in
          </label>
        )}

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
          {busy ? "Working" : mode === "sign-up" ? "Create account" : "Log in"}
        </button>
      </form>

      <div className="border-rule mt-8 space-y-2 border-t pt-5 text-center text-base">
        {mode === "sign-in" ? (
          <>
            <p>
              <Link href="/forgot-password" className="underline underline-offset-2">
                Forgotten your password?
              </Link>
            </p>
            <p className="text-ink-muted">
              No account yet?{" "}
              <Link href="/sign-up" className="underline underline-offset-2">
                Create one
              </Link>
            </p>
          </>
        ) : (
          <p className="text-ink-muted">
            Already have an account?{" "}
            <Link href="/sign-in" className="underline underline-offset-2">
              Log in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

/** Turns Better Auth's terse messages into something a reader can act on. */
function readableError(message: string | undefined, status: number | undefined): string {
  if (status === 401 || /invalid|credential/i.test(message ?? "")) {
    return "That email address and password do not match an account.";
  }
  if (/exists|unique|taken/i.test(message ?? "")) {
    return "That email address or nickname is already taken.";
  }
  if (status === 403 || /verif/i.test(message ?? "")) {
    return "Confirm your email address before logging in. Check your inbox for the link.";
  }
  return message ?? "That did not work. Please try again.";
}

function Field({
  label,
  type,
  value,
  onChange,
  autoComplete,
  hint,
  maxLength,
  ignoreManagers = false,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  hint?: string;
  maxLength?: number;
  /** Ask password managers to leave this field alone. See the nickname field. */
  ignoreManagers?: boolean;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="label text-ink block">
        {label}
      </label>
      <input
        id={id}
        type={type}
        required
        value={value}
        maxLength={maxLength}
        autoComplete={autoComplete}
        data-1p-ignore={ignoreManagers || undefined}
        data-lpignore={ignoreManagers ? "true" : undefined}
        data-bwignore={ignoreManagers || undefined}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="border-ink bg-paper text-ink mt-1.5 w-full border px-3 py-2.5 text-base outline-none focus:ring-1 focus:ring-current"
      />
      {hint && (
        <p id={`${id}-hint`} className="text-ink-faint mt-1.5 text-sm leading-snug">
          {hint}
        </p>
      )}
    </div>
  );
}

function PasswordField({
  value,
  onChange,
  mode,
  hint,
}: {
  value: string;
  onChange: (value: string) => void;
  mode: "sign-in" | "sign-up";
  hint?: string;
}) {
  const id = useId();
  const [shown, setShown] = useState(false);
  const icon = shown ? faEyeSlash : faEye;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="label text-ink">
          Password
        </label>
        <button
          type="button"
          onClick={() => setShown((current) => !current)}
          className="label text-ink-muted inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
        >
          <svg viewBox="0 0 576 512" className="h-3 w-3.5 fill-current" aria-hidden="true">
            <path d={icon.icon[4] as string} />
          </svg>
          {shown ? "Hide" : "Show"} password
        </button>
      </div>
      <input
        id={id}
        type={shown ? "text" : "password"}
        required
        value={value}
        autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="border-ink bg-paper text-ink mt-1.5 w-full border px-3 py-2.5 text-base outline-none focus:ring-1 focus:ring-current"
      />
      {hint && (
        <p id={`${id}-hint`} className="text-ink-faint mt-1.5 text-sm leading-snug">
          {hint}
        </p>
      )}
    </div>
  );
}
