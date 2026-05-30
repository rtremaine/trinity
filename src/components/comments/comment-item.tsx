"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  deleteCommentAction,
  editCommentAction,
  type CommentActionState,
} from "@/app/(app)/readings/[date]/comments/actions";
import { renderCommentNodes } from "@/lib/comment-render";
import type { CommentView, Participant } from "@/lib/comments";
import { useMentionTextarea } from "./use-mention-textarea";
import { MentionField } from "./mention-field";

function formatRelative(d: Date): string {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

function CommentBody({ comment }: { comment: CommentView }) {
  const nodes = renderCommentNodes(comment.body, comment.mentions);
  return (
    <div className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
      {nodes.map((n, i) =>
        n.type === "mention" ? (
          <span
            key={i}
            className="rounded bg-blue-100 px-1 font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
          >
            {n.text}
          </span>
        ) : (
          <span key={i}>{n.value}</span>
        )
      )}
    </div>
  );
}

export function CommentItem({
  comment,
  date,
  currentUserId,
  isAdmin,
  participants,
}: {
  comment: CommentView;
  date: string;
  currentUserId: string;
  isAdmin: boolean;
  participants: Participant[];
}) {
  const [editing, setEditing] = useState(false);
  const isOwner = currentUserId === comment.author.id;
  const canEdit = isOwner && !comment.isDeleted;
  const canDelete = (isOwner || isAdmin) && !comment.isDeleted;

  return (
    <li className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
        <span className="font-medium text-gray-700 dark:text-neutral-300">
          {comment.author.name ?? "Someone"}
        </span>
        <span>·</span>
        <span>{formatRelative(comment.createdAt)}</span>
        {comment.isEdited && <span className="italic">· edited</span>}
      </div>

      {comment.isDeleted ? (
        <p className="text-sm italic text-gray-400">comment removed</p>
      ) : editing ? (
        <EditForm
          comment={comment}
          date={date}
          participants={participants}
          onDone={() => setEditing(false)}
        />
      ) : (
        <>
          <CommentBody comment={comment} />
          {(canEdit || canDelete) && (
            <div className="mt-2 flex gap-3 text-xs text-gray-500">
              {canEdit && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="hover:text-gray-800 dark:hover:text-neutral-200"
                >
                  Edit
                </button>
              )}
              {canDelete && (
                <form action={deleteCommentAction}>
                  <input type="hidden" name="commentId" value={comment.id} />
                  <button
                    type="submit"
                    className="text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    Delete
                  </button>
                </form>
              )}
            </div>
          )}
        </>
      )}
    </li>
  );
}

function EditForm({
  comment,
  date,
  participants,
  onDone,
}: {
  comment: CommentView;
  date: string;
  participants: Participant[];
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState<
    CommentActionState,
    FormData
  >(editCommentAction, undefined);
  const field = useMentionTextarea(participants, {
    initialValue: comment.body,
    initialMentions: comment.mentions.map((m) => ({
      userId: m.mentionedUserId,
      mentionText: m.mentionText,
    })),
  });

  const wasPending = useRef(false);
  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) onDone();
    wasPending.current = pending;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending, state]);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="commentId" value={comment.id} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="mentions" value={field.mentionsJSON()} />
      <MentionField field={field} name="body" disabled={pending} />
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          {state.error}
        </p>
      )}
      <div className="flex gap-2 text-sm">
        <button
          type="submit"
          disabled={pending}
          className="h-9 rounded-lg bg-black px-3 font-medium text-white active:bg-black/90 disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="h-9 rounded-lg px-3 text-gray-600 active:bg-gray-100 dark:text-neutral-300 dark:active:bg-neutral-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
