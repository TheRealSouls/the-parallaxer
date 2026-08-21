import "server-only";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

/**
 * Throttling by network address.
 *
 * Per-account limits cannot see somebody registering fifty accounts from one
 * machine, which is the shape abuse actually takes at sign-up. This closes that
 * gap without keeping anything identifying: the address is salted and hashed
 * before it is stored, the rows carry nothing else, and they are disposable.
 *
 * The salt is the auth secret, so the hashes are useless outside this
 * deployment and cannot be compared against a rainbow table of addresses.
 */

const SALT = process.env.BETTER_AUTH_SECRET ?? "development-salt";

/**
 * The caller's address, as reported by the proxy in front of the app.
 *
 * These headers are trivially forged when a request reaches the server
 * directly, so this is a speed bump rather than a security boundary. On Vercel
 * the platform sets them and strips anything the client sent.
 */
async function callerAddress(): Promise<string> {
  const head = await headers();
  const forwarded = head.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return head.get("x-real-ip") ?? "unknown";
}

function hashKey(scope: string, value: string): string {
  return createHash("sha256").update(`${SALT}:${scope}:${value}`).digest("hex");
}

/**
 * Records a hit and reports whether the caller is over the limit.
 *
 * Returns `allowed: false` once `limit` hits have been recorded inside the
 * window. Expired rows for the same key are cleared on the way through, so the
 * table stays small without a scheduled job.
 */
export async function checkRateLimit(
  scope: string,
  limit: number,
  windowMinutes: number,
): Promise<{ allowed: boolean; retryAfterMinutes: number }> {
  const keyHash = hashKey(scope, await callerAddress());
  const since = new Date(Date.now() - windowMinutes * 60_000);

  await prisma.rateLimitHit.deleteMany({ where: { keyHash, createdAt: { lt: since } } });

  const used = await prisma.rateLimitHit.count({
    where: { keyHash, createdAt: { gte: since } },
  });

  if (used >= limit) return { allowed: false, retryAfterMinutes: windowMinutes };

  await prisma.rateLimitHit.create({ data: { keyHash } });
  return { allowed: true, retryAfterMinutes: 0 };
}
