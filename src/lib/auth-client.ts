"use client";

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";

/**
 * Browser-side auth. Used by the sign-in form and the masthead account control.
 *
 * inferAdditionalFields carries the extra User columns, nickname among them,
 * from the server config into the client's types, so a typo in a field name is
 * a compile error rather than a value silently dropped on sign-up. It is a
 * type-only import, so no server code reaches the browser bundle.
 *
 * Anything this reports is a convenience for rendering. It is never a permission
 * check: the server re-reads the session for every protected route and every
 * mutation. See auth-guards.ts.
 */
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
