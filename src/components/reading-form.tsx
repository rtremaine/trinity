"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { Book } from "@/db/schema";
import {
  upsertReadingAction,
  type UpsertState,
} from "@/app/(app)/admin/readings/actions";

type RangeInput = {
  bookId: number;
  chapter: number | "";
  verseStart: number | "";
  verseEnd: number | "";
};

export type ReadingFormProps = {
  books: Book[];
  initial?: {
    date: string;
    commentary: string;
    ranges: Array<{
      bookId: number;
      chapter: number;
      verseStart: number;
      verseEnd: number;
    }>;
  };
};

function blankRange(books: Book[]): RangeInput {
  return {
    bookId: books[0]?.id ?? 1,
    chapter: "",
    verseStart: "",
    verseEnd: "",
  };
}

export function ReadingForm({ books, initial }: ReadingFormProps) {
  const [state, formAction, pending] = useActionState<UpsertState, FormData>(
    upsertReadingAction,
    undefined
  );

  const [date, setDate] = useState(initial?.date ?? todayStr());
  const [commentary, setCommentary] = useState(initial?.commentary ?? "");
  const [ranges, setRanges] = useState<RangeInput[]>(
    initial?.ranges?.length
      ? initial.ranges.map((r) => ({
          bookId: r.bookId,
          chapter: r.chapter,
          verseStart: r.verseStart,
          verseEnd: r.verseEnd,
        }))
      : [blankRange(books)]
  );

  const update = (i: number, patch: Partial<RangeInput>) =>
    setRanges((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const remove = (i: number) =>
    setRanges((rs) => (rs.length > 1 ? rs.filter((_, idx) => idx !== i) : rs));

  const add = () => setRanges((rs) => [...rs, blankRange(books)]);

  const normalizedRanges = ranges
    .filter((r) => r.chapter !== "" && r.verseStart !== "")
    .map((r) => ({
      bookId: r.bookId,
      chapter: Number(r.chapter),
      verseStart: Number(r.verseStart),
      verseEnd: r.verseEnd === "" ? Number(r.verseStart) : Number(r.verseEnd),
    }));

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-1.5">
        <label htmlFor="date" className="text-sm font-medium">
          Date
        </label>
        <input
          id="date"
          name="date"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="block h-12 w-full rounded-lg border border-gray-300 bg-white px-3 text-base outline-none focus:border-black focus:ring-2 focus:ring-black/10 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-white dark:focus:ring-white/10"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h3 className="text-sm font-medium">Passages</h3>
          <span className="text-xs text-gray-500">{ranges.length} row{ranges.length === 1 ? "" : "s"}</span>
        </div>

        <ul className="space-y-3">
          {ranges.map((r, i) => (
            <li
              key={i}
              className="space-y-2 rounded-xl border border-gray-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-start gap-2">
                <select
                  value={r.bookId}
                  onChange={(e) => update(i, { bookId: Number(e.target.value) })}
                  className="h-12 flex-1 rounded-lg border border-gray-300 bg-white px-2 text-base dark:border-neutral-700 dark:bg-neutral-900"
                  aria-label="Book"
                >
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                {ranges.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    aria-label="Remove passage"
                    className="h-12 w-12 shrink-0 rounded-lg text-gray-400 active:bg-gray-100 dark:active:bg-neutral-800"
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                    </svg>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <NumField
                  label="Chapter"
                  value={r.chapter}
                  onChange={(v) => update(i, { chapter: v })}
                />
                <NumField
                  label="Start verse"
                  value={r.verseStart}
                  onChange={(v) => update(i, { verseStart: v })}
                />
                <NumField
                  label="End verse"
                  placeholder={r.verseStart === "" ? "—" : String(r.verseStart)}
                  value={r.verseEnd}
                  onChange={(v) => update(i, { verseEnd: v })}
                />
              </div>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={add}
          className="flex h-12 w-full items-center justify-center rounded-lg border border-dashed border-gray-300 text-sm text-gray-600 active:bg-gray-50 dark:border-neutral-700 dark:text-neutral-300 dark:active:bg-neutral-800"
        >
          + Add passage
        </button>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="commentary" className="text-sm font-medium">
          Commentary <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          id="commentary"
          name="commentary"
          rows={6}
          value={commentary}
          onChange={(e) => setCommentary(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base leading-relaxed outline-none focus:border-black focus:ring-2 focus:ring-black/10 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-white dark:focus:ring-white/10"
        />
      </div>

      <input type="hidden" name="ranges" value={JSON.stringify(normalizedRanges)} />

      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row-reverse">
        <button
          type="submit"
          disabled={pending}
          className="h-12 flex-1 rounded-lg bg-black px-4 text-base font-medium text-white active:bg-black/90 disabled:opacity-50 dark:bg-white dark:text-black dark:active:bg-white/90"
        >
          {pending ? "Saving…" : "Save reading"}
        </button>
        <Link
          href="/admin/readings"
          className="flex h-12 flex-1 items-center justify-center rounded-lg border border-gray-300 text-base font-medium dark:border-neutral-700"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

function NumField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: number | "";
  onChange: (v: number | "") => void;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs text-gray-500">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === "" ? "" : Number(v));
        }}
        className="block h-12 w-full rounded-lg border border-gray-300 bg-white px-3 text-base dark:border-neutral-700 dark:bg-neutral-900"
      />
    </label>
  );
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}
