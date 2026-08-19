import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * The Prisma client.
 *
 * Prisma 7 requires a driver adapter rather than its own engine. PrismaNeon
 * talks to Neon over a WebSocket pool, which is what makes it usable from
 * serverless functions where a normal TCP pool would exhaust connections.
 *
 * Construction is deferred until the first query. `next build` imports every
 * route module to collect its configuration, so building would otherwise demand
 * a live DATABASE_URL just to produce static pages that never touch the
 * database. Deferring means a missing connection string fails on the first
 * request that actually needs it, with a message that says what to do.
 *
 * Next.js reloads modules on every edit in development, which would otherwise
 * open a new pool each time until Postgres refuses more. Caching the client on
 * globalThis keeps one pool across reloads. In production the module is
 * evaluated once and the global is never touched.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

let client: PrismaClient | undefined;

function getClient(): PrismaClient {
  if (client) return client;
  if (globalForPrisma.prisma) {
    client = globalForPrisma.prisma;
    return client;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and add your Neon connection string.",
    );
  }

  client = new PrismaClient({
    adapter: new PrismaNeon({ connectionString }),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  return client;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    const instance = getClient();
    const value = Reflect.get(instance as object, property, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
