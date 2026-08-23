"use server";

import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { mailOrigin, sendMail } from "@/lib/mail";
import { checkRateLimit } from "@/lib/rate-limit";
import { site } from "@/lib/site";

/**
 * Newsletter sign-up.
 *
 * Double opt-in. Submitting the form creates a row but sends nothing until the
 * address is confirmed from the inbox, which stops anybody being subscribed by
 * a stranger typing their address and keeps the sending domain's reputation
 * intact. Reputation is what decides whether the weekly email arrives at all.
 */

export type SubscribeResult = { ok: true } | { ok: false; error: string };

export async function subscribe(email: string): Promise<SubscribeResult> {
  if (!process.env.DATABASE_URL) {
    return { ok: false, error: "The newsletter is not connected yet. Please try again later." };
  }

  const address = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(address) || address.length > 200) {
    return { ok: false, error: "That does not look like an email address." };
  }

  const allowance = await checkRateLimit("subscribe", 5, 60);
  if (!allowance.allowed) {
    return { ok: false, error: "Too many sign-ups from this connection. Try again later." };
  }

  const token = randomBytes(24).toString("base64url");

  const existing = await prisma.subscriber.findUnique({
    where: { email: address },
    select: { confirmedAt: true, unsubscribedAt: true },
  });

  // Already on the list and confirmed: report success without sending anything.
  // Saying "you are already subscribed" would turn this form into a way to test
  // whether an address is on the list.
  if (existing?.confirmedAt && !existing.unsubscribedAt) return { ok: true };

  await prisma.subscriber.upsert({
    where: { email: address },
    create: { email: address, token },
    update: { token, unsubscribedAt: null },
  });

  await sendMail({
    to: address,
    subject: `Confirm your subscription to ${site.name}`,
    text: [
      `Somebody asked to subscribe this address to ${site.name}.`,
      "",
      "If it was you, confirm here:",
      `${mailOrigin}/newsletter/confirm?token=${token}`,
      "",
      "If it was not you, ignore this message. Nothing will be sent and the",
      "address will be forgotten.",
    ].join("\n"),
  });

  return { ok: true };
}
