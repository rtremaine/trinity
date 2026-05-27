"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-5h-2v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

export function BottomNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  const tabs: Tab[] = [
    { href: "/dashboard", label: "Home", icon: <HomeIcon /> },
    ...(isAdmin ? [{ href: "/admin", label: "Admin", icon: <ShieldIcon /> }] : []),
  ];

  return (
    <nav
      aria-label="Primary"
      className="sticky bottom-0 z-20 border-t border-gray-200 bg-white/90 pb-safe backdrop-blur supports-backdrop-filter:bg-white/70 dark:border-neutral-800 dark:bg-neutral-950/90 dark:supports-backdrop-filter:bg-neutral-950/70"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {tabs.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-14 flex-col items-center justify-center gap-1 text-xs ${
                  active
                    ? "text-black dark:text-white"
                    : "text-gray-500 dark:text-neutral-400"
                }`}
              >
                <span aria-hidden>{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
