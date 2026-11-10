import { PERMISSIONS, type Permission, type User } from "../models";

export function hasPermission(
  user: Pick<User, "permission">,
  required: Permission,
) {
  return PERMISSIONS.indexOf(user.permission) >= PERMISSIONS.indexOf(required);
}

// Members with permission NONE (reporters, designers) still use the CMS for
// reports, so membership is a separate check from permission. ALUMNI keep a
// role for the member list but lose access.
export function isActiveMember(user: Pick<User, "role">) {
  return user.role != null && user.role !== "ALUMNI";
}

export type AdminAccess = "granted" | "forbidden" | "not-member";

export function getAdminAccess(
  user: Pick<User, "role" | "permission">,
  required: Permission,
): AdminAccess {
  if (!isActiveMember(user)) return "not-member";
  return hasPermission(user, required) ? "granted" : "forbidden";
}
