import { describe, expect, test } from "bun:test";

import {
  ADMIN_PAGE_SIZE,
  getPageCount,
  getPageWindow,
  isEdited,
  parseAdminArticleFilters,
  toArticlesQuery,
  writeAdminArticleFilters,
} from "./admin-article-list";

describe("query string", () => {
  test("round-trips filters and drops defaults", () => {
    const filters = parseAdminArticleFilters(
      "?q=축제&category=CULTURE&sort=MOST_POPULAR&page=3",
    );
    expect(filters).toEqual({
      search: "축제",
      category: "CULTURE",
      sort: "MOST_POPULAR",
      page: 3,
    });
    expect(
      writeAdminArticleFilters("", { search: " ", sort: "LATEST", page: 1 }),
    ).toBe("");
  });

  test("ignores unknown values and keeps unrelated keys", () => {
    expect(parseAdminArticleFilters("?category=NOPE&page=-2&sort=x")).toEqual({
      search: "",
      category: undefined,
      sort: "LATEST",
      page: 1,
    });
    expect(
      writeAdminArticleFilters("?id=story&page=4", {
        search: "",
        sort: "LATEST",
        page: 2,
      }),
    ).toBe("?id=story&page=2");
  });
});

describe("toArticlesQuery", () => {
  test("turns the page into an offset and omits empty filters", () => {
    expect(toArticlesQuery({ search: "  ", sort: "LATEST", page: 3 })).toEqual({
      offset: 2 * ADMIN_PAGE_SIZE,
      limit: ADMIN_PAGE_SIZE,
      sort: "LATEST",
    });
    expect(
      toArticlesQuery({
        search: " 축제 ",
        category: "CULTURE",
        sort: "LATEST",
        page: 1,
      }),
    ).toMatchObject({ search: "축제", category: "CULTURE", offset: 0 });
  });
});

describe("pagination", () => {
  test("always has at least one page", () => {
    expect(getPageCount(0)).toBe(1);
    expect(getPageCount(ADMIN_PAGE_SIZE)).toBe(1);
    expect(getPageCount(ADMIN_PAGE_SIZE + 1)).toBe(2);
  });

  test("centers the window and clamps it to the ends", () => {
    expect(getPageWindow(1, 3)).toEqual([1, 2, 3]);
    expect(getPageWindow(1, 10)).toEqual([1, 2, 3, 4, 5]);
    expect(getPageWindow(6, 10)).toEqual([4, 5, 6, 7, 8]);
    expect(getPageWindow(10, 10)).toEqual([6, 7, 8, 9, 10]);
  });
});

describe("isEdited", () => {
  test("ignores the save that created the article", () => {
    const createdAt = new Date("2026-10-28T09:00:00Z");
    expect(
      isEdited({ createdAt, updatedAt: new Date("2026-10-28T09:00:30Z") }),
    ).toBe(false);
    expect(
      isEdited({ createdAt, updatedAt: new Date("2026-10-28T10:00:00Z") }),
    ).toBe(true);
  });
});
