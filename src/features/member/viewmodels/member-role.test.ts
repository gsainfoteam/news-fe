import { describe, expect, test } from "bun:test";

import {
  getAccessLevel,
  getMemberActions,
  getRolesByAccess,
  isHandover,
  sortMembers,
} from "./member-role";
import { MEMBER_ROLES, REGISTRABLE_ROLES } from "../models";
import { mockMember } from "../models/mocks";

describe("roles", () => {
  test("EDITOR_IN_CHIEF is the only role registration leaves out", () => {
    expect(
      MEMBER_ROLES.filter((r) => !REGISTRABLE_ROLES.includes(r as never)),
    ).toEqual(["EDITOR_IN_CHIEF"]);
  });

  test("only EDITOR_IN_CHIEF hands the editorship over", () => {
    expect(MEMBER_ROLES.filter(isHandover)).toEqual(["EDITOR_IN_CHIEF"]);
  });
});

describe("getAccessLevel", () => {
  test("follows the role, with ALUMNI apart from NONE", () => {
    expect(getAccessLevel({ role: "EDITOR_IN_CHIEF" })).toBe("EDITORSHIP");
    expect(getAccessLevel({ role: "SENIOR_DESIGNER" })).toBe("EDITOR");
    expect(getAccessLevel({ role: "CUB_REPORTER" })).toBe("NONE");
    expect(getAccessLevel({ role: "ALUMNI" })).toBe("ALUMNI");
  });

  test("prefers the permission the server sent", () => {
    expect(getAccessLevel({ role: "DESIGNER", permission: "EDITOR" })).toBe(
      "EDITOR",
    );
    expect(getAccessLevel({ role: "ALUMNI", permission: "EDITOR" })).toBe(
      "ALUMNI",
    );
  });

  test("groups every role exactly once", () => {
    const groups = getRolesByAccess();
    expect(groups.EDITORSHIP).toEqual(["EDITOR_IN_CHIEF"]);
    expect(groups.ALUMNI).toEqual(["ALUMNI"]);
    expect(Object.values(groups).flat().sort()).toEqual(
      [...MEMBER_ROLES].sort(),
    );
  });
});

describe("getMemberActions", () => {
  const chief = {
    email: "chief@gm.gist.ac.kr",
    permission: "EDITORSHIP",
  } as const;
  const other = { email: "other@gm.gist.ac.kr" };

  test("EDITORSHIP can change and delete others", () => {
    expect(getMemberActions(chief, other)).toEqual({
      canChangeRole: true,
      canDelete: true,
    });
  });

  test("nobody can change or delete their own row", () => {
    // Matched by email, case-insensitively: member and account ids differ.
    expect(getMemberActions(chief, { email: "Chief@gm.gist.ac.kr" })).toEqual({
      canChangeRole: false,
      canDelete: false,
    });
  });

  test("EDITOR and NONE only read", () => {
    for (const permission of ["EDITOR", "NONE"] as const) {
      expect(
        getMemberActions({ email: chief.email, permission }, other),
      ).toEqual({ canChangeRole: false, canDelete: false });
    }
  });
});

describe("sortMembers", () => {
  test("orders by masthead, then name, with ALUMNI last", () => {
    const members = [
      mockMember({ name: "윤태오", role: "ALUMNI" }),
      mockMember({ name: "한지우", role: "CUB_REPORTER" }),
      mockMember({ name: "김도윤", role: "EDITOR_IN_CHIEF" }),
      mockMember({ name: "가람", role: "CUB_REPORTER" }),
      mockMember({ name: "이서연", role: "DEPUTY_EDITOR_IN_CHIEF" }),
    ];
    expect(sortMembers(members).map((m) => m.name)).toEqual([
      "김도윤",
      "이서연",
      "가람",
      "한지우",
      "윤태오",
    ]);
  });
});
