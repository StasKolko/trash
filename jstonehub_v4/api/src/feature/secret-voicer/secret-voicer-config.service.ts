import type { CredentialError } from "#api/feature/secret-voicer-credential/secret-voicer-credential.type";

import { SECRET_VOICER_CACHE_TTL_MS } from "@packages/contract/secret-voicer";
import { and, eq } from "drizzle-orm";

import { browserFingerprintsTable } from "#api/feature/browser-fingerprint/browser-fingerprint.table";
import { secretVoicerCredentialRepository } from "#api/feature/secret-voicer-credential/secret-voicer-credential.repository";
import { secretVoicerCredentialsTable } from "#api/feature/secret-voicer-credential/secret-voicer-credential.table";
import { db } from "#api/shared/db/instance";

type SecretVoicerConfig = {
  credentialId: string;
  csrfToken: string;
  sessionId: string;
  userAgent: string;
  platform: string;
  language: string;
  languages: string[];
};

type CachedCredential = {
  config: SecretVoicerConfig;
  cachedAt: number;
};

type AllCredentialsCache = {
  list: SecretVoicerConfig[];
  cachedAt: number;
};

const LIST_CACHE_TTL_MS = 30_000;

let roundRobinIndex = 0;
const credentialCache = new Map<string, CachedCredential>();
let allCredentialsCache: AllCredentialsCache | null = null;

function isExpired(
  cachedAt: number,
  ttl = SECRET_VOICER_CACHE_TTL_MS,
): boolean {
  return Date.now() - cachedAt > ttl;
}

async function loadAllActiveConfigsWithFingerprint(): Promise<
  SecretVoicerConfig[]
> {
  if (
    allCredentialsCache
    && !isExpired(allCredentialsCache.cachedAt, LIST_CACHE_TTL_MS)
  ) {
    return allCredentialsCache.list;
  }

  const rows = await db
    .select({
      id: secretVoicerCredentialsTable.id,
      csrfToken: secretVoicerCredentialsTable.csrfToken,
      sessionId: secretVoicerCredentialsTable.sessionId,
      userAgent: browserFingerprintsTable.userAgent,
      platform: browserFingerprintsTable.platform,
      language: browserFingerprintsTable.language,
      languages: browserFingerprintsTable.languages,
    })
    .from(secretVoicerCredentialsTable)
    .innerJoin(
      browserFingerprintsTable,
      eq(
        secretVoicerCredentialsTable.fingerprintId,
        browserFingerprintsTable.id,
      ),
    )
    .where(
      and(
        eq(secretVoicerCredentialsTable.isActive, true),
        eq(browserFingerprintsTable.isActive, true),
      ),
    )
    .orderBy(secretVoicerCredentialsTable.createdAt);

  if (rows.length === 0) {
    throw new Error("No active Secret Voicer credentials found");
  }

  const configs: SecretVoicerConfig[] = rows.map((row) => ({
    credentialId: row.id,
    csrfToken: row.csrfToken.trim(),
    sessionId: row.sessionId.trim(),
    userAgent: row.userAgent,
    platform: row.platform,
    language: row.language,
    languages: row.languages,
  }));

  allCredentialsCache = { list: configs, cachedAt: Date.now() };
  return configs;
}

async function resolveConfig(): Promise<SecretVoicerConfig> {
  const configs = await loadAllActiveConfigsWithFingerprint();

  if (roundRobinIndex >= configs.length) {
    roundRobinIndex = 0;
  }

  const config = configs[roundRobinIndex];
  if (!config) {
    throw new Error("No active Secret Voicer credentials found");
  }

  roundRobinIndex = (roundRobinIndex + 1) % configs.length;
  return config;
}

async function resolveConfigById(
  credentialId: string,
): Promise<SecretVoicerConfig> {
  const cached = credentialCache.get(credentialId);
  if (cached && !isExpired(cached.cachedAt)) {
    return cached.config;
  }

  const rows = await db
    .select({
      id: secretVoicerCredentialsTable.id,
      csrfToken: secretVoicerCredentialsTable.csrfToken,
      sessionId: secretVoicerCredentialsTable.sessionId,
      userAgent: browserFingerprintsTable.userAgent,
      platform: browserFingerprintsTable.platform,
      language: browserFingerprintsTable.language,
      languages: browserFingerprintsTable.languages,
    })
    .from(secretVoicerCredentialsTable)
    .innerJoin(
      browserFingerprintsTable,
      eq(
        secretVoicerCredentialsTable.fingerprintId,
        browserFingerprintsTable.id,
      ),
    )
    .where(
      and(
        eq(secretVoicerCredentialsTable.id, credentialId),
        eq(secretVoicerCredentialsTable.isActive, true),
        eq(browserFingerprintsTable.isActive, true),
      ),
    )
    .limit(1);

  const row = rows[0];
  if (!row) {
    throw new Error(`Credential ${credentialId} not found or inactive`);
  }

  const config: SecretVoicerConfig = {
    credentialId: row.id,
    csrfToken: row.csrfToken.trim(),
    sessionId: row.sessionId.trim(),
    userAgent: row.userAgent,
    platform: row.platform,
    language: row.language,
    languages: row.languages,
  };

  credentialCache.set(credentialId, { config, cachedAt: Date.now() });
  return config;
}

async function markCredentialError(
  credentialId: string,
  error: CredentialError,
): Promise<void> {
  // biome-ignore lint/suspicious/noConsole: Auth error logging required
  console.warn(
    `⚠️ [secret-voicer] Credential ${credentialId} marked as error: ${error.action} — ${error.message}`,
  );

  await secretVoicerCredentialRepository.markAsError(credentialId, error);
  invalidateConfigCache();
}

function invalidateConfigCache(): void {
  allCredentialsCache = null;
  credentialCache.clear();
  roundRobinIndex = 0;
}

export type { SecretVoicerConfig };
export {
  invalidateConfigCache,
  markCredentialError,
  resolveConfig,
  resolveConfigById,
};
