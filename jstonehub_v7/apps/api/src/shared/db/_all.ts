import {
  auditLogRelations,
  authAccountRelations,
  authLinkRequestRelations,
  permissionRelations,
  securityEventRelations,
  sessionRelations,
  userRelations,
} from "./_relation";
import { auditLogTable } from "./schema/audit.table";
import { authAccountTable } from "./schema/auth-account.table";
import { authLinkRequestTable } from "./schema/auth-link-request.table";
import { permissionTable } from "./schema/permission.table";
import { securityEventTable } from "./schema/security-event.table";
import { sessionTable } from "./schema/session.table";
import { userTable } from "./schema/user.table";

const schema = {
  auditLogTable,
  authAccountTable,
  authLinkRequestTable,
  permissionTable,
  securityEventTable,
  sessionTable,
  userTable,

  auditLogRelations,
  authAccountRelations,
  authLinkRequestRelations,
  permissionRelations,
  securityEventRelations,
  sessionRelations,
  userRelations,
};

export { schema };
