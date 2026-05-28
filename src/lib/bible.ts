import { and, asc, eq, gte, inArray, lte } from "drizzle-orm";
import { db } from "@/db";
import { books, verses, type Book, type Verse } from "@/db/schema";

export type VerseRange = {
  bookId: number;
  chapter: number;
  verseStart: number;
  verseEnd: number;
};

export type LoadedRange = VerseRange & {
  book: Book;
  verses: Verse[];
};

export async function listBooks(): Promise<Book[]> {
  return db.select().from(books).orderBy(asc(books.orderIdx));
}

export async function getBookById(id: number): Promise<Book | undefined> {
  const [b] = await db.select().from(books).where(eq(books.id, id)).limit(1);
  return b;
}

export async function getBookBySlug(slug: string): Promise<Book | undefined> {
  const [b] = await db.select().from(books).where(eq(books.slug, slug)).limit(1);
  return b;
}

export async function loadRanges(ranges: VerseRange[]): Promise<LoadedRange[]> {
  if (ranges.length === 0) return [];

  const bookIds = Array.from(new Set(ranges.map((r) => r.bookId)));
  const bookRows = await db
    .select()
    .from(books)
    .where(inArray(books.id, bookIds));
  const bookMap = new Map(bookRows.map((b) => [b.id, b]));

  return Promise.all(
    ranges.map(async (r) => {
      const book = bookMap.get(r.bookId);
      if (!book) throw new Error(`Unknown book id ${r.bookId}`);
      const rows = await db
        .select()
        .from(verses)
        .where(
          and(
            eq(verses.bookId, r.bookId),
            eq(verses.chapter, r.chapter),
            gte(verses.verseNum, r.verseStart),
            lte(verses.verseNum, r.verseEnd)
          )
        )
        .orderBy(asc(verses.verseNum));
      return { ...r, book, verses: rows };
    })
  );
}

export function formatRef(
  book: Pick<Book, "name">,
  chapter: number,
  verseStart: number,
  verseEnd: number
): string {
  if (verseStart === verseEnd) {
    return `${book.name} ${chapter}:${verseStart}`;
  }
  return `${book.name} ${chapter}:${verseStart}-${verseEnd}`;
}
