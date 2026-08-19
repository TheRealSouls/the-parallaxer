import Link from "next/link";
import { requireEditor } from "@/lib/auth-guards";

/**
 * Guards everything under /studio.
 *
 * Putting the check in the layout means a new page added below it is protected
 * by default rather than by remembering. The proxy also bounces signed-out
 * visitors before they get here, but that only sees whether a cookie exists;
 * this is the check that reads the session and the role.
 */
export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const user = await requireEditor();

  return (
    <div>
      <div className="border-ink border-b">
        <div className="label mx-auto flex w-full max-w-(--page) flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-2.5">
          <span className="flex items-center gap-6">
            <Link href="/studio" className="underline-offset-4 hover:underline">
              Studio
            </Link>
            {user.role === "admin" && (
              <Link href="/admin" className="text-ink-muted underline-offset-4 hover:underline">
                Admin
              </Link>
            )}
          </span>
          <span className="text-ink-faint">{user.nickname ?? user.name}</span>
        </div>
      </div>
      {children}
    </div>
  );
}
