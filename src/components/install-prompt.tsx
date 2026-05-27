"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "trinity:install-dismissed-at";
const DISMISS_TTL_DAYS = 7;

function isIos() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

function isRecentlyDismissed() {
  const raw = window.localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  return Date.now() - Number(raw) < DISMISS_TTL_DAYS * 24 * 60 * 60 * 1000;
}

type Env = "ssr" | "suppress" | "ios" | "default";

const noopSubscribe = () => () => {};
const getClientEnv = (): Env => {
  if (isStandalone() || isRecentlyDismissed()) return "suppress";
  if (isIos()) return "ios";
  return "default";
};
const getServerEnv = (): Env => "ssr";

export function InstallPrompt() {
  const env = useSyncExternalStore(noopSubscribe, getClientEnv, getServerEnv);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (env === "ssr" || env === "suppress") return;
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    };
  }, [env]);

  if (env === "ssr" || env === "suppress" || dismissed) return null;
  if (env !== "ios" && !deferred) return null;

  const dismiss = () => {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDeferred(null);
    setDismissed(true);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") dismiss();
    setDeferred(null);
  };

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
