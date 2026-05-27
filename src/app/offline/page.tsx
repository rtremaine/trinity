export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold">You&apos;re offline</h1>
      <p className="mt-2 text-sm text-gray-500">
        Trinity will sync once you&apos;re back online.
      </p>
    </main>
  );
}
