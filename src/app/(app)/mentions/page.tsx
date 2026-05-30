import Link from "next/link";
import { requireUser } from "@/lib/authz";
import { listMentionsForUser } from "@/lib/comments";
import { MarkMentionsRead } from "./mark-mentions-read";

function formatLongDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function MentionsPage() {
  const user = await requireUser();
  const mentions = await listMentionsForUser(user.id);
  const hasUnread = mentions.some((m) => m.readAt === null);

  return (
    <div className="space-y-4">
      <MarkMentionsRead hasUnread={hasUnread} />
      <header>
        <p className="text-xs uppercase tracking-wide text-gray-500">Mentions</p>
        <h2 className="text-xl font-semibold">When people @ you</h2>
      </header>

      {mentions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <p className="text-sm font-medium">No mentions yet</p>
          <p className="mt-1 text-xs text-gray-500">
            You&rsquo;ll see a note here whenever someone @-mentions you in a
            reading discussion.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {mentions.map((m) => (
            <li key={m.mentionId}>
              <Link
                href={`/readings/${m.readingDate}`}
                className={`block rounded-xl border p-3 shadow-sm active:bg-gray-50 dark:active:bg-neutral-800 ${
                  m.readAt === null
                    ? "border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-900/10"
                    : "border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
                }`}
              >
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="font-medium text-gray-700 dark:text-neutral-300">
                    {m.authorName ?? "Someone"}
                  </span>
                  <span>mentioned you</span>
                  {m.readAt === null && (
                    <span
                      aria-label="unread"
                      className="ml-auto h-2 w-2 rounded-full bg-blue-500"
                    />
                  )}
                </div>
                <p className="mt-1 text-sm">
                  {m.isCommentDeleted ? (
                    <span className="italic text-gray-400">comment removed</span>
                  ) : (
                    m.snippet
                  )}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {formatLongDate(m.readingDate)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
