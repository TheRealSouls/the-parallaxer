import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

/**
 * A cheap first gate on the editorial routes.
 *
 * This only checks whether a session cookie is present. It does not validate it,
 * does not read the database, and cannot see what role the account holds, which
 * is deliberate: the proxy runs on every matching request, may be deployed to
 * the CDN, and a database round trip here would cost more than it saves.
 *
 * It is therefore not the access check. Every /studio and /admin page calls
 * requireEditor or requireAdmin from auth-guards.ts, which re-reads the session
 * server side. All this does is bounce signed-out visitors to the sign-in page
 * instead of rendering a shell they cannot use.
 *
 * Named `proxy` rather than `middleware`: Next 16 renamed the convention.
 */
export function proxy(request: NextRequest) {
  const hasSession = getSessionCookie(request);
  if (hasSession) return NextResponse.next();

  const signIn = new URL("/sign-in", request.url);
  signIn.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: ["/studio/:path*", "/admin/:path*"],
};
