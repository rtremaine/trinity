"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUpAction, type ActionState } from "../actions";

export default function SignUpPage() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    signUpAction,
    undefined
  );

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
        <p className="mt-1 text-sm text-gray-500">Get started in seconds</p>
      </header>

      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="block h-12 w-full rounded-lg border border-gray-300 bg-white px-3 text-base outline-none focus:border-black focus:ring-2 focus:ring-black/10 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-white dark:focus:ring-white/10"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            className="block h-12 w-full rounded-lg border border-gray-300 bg-white px-3 text-base outline-none focus:border-black focus:ring-2 focus:ring-black/10 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-white dark:focus:ring-white/10"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="block h-12 w-full rounded-lg border border-gray-300 bg-white px-3 text-base outline-none focus:border-black focus:ring-2 focus:ring-black/10 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-white dark:focus:ring-white/10"
          />
          <p className="text-xs text-gray-500">Minimum 8 characters.</p>
        </div>

        {state?.error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="h-12 w-full rounded-lg bg-black px-4 text-base font-medium text-white active:bg-black/90 disabled:opacity-50 dark:bg-white dark:text-black dark:active:bg-white/90"
        >
          {pending ? "Creating…" : "Create account"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/signin" className="font-medium text-black underline dark:text-white">
          Sign in
        </Link>
      </p>
    </div>
  );
}
