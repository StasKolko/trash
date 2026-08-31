import { DrizzleAdapter } from "@auth/drizzle-adapter";
import type { NextAuthConfig } from "next-auth";
import { db } from "@/shared/api/db";
import {
  accounts,
  authenticators,
  sessions,
  users,
  verificationTokens,
} from "@/shared/api/db/schemas/users";
import { env } from "@/shared/config/env";
import { createId } from "@/shared/lib/id";
import type { Role } from "./types";

const ADMIN_EMAILS = new Set(env.ADMIN_EMAILS);
const MANAGER_EMAILS = new Set(env.MANAGER_EMAILS);

export const buildAdapter = (): NonNullable<NextAuthConfig["adapter"]> => ({
  ...DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    authenticatorsTable: authenticators,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  async createUser(data) {
    try {
      const email = data.email.toLowerCase().trim();

      if (!email) {
        throw new Error("Email is required");
      }

      let role: Role = "USER";
      if (ADMIN_EMAILS.has(email)) {
        role = "ADMIN";
      } else if (MANAGER_EMAILS.has(email)) {
        role = "MANAGER";
      }

      const [inserted] = await db
        .insert(users)
        .values({
          ...data,
          id: createId(),
          role,
          email,
        })
        .returning();

      return {
        ...inserted,
        email,
      };
    } catch (error) {
      console.error("Failed to create user:", error);
      throw error;
    }
  },
});
