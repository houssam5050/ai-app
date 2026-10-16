import { describe, it, expect } from "vitest";
import { hasRole, canManageCourse, canManageUsers, assertSuperAdmin } from "@/server/permissions/rbac";

describe("admin permissions", () => {
  it("denies admin actions to students and instructors", () => {
    expect(hasRole("STUDENT", "ADMIN")).toBe(false);
    expect(hasRole("INSTRUCTOR", "ADMIN")).toBe(false);
    expect(hasRole("ADMIN", "ADMIN")).toBe(true);
  });
  it("lets instructors manage only their own courses", () => {
    expect(canManageCourse("INSTRUCTOR", "u1", ["u1"])).toBe(true);
    expect(canManageCourse("INSTRUCTOR", "u1", ["u2"])).toBe(false);
    expect(canManageCourse("STUDENT", "u1", ["u1"])).toBe(false);
  });
  it("reserves super-admin grants for super-admins", () => {
    expect(canManageUsers("ADMIN", "SUPER_ADMIN")).toBe(false);
    expect(canManageUsers("ADMIN", "STUDENT")).toBe(true);
    expect(() => assertSuperAdmin("ADMIN")).toThrow();
    expect(() => assertSuperAdmin("SUPER_ADMIN")).not.toThrow();
  });
});
