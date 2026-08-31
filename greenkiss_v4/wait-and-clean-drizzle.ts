import "dotenv/config";
import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import postgres from "postgres";

const __dirname = dirname(new URL(import.meta.url).pathname);

const MAX_ATTEMPTS = 60;
const DELAY_MS = 1000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error(
      "[wait-for-db] DATABASE_URL не задан. Убедись, что .env загружен.",
    );
    process.exit(1);
  }

  console.log(`[wait-for-db] Ожидание PostgreSQL по ${databaseUrl}...`);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const sql = postgres(databaseUrl, { max: 1, idle_timeout: 1 });

    try {
      await sql`select 1`;
      await sql.end({ timeout: 1 });
      console.log("[wait-for-db] PostgreSQL полностью готов к запросам.");
      return;
    } catch {
      await sql.end({ timeout: 1 }).catch(() => {});
      console.log(`[wait-for-db] ещё не готов (попытка ${attempt})`);
      await sleep(DELAY_MS);
    }
  }

  console.error("[wait-for-db] PostgreSQL так и не стал готов к запросам :(");
  process.exit(1);
}

async function cleanDrizzle() {
  const target = join(__dirname, "..", "drizzle");

  if (!existsSync(target)) {
    console.log("[clean-drizzle] Папка 'drizzle' не найдена, пропускаю.");
    return;
  }

  try {
    await rm(target, { recursive: true, force: true });
    console.log("[clean-drizzle] Папка 'drizzle' удалена.");
  } catch (err) {
    console.error("[clean-drizzle] Ошибка при удалении папки 'drizzle':", err);
    process.exit(1);
  }
}

async function main() {
  await waitForDb();
  await cleanDrizzle();
}

main().catch((err) => {
  console.error("[wait-and-clean-drizzle] Неожиданная ошибка:", err);
  process.exit(1);
});
