"use client";

import type { useMentionTextarea } from "./use-mention-textarea";

type Field = ReturnType<typeof useMentionTextarea>;

export function MentionField({
  field,
  name,
  placeholder,
  disabled,
}: {
  field: Field;
  name: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <textarea
        ref={field.ref}
        name={name}
        value={field.value}
        onChange={field.handleChange}
        onKeyUp={field.handleCaret}
        onClick={field.handleCaret}
        placeholder={placeholder}
        disabled={disabled}
        rows={3}
        className="block w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-base outline-none focus:border-black focus:ring-2 focus:ring-black/10 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-white dark:focus:ring-white/10"
      />
      {field.suggestions.length > 0 && (
        <ul className="absolute z-30 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
          {field.suggestions.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                // mousedown (fires before blur) keeps focus in the textarea
                onMouseDown={(e) => {
                  e.preventDefault();
                  field.select(p);
                }}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-neutral-800"
              >
                @{p.name ?? "Unknown"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
