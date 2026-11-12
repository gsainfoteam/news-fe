import { type TFunction } from "i18next";

import { type Permission, type User } from "@/features/auth";

import { type Member, MEMBER_ROLES, type MemberRole } from "../models";

// news-be's DEFAULT_PERMISSION (member.policy.ts). The spec carries it only as
// prose, so it is copied here. The table shows the permission the server
// returns; this is only for previewing what a role change or a new member gets.
export const ROLE_PERMISSION: Record<MemberRole, Permission> = {
  EDITOR_IN_CHIEF: "EDITORSHIP",
  DEPUTY_EDITOR_IN_CHIEF: "EDITOR",
  REPORTING_SENIOR_REPORTER: "EDITOR",
  SENIOR_DESIGNER: "EDITOR",
  DIGITAL_SENIOR_REPORTER: "EDITOR",
  REPORTING_REPORTER: "NONE",
  DESIGNER: "NONE",
  DIGITAL_REPORTER: "NONE",
  CUB_REPORTER: "NONE",
  ALUMNI: "NONE",
};

// ALUMNI share permission NONE with reporters but cannot open the CMS at all,
// so the screen shows them as a level of their own.
export const ACCESS_LEVELS = [
  "EDITORSHIP",
  "EDITOR",
  "NONE",
  "ALUMNI",
] as const;
export type AccessLevel = (typeof ACCESS_LEVELS)[number];

export function getAccessLevel(
  member: Pick<Member, "role"> & { permission?: Permission },
): AccessLevel {
  if (member.role === "ALUMNI") return "ALUMNI";
  return member.permission ?? ROLE_PERMISSION[member.role];
}

export function getAccessLabels(t: TFunction): Record<AccessLevel, string> {
  return {
    EDITORSHIP: t("member.access.EDITORSHIP", "전체 관리"),
    EDITOR: t("member.access.EDITOR", "편집"),
    NONE: t("member.access.NONE", "권한 없음"),
    ALUMNI: t("member.access.ALUMNI", "접근 불가"),
  };
}

export function getRolesByAccess(): Record<AccessLevel, MemberRole[]> {
  const groups: Record<AccessLevel, MemberRole[]> = {
    EDITORSHIP: [],
    EDITOR: [],
    NONE: [],
    ALUMNI: [],
  };
  for (const role of MEMBER_ROLES) groups[getAccessLevel({ role })].push(role);
  return groups;
}

// Masthead order (the enum's), then name.
export function sortMembers(members: readonly Member[], lng = "ko") {
  return [...members].sort(
    (a, b) =>
      MEMBER_ROLES.indexOf(a.role) - MEMBER_ROLES.indexOf(b.role) ||
      a.name.localeCompare(b.name, lng),
  );
}

// `Member.id` is the member row's id and `User.id` the account's; news-be
// joins the two by email, so that is how a row is matched to the viewer.
export function isSelf(
  viewer: Pick<User, "email">,
  member: Pick<Member, "email">,
) {
  return viewer.email.toLowerCase() === member.email.toLowerCase();
}

export type MemberActions = { canChangeRole: boolean; canDelete: boolean };

// news-be lets only EDITORSHIP register, change and delete, and never on the
// caller's own row (403). EDITOR can read the list but change nothing.
export function getMemberActions(
  viewer: Pick<User, "email" | "permission">,
  member: Pick<Member, "email">,
): MemberActions {
  const allowed = viewer.permission === "EDITORSHIP" && !isSelf(viewer, member);
  return { canChangeRole: allowed, canDelete: allowed };
}

export const canRegisterMembers = (viewer: Pick<User, "permission">) =>
  viewer.permission === "EDITORSHIP";

// Giving someone EDITOR_IN_CHIEF hands the editorship over: news-be demotes
// the caller to CUB_REPORTER in the same transaction, so it needs a confirm.
export const isHandover = (role: MemberRole) => role === "EDITOR_IN_CHIEF";
