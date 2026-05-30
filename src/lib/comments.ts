import {
  and,
  asc,
  desc,
  eq,
  inArray,
  isNull,
  notInArray,
  sql,
} from "drizzle-orm";
import { db } from "@/db";
import {
  comments,
  commentMentions,
  dailyReadings,
  users,
  type Comment,
} from "@/db/schema";
import { ForbiddenError } from "./authz";

/** Thrown for invalid input the user can fix (e.g. mentioning a non-participant). */
export class CommentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CommentError";
  }
}

export type ActingUser = { id: string; role: "user" | "admin" };

export type MentionInput = { userId: string; mentionText: string };

export type CommentMentionView = {
  mentionedUserId: string;
  mentionText: string;
};

export type CommentView = {
  id: string;
  readingId: string;
  author: { id: string; name: string | null };
  body: string; // already blanked when deleted
  isDeleted: boolean;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
  mentions: CommentMentionView[];
};

export type Participant = { id: string; name: string | null };

/** updatedAt is set to now() on insert alongside createdAt, so treat sub-second
 * differences as "not edited". */
function isEdited(c: Pick<Comment, "createdAt" | "updatedAt" | "deletedAt">) {
  if (c.deletedAt) return false;
  return c.updatedAt.getTime() - c.createdAt.getTime() > 1000;
}

export async function listComments(readingId: string): Promise<CommentView[]> {
  const rows = await db
    .select({
      id: comments.id,
      readingId: comments.readingId,
      body: comments.body,
      deletedAt: comments.deletedAt,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
      authorId: users.id,
      authorName: users.name,
    })
    .from(comments)
    .innerJoin(users, eq(users.id, comments.userId))
    .where(eq(comments.readingId, readingId))
    .orderBy(asc(comments.createdAt));

  if (rows.length === 0) return [];

  const mentionRows = await db
    .select({
      commentId: commentMentions.commentId,
      mentionedUserId: commentMentions.mentionedUserId,
      mentionText: commentMentions.mentionText,
    })
    .from(commentMentions)
    .where(
      inArray(
        commentMentions.commentId,
        rows.map((r) => r.id)
      )
    );

  const mentionsByComment = new Map<string, CommentMentionView[]>();
  for (const m of mentionRows) {
    const list = mentionsByComment.get(m.commentId) ?? [];
    list.push({ mentionedUserId: m.mentionedUserId, mentionText: m.mentionText });
    mentionsByComment.set(m.commentId, list);
  }

  return rows.map((r) => {
    const deleted = !!r.deletedAt;
    return {
      id: r.id,
      readingId: r.readingId,
      author: { id: r.authorId, name: r.authorName },
      body: deleted ? "" : r.body,
      isDeleted: deleted,
      isEdited: isEdited(r),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      mentions: deleted ? [] : mentionsByComment.get(r.id) ?? [],
    };
  });
}

/** People who have left a (non-deleted) comment on this reading — the set that
 * can be @-mentioned. */
export async function listParticipants(
  readingId: string
): Promise<Participant[]> {
  const rows = await db
    .selectDistinct({ id: users.id, name: users.name })
    .from(comments)
    .innerJoin(users, eq(users.id, comments.userId))
    .where(and(eq(comments.readingId, readingId), isNull(comments.deletedAt)))
    .orderBy(asc(users.name));
  return rows;
}

