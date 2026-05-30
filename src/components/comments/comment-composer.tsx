"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createCommentAction,
  type CommentActionState,
} from "@/app/(app)/readings/[date]/comments/actions";
import type { Participant } from "@/lib/comments";
import { useMentionTextarea } from "./use-mention-textarea";
import { MentionField } from "./mention-field";

export function CommentComposer({
  readingId,
  date,
  participants,
}: {
  readingId: string;
  date: string;
  participants: Participant[];
}) {
  const [state, formAction, pending] = useActionState<
    CommentActionState,
    FormData
  >(createCommentAction, undefined);
  const field = useMentionTextarea(participants);

  // Clear the textarea once a submit completes without error.
  const wasPending = useRef(false);
  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) field.reset();
    wasPending.current = pending;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending, state]);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="readingId" value={readingId} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="mentions" value={field.mentionsJSON()} />
      <MentionField
        field={field}
        name="body"
        disabled={pending}
        placeholder={
          participants.length > 0
            ? "Add a comment… type @ to mention someone"
            : "Add a comment…"
        }
      />
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          {state.error}
        </p>
      )}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="h-10 rounded-lg bg-black px-4 text-sm font-medium text-white active:bg-black/90 disabled:opacity-50 dark:bg-white dark:text-black dark:active:bg-white/90"
        >
          {pending ? "Posting…" : "Post"}
        </button>
      </div>
    </form>
  );
}
