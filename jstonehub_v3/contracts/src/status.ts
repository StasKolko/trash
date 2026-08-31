export type ContentStatus = (typeof CONTENT_STATUSES)[number];
export type TaskStatus = (typeof TASK_STATUSES)[number];
export type InviteStatus = (typeof INVITE_STATUSES)[number];
export type ComplaintStatus = (typeof COMPLAINT_STATUSES)[number];

export const CONTENT_STATUSES = [
  "draft",
  "pending_review",
  "approved",
  "rejected",
] as const;
export const TASK_STATUSES = [
  "pending",
  "processing",
  "completed",
  "failed",
  "cancelled",
] as const;
export const INVITE_STATUSES = [
  "pending",
  "accepted",
  "declined",
  "expired",
  "cancelled",
] as const;
export const COMPLAINT_STATUSES = [
  "pending",
  "in_progress",
  "pending_review",
  "resolved",
  "rejected",
] as const;
