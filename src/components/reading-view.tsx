import { formatRef } from "@/lib/bible";
import type { FullReading } from "@/lib/readings";

export function ReadingView({ reading }: { reading: FullReading }) {
  return (
    <div className="space-y-6">
      {reading.ranges.length === 0 ? (
        <p className="text-sm text-gray-500">No verses were attached to this reading.</p>
      ) : (
        reading.ranges.map((r) => (
          <section
            key={`${r.bookId}-${r.chapter}-${r.verseStart}-${r.verseEnd}`}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
          >
            <h3 className="mb-3 text-sm font-semibold tracking-tight">
              {formatRef(r.book, r.chapter, r.verseStart, r.verseEnd)}
            </h3>
            <div className="space-y-2 leading-relaxed">
              {r.verses.map((v) => (
                <p key={v.verseNum} className="text-[15px]">
                  <sup className="mr-1 text-[10px] font-semibold text-gray-400">
                    {v.verseNum}
                  </sup>
                  {v.text}
                </p>
              ))}
            </div>
          </section>
        ))
      )}

      {reading.commentary && reading.commentary.trim().length > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            Commentary
          </h3>
          <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
            {reading.commentary}
          </div>
        </section>
      )}
    </div>
  );
}
