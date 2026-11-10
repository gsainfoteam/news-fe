import { describe, expect, test } from "bun:test";

import {
  filterByCategory,
  getArticleCount,
  getPagePath,
  getPageWindow,
  getPopularArticles,
} from "./article-list";
import { getKickerCategory, toArticlePreview } from "./article-preview";
import { createMockArticle } from "../models/mocks";

describe("getArticleCount", () => {
  test("accepts the bigint string news-be sends", () => {
    expect(getArticleCount({ count: "42" })).toBe(42);
    expect(getArticleCount({ count: 7 })).toBe(7);
    expect(getArticleCount({ count: "" })).toBe(0);
    expect(getArticleCount({ count: "abc" })).toBe(0);
  });
});

describe("filterByCategory", () => {
  const articles = [
    createMockArticle(0, { categories: ["ACADEMIC_RESEARCH"] }),
    createMockArticle(1, { categories: ["RESEARCH"] }),
    createMockArticle(2, { categories: ["CAMPUS"] }),
    createMockArticle(3, { categories: ["CAMPUS", "ACADEMIC"] }),
  ];
  const ids = (list: { id: number }[]) => list.map((a) => a.id);

  test("a section includes its sub-categories", () => {
    expect(ids(filterByCategory(articles, "ACADEMIC_RESEARCH"))).toEqual([
      1, 2, 4,
    ]);
  });

  test("a sub-category includes only itself", () => {
    expect(ids(filterByCategory(articles, "RESEARCH"))).toEqual([2]);
    expect(ids(filterByCategory(articles, "CAMPUS"))).toEqual([3, 4]);
  });

  test("an empty category is empty", () => {
    expect(filterByCategory(articles, "CARTOON")).toEqual([]);
  });
});

describe("getKickerCategory", () => {
  test("prefers the most specific category", () => {
    expect(getKickerCategory(["ACADEMIC_RESEARCH", "RESEARCH"])).toBe(
      "RESEARCH",
    );
    expect(getKickerCategory(["CAMPUS", "SOCIETY"])).toBe("CAMPUS");
  });

  test("stays inside the page's category", () => {
    expect(getKickerCategory(["CAMPUS", "ACADEMIC"], "CAMPUS")).toBe("CAMPUS");
    expect(getKickerCategory(["CAMPUS", "ACADEMIC"], "ACADEMIC_RESEARCH")).toBe(
      "ACADEMIC",
    );
  });

  test("is undefined without categories", () => {
    expect(getKickerCategory([])).toBeUndefined();
  });
});

describe("toArticlePreview", () => {
  test("falls back to the first body image without a thumbnail field", () => {
    const article = createMockArticle(0, {
      content: '<p>본문</p><img src="https://cdn.test/body.jpg">',
    });
    expect(toArticlePreview(article).thumbnail).toBe(
      "https://cdn.test/body.jpg",
    );
    expect(
      toArticlePreview({
        ...article,
        thumbnailUrl: "https://cdn.test/thumb.jpg",
      }).thumbnail,
    ).toBe("https://cdn.test/thumb.jpg");
  });

  test("links to the article and lists author names", () => {
    const card = toArticlePreview(
      createMockArticle(4, {
        authors: [
          { id: "a", name: "김도윤" },
          { id: "b", name: "이서연" },
        ],
      }),
    );
    expect(card.path).toBe("/article/5");
    expect(card.authors).toEqual(["김도윤", "이서연"]);
  });
});

test("getPopularArticles ranks by views, newer first on ties", () => {
  const articles = [
    createMockArticle(0, { views: 10 }),
    createMockArticle(1, { views: 30 }),
    createMockArticle(2, { views: 30 }),
    createMockArticle(3, { views: 20 }),
  ];
  expect(getPopularArticles(articles, 3).map((a) => a.id)).toEqual([2, 3, 4]);
});

test("getPagePath keeps page 1 at the base path", () => {
  expect(getPagePath("/category/campus", 1)).toBe("/category/campus");
  expect(getPagePath("/category/campus", 3)).toBe("/category/campus/3");
});

describe("getPageWindow", () => {
  test("lists every page when they fit", () => {
    expect(getPageWindow(1, 1)).toEqual([1]);
    expect(getPageWindow(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  test("keeps first and last around the current page", () => {
    expect(getPageWindow(1, 20)).toEqual([1, 2, 3, 4, 5, "ellipsis", 20]);
    expect(getPageWindow(10, 20)).toEqual([
      1,
      "ellipsis",
      9,
      10,
      11,
      "ellipsis",
      20,
    ]);
    expect(getPageWindow(20, 20)).toEqual([1, "ellipsis", 16, 17, 18, 19, 20]);
  });

  test("shows a lone hidden page instead of an ellipsis", () => {
    expect(getPageWindow(4, 20)).toEqual([1, 2, 3, 4, 5, "ellipsis", 20]);
    expect(getPageWindow(17, 20)).toEqual([1, "ellipsis", 16, 17, 18, 19, 20]);
  });

  test("always has the same number of slots", () => {
    for (let current = 1; current <= 30; current++) {
      expect(getPageWindow(current, 30)).toHaveLength(7);
    }
  });
});
