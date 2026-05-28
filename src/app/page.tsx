import Link from "next/link";
import { auth } from "@/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-8 px-6 pt-safe pb-safe text-center">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Trinity</h1>
        <p className="text-sm text-gray-500">
          Next.js + Postgres app with auth, roles, and audit logging.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {session?.user ? (
          <Link
            href="/today"
            className="flex h-12 items-center justify-center rounded-lg bg-black text-base font-medium text-white active:bg-black/90 dark:bg-white dark:text-black"
          >
            Go to dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/signup"
              className="flex h-12 items-center justify-center rounded-lg bg-black text-base font-medium text-white active:bg-black/90 dark:bg-white dark:text-black"
            >
              Create account
            </Link>
            <Link
              href="/signin"
              className="flex h-12 items-center justify-center rounded-lg border border-gray-300 text-base font-medium dark:border-neutral-700"
            >
              Sign in
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
