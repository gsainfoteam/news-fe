import { type TFunction } from "i18next";

import { localizePath } from "@/common/lib/languages";
import { hasPermission, type Permission, type User } from "@/features/auth";

export type AdminSection = "articles" | "reports" | "members";

export type AdminNavItem = {
  section: AdminSection;
  label: string;
  href: string;
  required: Permission;
};

// A page's guard and its menu entry read the same permission, so a menu item
// is shown exactly when its page lets the user in. The backend enforces the
// real rules; this only keeps people from opening screens that would fail.
const SECTIONS: readonly Omit<AdminNavItem, "label" | "href">[] = [
  { section: "articles", required: "EDITOR" },
  { section: "reports", required: "NONE" },
  { section: "members", required: "EDITORSHIP" },
];

const PATHS: Record<AdminSection, string> = {
  articles: "/admin",
  reports: "/admin/reports",
  members: "/admin/members",
};

export function getSectionPermission(section: AdminSection): Permission {
  return SECTIONS.find((s) => s.section === section)!.required;
}

export function getAdminNav(
  t: TFunction,
  lng: string,
  user: Pick<User, "permission">,
): AdminNavItem[] {
  const labels: Record<AdminSection, string> = {
    articles: t("admin.nav.articles", "기사"),
    reports: t("admin.nav.reports", "제보함"),
    members: t("admin.nav.members", "멤버 관리"),
  };
  return SECTIONS.filter((s) => hasPermission(user, s.required)).map((s) => ({
    ...s,
    label: labels[s.section],
    href: localizePath(lng, PATHS[s.section]),
  }));
}
