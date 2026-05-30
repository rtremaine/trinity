import { listComments, listParticipants } from "@/lib/comments";
import { CommentComposer } from "./comment-composer";
import { CommentItem } from "./comment-item";

export async function CommentSection({
  readingId,
  date,
  currentUserId,
  isAdmin,
}: {
  readingId: string;
  date: string;
  currentUserId: string;
  isAdmin: boolean;
}) {
  const [comments, participants] = await Promise.all([
    listComments(readingId),
    listParticipants(readingId),
  ]);

  return (
    <section className="space-y-4">
      <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500">
        Discussion
        {comments.length > 0 && (
          <span className="ml-1 text-gray-400">({comments.length})</span>
        )}
      </h3>

      {comments.length === 0 ? (
        <p className="text-sm text-gray-500">
          No comments yet. Start the conversation.
        </p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              date={date}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              participants={participants}
            />
          ))}
        </ul>
      )}

      <CommentComposer
        readingId={readingId}
        date={date}
        participants={participants}
      />
    </section>
  );
}
