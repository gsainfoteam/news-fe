import { describe, expect, test } from "bun:test";

import { CATEGORIES } from "../models";
import {
  CATEGORY_GROUPS,
  fromCategorySlug,
  getCategoryTabs,
  toCategorySlug,
} from "./category";

describe("category slug", () => {
  test("round-trips every category", () => {
    for (const category of CATEGORIES) {
      expect(fromCategorySlug(toCategorySlug(category))).toBe(category);
    }
  });

  test("is unique and URL-safe", () => {
    const slugs = CATEGORIES.map(toCategorySlug);
    expect(new Set(slugs).size).toBe(CATEGORIES.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z]+(-[a-z]+)*$/);
  });

  test("rejects unknown slugs", () => {
    expect(fromCategorySlug("sports")).toBeUndefined();
    expect(fromCategorySlug("")).toBeUndefined();
    // The enum value itself is not a slug.
    expect(fromCategorySlug("academic_research")).toBeUndefined();
  });
});

test("navigation lists every category exactly once", () => {
  const listed = [
    ...CATEGORY_GROUPS.flatMap((g) => [g.category, ...g.children]),
    "NOTICE",
  ];
  expect(listed.toSorted()).toEqual([...CATEGORIES].toSorted());
});

describe("getCategoryTabs", () => {
  const t = ((_key: string, fallback: string) => fallback) as never;

  test("a section and its sub-categories share the same tabs", () => {
    const section = getCategoryTabs(t, "ko", "ACADEMIC_RESEARCH");
    const child = getCategoryTabs(t, "ko", "RESEARCH");
    expect(section.map((tab) => tab.label)).toEqual(["전체", "학술", "연구"]);
    expect(child.map((tab) => tab.href)).toEqual(
      section.map((tab) => tab.href),
    );
    expect(section.find((tab) => tab.current)?.category).toBe(
      "ACADEMIC_RESEARCH",
    );
    expect(child.find((tab) => tab.current)?.category).toBe("RESEARCH");
  });

  test("links follow the page language", () => {
    expect(getCategoryTabs(t, "en", "OPINION")[1].href).toBe(
      "/en/category/internal-column",
    );
  });

  test("sections without sub-categories have no tabs", () => {
    expect(getCategoryTabs(t, "ko", "CAMPUS")).toEqual([]);
    expect(getCategoryTabs(t, "ko", "NOTICE")).toEqual([]);
  });
});
