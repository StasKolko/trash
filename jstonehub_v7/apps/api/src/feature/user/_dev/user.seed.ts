import type { InferSelectModel } from "drizzle-orm";

import { createId } from "@packages/util/id";
import { eq, like } from "drizzle-orm";

import { db } from "#api/shared/db/instance";
import { auditLogTable } from "#api/shared/db/schema/audit.table";
import { authAccountTable } from "#api/shared/db/schema/auth-account.table";
import { permissionTable } from "#api/shared/db/schema/permission.table";
import { sessionTable } from "#api/shared/db/schema/session.table";
import { userTable } from "#api/shared/db/schema/user.table";

type UserRow = InferSelectModel<typeof userTable>;

const TEST_PREFIX = "__test__";
const TEST_EMAIL_DOMAIN = "@example.com";
const EMAIL_SLUG_LENGTH = 6;
const PRESET_USER_COUNT = 4;
const BAN_PROBABILITY = 0.1;
const ADMIN_ACCESS_PROBABILITY = 0.3;
const MAX_RANDOM_PERMISSIONS = 4;
const SHUFFLE_MIDPOINT = 0.5;
const MAX_LOGIN_STREAK = 30;
const ENERGY_VARIANCE_FACTOR = 0.5;
const DEFAULT_ENERGY = 0;

// biome-ignore-start lint/style/noMagicNumbers: seed data — energy balance presets for test users
const ENERGY_RANGES = [
  0, 1000, 10_000, 100_000, 1_000_000, 10_000_000, 100_000_000,
] as const;
// biome-ignore-end lint/style/noMagicNumbers: seed data — energy balance presets for test users

const FIRST_NAMES = [
  "Alice",
  "Bob",
  "Charlie",
  "Diana",
  "Eve",
  "Frank",
  "Grace",
  "Hank",
  "Ivy",
  "Jack",
  "Karen",
  "Leo",
  "Mona",
  "Nick",
  "Olivia",
  "Paul",
  "Quinn",
  "Rosa",
  "Sam",
  "Tina",
  "Uma",
  "Victor",
  "Wendy",
  "Xander",
];

const LAST_NAMES = [
  "Smith",
  "Johnson",
  "Brown",
  "Davis",
  "Miller",
  "Wilson",
  "Moore",
  "Taylor",
  "Anderson",
  "Thomas",
  "Jackson",
  "White",
  "Harris",
  "Martin",
];

const ADMIN_PERMISSIONS = [
  "admin:access:read",
  "admin:user:read",
  "admin:user:ban",
  "admin:user:manage",
  "admin:user:grant_energy",
  "admin:joke:all",
  "admin:language:read",
  "admin:pricing:read",
  "admin:feedback:read",
  "admin:audit:read",
] as const;

const MODERATOR_PERMISSIONS = [
  "admin:access:read",
  "admin:joke:read",
  "admin:joke:update",
  "admin:feedback:read",
  "admin:feedback:manage",
] as const;

// ─── seed users ────────────────────────────────────────

async function seedUsers(count: number) {
  const presetUsers = await createPresetUsers();
  const bulkCount = Math.max(0, count - PRESET_USER_COUNT);
  const bulkUsers = await createBulkUsers(bulkCount);

  return { created: presetUsers.length + bulkUsers.length };
}

async function createPresetUsers() {
  const adminUser = await createTestUser({
    name: `${TEST_PREFIX} Admin User`,
    permissions: [...ADMIN_PERMISSIONS],
    isBanned: false,
  });

  const moderatorUser = await createTestUser({
    name: `${TEST_PREFIX} Moderator`,
    permissions: [...MODERATOR_PERMISSIONS],
    isBanned: false,
  });

  const bannedUser = await createTestUser({
    name: `${TEST_PREFIX} Banned User`,
    permissions: [],
    isBanned: true,
  });

  const regularUser = await createTestUser({
    name: `${TEST_PREFIX} Regular User`,
    permissions: [],
    isBanned: false,
  });

  return [adminUser, moderatorUser, bannedUser, regularUser].filter(Boolean);
}

async function createBulkUsers(count: number) {
  const users: UserRow[] = [];

  for (let i = 0; i < count; i++) {
    const name = generateRandomName();
    const isBanned = Math.random() < BAN_PROBABILITY;
    const permissions = generateRandomPermissions();

    // biome-ignore lint/performance/noAwaitInLoops: sequential seed to avoid UNIQUE constraint race conditions
    const user = await createTestUser({ name, permissions, isBanned });

    if (user) {
      users.push(user);
    }
  }

  return users;
}

async function createTestUser(params: {
  name: string;
  permissions: string[];
  isBanned: boolean;
}) {
  const emailSlug = createId().slice(0, EMAIL_SLUG_LENGTH);
  const email = `${TEST_PREFIX}${emailSlug}${TEST_EMAIL_DOMAIN}`;
  const energy = generateRandomEnergy();
  const loginStreak = Math.floor(Math.random() * MAX_LOGIN_STREAK);

  const [user] = await db
    .insert(userTable)
    .values({
      email,
      name: params.name,
      avatarUrl: null,
      isBanned: params.isBanned,
      energyBalance: BigInt(energy),
      loginStreak,
    })
    .returning();

  if (!user) {
    return null;
  }

  await db.insert(authAccountTable).values({
    userId: user.id,
    provider: "google",
    providerAccountId: `test_${createId()}`,
  });

  if (params.permissions.length > 0) {
    const permissionValues = params.permissions.map((perm) => ({
      userId: user.id,
      permission: perm,
      grantedBy: null,
    }));

    await db.insert(permissionTable).values(permissionValues);
  }

  return user;
}

// ─── cleanup ───────────────────────────────────────────

async function cleanupTestUsers() {
  const testUsers = await db
    .select({ id: userTable.id })
    .from(userTable)
    .where(like(userTable.email, `${TEST_PREFIX}%`));

  if (testUsers.length === 0) {
    return { deleted: 0 };
  }

  const userIds = testUsers.map((u) => u.id);

  await Promise.all(userIds.map((userId) => deleteTestUserData(userId)));

  return { deleted: userIds.length };
}

async function deleteTestUserData(userId: string) {
  await db.delete(auditLogTable).where(eq(auditLogTable.actorId, userId));
  await db.delete(auditLogTable).where(eq(auditLogTable.targetId, userId));
  await db.delete(permissionTable).where(eq(permissionTable.userId, userId));
  await db.delete(sessionTable).where(eq(sessionTable.userId, userId));
  await db.delete(authAccountTable).where(eq(authAccountTable.userId, userId));
  await db.delete(userTable).where(eq(userTable.id, userId));
}

// ─── random helpers ────────────────────────────────────

function generateRandomName() {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${TEST_PREFIX} ${first} ${last}`;
}

function generateRandomPermissions() {
  const shouldHaveAdmin = Math.random() < ADMIN_ACCESS_PROBABILITY;

  if (!shouldHaveAdmin) {
    return [];
  }

  const shuffled = [...ADMIN_PERMISSIONS].sort(
    () => Math.random() - SHUFFLE_MIDPOINT,
  );
  const count = Math.floor(Math.random() * MAX_RANDOM_PERMISSIONS) + 1;

  return shuffled.slice(0, count);
}

function generateRandomEnergy() {
  const base =
    ENERGY_RANGES[Math.floor(Math.random() * ENERGY_RANGES.length)]
    ?? DEFAULT_ENERGY;
  const variance = Math.floor(base * ENERGY_VARIANCE_FACTOR * Math.random());
  return base + variance;
}

export { cleanupTestUsers, seedUsers };
