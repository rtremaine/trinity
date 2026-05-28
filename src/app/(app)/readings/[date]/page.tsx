import { notFound } from "next/navigation";
import { requireUser } from "@/lib/authz";
import { getReadingByDate } from "@/lib/readings";
import { ReadingView } from "@/components/reading-view";

function formatLongDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type Params = Promise<{ date: string }>;

export default async function ReadingByDatePage({ params }: { params: Params }) {
  await requireUser();
  const { date } = await params;
  if (!DATE_RE.test(date)) notFound();

  const reading = await getReadingByDate(date);
  if (!reading) notFound();

  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs uppercase tracking-wide text-gray-500">Reading</p>
        <h2 className="text-xl font-semibold">{formatLongDate(date)}</h2>
      </header>
      <ReadingView reading={reading} />
    </div>
  );
}
