import { describe, expect, test } from "bun:test";

import { CATEGORIES } from "../models";
import { CATEGORY_GROUPS, fromCategorySlug, toCategorySlug } from "./category";

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
