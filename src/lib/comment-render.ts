import type { CommentMentionView } from "./comments";

export type CommentNode =
  | { type: "text"; value: string }
  | { type: "mention"; userId: string; text: string };

/**
 * Split a comment body into plain-text and mention nodes by matching the stored
 * `mentionText` tokens (e.g. "@Ryan Tremaine") against the raw body.
 *
 * Each stored mention is consumed once, in document order, and longer tokens are
 * tried first so "@Ryan Tremaine" wins over "@Ryan". Any "@..." text that has no
 * matching stored mention is left as plain text. The body is never interpreted
 * as HTML — callers render text/mention nodes as React children only.
 */
export function renderCommentNodes(
  body: string,
  mentions: CommentMentionView[]
): CommentNode[] {
  if (mentions.length === 0) {
    return body ? [{ type: "text", value: body }] : [];
  }

  // Pool of available mention rows, longest token first.
  const pool = [...mentions].sort(
    (a, b) => b.mentionText.length - a.mentionText.length
  );

  const nodes: CommentNode[] = [];
  let text = "";
  let i = 0;

  const flush = () => {
    if (text) {
      nodes.push({ type: "text", value: text });
      text = "";
    }
  };

  while (i < body.length) {
    if (body[i] === "@") {
      const idx = pool.findIndex((m) => body.startsWith(m.mentionText, i));
      if (idx !== -1) {
        const [m] = pool.splice(idx, 1);
        flush();
        nodes.push({
          type: "mention",
          userId: m.mentionedUserId,
          text: m.mentionText,
        });
        i += m.mentionText.length;
        continue;
      }
    }
    text += body[i];
    i += 1;
  }

  flush();
  return nodes;
}
