import { desc } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, users } from "@/db/schema";
import { requireRole } from "@/lib/authz";

function fmt(d: Date) {
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
    <div className="space-y-6">
      <section>
        <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
          Recent users
        </h2>
        <ul className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
          {recentUsers.map((u) => (
            <li key={u.id} className="px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{u.email}</p>
                  <p className="truncate text-xs text-gray-500">
                    {u.name ?? "—"} · {fmt(u.createdAt)}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                    u.role === "admin"
                      ? "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200"
                      : "bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-300"
                  }`}
                >
                  {u.role}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
          Recent audit log
        </h2>
        <ul className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
          {recentAudits.map((a) => (
            <li key={a.id} className="px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-mono text-sm">{a.action}</p>
                  <p className="truncate text-xs text-gray-500">
                    {fmt(a.createdAt)} · {a.ip ?? "no ip"}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                    a.success
                      ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200"
                      : "bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-200"
                  }`}
                >
                  {a.success ? "ok" : "fail"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
