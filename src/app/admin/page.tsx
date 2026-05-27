import { desc } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, users } from "@/db/schema";
import { requireRole } from "@/lib/authz";

export default async function AdminPage() {
  await requireRole("admin");

  const [recentUsers, recentAudits] = await Promise.all([
    db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(20),
    db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(20),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-10 py-16">
      <h1 className="text-2xl font-semibold">Admin</h1>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Recent users</h2>
        <div className="overflow-x-auto rounded border border-gray-200 dark:border-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left dark:bg-gray-900">
              <tr>
                <th className="px-3 py-2 font-medium">Email</th>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Role</th>
                <th className="px-3 py-2 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u) => (
                <tr key={u.id} className="border-t border-gray-200 dark:border-gray-800">
                  <td className="px-3 py-2">{u.email}</td>
                  <td className="px-3 py-2">{u.name ?? "—"}</td>
                  <td className="px-3 py-2">{u.role}</td>
                  <td className="px-3 py-2 text-gray-500">
                    {u.createdAt.toISOString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Recent audit log</h2>
        <div className="overflow-x-auto rounded border border-gray-200 dark:border-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left dark:bg-gray-900">
              <tr>
                <th className="px-3 py-2 font-medium">When</th>
                <th className="px-3 py-2 font-medium">Action</th>
                <th className="px-3 py-2 font-medium">User</th>
                <th className="px-3 py-2 font-medium">IP</th>
                <th className="px-3 py-2 font-medium">OK</th>
              </tr>
            </thead>
            <tbody>
              {recentAudits.map((a) => (
                <tr key={a.id} className="border-t border-gray-200 dark:border-gray-800">
                  <td className="px-3 py-2 text-gray-500">
                    {a.createdAt.toISOString()}
                  </td>
                  <td className="px-3 py-2 font-mono">{a.action}</td>
                  <td className="px-3 py-2 font-mono text-xs">{a.userId ?? "—"}</td>
                  <td className="px-3 py-2 font-mono text-xs">{a.ip ?? "—"}</td>
                  <td className="px-3 py-2">{a.success ? "yes" : "no"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
