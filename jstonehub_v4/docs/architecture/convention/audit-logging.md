### Audit Logging

Each auditable feature exports a snapshot function in `{entity}.audit.ts`:

```typescript
// user.audit.ts
export function userAuditSnapshot(user: User): Record<string, unknown> {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    bannedAt: user.bannedAt,
    subscriptionTier: user.subscriptionTier,
  };
}
```

**Rules:**
- Snapshot includes only business-relevant fields (no tokens, no internal metadata)
- For **create**: `snapshot` = full snapshot, `changes` = null
- For **update**: `snapshot` = null, `changes` = `{ old: {...}, new: {...} }` only changed fields
- For **delete**: `snapshot` = full snapshot, `changes` = null
- Action format: `"{entity}.{verb}"` — e.g., `"user.banned"`, `"joke.created"`, `"language.updated"`