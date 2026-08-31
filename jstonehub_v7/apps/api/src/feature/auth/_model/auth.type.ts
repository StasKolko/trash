type GoogleUserInfo = {
  email: string;
  name: string;
  avatarUrl: string | null;
  providerAccountId: string;
};

type OauthCallbackResult =
  | {
      kind: "success";
      userId: string;
      redirect: string;
      accessToken: string;
      refreshToken: string;
    }
  | { kind: "banned"; redirect: string }
  | { kind: "link_conflict"; email: string; redirect: string };

type SessionInfo = {
  id: string;
  deviceType: string | null;
  os: string | null;
  browser: string | null;
  ipAddress: string | null;
  isSuspicious: boolean;
  createdAt: Date;
  lastActiveAt: Date;
  isCurrent: boolean;
};

type ProviderInfo = {
  id: string;
  provider: string;
  createdAt: Date;
};

type AuthContextResponse = {
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    isBanned: boolean;
  };
  permissions: string[];
  energyBalance: string;
  loginStreak: number;
};

const AUTH_LINK_REQUEST_TTL_MINUTES = 15;
const SECONDS_PER_MINUTE = 60;
const MS_PER_SECOND = 1000;
const AUTH_LINK_REQUEST_TTL_MS =
  AUTH_LINK_REQUEST_TTL_MINUTES * SECONDS_PER_MINUTE * MS_PER_SECOND;

export type {
  AuthContextResponse,
  GoogleUserInfo,
  OauthCallbackResult,
  ProviderInfo,
  SessionInfo,
};
export { AUTH_LINK_REQUEST_TTL_MS };
