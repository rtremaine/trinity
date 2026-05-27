import Link from "next/link";
import { auth } from "@/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="mx-auto max-w-2xl space-y-8 py-24 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">Trinity</h1>
      <p className="text-gray-600 dark:text-gray-400">
        Next.js + Postgres starter with auth, roles, and audit logging.
      </p>

      <div className="flex justify-center gap-3">
        {session?.user ? (
          <Link
            href="/dashboard"
            className="rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
          >
            Go to dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/signin"
              className="rounded border border-gray-300 px-4 py-2 dark:border-gray-700"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
