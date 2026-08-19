import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth-guards";
import { getAllUsers } from "@/lib/queries/studio";
import { UserTable } from "@/components/studio/UserTable";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default async function AdminPage() {
  await requireAdmin();
  const users = await getAllUsers();

  return (
    <div className="mx-auto w-full max-w-(--page) px-5 py-10">
      <header className="border-ink border-b-2 pb-5">
        <h1 className="font-display text-4xl font-semibold">Admin</h1>
        <p className="text-ink-muted mt-1 max-w-(--measure) text-base leading-relaxed">
          Roles decide what an account may do. Titles decide what appears under a byline. They are
          set separately, because a guest contributor has a byline without editing rights.
        </p>
      </header>

      <UserTable
        users={users.map((user) => ({
          id: user.id,
          name: user.nickname ?? user.name,
          email: user.email,
          role: user.role,
          rank: user.rank,
          beat: user.beat,
          articles: user._count.articles,
          comments: user._count.comments,
        }))}
      />
    </div>
  );
}
