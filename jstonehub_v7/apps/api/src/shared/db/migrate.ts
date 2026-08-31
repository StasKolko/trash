import process from "node:process";
import { migrate } from "drizzle-orm/bun-sql/migrator";

import { db } from "./instance";

// biome-ignore lint/suspicious/noConsole: Migration logging required
console.log("⏳ Running migrations...");

try {
  await migrate(db, { migrationsFolder: "drizzle" });
  // biome-ignore lint/suspicious/noConsole: Migration logging required
  console.log("✅ Migrations completed successfully");
  process.exit(0);
} catch (error) {
  // biome-ignore lint/suspicious/noConsole: Migration logging required
  console.error("❌ Migration failed:", error);
  process.exit(1);
}
