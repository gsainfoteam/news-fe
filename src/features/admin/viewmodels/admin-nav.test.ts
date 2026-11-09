import { describe, expect, test } from "bun:test";
import { type TFunction } from "i18next";

import { getAdminNav, getSectionPermission } from "./admin-nav";

const t = ((_key: string, fallback: string) => fallback) as TFunction;
const sections = (permission: "NONE" | "EDITOR" | "EDITORSHIP") =>
  getAdminNav(t, "ko", { permission }).map((item) => item.section);

describe("getAdminNav", () => {
  test("shows only the menus each permission can open", () => {
    expect(sections("NONE")).toEqual(["reports"]);
    expect(sections("EDITOR")).toEqual(["articles", "reports"]);
    expect(sections("EDITORSHIP")).toEqual(["articles", "reports", "members"]);
  });

  test("prefixes paths with the language", () => {
    const [articles] = getAdminNav(t, "en", { permission: "EDITOR" });
    expect(articles.href).toBe("/en/admin");
  });
});

describe("getSectionPermission", () => {
  test("matches the menu", () => {
    expect(getSectionPermission("articles")).toBe("EDITOR");
    expect(getSectionPermission("reports")).toBe("NONE");
    expect(getSectionPermission("members")).toBe("EDITORSHIP");
  });
});
