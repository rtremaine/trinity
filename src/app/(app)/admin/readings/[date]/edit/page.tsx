import { notFound } from "next/navigation";
import { listBooks } from "@/lib/bible";
import { requireRole } from "@/lib/authz";
import { getReadingByDate } from "@/lib/readings";
import { ReadingForm } from "@/components/reading-form";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type Params = Promise<{ date: string }>;

export default async function EditReadingPage({ params }: { params: Params }) {
  await requireRole("admin");
  const { date } = await params;
  if (!DATE_RE.test(date)) notFound();

  const [books, reading] = await Promise.all([
    listBooks(),
    getReadingByDate(date),
  ]);

  if (!reading) notFound();

  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs uppercase tracking-wide text-gray-500">Admin · Edit</p>
        <h2 className="text-xl font-semibold">Reading for {date}</h2>
      </header>
      <ReadingForm
        books={books}
        initial={{
          date: reading.date,
          commentary: reading.commentary ?? "",
          ranges: reading.ranges.map((r) => ({
            bookId: r.bookId,
            chapter: r.chapter,
            verseStart: r.verseStart,
            verseEnd: r.verseEnd,
          })),
        }}
      />
    </div>
  );
}
