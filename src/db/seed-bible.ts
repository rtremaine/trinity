import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import { books, verses } from "./schema";
import { BIBLE_BOOKS } from "./bible-books";

const TARBALL_URL =
  "https://codeload.github.com/benkaiser/webbe-json/tar.gz/refs/heads/master";
const DATA_DIR = path.join(process.cwd(), "data");
const EXTRACT_DIR = path.join(DATA_DIR, "webbe-json-master");
const CHAPTERS_FILE = path.join(EXTRACT_DIR, "chapters.json");
const CHAPTER_DATA_DIR = path.join(EXTRACT_DIR, "data");

type ChapterFile = {
  reference: string;
  verses: Array<{
    book_id: string;
    book_name: string;
    chapter: number;
    verse: number;
    text: string;
  }>;
};

async function ensureData() {
  if (existsSync(CHAPTERS_FILE)) return;

  mkdirSync(DATA_DIR, { recursive: true });
  const tarballPath = path.join(DATA_DIR, "webbe.tar.gz");

  console.log(`Downloading WEB Bible from ${TARBALL_URL}...`);
  const res = await fetch(TARBALL_URL);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(tarballPath, buf);
  console.log(`Downloaded ${(buf.length / 1024 / 1024).toFixed(2)} MB.`);

  console.log("Extracting...");
  execFileSync("tar", ["-xzf", tarballPath, "-C", DATA_DIR]);
  if (!existsSync(CHAPTERS_FILE)) {
    throw new Error(`chapters.json not found after extraction at ${CHAPTERS_FILE}`);
  }
}

function normalizeText(t: string): string {
  return t.replace(/\s+/g, " ").trim();
}

// benkaiser/webbe-json is missing or corrupt for single-chapter books
// (Philemon has zero data; 2 John / 3 John / Jude only ship verse 1).
// We backfill those from bible-api.com which has WEB.
const BACKFILL_FROM_BIBLE_API: Array<{
  slug: string;
  apiRange: string;
}> = [
  { slug: "philemon", apiRange: "philemon+1:1-25" },
  { slug: "2-john", apiRange: "2john+1:1-13" },
  { slug: "3-john", apiRange: "3john+1:1-14" },
  { slug: "jude", apiRange: "jude+1:1-25" },
];
const BACKFILL_SLUGS = new Set(BACKFILL_FROM_BIBLE_API.map((b) => b.slug));

async function fetchBackfill(apiRange: string) {
  const res = await fetch(
    `https://bible-api.com/${apiRange}?translation=web`
  );
  if (!res.ok) throw new Error(`bible-api fetch failed (${res.status}): ${apiRange}`);
  const data = (await res.json()) as {
    verses: Array<{ chapter: number; verse: number; text: string }>;
  };
  return data.verses;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");

  await ensureData();

  const chapters = JSON.parse(readFileSync(CHAPTERS_FILE, "utf-8")) as Record<
    string,
    number
  >;

  const client = postgres(url, { max: 1 });
  const db = drizzle(client);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(verses);

  if (count > 0) {
    console.log(`Verses already seeded (${count} rows). Skipping.`);
    await client.end();
    return;
  }

  console.log("Inserting books...");
  await db
    .insert(books)
    .values(
      BIBLE_BOOKS.map((b) => ({
        id: b.id,
        slug: b.slug,
        name: b.name,
        shortName: b.shortName,
        testament: b.testament,
        orderIdx: b.id,
        chapterCount: chapters[b.dataSlug] ?? 0,
      }))
    )
    .onConflictDoNothing();

  console.log("Inserting verses...");
  let totalVerses = 0;

  for (const book of BIBLE_BOOKS) {
    let rows: { bookId: number; chapter: number; verseNum: number; text: string }[] =
      [];

    if (BACKFILL_SLUGS.has(book.slug)) {
      const backfill = BACKFILL_FROM_BIBLE_API.find((b) => b.slug === book.slug)!;
      const fetched = await fetchBackfill(backfill.apiRange);
      rows = fetched.map((v) => ({
        bookId: book.id,
        chapter: v.chapter,
        verseNum: v.verse,
        text: normalizeText(v.text),
      }));
    } else {
      const chapterCount = chapters[book.dataSlug];
      if (!chapterCount) {
        console.warn(`No chapter count for ${book.name} (${book.dataSlug}); skipping`);
        continue;
      }
      for (let ch = 1; ch <= chapterCount; ch++) {
        const file = path.join(CHAPTER_DATA_DIR, `${book.dataSlug}${ch}.json`);
        if (!existsSync(file)) {
          throw new Error(`Missing chapter file: ${file}`);
        }
        const chap = JSON.parse(readFileSync(file, "utf-8")) as ChapterFile;
        for (const v of chap.verses) {
          rows.push({
            bookId: book.id,
            chapter: v.chapter,
            verseNum: v.verse,
            text: normalizeText(v.text),
          });
        }
      }
    }

    // Insert in batches of 500 to keep parameter counts well under the
    // postgres-js default and avoid huge single statements.
    const BATCH = 500;
    for (let i = 0; i < rows.length; i += BATCH) {
      await db.insert(verses).values(rows.slice(i, i + BATCH));
    }
    totalVerses += rows.length;
    console.log(`  ${book.name}: ${rows.length} verses`);
  }

  console.log(`Done. Inserted ${totalVerses} verses across ${BIBLE_BOOKS.length} books.`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
