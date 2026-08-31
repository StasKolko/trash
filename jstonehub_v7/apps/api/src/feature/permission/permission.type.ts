type AdminPermissionUser = {
  userId: string;
  userName: string;
  userEmail: string;
  userAvatarUrl: string | null;
  permissions: string[];
};

type UserPermissions = {
  permissions: string[];
};

type UpdatePermissionsInput = {
  permissions: string[];
};

export type { AdminPermissionUser, UpdatePermissionsInput, UserPermissions };
