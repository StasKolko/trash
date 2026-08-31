import process from "node:process";
import { defineConfig } from "drizzle-kit";

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/**/*.table.ts",
  out: "./drizzle",
  dbCredentials: { url: DATABASE_URL },
  verbose: true,
  strict: true,
});
