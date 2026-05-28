CREATE TYPE "public"."testament" AS ENUM('OT', 'NT');--> statement-breakpoint
CREATE TABLE "books" (
	"id" smallint PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"short_name" text NOT NULL,
	"testament" "testament" NOT NULL,
	"order_idx" smallint NOT NULL,
	"chapter_count" smallint NOT NULL,
	CONSTRAINT "books_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "daily_reading_verses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reading_id" uuid NOT NULL,
	"position" smallint NOT NULL,
	"book_id" smallint NOT NULL,
	"chapter" smallint NOT NULL,
	"verse_start" smallint NOT NULL,
	"verse_end" smallint NOT NULL,
	CONSTRAINT "drv_range_check" CHECK ("daily_reading_verses"."verse_end" >= "daily_reading_verses"."verse_start" AND "daily_reading_verses"."verse_start" >= 1 AND "daily_reading_verses"."chapter" >= 1)
);
--> statement-breakpoint
CREATE TABLE "daily_readings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"commentary" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "daily_readings_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "verses" (
	"book_id" smallint NOT NULL,
	"chapter" smallint NOT NULL,
	"verse_num" smallint NOT NULL,
	"text" text NOT NULL,
	CONSTRAINT "verses_book_id_chapter_verse_num_pk" PRIMARY KEY("book_id","chapter","verse_num")
);
--> statement-breakpoint
ALTER TABLE "daily_reading_verses" ADD CONSTRAINT "daily_reading_verses_reading_id_daily_readings_id_fk" FOREIGN KEY ("reading_id") REFERENCES "public"."daily_readings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_reading_verses" ADD CONSTRAINT "daily_reading_verses_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_readings" ADD CONSTRAINT "daily_readings_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verses" ADD CONSTRAINT "verses_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "books_order_idx_uq" ON "books" USING btree ("order_idx");--> statement-breakpoint
CREATE INDEX "drv_reading_idx" ON "daily_reading_verses" USING btree ("reading_id","position");--> statement-breakpoint
CREATE INDEX "daily_readings_date_idx" ON "daily_readings" USING btree ("date");--> statement-breakpoint
CREATE INDEX "verses_book_chapter_idx" ON "verses" USING btree ("book_id","chapter");