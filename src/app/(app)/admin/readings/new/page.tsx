import { listBooks } from "@/lib/bible";
import { requireRole } from "@/lib/authz";
import { ReadingForm } from "@/components/reading-form";

export default async function NewReadingPage() {
  await requireRole("admin");
  const books = await listBooks();

  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs uppercase tracking-wide text-gray-500">Admin · New</p>
        <h2 className="text-xl font-semibold">Create reading</h2>
      </header>
      <ReadingForm books={books} />
    </div>
  );
}
