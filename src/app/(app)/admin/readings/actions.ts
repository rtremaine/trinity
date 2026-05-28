"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRoleApi } from "@/lib/authz";
import { recordAudit } from "@/lib/audit";
import { deleteReading, upsertReading } from "@/lib/readings";

const rangeSchema = z.object({
  bookId: z.number().int().min(1).max(66),
  chapter: z.number().int().min(1).max(150),
  verseStart: z.number().int().min(1).max(200),
  verseEnd: z.number().int().min(1).max(200),
});

const upsertSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  commentary: z.string().max(20_000).optional().nullable(),
  ranges: z.array(rangeSchema).min(1, "Add at least one passage"),
});

export type UpsertState = { error?: string } | undefined;

export async function upsertReadingAction(
  _prev: UpsertState,
  formData: FormData
): Promise<UpsertState> {
  const admin = await requireRoleApi("admin");

  let rangesParsed: unknown;
  try {
    rangesParsed = JSON.parse(String(formData.get("ranges") ?? "[]"));
  } catch {
    return { error: "Could not parse passages" };
  }

  const parsed = upsertSchema.safeParse({
    date: formData.get("date"),
    commentary: (formData.get("commentary") as string) || null,
    ranges: rangesParsed,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  for (const r of parsed.data.ranges) {
    if (r.verseEnd < r.verseStart) {
      return { error: "Verse end must be greater than or equal to verse start" };
    }
  }

  const id = await upsertReading({
    date: parsed.data.date,
    commentary: parsed.data.commentary ?? null,
    ranges: parsed.data.ranges,
    createdBy: admin.id,
  });

  await recordAudit({
    action: "reading.upsert",
    userId: admin.id,
    resource: "daily_reading",
    resourceId: id,
    metadata: { date: parsed.data.date, rangeCount: parsed.data.ranges.length },
  });

  revalidatePath("/today");
  revalidatePath("/archive");
  revalidatePath(`/readings/${parsed.data.date}`);
  revalidatePath("/admin/readings");

  redirect("/admin/readings");
}

export async function deleteReadingAction(formData: FormData) {
  const admin = await requireRoleApi("admin");
  const id = String(formData.get("id") ?? "");
  const date = String(formData.get("date") ?? "");
  if (!id) return;

  await deleteReading(id);

  await recordAudit({
    action: "reading.delete",
    userId: admin.id,
    resource: "daily_reading",
    resourceId: id,
    metadata: { date },
  });

  revalidatePath("/today");
  revalidatePath("/archive");
  if (date) revalidatePath(`/readings/${date}`);
  revalidatePath("/admin/readings");
}
