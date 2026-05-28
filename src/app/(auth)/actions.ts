"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { signIn, signOut } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { recordAudit } from "@/lib/audit";
import { logger } from "@/lib/logger";

const signUpSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type ActionState = { error?: string } | undefined;

export async function signUpAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { error: first?.message ?? "Invalid input" };
  }

  const email = parsed.data.email.toLowerCase();

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    await recordAudit({ action: "user.signup", success: false, metadata: { reason: "email_taken", email } });
    return { error: "An account with that email already exists" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  const [created] = await db
    .insert(users)
    .values({ name: parsed.data.name, email, passwordHash })
    .returning({ id: users.id });

  await recordAudit({ action: "user.signup", userId: created.id, success: true });
  logger.info({ userId: created.id }, "user signed up");

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo: "/today",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Account created, but sign-in failed. Try signing in." };
    }
    throw err;
  }
}

export async function signInAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) return { error: "Invalid email or password" };

  try {
    await signIn("credentials", {
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      redirectTo: "/today",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      await recordAudit({
        action: "user.signin",
        success: false,
        metadata: { email: parsed.data.email, code: err.type },
      });
      return { error: "Invalid email or password" };
    }
    throw err;
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
