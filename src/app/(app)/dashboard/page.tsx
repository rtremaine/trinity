import { requireUser } from "@/lib/authz";

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
          Signed in as
        </h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">Name</dt>
            <dd className="text-right">{user.name ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">Email</dt>
            <dd className="text-right break-all">{user.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">Role</dt>
            <dd className="text-right capitalize">{user.role}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