function dedupeMentions(mentions: MentionInput[]): MentionInput[] {
  const seen = new Set<string>();
  const out: MentionInput[] = [];
  for (const m of mentions) {
    if (seen.has(m.userId)) continue;
    seen.add(m.userId);
    out.push(m);
  }
  return out;
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function participantIds(
  tx: Tx,
  readingId: string
): Promise<Set<string>> {
  const rows = await tx
    .selectDistinct({ id: comments.userId })
    .from(comments)
    .where(and(eq(comments.readingId, readingId), isNull(comments.deletedAt)));
  return new Set(rows.map((r) => r.id));
}

export async function createComment(input: {
  readingId: string;
  userId: string;
  body: string;
  mentions: MentionInput[];
}): Promise<string> {
  return db.transaction(async (tx) => {
    const [reading] = await tx
      .select({ id: dailyReadings.id })
      .from(dailyReadings)
      .where(eq(dailyReadings.id, input.readingId))
      .limit(1);
    if (!reading) throw new CommentError("That reading no longer exists");

    // Skip self-mentions; validate the rest are participants of this reading.
    const mentions = dedupeMentions(input.mentions).filter(
      (m) => m.userId !== input.userId
    );
    if (mentions.length > 0) {
      const participants = await participantIds(tx, input.readingId);
      for (const m of mentions) {
        if (!participants.has(m.userId)) {
          throw new CommentError(
            "You can only mention people who have commented here"
          );
        }
      }
    }

    const [row] = await tx
      .insert(comments)
      .values({
        readingId: input.readingId,
        userId: input.userId,
        body: input.body,
      })
      .returning({ id: comments.id });

    if (mentions.length > 0) {
      await tx.insert(commentMentions).values(
        mentions.map((m) => ({
          commentId: row.id,
          mentionedUserId: m.userId,
          mentionText: m.mentionText,
        }))
      );
    }

    return row.id;
  });
}

export async function editComment(input: {
  commentId: string;
  actingUser: ActingUser;
  body: string;
  mentions: MentionInput[];
}): Promise<{ readingDate: string }> {
  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({
        id: comments.id,
        userId: comments.userId,
        readingId: comments.readingId,
        deletedAt: comments.deletedAt,
        readingDate: dailyReadings.date,
      })
      .from(comments)
      .innerJoin(dailyReadings, eq(dailyReadings.id, comments.readingId))
      .where(eq(comments.id, input.commentId))
      .limit(1);

    if (!existing || existing.deletedAt) {
      throw new CommentError("That comment no longer exists");
    }
    // Admins can delete others' comments, but only the author may edit the words.
    if (existing.userId !== input.actingUser.id) {
      throw new ForbiddenError("You can't edit this comment");
    }

    const mentions = dedupeMentions(input.mentions).filter(
      (m) => m.userId !== existing.userId
    );
    if (mentions.length > 0) {
      const participants = await participantIds(tx, existing.readingId);
      for (const m of mentions) {
        if (!participants.has(m.userId)) {
          throw new CommentError(
            "You can only mention people who have commented here"
          );
        }
      }
    }

    await tx
      .update(comments)
      .set({ body: input.body, updatedAt: new Date() })
      .where(eq(comments.id, input.commentId));

    // Reconcile mention rows: drop the ones removed, add the new ones. Existing
    // rows keep their readAt so re-saving doesn't re-flag already-seen mentions.
    const keepIds = mentions.map((m) => m.userId);
    if (keepIds.length === 0) {
      await tx
        .delete(commentMentions)
        .where(eq(commentMentions.commentId, input.commentId));
    } else {
      await tx
        .delete(commentMentions)
        .where(
          and(
            eq(commentMentions.commentId, input.commentId),
            notInArray(commentMentions.mentionedUserId, keepIds)
          )
        );
      await tx
        .insert(commentMentions)
        .values(
          mentions.map((m) => ({
            commentId: input.commentId,
            mentionedUserId: m.userId,
            mentionText: m.mentionText,
          }))
        )
        .onConflictDoNothing({
          target: [commentMentions.commentId, commentMentions.mentionedUserId],
        });
    }

    return { readingDate: existing.readingDate };
  });
}

export async function softDeleteComment(input: {
  commentId: string;
  actingUser: ActingUser;
}): Promise<{ readingDate: string }> {
  const [existing] = await db
    .select({
      id: comments.id,
      userId: comments.userId,
      deletedAt: comments.deletedAt,
      readingDate: dailyReadings.date,
    })
    .from(comments)
    .innerJoin(dailyReadings, eq(dailyReadings.id, comments.readingId))
    .where(eq(comments.id, input.commentId))
    .limit(1);

  if (!existing || existing.deletedAt) {
    return { readingDate: existing?.readingDate ?? "" };
  }

  const isOwner = existing.userId === input.actingUser.id;
  if (!isOwner && input.actingUser.role !== "admin") {
    throw new ForbiddenError("You can't delete this comment");
  }

  // Blank the body so removed text can never leak; keep the row + mention rows
  // so existing chips and feed links stay coherent.
  await db
    .update(comments)
    .set({ body: "", deletedAt: new Date() })
    .where(eq(comments.id, input.commentId));

  return { readingDate: existing.readingDate };
}

export type MentionFeedItem = {
  mentionId: string;
  commentId: string;
  readingDate: string;
  authorName: string | null;
  snippet: string;
  isCommentDeleted: boolean;
  readAt: Date | null;
  createdAt: Date;
};

export async function listMentionsForUser(
  userId: string,
  limit = 50
): Promise<MentionFeedItem[]> {
  const rows = await db
    .select({
      mentionId: commentMentions.id,
      commentId: commentMentions.commentId,
      readAt: commentMentions.readAt,
      createdAt: commentMentions.createdAt,
      body: comments.body,
      deletedAt: comments.deletedAt,
      readingDate: dailyReadings.date,
      authorName: users.name,
    })
    .from(commentMentions)
    .innerJoin(comments, eq(comments.id, commentMentions.commentId))
    .innerJoin(dailyReadings, eq(dailyReadings.id, comments.readingId))
    .innerJoin(users, eq(users.id, comments.userId))
    .where(eq(commentMentions.mentionedUserId, userId))
    .orderBy(desc(commentMentions.createdAt))
    .limit(limit);

  return rows.map((r) => {
    const deleted = !!r.deletedAt;
    const text = deleted ? "" : r.body.replace(/\s+/g, " ").trim();
    return {
      mentionId: r.mentionId,
      commentId: r.commentId,
      readingDate: r.readingDate,
      authorName: r.authorName,
      snippet: text.length > 140 ? `${text.slice(0, 140)}…` : text,
      isCommentDeleted: deleted,
      readAt: r.readAt,
      createdAt: r.createdAt,
    };
  });
}

export async function unreadMentionCount(userId: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(commentMentions)
    .where(
      and(
        eq(commentMentions.mentionedUserId, userId),
        isNull(commentMentions.readAt)
      )
    );
  return row?.count ?? 0;
}

export async function markMentionsRead(userId: string): Promise<void> {
  await db
    .update(commentMentions)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(commentMentions.mentionedUserId, userId),
        isNull(commentMentions.readAt)
      )
    );
}
