import { findPermissionsByUserId } from "#api/service/permission/permission.repository";

async function loadPermissionStrings(userId: string) {
  const rows = await findPermissionsByUserId(userId);
  return rows.map((row) => row.permission);
}

export { loadPermissionStrings };
