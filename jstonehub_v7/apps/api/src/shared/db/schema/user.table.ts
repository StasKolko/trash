import { createId } from "@packages/util/id";
import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const userTable = pgTable(
  "user",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    email: text("email").notNull(),
    name: text("name").notNull(),
    avatarUrl: text("avatar_url"),

    isBanned: boolean("is_banned").notNull().default(false),

    energyBalance: bigint("energy_balance", { mode: "bigint" })
      .notNull()
      .default(sql`0`),
    lastEnergyClaimAt: timestamp("last_energy_claim_at", {
      withTimezone: true,
    }),
    loginStreak: integer("login_streak").notNull().default(0),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("user_email_unique_idx").on(table.email),

    index("user_name_trgm_idx").using("gin", sql`${table.name} gin_trgm_ops`),

    index("user_email_trgm_idx").using("gin", sql`${table.email} gin_trgm_ops`),

    index("user_is_banned_created_at_id_idx").on(
      table.isBanned,
      table.createdAt,
      table.id,
    ),

    index("user_created_at_id_idx").on(table.createdAt, table.id),

    index("user_energy_balance_id_idx").on(table.energyBalance, table.id),

    index("user_login_streak_id_idx").on(table.loginStreak, table.id),

    index("user_name_id_idx").on(table.name, table.id),

    index("user_email_id_idx").on(table.email, table.id),
  ],
);

export { userTable };
