import { headers } from "next/headers";
import { db } from "@/db";
import { auditLogs, type NewAuditLog } from "@/db/schema";
import { logger } from "./logger";

type AuditInput = {
  action: string;
  userId?: string | null;
  resource?: string;
  resourceId?: string;
  success?: boolean;
  metadata?: Record<string, unknown>;
};

export async function recordAudit(input: AuditInput) {
  let ip: string | null = null;
  let userAgent: string | null = null;

  try {
    const h = await headers();
    ip =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      h.get("x-real-ip") ??
      null;
    userAgent = h.get("user-agent");
  } catch {
    // headers() is only available in request scope; ignore otherwise.
  }

  const row: NewAuditLog = {
    action: input.action,
    userId: input.userId ?? null,
    resource: input.resource,
    resourceId: input.resourceId,
    success: input.success ?? true,
    metadata: input.metadata ?? null,
    ip,
    userAgent,
  };

  try {
    await db.insert(auditLogs).values(row);
  } catch (err) {
    logger.error({ err, audit: row }, "Failed to write audit log");
  }

  logger.info({ audit: row }, `audit:${input.action}`);
}
