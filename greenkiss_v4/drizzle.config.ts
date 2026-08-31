import path from "node:path";
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

const envFile =
  process.env.NODE_ENV === "production" ? ".env.local" : ".env.development";
config({ path: path.resolve(process.cwd(), envFile) });

export default defineConfig({
  schema: "./src/shared/api/db/schemas/**/*.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  strict: true,
  verbose: true,
});
