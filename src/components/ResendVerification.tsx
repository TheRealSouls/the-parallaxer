"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

/**
 * Asks for the confirmation link again.
 *
 * An account can end up stranded easily. The first message lands in spam, or
 * the link expires, or somebody signs up on a phone and reads mail on a laptop
 * that had already deleted it. Without this, signing up again is refused
 * because the account exists and signing in is refused because the address is
 * unconfirmed, and the reader has no third option.
 *
 * The result never says whether the address has an account. Reporting that
 * would turn this button into a way to test whether somebody is a member.
 */
export function ResendVerification({
  email,
  className = "",
}: {
  email: string;
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  async function resend() {
    if (!email.trim() || state === "sending") return;
    setState("sending");
    try {
      await authClient.sendVerificationEmail({ email: email.trim(), callbackURL: "/" });
    } catch {
      // Deliberately swallowed. A failure here and a success look the same to
      // the reader, for the reason in the comment above, and the message below
      // is true either way: if the address has an unconfirmed account, a link
      // is now on its way.
    }
    setState("sent");
  }

  if (state === "sent") {
    return (
      <p className={`text-ink-muted text-base leading-relaxed ${className}`}>
        Sent. If that address has an account waiting to be confirmed, a new link is on its way. It
        can take a minute, and it is worth checking spam.
      </p>
    );
  }

  return (
    <p className={`text-ink-muted text-base leading-relaxed ${className}`}>
      <button
        type="button"
        onClick={resend}
        disabled={state === "sending" || !email.trim()}
        className="underline underline-offset-2 disabled:no-underline disabled:opacity-50"
      >
        {state === "sending" ? "Sending" : "Send the link again"}
      </button>
    </p>
  );
}
