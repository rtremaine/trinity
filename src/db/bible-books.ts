// Protestant canon (66 books) in canonical order. The `dataSlug` matches
// the lowercased concatenated form used by benkaiser/webbe-json
// (e.g. "1samuel", "songofsolomon", "1corinthians"). The `slug` we store
// in our DB is the URL-friendly kebab-case variant.

export type BookMeta = {
  id: number;
  slug: string;
  name: string;
  shortName: string;
  testament: "OT" | "NT";
  dataSlug: string;
};

export const BIBLE_BOOKS: BookMeta[] = [
  { id: 1, slug: "genesis", name: "Genesis", shortName: "Gen", testament: "OT", dataSlug: "genesis" },
  { id: 2, slug: "exodus", name: "Exodus", shortName: "Exod", testament: "OT", dataSlug: "exodus" },
  { id: 3, slug: "leviticus", name: "Leviticus", shortName: "Lev", testament: "OT", dataSlug: "leviticus" },
  { id: 4, slug: "numbers", name: "Numbers", shortName: "Num", testament: "OT", dataSlug: "numbers" },
  { id: 5, slug: "deuteronomy", name: "Deuteronomy", shortName: "Deut", testament: "OT", dataSlug: "deuteronomy" },
  { id: 6, slug: "joshua", name: "Joshua", shortName: "Josh", testament: "OT", dataSlug: "joshua" },
  { id: 7, slug: "judges", name: "Judges", shortName: "Judg", testament: "OT", dataSlug: "judges" },
  { id: 8, slug: "ruth", name: "Ruth", shortName: "Ruth", testament: "OT", dataSlug: "ruth" },
  { id: 9, slug: "1-samuel", name: "1 Samuel", shortName: "1 Sam", testament: "OT", dataSlug: "1samuel" },
  { id: 10, slug: "2-samuel", name: "2 Samuel", shortName: "2 Sam", testament: "OT", dataSlug: "2samuel" },
  { id: 11, slug: "1-kings", name: "1 Kings", shortName: "1 Kgs", testament: "OT", dataSlug: "1kings" },
  { id: 12, slug: "2-kings", name: "2 Kings", shortName: "2 Kgs", testament: "OT", dataSlug: "2kings" },
  { id: 13, slug: "1-chronicles", name: "1 Chronicles", shortName: "1 Chr", testament: "OT", dataSlug: "1chronicles" },
  { id: 14, slug: "2-chronicles", name: "2 Chronicles", shortName: "2 Chr", testament: "OT", dataSlug: "2chronicles" },
  { id: 15, slug: "ezra", name: "Ezra", shortName: "Ezra", testament: "OT", dataSlug: "ezra" },
  { id: 16, slug: "nehemiah", name: "Nehemiah", shortName: "Neh", testament: "OT", dataSlug: "nehemiah" },
  { id: 17, slug: "esther", name: "Esther", shortName: "Esth", testament: "OT", dataSlug: "esther" },
  { id: 18, slug: "job", name: "Job", shortName: "Job", testament: "OT", dataSlug: "job" },
  { id: 19, slug: "psalms", name: "Psalms", shortName: "Ps", testament: "OT", dataSlug: "psalms" },
  { id: 20, slug: "proverbs", name: "Proverbs", shortName: "Prov", testament: "OT", dataSlug: "proverbs" },
  { id: 21, slug: "ecclesiastes", name: "Ecclesiastes", shortName: "Eccl", testament: "OT", dataSlug: "ecclesiastes" },
  { id: 22, slug: "song-of-solomon", name: "Song of Solomon", shortName: "Song", testament: "OT", dataSlug: "songofsolomon" },
  { id: 23, slug: "isaiah", name: "Isaiah", shortName: "Isa", testament: "OT", dataSlug: "isaiah" },
  { id: 24, slug: "jeremiah", name: "Jeremiah", shortName: "Jer", testament: "OT", dataSlug: "jeremiah" },
  { id: 25, slug: "lamentations", name: "Lamentations", shortName: "Lam", testament: "OT", dataSlug: "lamentations" },
  { id: 26, slug: "ezekiel", name: "Ezekiel", shortName: "Ezek", testament: "OT", dataSlug: "ezekiel" },
  { id: 27, slug: "daniel", name: "Daniel", shortName: "Dan", testament: "OT", dataSlug: "daniel" },
  { id: 28, slug: "hosea", name: "Hosea", shortName: "Hos", testament: "OT", dataSlug: "hosea" },
  { id: 29, slug: "joel", name: "Joel", shortName: "Joel", testament: "OT", dataSlug: "joel" },
  { id: 30, slug: "amos", name: "Amos", shortName: "Amos", testament: "OT", dataSlug: "amos" },
  { id: 31, slug: "obadiah", name: "Obadiah", shortName: "Obad", testament: "OT", dataSlug: "obadiah" },
  { id: 32, slug: "jonah", name: "Jonah", shortName: "Jonah", testament: "OT", dataSlug: "jonah" },
  { id: 33, slug: "micah", name: "Micah", shortName: "Mic", testament: "OT", dataSlug: "micah" },
  { id: 34, slug: "nahum", name: "Nahum", shortName: "Nah", testament: "OT", dataSlug: "nahum" },
  { id: 35, slug: "habakkuk", name: "Habakkuk", shortName: "Hab", testament: "OT", dataSlug: "habakkuk" },
  { id: 36, slug: "zephaniah", name: "Zephaniah", shortName: "Zeph", testament: "OT", dataSlug: "zephaniah" },
  { id: 37, slug: "haggai", name: "Haggai", shortName: "Hag", testament: "OT", dataSlug: "haggai" },
  { id: 38, slug: "zechariah", name: "Zechariah", shortName: "Zech", testament: "OT", dataSlug: "zechariah" },
  { id: 39, slug: "malachi", name: "Malachi", shortName: "Mal", testament: "OT", dataSlug: "malachi" },
  { id: 40, slug: "matthew", name: "Matthew", shortName: "Matt", testament: "NT", dataSlug: "matthew" },
  { id: 41, slug: "mark", name: "Mark", shortName: "Mark", testament: "NT", dataSlug: "mark" },
  { id: 42, slug: "luke", name: "Luke", shortName: "Luke", testament: "NT", dataSlug: "luke" },
  { id: 43, slug: "john", name: "John", shortName: "John", testament: "NT", dataSlug: "john" },
  { id: 44, slug: "acts", name: "Acts", shortName: "Acts", testament: "NT", dataSlug: "acts" },
  { id: 45, slug: "romans", name: "Romans", shortName: "Rom", testament: "NT", dataSlug: "romans" },
  { id: 46, slug: "1-corinthians", name: "1 Corinthians", shortName: "1 Cor", testament: "NT", dataSlug: "1corinthians" },
  { id: 47, slug: "2-corinthians", name: "2 Corinthians", shortName: "2 Cor", testament: "NT", dataSlug: "2corinthians" },
  { id: 48, slug: "galatians", name: "Galatians", shortName: "Gal", testament: "NT", dataSlug: "galatians" },
  { id: 49, slug: "ephesians", name: "Ephesians", shortName: "Eph", testament: "NT", dataSlug: "ephesians" },
  { id: 50, slug: "philippians", name: "Philippians", shortName: "Phil", testament: "NT", dataSlug: "philippians" },
  { id: 51, slug: "colossians", name: "Colossians", shortName: "Col", testament: "NT", dataSlug: "colossians" },
  { id: 52, slug: "1-thessalonians", name: "1 Thessalonians", shortName: "1 Thess", testament: "NT", dataSlug: "1thessalonians" },
  { id: 53, slug: "2-thessalonians", name: "2 Thessalonians", shortName: "2 Thess", testament: "NT", dataSlug: "2thessalonians" },
  { id: 54, slug: "1-timothy", name: "1 Timothy", shortName: "1 Tim", testament: "NT", dataSlug: "1timothy" },
  { id: 55, slug: "2-timothy", name: "2 Timothy", shortName: "2 Tim", testament: "NT", dataSlug: "2timothy" },
  { id: 56, slug: "titus", name: "Titus", shortName: "Titus", testament: "NT", dataSlug: "titus" },
  { id: 57, slug: "philemon", name: "Philemon", shortName: "Phlm", testament: "NT", dataSlug: "philemon" },
  { id: 58, slug: "hebrews", name: "Hebrews", shortName: "Heb", testament: "NT", dataSlug: "hebrews" },
  { id: 59, slug: "james", name: "James", shortName: "Jas", testament: "NT", dataSlug: "james" },
  { id: 60, slug: "1-peter", name: "1 Peter", shortName: "1 Pet", testament: "NT", dataSlug: "1peter" },
  { id: 61, slug: "2-peter", name: "2 Peter", shortName: "2 Pet", testament: "NT", dataSlug: "2peter" },
  { id: 62, slug: "1-john", name: "1 John", shortName: "1 John", testament: "NT", dataSlug: "1john" },
  { id: 63, slug: "2-john", name: "2 John", shortName: "2 John", testament: "NT", dataSlug: "2john" },
  { id: 64, slug: "3-john", name: "3 John", shortName: "3 John", testament: "NT", dataSlug: "3john" },
  { id: 65, slug: "jude", name: "Jude", shortName: "Jude", testament: "NT", dataSlug: "jude" },
  { id: 66, slug: "revelation", name: "Revelation", shortName: "Rev", testament: "NT", dataSlug: "revelation" },
];
