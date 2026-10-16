import { describe, it, expect } from "vitest";
import { hasRole, canManageCourse, canManageUsers } from "@/server/permissions/rbac";

describe("rbac", () => {
  it("ranks roles", () => {
    expect(hasRole("ADMIN", "INSTRUCTOR")).toBe(true);
    expect(hasRole("STUDENT", "ADMIN")).toBe(false);
    expect(hasRole("SUPER_ADMIN", "SUPER_ADMIN")).toBe(true);
  });
  it("restricts course management", () => {
    expect(canManageCourse("STUDENT", "u1", ["u1"])).toBe(false);
    expect(canManageCourse("INSTRUCTOR", "u1", ["u1"])).toBe(true);
    expect(canManageCourse("ADMIN", "u9", [])).toBe(true);
  });
  it("protects super-admin", () => {
    expect(canManageUsers("ADMIN", "SUPER_ADMIN")).toBe(false);
    expect(canManageUsers("SUPER_ADMIN", "ADMIN")).toBe(true);
  });
});
