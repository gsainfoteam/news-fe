import { describe, expect, test } from "bun:test";

import { getAdminAccess, hasPermission, isActiveMember } from "./permission";

describe("hasPermission", () => {
  test("follows NONE < EDITOR < EDITORSHIP", () => {
    expect(hasPermission({ permission: "NONE" }, "NONE")).toBe(true);
    expect(hasPermission({ permission: "NONE" }, "EDITOR")).toBe(false);
    expect(hasPermission({ permission: "EDITOR" }, "EDITOR")).toBe(true);
    expect(hasPermission({ permission: "EDITOR" }, "EDITORSHIP")).toBe(false);
    expect(hasPermission({ permission: "EDITORSHIP" }, "EDITOR")).toBe(true);
    expect(hasPermission({ permission: "EDITORSHIP" }, "EDITORSHIP")).toBe(
      true,
    );
  });
});

describe("isActiveMember", () => {
  test("needs a role other than ALUMNI", () => {
    expect(isActiveMember({ role: undefined })).toBe(false);
    expect(isActiveMember({ role: null as never })).toBe(false);
    expect(isActiveMember({ role: "ALUMNI" })).toBe(false);
    expect(isActiveMember({ role: "CUB_REPORTER" })).toBe(true);
  });
});

describe("getAdminAccess", () => {
  test("keeps readers out even when the required permission is NONE", () => {
    expect(getAdminAccess({ permission: "NONE" }, "NONE")).toBe("not-member");
    expect(getAdminAccess({ role: "ALUMNI", permission: "NONE" }, "NONE")).toBe(
      "not-member",
    );
  });

  test("lets members in by permission", () => {
    const reporter = {
      role: "REPORTING_REPORTER",
      permission: "NONE",
    } as const;
    const deputy = {
      role: "DEPUTY_EDITOR_IN_CHIEF",
      permission: "EDITOR",
    } as const;
    const chief = {
      role: "EDITOR_IN_CHIEF",
      permission: "EDITORSHIP",
    } as const;

    expect(getAdminAccess(reporter, "NONE")).toBe("granted");
    expect(getAdminAccess(reporter, "EDITOR")).toBe("forbidden");
    expect(getAdminAccess(deputy, "EDITOR")).toBe("granted");
    expect(getAdminAccess(deputy, "EDITORSHIP")).toBe("forbidden");
    expect(getAdminAccess(chief, "EDITORSHIP")).toBe("granted");
  });
});
