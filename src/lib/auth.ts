import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { SIGNUP_IP_LIMIT, SIGNUP_IP_WINDOW_MINUTES } from "@/lib/engagement-limits";
import { PASSWORD_MAX, PASSWORD_MIN, validatePassword } from "@/lib/password";
import { checkRateLimit } from "@/lib/rate-limit";
import { site } from "@/lib/site";

/**
 * Authentication.
 *
 * Email and password only for now. Google sign-in is written and works, but is
 * held behind ENABLE_GOOGLE below so it cannot appear before it is wanted.
 *
 * Everyone arrives as a reader. Nothing here can promote an account except the
 * ADMIN_EMAIL bootstrap, which exists so the first administrator can exist at
 * all. Every later promotion goes through the admin screens.
 */

/**
 * Master switch for Google sign-in. Flip to true and set the two environment
 * variables to turn it on; either one alone does nothing, so a half-configured
 * deployment cannot show a button that fails on click.
 */
const ENABLE_GOOGLE = false;

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const googleEnabled = ENABLE_GOOGLE && Boolean(googleClientId && googleClientSecret);

const secret = process.env.BETTER_AUTH_SECRET;

// `next build` evaluates this module with NODE_ENV=production to collect route
// configuration, so the check has to exempt the build itself or the project
// could never be built without a live secret. A real deployment sets the
// variable at build time anyway; this only fails a genuinely misconfigured
// server, on its first request rather than silently signing with a known key.
const isBuild = process.env.NEXT_PHASE === "phase-production-build";
if (!secret && process.env.NODE_ENV === "production" && !isBuild) {
  throw new Error("BETTER_AUTH_SECRET must be set in production.");
}

const baseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

export const auth = betterAuth({
  appName: site.name,
  secret: secret ?? "insecure-development-secret-never-use-in-production",
  baseURL,

  database: prismaAdapter(prisma, { provider: "postgresql" }),

  /**
   * Server-side gates on the credential endpoints.
   *
   * The forms check the same password rules for immediate feedback, but that is
   * a courtesy: these endpoints are reachable directly, so the rule that
   * actually holds is this one. Better Auth enforces the length floor by itself;
   * the composition rule is ours.
   *
   * Sign-up is also throttled by network address. Per-account limits cannot see
   * one machine registering fifty accounts, which is the shape abuse takes here.
   */
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      const guarded = ["/sign-up/email", "/reset-password", "/change-password"];
      if (!guarded.some((path) => ctx.path.startsWith(path))) return;

      if (ctx.path.startsWith("/sign-up/email")) {
        const allowance = await checkRateLimit("signup", SIGNUP_IP_LIMIT, SIGNUP_IP_WINDOW_MINUTES);
        if (!allowance.allowed) {
          throw new APIError("TOO_MANY_REQUESTS", {
            message: "Too many accounts have been created from this connection. Try again later.",
          });
        }
      }

      const body = ctx.body as { password?: unknown; newPassword?: unknown } | undefined;
      const candidate = body?.password ?? body?.newPassword;
      if (typeof candidate !== "string") return;

      const problem = validatePassword(candidate);
      if (problem) throw new APIError("BAD_REQUEST", { message: problem });
    }),
  },

  emailAndPassword: {
    enabled: true,
    minPasswordLength: PASSWORD_MIN,
    maxPasswordLength: PASSWORD_MAX,

    // An account can be created but not used until the address is confirmed.
    requireEmailVerification: true,

    sendResetPassword: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        subject: `Reset your ${site.name} password`,
        text: [
          `Somebody asked to reset the password for this address at ${site.name}.`,
          "",
          "If it was you, open this link:",
          url,
          "",
          "The link expires in an hour. If it was not you, ignore this message;",
          "nothing has changed and your password still works.",
        ].join("\n"),
      });
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    /**
     * Also send on sign-in, when the address is still unconfirmed.
     *
     * Without this, an account whose first verification email went astray is
     * stranded: signing up again is refused because the account exists, and
     * signing in is refused because the address is unverified, and neither path
     * sends a new link. Better Auth defaults this to false, which is a locked
     * door with no handle on either side.
     */
    sendOnSignIn: true,
    // Signing somebody in the moment they click the link saves a second step,
    // and the click already proves they hold the address.
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        subject: `Confirm your email for ${site.name}`,
        text: [
          `Welcome to ${site.name}.`,
          "",
          "Confirm this address to finish setting up your account:",
          url,
          "",
          "If you did not sign up, ignore this message and no account will be created.",
        ].join("\n"),
      });
    },
  },

  socialProviders: googleEnabled
    ? { google: { clientId: googleClientId!, clientSecret: googleClientSecret! } }
    : {},

  /**
   * Columns added to Better Auth's User table.
   *
   * Everything except the nickname is marked non-inputtable, so a crafted
   * sign-up request cannot set its own role, which would be a straightforward
   * privilege escalation. The nickname has to be inputtable because the reader
   * chooses it, and it is validated before it reaches this point.
   */
  user: {
    additionalFields: {
      nickname: { type: "string", required: false, input: true },
      role: { type: "string", required: false, defaultValue: "reader", input: false },
      rank: { type: "string", required: false, input: false },
      beat: { type: "number", required: false, input: false },
      slug: { type: "string", required: false, input: false },
      bio: { type: "string", required: false, input: false },
      links: { type: "string", required: false, input: false },
    },
  },

  databaseHooks: {
    user: {
      create: {
        /**
         * Bootstrap the first administrator. Without this there is no way to
         * grant anybody the admin role, because granting it requires an admin.
         * Comparison is case-insensitive because email addresses are.
         */
        before: async (user) => {
          const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
          const isAdmin = Boolean(adminEmail) && user.email.toLowerCase() === adminEmail;
          return {
            data: {
              ...user,
              role: isAdmin ? "admin" : "reader",
              rank: isAdmin ? "founding" : null,
            },
          };
        },
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
});

export type Session = typeof auth.$Infer.Session;
