type SecurityEventType = (typeof SECURITY_EVENT_TYPE)[number];
type SecuritySeverity = (typeof SECURITY_SEVERITY)[number];

const SECURITY_EVENT_TYPE = [
  "login_success",
  "logout",
  "session_revoked",
  "all_sessions_revoked",
  "refresh_rotated",
  "suspicious_activity",
  "token_reuse_detected",
  "session_limit_exceeded",
] as const;

const SECURITY_SEVERITY = ["info", "warning", "critical"] as const;

type RecordEventInput = {
  userId: string;
  sessionId: string | null;
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, unknown> | null;
};

export type { RecordEventInput, SecurityEventType, SecuritySeverity };
export { SECURITY_EVENT_TYPE, SECURITY_SEVERITY };
