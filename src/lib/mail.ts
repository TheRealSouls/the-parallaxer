import "server-only";

import { Resend } from "resend";
import { site } from "@/lib/site";

/**
 * Transactional and bulk email.
 *
 * Resend is used because its free tier covers far more than a new publication
 * sends, and because it needs no server to run. Sending requires a verified
 * sending domain, which takes a DNS record and an afternoon of propagation.
 *
 * Until that exists, and in development, messages are written to the terminal
 * instead. That is deliberate: a developer running this locally should be able
 * to click the verification link out of their own console rather than needing an
 * account with a mail provider before they can sign up once.
 *
 * Everything sent is plain text. That is a design decision, not a limitation: an
 * HTML email is where tracking pixels live, and the privacy policy promises
 * there are none.
 */

/**
 * The origin to put in links inside emails.
 *
 * Not `site.url`, because a confirmation link is only useful if it points at the
 * host the reader actually signed up on. BETTER_AUTH_URL already means "the
 * site's own origin" and is set per environment, so a link mailed from a local
 * run comes back to the local run instead of the live domain.
 */
export const mailOrigin = (process.env.BETTER_AUTH_URL ?? site.url).replace(/\/+$/, "");

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.MAIL_FROM ?? `${site.name} <onboarding@resend.dev>`;

const resend = apiKey ? new Resend(apiKey) : null;

/** Whether mail will actually leave the building, or only reach the console. */
export const mailConfigured = Boolean(resend);

export type Mail = {
  to: string;
  subject: string;
  /** Plain text only. Everything sent is a short message with one link. */
  text: string;
  /**
   * Extra headers. Used by the newsletter for List-Unsubscribe, which lets a
   * mail client show its own unsubscribe button. Without it, the only way out
   * of a list is the spam button, which damages the sending domain far more.
   */
  headers?: Record<string, string>;
};

function logInstead(mail: Mail): void {
  console.warn(
    [
      "",
      "RESEND_API_KEY is not set, so this email was not sent.",
      `  to:      ${mail.to}`,
      `  subject: ${mail.subject}`,
      "",
      mail.text,
      "",
    ].join("\n"),
  );
}

export async function sendMail(mail: Mail): Promise<void> {
  if (!resend) return logInstead(mail);

  const { error } = await resend.emails.send({
    from,
    to: mail.to,
    subject: mail.subject,
    text: mail.text,
    headers: mail.headers,
  });

  // Thrown rather than swallowed: a sign-up whose verification mail vanished
  // silently leaves somebody locked out with no way to tell why.
  if (error) throw new Error(`Could not send "${mail.subject}" to ${mail.to}: ${error.message}`);
}

/** Resend accepts at most this many messages in one batch call. */
const BATCH_SIZE = 100;

export type BatchResult = { sent: number; failed: { to: string; reason: string }[] };

/**
 * Sends many individually addressed messages.
 *
 * One message per recipient rather than one message with many recipients: each
 * carries its own unsubscribe link, and putting subscribers in a shared To or
 * Cc would expose every address on the list to everyone on it.
 *
 * A failed batch is recorded and the rest continue. One bad address should not
 * stop an issue reaching everybody else.
 */
export async function sendBatch(messages: Mail[]): Promise<BatchResult> {
  if (!resend) {
    messages.forEach(logInstead);
    return { sent: 0, failed: [] };
  }

  const result: BatchResult = { sent: 0, failed: [] };

  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const chunk = messages.slice(i, i + BATCH_SIZE);

    try {
      const { error } = await resend.batch.send(
        chunk.map((mail) => ({
          from,
          to: mail.to,
          subject: mail.subject,
          text: mail.text,
          headers: mail.headers,
        })),
      );

      if (error) {
        for (const mail of chunk) result.failed.push({ to: mail.to, reason: error.message });
      } else {
        result.sent += chunk.length;
      }
    } catch (cause) {
      const reason = cause instanceof Error ? cause.message : "unknown error";
      for (const mail of chunk) result.failed.push({ to: mail.to, reason });
    }
  }

  return result;
}
