type PendingExchange = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

const EXCHANGE_CODE_MAX_AGE_SECONDS = 60;
const CLEANUP_INTERVAL_MS = 30_000;
const MS_PER_SECOND = 1000;

const CODE_BYTES = 32;
const BASE64_PLUS_REGEX = /\+/g;
const BASE64_SLASH_REGEX = /\//g;
const BASE64_PADDING_REGEX = /=+$/;

const pendingExchanges = new Map<string, PendingExchange>();

setInterval(() => {
  const now = Date.now();
  for (const [code, entry] of pendingExchanges) {
    if (entry.expiresAt < now) {
      pendingExchanges.delete(code);
    }
  }
}, CLEANUP_INTERVAL_MS);

function createExchangeCode(tokens: {
  accessToken: string;
  refreshToken: string;
}) {
  const code = generateRandomCode();

  pendingExchanges.set(code, {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: Date.now() + EXCHANGE_CODE_MAX_AGE_SECONDS * MS_PER_SECOND,
  });

  return code;
}

function consumeExchangeCode(code: string) {
  const entry = pendingExchanges.get(code);

  if (!entry) {
    return { kind: "not_found" as const };
  }

  if (entry.expiresAt < Date.now()) {
    pendingExchanges.delete(code);
    return { kind: "expired" as const };
  }

  pendingExchanges.delete(code);

  return {
    kind: "success" as const,
    accessToken: entry.accessToken,
    refreshToken: entry.refreshToken,
  };
}

function generateRandomCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(CODE_BYTES));
  return btoa(String.fromCharCode(...bytes))
    .replace(BASE64_PLUS_REGEX, "-")
    .replace(BASE64_SLASH_REGEX, "_")
    .replace(BASE64_PADDING_REGEX, "");
}

export { consumeExchangeCode, createExchangeCode };
