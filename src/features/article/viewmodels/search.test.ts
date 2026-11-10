import { describe, expect, test } from "bun:test";

import { extractSummary } from "./article-content";
import {
  extractSnippet,
  getRequestedPages,
  MAX_QUERY_LENGTH,
  MAX_SEARCH_PAGES,
  mergeSearchPages,
  parseSearchParams,
  toSearchQuery,
  writeSearchParams,
  type SearchState,
} from "./search";
import { createMockArticle } from "../models/mocks";

const state = (patch: Partial<SearchState> = {}): SearchState => ({
  q: "기숙사",
  sort: "LATEST",
  page: 1,
  ...patch,
});

describe("parseSearchParams", () => {
  test("reads a Korean query from an encoded URL", () => {
    expect(
      parseSearchParams(`?q=${encodeURIComponent("기숙사 식당")}`),
    ).toEqual({
      q: "기숙사 식당",
      category: undefined,
      sort: "LATEST",
      page: 1,
    });
  });

  test("reads every key", () => {
    expect(
      parseSearchParams("?q=a&category=CAMPUS&sort=MOST_POPULAR&page=3"),
    ).toEqual({ q: "a", category: "CAMPUS", sort: "MOST_POPULAR", page: 3 });
  });

  test("collapses whitespace and trims", () => {
    expect(parseSearchParams("?q=%20%20a%20%20%20b%0A").q).toBe("a b");
  });

  test("caps the query length", () => {
    const long = "가".repeat(MAX_QUERY_LENGTH + 20);
    expect(parseSearchParams(`?q=${long}`).q).toHaveLength(MAX_QUERY_LENGTH);
  });

  test("falls back to defaults for unknown values", () => {
    expect(parseSearchParams("?category=campus&sort=RANDOM&page=abc")).toEqual({
      q: "",
      category: undefined,
      sort: "LATEST",
      page: 1,
    });
  });

  test.each(["0", "-2", "1.5", "2e3", ""])("page %p reads as 1", (page) => {
    expect(parseSearchParams(`?page=${page}`).page).toBe(1);
  });

  test("caps the page so a hand-edited URL can't fan out requests", () => {
    expect(parseSearchParams("?page=500").page).toBe(MAX_SEARCH_PAGES);
  });
});

describe("writeSearchParams", () => {
  test("leaves defaults out", () => {
    expect(writeSearchParams("", state())).toBe(
      `?q=${encodeURIComponent("기숙사")}`,
    );
  });

  test("round-trips through parseSearchParams", () => {
    const full = state({ category: "RESEARCH", sort: "MOST_POPULAR", page: 4 });
    expect(parseSearchParams(writeSearchParams("", full))).toEqual(full);
  });

  test("keeps keys it doesn't own and drops ones reset to default", () => {
    expect(
      writeSearchParams("?utm_source=x&page=3&sort=MOST_POPULAR", state()),
    ).toBe(`?utm_source=x&q=${encodeURIComponent("기숙사")}`);
  });

  test("writes nothing for an empty search", () => {
    expect(writeSearchParams("?q=old", state({ q: " " }))).toBe("");
  });
});

describe("toSearchQuery", () => {
  test("maps a page to offset and limit", () => {
    expect(toSearchQuery(state({ category: "CAMPUS" }), 3)).toEqual({
      search: "기숙사",
      offset: 20,
      limit: 10,
      sort: "LATEST",
      category: "CAMPUS",
    });
  });

  test("omits the category filter when unset", () => {
    expect(toSearchQuery(state(), 1)).not.toHaveProperty("category");
  });
});

describe("getRequestedPages", () => {
  test("asks for the first page until the total is known", () => {
    expect(getRequestedPages(state({ page: 3 }))).toEqual([1]);
  });

  test("restores every loaded page", () => {
    expect(getRequestedPages(state({ page: 3 }), 23)).toEqual([1, 2, 3]);
  });

  test("stops at the last page", () => {
    expect(getRequestedPages(state({ page: 5 }), 23)).toEqual([1, 2, 3]);
    expect(getRequestedPages(state({ page: 2 }), 0)).toEqual([1]);
  });
});

describe("extractSnippet", () => {
  const filler = "가나다 라마바 사아자 차카타 ".repeat(6);

  test("uses the summary when nothing matches", () => {
    const html = `<p>${filler}</p>`;
    expect(extractSnippet(html, "기숙사")).toBe(extractSummary(html));
  });

  test("uses the summary when the match is near the start", () => {
    const html = `<p>기숙사 식당 ${filler}</p>`;
    expect(extractSnippet(html, "기숙사")).toBe(extractSummary(html));
  });

  test("starts near a later match, on a word boundary", () => {
    const snippet = extractSnippet(
      `<p>${filler}<strong>기숙사</strong> 식당의 저녁 운영 ${filler}${filler}</p>`,
      "기숙사",
    );
    expect(snippet.startsWith("…")).toBe(true);
    expect(snippet.endsWith("…")).toBe(true);
    expect(snippet).toContain("기숙사 식당");
    expect(snippet[1]).not.toBe(" ");
    expect(Array.from(snippet).length).toBeLessThanOrEqual(161);
  });

  test("matches any term, ignoring case", () => {
    expect(
      extractSnippet(`<p>${filler}GIST 소식</p>`, "없는말 gist"),
    ).toContain("GIST 소식");
  });

  test("treats regex characters in the query as text", () => {
    expect(extractSnippet(`<p>${filler}a+b 공식</p>`, "a+b")).toContain(
      "a+b 공식",
    );
  });
});

describe("mergeSearchPages", () => {
  test("joins pages in order and drops a row repeated by an offset shift", () => {
    const [a, b, c] = [0, 1, 2].map((i) => createMockArticle(i));
    const merged = mergeSearchPages(
      [{ articles: [a, b] }, { articles: [b, c] }],
      "연구",
    );
    expect(merged.map((p) => p.id)).toEqual([a.id, b.id, c.id]);
  });
});
