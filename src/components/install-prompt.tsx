"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "trinity:install-dismissed-at";
const DISMISS_TTL_DAYS = 7;

function isIos() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

function isRecentlyDismissed() {
  if (typeof window === "undefined") return false;
  const raw = window.localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const at = Number(raw);
  return Date.now() - at < DISMISS_TTL_DAYS * 24 * 60 * 60 * 1000;
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    if (isStandalone() || isRecentlyDismissed()) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    if (isIos()) setShowIosHint(true);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    };
  }, []);

  const dismiss = () => {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDeferred(null);
    setShowIosHint(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") dismiss();
    setDeferred(null);
  };

  if (!deferred && !showIosHint) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 px-safe pb-safe">
      <div className="mx-auto m-3 max-w-md rounded-2xl border border-gray-200 bg-white p-4 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="text-sm font-medium">Install Trinity</p>
            <p className="mt-1 text-xs text-gray-500">
              {deferred
                ? "Add to your home screen for a faster, full-screen experience."
                : "Tap the Share icon, then “Add to Home Screen.”"}
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss"
            className="-mr-1 -mt-1 rounded p-1 text-gray-400 active:bg-gray-100 dark:active:bg-neutral-800"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        {deferred && (
          <button
            type="button"
            onClick={install}
            className="mt-3 h-10 w-full rounded-lg bg-black text-sm font-medium text-white active:bg-black/90 dark:bg-white dark:text-black"
          >
            Install
          </button>
        )}
      </div>
    </div>
  );
}
