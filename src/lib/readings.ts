import { asc, desc, eq, inArray, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  dailyReadingVerses,
  dailyReadings,
  type DailyReading,
  type DailyReadingVerse,
} from "@/db/schema";
import { loadRanges, type LoadedRange } from "./bible";

export type FullReading = DailyReading & {
  ranges: LoadedRange[];
};

/** Returns YYYY-MM-DD for "today" in the server's local time zone. */
export function todayDateStr(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function getReadingByDate(
  date: string
): Promise<FullReading | null> {
  const [reading] = await db
    .select()
    .from(dailyReadings)
    .where(eq(dailyReadings.date, date))
    .limit(1);

  if (!reading) return null;

  const rangeRows = await db
    .select()
    .from(dailyReadingVerses)
    .where(eq(dailyReadingVerses.readingId, reading.id))
    .orderBy(asc(dailyReadingVerses.position));

  const ranges = await loadRanges(
    rangeRows.map((r) => ({
      bookId: r.bookId,
      chapter: r.chapter,
      verseStart: r.verseStart,
      verseEnd: r.verseEnd,
    }))
  );

  return { ...reading, ranges };
}

export type ReadingSummary = {
  id: string;
  date: string;
  hasCommentary: boolean;
  rangeCount: number;
};

export async function listReadings(opts: {
  limit?: number;
  upTo?: string;
}): Promise<ReadingSummary[]> {
  const limit = opts.limit ?? 50;
  const where = opts.upTo ? lte(dailyReadings.date, opts.upTo) : undefined;

  const rows = await db
    .select({
      id: dailyReadings.id,
      date: dailyReadings.date,
      commentary: dailyReadings.commentary,
    })
    .from(dailyReadings)
    .where(where)
    .orderBy(desc(dailyReadings.date))
    .limit(limit);

  const ids = rows.map((r) => r.id);
  const counts = ids.length
    ? await db
        .select({
          id: dailyReadingVerses.readingId,
          count: sql<number>`count(*)::int`,
        })
        .from(dailyReadingVerses)
        .where(inArray(dailyReadingVerses.readingId, ids))
        .groupBy(dailyReadingVerses.readingId)
    : [];

  const countMap = new Map(counts.map((c) => [c.id, c.count]));

  return rows.map((r) => ({
    id: r.id,
    date: r.date,
    hasCommentary: !!r.commentary && r.commentary.trim().length > 0,
    rangeCount: countMap.get(r.id) ?? 0,
  }));
}

type RangeInput = {
  bookId: number;
  chapter: number;
  verseStart: number;
  verseEnd: number;
};

export async function upsertReading(input: {
  date: string;
  commentary: string | null;
  ranges: RangeInput[];
  createdBy: string;
}): Promise<string> {
  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ id: dailyReadings.id })
      .from(dailyReadings)
      .where(eq(dailyReadings.date, input.date))
      .limit(1);

    let readingId: string;
    if (existing) {
      await tx
        .update(dailyReadings)
        .set({ commentary: input.commentary, updatedAt: new Date() })
        .where(eq(dailyReadings.id, existing.id));
      readingId = existing.id;
      await tx
        .delete(dailyReadingVerses)
        .where(eq(dailyReadingVerses.readingId, readingId));
    } else {
      const [row] = await tx
        .insert(dailyReadings)
        .values({
          date: input.date,
          commentary: input.commentary,
          createdBy: input.createdBy,
        })
        .returning({ id: dailyReadings.id });
      readingId = row.id;
    }

    if (input.ranges.length > 0) {
      await tx.insert(dailyReadingVerses).values(
        input.ranges.map((r, i) => ({
          readingId,
          position: i,
          bookId: r.bookId,
          chapter: r.chapter,
          verseStart: r.verseStart,
          verseEnd: r.verseEnd,
        }))
      );
    }

    return readingId;
  });
}

export async function deleteReading(id: string): Promise<void> {
  await db.delete(dailyReadings).where(eq(dailyReadings.id, id));
}

export type { DailyReading, DailyReadingVerse };
