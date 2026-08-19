import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

/**
 * Every Better Auth endpoint lives under this one catch-all: sign-in, sign-up,
 * sign-out, the Google callback, and session lookups.
 */
export const { GET, POST } = toNextJsHandler(auth);
