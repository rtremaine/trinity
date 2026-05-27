import { signOutAction } from "@/app/(auth)/actions";
import { requireUser } from "@/lib/authz";

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <form action={signOutAction}>
          <button
            type="submit"
            className="rounded border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-700"
          >
            Sign out
          </button>
        </form>
      </div>

      <div className="rounded border border-gray-200 p-4 dark:border-gray-800">
        <h2 className="mb-3 text-sm font-medium text-gray-500">Signed in as</h2>
        <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-gray-500">Name</dt>
          <dd>{user.name ?? "—"}</dd>
          <dt className="text-gray-500">Email</dt>
          <dd>{user.email}</dd>
          <dt className="text-gray-500">Role</dt>
          <dd>{user.role}</dd>
          <dt className="text-gray-500">ID</dt>
          <dd className="font-mono text-xs">{user.id}</dd>
        </dl>
      </div>

      {user.role === "admin" && (
        <a href="/admin" className="text-sm underline">
          Go to admin →
        </a>
      )}
    </div>
  );
}
