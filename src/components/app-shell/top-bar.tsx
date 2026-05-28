"use client";

import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/(auth)/actions";

const TITLES: Array<{ match: (path: string) => boolean; title: string }> = [
  { match: (p) => p === "/today", title: "Today" },
  { match: (p) => p === "/archive", title: "Archive" },
  { match: (p) => p.startsWith("/readings/"), title: "Reading" },
  { match: (p) => p === "/admin", title: "Admin" },
  { match: (p) => p === "/admin/readings", title: "Daily readings" },
  { match: (p) => p === "/admin/readings/new", title: "New reading" },
  { match: (p) => /^\/admin\/readings\/[^/]+\/edit$/.test(p), title: "Edit reading" },
];

export function TopBar() {
  const pathname = usePathname();
  const title = TITLES.find((t) => t.match(pathname))?.title ?? "Trinity";

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 pt-safe backdrop-blur supports-backdrop-filter:bg-white/70 dark:border-neutral-800 dark:bg-neutral-950/90 dark:supports-backdrop-filter:bg-neutral-950/70">
      <div className="mx-auto flex h-12 max-w-md items-center justify-between px-4">
        <h1 className="text-base font-semibold">{title}</h1>
        <form action={signOutAction}>
          <button
            type="submit"
            className="-mr-2 rounded px-2 py-1 text-xs text-gray-500 active:bg-gray-100 dark:text-neutral-400 dark:active:bg-neutral-800"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
