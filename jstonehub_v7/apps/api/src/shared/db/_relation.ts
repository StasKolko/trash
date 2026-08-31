import { relations } from "drizzle-orm";

import { auditLogTable } from "./schema/audit.table";
import { authAccountTable } from "./schema/auth-account.table";
import { authLinkRequestTable } from "./schema/auth-link-request.table";
import { permissionTable } from "./schema/permission.table";
import { securityEventTable } from "./schema/security-event.table";
import { sessionTable } from "./schema/session.table";
import { userTable } from "./schema/user.table";

const userRelations = relations(userTable, ({ many }) => ({
  authAccounts: many(authAccountTable),
  authLinkRequests: many(authLinkRequestTable),
  sessions: many(sessionTable),
  permissions: many(permissionTable, { relationName: "userPermissions" }),
  auditLogsAsActor: many(auditLogTable, { relationName: "auditActor" }),
  securityEvents: many(securityEventTable),
}));

const authAccountRelations = relations(authAccountTable, ({ one }) => ({
  user: one(userTable, {
    fields: [authAccountTable.userId],
    references: [userTable.id],
  }),
}));

const authLinkRequestRelations = relations(authLinkRequestTable, ({ one }) => ({
  targetUser: one(userTable, {
    fields: [authLinkRequestTable.targetUserId],
    references: [userTable.id],
  }),
}));

const sessionRelations = relations(sessionTable, ({ one, many }) => ({
  user: one(userTable, {
    fields: [sessionTable.userId],
    references: [userTable.id],
  }),
  securityEvents: many(securityEventTable),
}));

const permissionRelations = relations(permissionTable, ({ one }) => ({
  user: one(userTable, {
    fields: [permissionTable.userId],
    references: [userTable.id],
    relationName: "userPermissions",
  }),
  grantedByUser: one(userTable, {
    fields: [permissionTable.grantedBy],
    references: [userTable.id],
    relationName: "permissionGranter",
  }),
}));

const auditLogRelations = relations(auditLogTable, ({ one }) => ({
  actor: one(userTable, {
    fields: [auditLogTable.actorId],
    references: [userTable.id],
    relationName: "auditActor",
  }),
}));

const securityEventRelations = relations(securityEventTable, ({ one }) => ({
  user: one(userTable, {
    fields: [securityEventTable.userId],
    references: [userTable.id],
  }),
  session: one(sessionTable, {
    fields: [securityEventTable.sessionId],
    references: [sessionTable.id],
  }),
}));

export {
  auditLogRelations,
  authAccountRelations,
  authLinkRequestRelations,
  permissionRelations,
  securityEventRelations,
  sessionRelations,
  userRelations,
};
