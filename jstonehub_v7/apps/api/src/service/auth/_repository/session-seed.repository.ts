import { createId } from "@packages/util/id";

import { db } from "#api/shared/db/instance";
import { sessionTable } from "#api/shared/db/schema/session.table";

import {
  SESSION_ABSOLUTE_LIFETIME_MS,
  SESSION_IDLE_LIFETIME_MS,
} from "./session.repository";

const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const MS_PER_SECOND = 1000;
const MS_PER_DAY =
  HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MS_PER_SECOND;

const CREATED_DAYS_DIVISOR = 2;
const LAST_ACTIVE_DAYS_DIVISOR = 3;
const SUSPICIOUS_EVERY_N = 4;

const sessionSeedRepository = {
  async createForUser(params: {
    userId: string;
    tokenHash: string;
    userAgent: string;
    ipAddress: string;
    isSuspicious?: boolean;
    createdDaysAgo?: number;
    lastActiveDaysAgo?: number;
  }) {
    const now = Date.now();

    const createdAt = new Date(now - (params.createdDaysAgo ?? 0) * MS_PER_DAY);
    const lastActiveAt = new Date(
      now - (params.lastActiveDaysAgo ?? 0) * MS_PER_DAY,
    );

    const absoluteExpiresAt = new Date(
      createdAt.getTime() + SESSION_ABSOLUTE_LIFETIME_MS,
    );
    const expiresAt = new Date(
      lastActiveAt.getTime() + SESSION_IDLE_LIFETIME_MS,
    );

    const [session] = await db
      .insert(sessionTable)
      .values({
        userId: params.userId,
        token: params.tokenHash,
        userAgent: params.userAgent,
        ipAddress: params.ipAddress,
        createdUserAgent: params.userAgent,
        createdIpAddress: params.ipAddress,
        isSuspicious: params.isSuspicious ?? false,
        lastActiveAt,
        expiresAt,
        absoluteExpiresAt,
        createdAt,
        updatedAt: createdAt,
      })
      .returning({ id: sessionTable.id });

    return session?.id ?? null;
  },

  async createBulkForUser(params: {
    userId: string;
    count: number;
  }): Promise<number> {
    const combinations = _generateDeviceCombinations(params.count);

    const results = await Promise.all(
      combinations.map((device, index) =>
        sessionSeedRepository.createForUser({
          userId: params.userId,
          tokenHash: `__seed__${createId()}`,
          userAgent: device.userAgent,
          ipAddress: device.ipAddress,
          isSuspicious: device.isSuspicious,
          createdDaysAgo: Math.floor(index / CREATED_DAYS_DIVISOR),
          lastActiveDaysAgo: Math.floor(index / LAST_ACTIVE_DAYS_DIVISOR),
        }),
      ),
    );

    return results.filter(Boolean).length;
  },
} as const;

const SEED_USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
];

const SEED_IP_ADDRESSES = [
  "192.168.1.10",
  "10.0.0.15",
  "172.16.0.20",
  "185.228.168.42",
  "203.0.113.55",
];

function _generateDeviceCombinations(count: number) {
  const combinations: Array<{
    userAgent: string;
    ipAddress: string;
    isSuspicious: boolean;
  }> = [];

  for (let i = 0; i < count; i++) {
    const uaIndex = i % SEED_USER_AGENTS.length;
    const ipIndex = i % SEED_IP_ADDRESSES.length;

    combinations.push({
      userAgent: SEED_USER_AGENTS[uaIndex] ?? SEED_USER_AGENTS[0] ?? "unknown",
      ipAddress:
        SEED_IP_ADDRESSES[ipIndex] ?? SEED_IP_ADDRESSES[0] ?? "unknown",
      isSuspicious: i % SUSPICIOUS_EVERY_N === 0,
    });
  }

  return combinations;
}

export { sessionSeedRepository };
