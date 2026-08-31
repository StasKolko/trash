import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";

import { env } from "#api/shared/config/env";

import { schema } from "./_all";

const client = new SQL(env.DATABASE_URL);
const db = drizzle({ client, schema });

export { db };
