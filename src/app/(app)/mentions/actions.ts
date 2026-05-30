"use server";

import { revalidatePath } from "next/cache";
import { requireUserApi } from "@/lib/authz";
import { markMentionsRead } from "@/lib/comments";

export async function markMentionsReadAction(): Promise<void> {
  const user = await requireUserApi();
  await markMentionsRead(user.id);
  // Refresh the unread badge in the nav (rendered from the (app) layout).
  revalidatePath("/mentions");
  revalidatePath("/today");
}
