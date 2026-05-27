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
    <div className="mx-auto max-w-sm space-y-6 py-16">
      <h1 className="text-2xl font-semibold">Create an account</h1>

      <form action={formAction} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          />
        </div>

        <div className="space-y-1">
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
            className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          />
          <p className="text-xs text-gray-500">Minimum 8 characters.</p>
        </div>

        {state?.error && (
          <p className="text-sm text-red-600">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {pending ? "Creating..." : "Create account"}
        </button>
      </form>

      <p className="text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{" "}
        <Link href="/signin" className="underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
