import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { Session } from "next-auth";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export async function getSession(): Promise<Session | null> {
  return auth();
}

export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/signin");
  return session.user;
}

export async function requireRole(role: "user" | "admin") {
  const user = await requireUser();
  if (role === "admin" && user.role !== "admin") {
    redirect("/today?error=forbidden");
  }
  return user;
}

export async function requireUserApi() {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();
  return session.user;
}

export async function requireRoleApi(role: "user" | "admin") {
  const user = await requireUserApi();
  if (role === "admin" && user.role !== "admin") throw new ForbiddenError();
  return user;
}
