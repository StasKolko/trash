import type {
  SecretVoicerCredential,
  SecretVoicerCredentialStatusFilter,
} from "../model/types";

const TOKEN_MASK_MIN_LENGTH = 8;
const TOKEN_VISIBLE_PREFIX_LENGTH = 4;
const TOKEN_VISIBLE_SUFFIX_LENGTH = 4;
const TOKEN_MASK_PLACEHOLDER = "••••••••";
const TOKEN_MASK_MIDDLE = "••••";

export function filterSecretVoicerCredentials(
  credentials: SecretVoicerCredential[],
  searchQuery: string,
  statusFilter: SecretVoicerCredentialStatusFilter,
): SecretVoicerCredential[] {
  let result = credentials;

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    result = result.filter((c) => c.name.toLowerCase().includes(query));
  }

  if (statusFilter === "active") {
    result = result.filter((c) => c.isActive);
  } else if (statusFilter === "inactive") {
    result = result.filter((c) => !c.isActive);
  }

  return result;
}

export function formatSecretVoicerCredentialDate(
  date: Date | string | null | undefined,
): string {
  if (!date) {
    return "—";
  }
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function maskSecretVoicerCredentialToken(token: string): string {
  if (token.length <= TOKEN_MASK_MIN_LENGTH) {
    return TOKEN_MASK_PLACEHOLDER;
  }

  const prefix = token.slice(0, TOKEN_VISIBLE_PREFIX_LENGTH);
  const suffix = token.slice(-TOKEN_VISIBLE_SUFFIX_LENGTH);

  return `${prefix}${TOKEN_MASK_MIDDLE}${suffix}`;
}
