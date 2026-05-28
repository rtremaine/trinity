import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import type { AdapterAccountType } from "next-auth/adapters";

export const userRole = pgEnum("user_role", ["user", "admin"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("email_verified", { mode: "date", withTimezone: true }),
  image: text("image"),
  passwordHash: text("password_hash"),
  role: userRole("role").default("user").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    resource: text("resource"),
    resourceId: text("resource_id"),
    metadata: jsonb("metadata"),
    ip: text("ip"),
    userAgent: text("user_agent"),
    success: boolean("success").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("audit_logs_user_id_idx").on(t.userId),
    index("audit_logs_created_at_idx").on(t.createdAt),
    index("audit_logs_action_idx").on(t.action),
  ]
);

export const testament = pgEnum("testament", ["OT", "NT"]);

export const books = pgTable(
  "books",
  {
    id: smallint("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    shortName: text("short_name").notNull(),
    testament: testament("testament").notNull(),
    orderIdx: smallint("order_idx").notNull(),
    chapterCount: smallint("chapter_count").notNull(),
  },
  (t) => [uniqueIndex("books_order_idx_uq").on(t.orderIdx)]
);

export const verses = pgTable(
  "verses",
  {
    bookId: smallint("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    chapter: smallint("chapter").notNull(),
    verseNum: smallint("verse_num").notNull(),
    text: text("text").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.bookId, t.chapter, t.verseNum] }),
    index("verses_book_chapter_idx").on(t.bookId, t.chapter),
  ]
);

export const dailyReadings = pgTable(
  "daily_readings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    date: date("date", { mode: "string" }).notNull().unique(),
    commentary: text("commentary"),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("daily_readings_date_idx").on(t.date)]
);

export const dailyReadingVerses = pgTable(
  "daily_reading_verses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    readingId: uuid("reading_id")
      .notNull()
      .references(() => dailyReadings.id, { onDelete: "cascade" }),
    position: smallint("position").notNull(),
    bookId: smallint("book_id")
      .notNull()
      .references(() => books.id),
    chapter: smallint("chapter").notNull(),
    verseStart: smallint("verse_start").notNull(),
    verseEnd: smallint("verse_end").notNull(),
  },
  (t) => [
    index("drv_reading_idx").on(t.readingId, t.position),
    check(
      "drv_range_check",
      sql`${t.verseEnd} >= ${t.verseStart} AND ${t.verseStart} >= 1 AND ${t.chapter} >= 1`
    ),
  ]
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
export type Book = typeof books.$inferSelect;
export type Verse = typeof verses.$inferSelect;
export type DailyReading = typeof dailyReadings.$inferSelect;
export type DailyReadingVerse = typeof dailyReadingVerses.$inferSelect;
