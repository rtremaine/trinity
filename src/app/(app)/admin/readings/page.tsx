import Link from "next/link";
import { requireRole } from "@/lib/authz";
import { listReadings } from "@/lib/readings";
import { deleteReadingAction } from "./actions";

function fmt(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function AdminReadingsPage() {
  await requireRole("admin");
  const readings = await listReadings({ limit: 200 });

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Admin</p>
          <h2 className="text-xl font-semibold">Daily readings</h2>
        </div>
        <Link
          href="/admin/readings/new"
          className="h-10 rounded-lg bg-black px-4 text-sm font-medium leading-10 text-white active:bg-black/90 dark:bg-white dark:text-black"
        >
          + New
        </Link>
      </header>

      {readings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <p className="text-sm font-medium">No readings yet</p>
          <p className="mt-1 text-xs text-gray-500">
            Tap <span className="font-medium">+ New</span> to publish your first one.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
          {readings.map((r) => (
            <li key={r.id} className="flex items-center gap-2 px-4 py-3">
              <Link href={`/admin/readings/${r.date}/edit`} className="min-w-0 flex-1">
                <p className="text-sm font-medium">{fmt(r.date)}</p>
                <p className="text-xs text-gray-500">
                  {r.rangeCount} passage{r.rangeCount === 1 ? "" : "s"}
                  {r.hasCommentary ? " · commentary" : ""}
                </p>
              </Link>
              <form action={deleteReadingAction}>
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="date" value={r.date} />
                <button
                  type="submit"
                  aria-label="Delete reading"
                  className="h-10 w-10 rounded-lg text-gray-400 active:bg-gray-100 dark:active:bg-neutral-800"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                  </svg>
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
