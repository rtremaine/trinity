"use client";

import { useRef, useState } from "react";
import type { MentionInput, Participant } from "@/lib/comments";

type Options = {
  initialValue?: string;
  initialMentions?: MentionInput[];
};

/**
 * Shared `@`-mention behaviour for the comment composer and inline edit form.
 * Tracks the textarea value, the mentions chosen from the picker, and the open
 * autocomplete query. Mentions are reconciled against the final text on submit
 * (a mention is dropped if its "@Name" token was deleted).
 */
export function useMentionTextarea(
  participants: Participant[],
  options: Options = {}
) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(options.initialValue ?? "");
  const [selected, setSelected] = useState<MentionInput[]>(
    options.initialMentions ?? []
  );
  // null = picker closed; otherwise the partial text typed after the "@".
  const [query, setQuery] = useState<string | null>(null);
  const [anchor, setAnchor] = useState(0);

  function syncQuery(text: string, caret: number) {
    const upto = text.slice(0, caret);
    const at = upto.lastIndexOf("@");
    if (at === -1) {
      setQuery(null);
      return;
    }
    const before = at === 0 ? " " : upto[at - 1];
    const frag = upto.slice(at + 1);
    if (!/\s/.test(before) || frag.includes("\n")) {
      setQuery(null);
      return;
    }
    setAnchor(at);
    setQuery(frag);
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const next = e.target.value;
    setValue(next);
    syncQuery(next, e.target.selectionStart ?? next.length);
  }

  function handleCaret() {
    const el = ref.current;
    if (el) syncQuery(el.value, el.selectionStart ?? el.value.length);
  }

  const suggestions =
    query === null
      ? []
      : participants.filter((p) =>
          (p.name ?? "").toLowerCase().startsWith(query.toLowerCase())
        );

  function select(p: Participant) {
    const mentionText = `@${p.name ?? ""}`;
    const el = ref.current;
    const caret = el?.selectionStart ?? value.length;
    const next = `${value.slice(0, anchor)}${mentionText} ${value.slice(caret)}`;
    setValue(next);
    setSelected((prev) => [...prev, { userId: p.id, mentionText }]);
    setQuery(null);

    const pos = anchor + mentionText.length + 1;
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(pos, pos);
    });
  }

  /** Mentions still present in the text, de-duplicated by user. */
  function mentionsJSON(): string {
    const seen = new Set<string>();
    const kept = selected.filter((m) => {
      if (!value.includes(m.mentionText) || seen.has(m.userId)) return false;
      seen.add(m.userId);
      return true;
    });
    return JSON.stringify(kept);
  }

  function reset() {
    setValue("");
    setSelected([]);
    setQuery(null);
  }

  return {
    ref,
    value,
    query,
    suggestions,
    handleChange,
    handleCaret,
    select,
    mentionsJSON,
    reset,
  };
}
