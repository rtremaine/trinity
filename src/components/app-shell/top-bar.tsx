"use client";

import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/(auth)/actions";

const TITLES: Record<string, string> = {
  "/dashboard": "Home",
  "/admin": "Admin",
};

export function TopBar() {
  const pathname = usePathname();
  const title = TITLES[pathname] ?? "Trinity";

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
