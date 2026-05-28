import Link from "next/link";
import { requireUser } from "@/lib/authz";
import { listReadings } from "@/lib/readings";

function formatShortDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function ArchivePage() {
  await requireUser();
  const readings = await listReadings({ limit: 100 });

  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs uppercase tracking-wide text-gray-500">Archive</p>
        <h2 className="text-xl font-semibold">Previous readings</h2>
      </header>

      {readings.length === 0 ? (
        <p className="text-sm text-gray-500">No readings have been posted yet.</p>
      ) : (
        <ul className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
          {readings.map((r) => (
            <li key={r.id}>
              <Link
                href={`/readings/${r.date}`}
                className="flex items-center justify-between px-4 py-3 active:bg-gray-50 dark:active:bg-neutral-800"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{formatShortDate(r.date)}</p>
                  <p className="text-xs text-gray-500">
                    {r.rangeCount} passage{r.rangeCount === 1 ? "" : "s"}
                    {r.hasCommentary ? " · commentary" : ""}
                  </p>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
