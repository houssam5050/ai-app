import type { Role } from "@prisma/client";

const RANK: Record<Role, number> = {
  STUDENT: 0,
  INSTRUCTOR: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

export function hasRole(userRole: Role, minimum: Role): boolean {
  return RANK[userRole] >= RANK[minimum];
}

export function canManageCourse(
  userRole: Role,
  userId: string,
  instructorIds: string[],
): boolean {
  if (hasRole(userRole, "ADMIN")) return true;
  if (userRole === "INSTRUCTOR") return instructorIds.includes(userId);
  return false;
}

export function canManageUsers(actorRole: Role, targetRole: Role): boolean {
  // Only admins manage users; super-admin role changes require super-admin.
  if (actorRole === "SUPER_ADMIN") return true;
  if (actorRole === "ADMIN") return targetRole !== "SUPER_ADMIN";
  return false;
}

export function assertSuperAdmin(actorRole: Role) {
  if (actorRole !== "SUPER_ADMIN") throw new Error("FORBIDDEN");
}
