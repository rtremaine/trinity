import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import { users } from "./schema";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");

  const client = postgres(url, { max: 1 });
  const db = drizzle(client);

  const passwordHash = await bcrypt.hash("admin1234", 10);

  await db
    .insert(users)
    .values({
      email: "admin@trinity.local",
      name: "Admin",
      passwordHash,
      role: "admin",
      emailVerified: new Date(),
    })
    .onConflictDoNothing();

  console.log("Seeded admin@trinity.local / admin1234");
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
