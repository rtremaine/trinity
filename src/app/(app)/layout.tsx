import { requireUser } from "@/lib/authz";
import { unreadMentionCount } from "@/lib/comments";
import { TopBar } from "@/components/app-shell/top-bar";
import { BottomNav } from "@/components/app-shell/bottom-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const unreadMentions = await unreadMentionCount(user.id);

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-4">{children}</main>
      <BottomNav
        isAdmin={user.role === "admin"}
        unreadMentions={unreadMentions}
      />
    </div>
  );
}
