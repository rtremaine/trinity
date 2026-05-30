"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ForbiddenError, requireUserApi } from "@/lib/authz";
import { recordAudit } from "@/lib/audit";
import {
  CommentError,
  createComment,
  editComment,
  softDeleteComment,
} from "@/lib/comments";

const mentionSchema = z.object({
  userId: z.string().uuid(),
  mentionText: z.string().min(1).max(120),
});

const baseSchema = {
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Bad date"),
  body: z.string().trim().min(1, "Comment can't be empty").max(4000),
  mentions: z.array(mentionSchema).max(20),
};

const createSchema = z.object({
  readingId: z.string().uuid(),
  ...baseSchema,
});

const editSchema = z.object({
  commentId: z.string().uuid(),
  ...baseSchema,
});

export type CommentActionState = { error?: string } | undefined;

function parseMentions(formData: FormData): unknown {
  try {
    return JSON.parse(String(formData.get("mentions") ?? "[]"));
  } catch {
    return null;
  }
}

function revalidateReading(date: string) {
  revalidatePath(`/readings/${date}`);
  revalidatePath("/today");
  revalidatePath("/mentions");
}

export async function createCommentAction(
  _prev: CommentActionState,
  formData: FormData
): Promise<CommentActionState> {
  const user = await requireUserApi();

  const mentions = parseMentions(formData);
  if (mentions === null) return { error: "Could not read mentions" };

  const parsed = createSchema.safeParse({
    readingId: formData.get("readingId"),
    date: formData.get("date"),
    body: formData.get("body"),
    mentions,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  let commentId: string;
  try {
    commentId = await createComment({
      readingId: parsed.data.readingId,
      userId: user.id,
      body: parsed.data.body,
      mentions: parsed.data.mentions,
    });
  } catch (err) {
    if (err instanceof CommentError) return { error: err.message };
    throw err;
  }

  await recordAudit({
    action: "comment.create",
    userId: user.id,
    resource: "comment",
    resourceId: commentId,
    metadata: {
      readingId: parsed.data.readingId,
      mentionCount: parsed.data.mentions.length,
    },
  });

  revalidateReading(parsed.data.date);
  return undefined;
}

export async function editCommentAction(
  _prev: CommentActionState,
  formData: FormData
): Promise<CommentActionState> {
  const user = await requireUserApi();

  const mentions = parseMentions(formData);
  if (mentions === null) return { error: "Could not read mentions" };

  const parsed = editSchema.safeParse({
    commentId: formData.get("commentId"),
    date: formData.get("date"),
    body: formData.get("body"),
    mentions,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await editComment({
      commentId: parsed.data.commentId,
      actingUser: { id: user.id, role: user.role },
      body: parsed.data.body,
      mentions: parsed.data.mentions,
    });
  } catch (err) {
    if (err instanceof CommentError || err instanceof ForbiddenError) {
      return { error: err.message };
    }
    throw err;
  }

  await recordAudit({
    action: "comment.edit",
    userId: user.id,
    resource: "comment",
    resourceId: parsed.data.commentId,
  });

  revalidateReading(parsed.data.date);
  return undefined;
}

export async function deleteCommentAction(formData: FormData): Promise<void> {
  const user = await requireUserApi();
  const commentId = String(formData.get("commentId") ?? "");
  if (!commentId) return;

  let readingDate = "";
  try {
    ({ readingDate } = await softDeleteComment({
      commentId,
      actingUser: { id: user.id, role: user.role },
    }));
  } catch (err) {
    if (err instanceof ForbiddenError) return;
    throw err;
  }

  await recordAudit({
    action: "comment.delete",
    userId: user.id,
    resource: "comment",
    resourceId: commentId,
    metadata: { byAdmin: user.role === "admin" },
  });

  if (readingDate) revalidateReading(readingDate);
}
