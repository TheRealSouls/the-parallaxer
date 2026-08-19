import "server-only";

import { Resend } from "resend";
import { site } from "@/lib/site";

/**
 * Transactional email.
 *
 * Resend is used because its free tier covers far more than a new publication
 * sends, and because it needs no server to run. Sending requires a verified
 * sending domain, which takes a DNS record and an afternoon of propagation.
 *
 * Until that exists, and in development, messages are written to the terminal
 * instead. That is deliberate: a developer running this locally should be able
 * to click the verification link out of their own console rather than needing an
 * account with a mail provider before they can sign up once.
 */

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.MAIL_FROM ?? `${site.name} <onboarding@resend.dev>`;

const resend = apiKey ? new Resend(apiKey) : null;

export type Mail = {
  to: string;
  subject: string;
  /** Plain text only. Everything sent is a short message with one link. */
  text: string;
};

export async function sendMail({ to, subject, text }: Mail): Promise<void> {
  if (!resend) {
    console.warn(
      [
        "",
        "RESEND_API_KEY is not set, so this email was not sent.",
        `  to:      ${to}`,
        `  subject: ${subject}`,
        "",
        text,
        "",
      ].join("\n"),
    );
    return;
  }

  const { error } = await resend.emails.send({ from, to, subject, text });

  // Thrown rather than swallowed: a sign-up whose verification mail vanished
  // silently leaves somebody locked out with no way to tell why.
  if (error) throw new Error(`Could not send "${subject}" to ${to}: ${error.message}`);
}
