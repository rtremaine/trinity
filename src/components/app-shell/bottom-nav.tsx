"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
};

function BookIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v18l-7-3-7 3z"/>
      <path d="M18 2h2a2 2 0 0 1 2 2v18l-4-2"/>
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7h18M5 7v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7M9 11h6"/>
      <rect x="3" y="3" width="18" height="4" rx="1"/>
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

function BellIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}

export function BottomNav({
  isAdmin,
  unreadMentions = 0,
}: {
  isAdmin: boolean;
  unreadMentions?: number;
}) {
  const pathname = usePathname();

  const tabs: Tab[] = [
    { href: "/today", label: "Today", icon: <BookIcon /> },
    { href: "/archive", label: "Archive", icon: <ArchiveIcon /> },
    { href: "/mentions", label: "Mentions", icon: <BellIcon />, badge: unreadMentions },
    ...(isAdmin ? [{ href: "/admin/readings", label: "Admin", icon: <ShieldIcon /> }] : []),
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
                <span aria-hidden className="relative">
                  {tab.icon}
                  {tab.badge ? (
                    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-semibold leading-none text-white">
                      {tab.badge > 9 ? "9+" : tab.badge}
                    </span>
                  ) : null}
                </span>
                <span className="font-medium">{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
