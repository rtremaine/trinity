import Link from "next/link";
import { requireUser } from "@/lib/authz";
import { getReadingByDate, todayDateStr } from "@/lib/readings";
import { ReadingView } from "@/components/reading-view";

export default async function TodayPage() {
  await requireUser();
  const date = todayDateStr();
  const reading = await getReadingByDate(date);

  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs uppercase tracking-wide text-gray-500">Today</p>
        <h2 className="text-xl font-semibold">{formatLongDate(date)}</h2>
      </header>

      {reading ? (
        <ReadingView reading={reading} />
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <p className="text-sm font-medium">No reading for today yet</p>
          <p className="mt-1 text-xs text-gray-500">
            Check back later, or browse{" "}
            <Link href="/archive" className="underline">
              previous readings
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}

function formatLongDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
