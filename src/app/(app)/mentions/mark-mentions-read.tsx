"use client";

import { useEffect } from "react";
import { markMentionsReadAction } from "./actions";

/** Marks the viewer's mentions as read once, on mount. Renders nothing. */
export function MarkMentionsRead({ hasUnread }: { hasUnread: boolean }) {
  useEffect(() => {
    if (hasUnread) void markMentionsReadAction();
  }, [hasUnread]);
  return null;
}
