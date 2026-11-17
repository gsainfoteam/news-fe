import { describe, expect, test } from "bun:test";

import {
  formatDay,
  formatMonthDay,
  groupHistoryByYear,
  toAboutPage,
  toInstagramHandle,
  toLinkLabel,
  toParagraphs,
  toSafeUrl,
} from "./about-page";
import { MOCK_ABOUT } from "../models/mocks";

describe("toParagraphs", () => {
  test("splits on line breaks and drops blank lines", () => {
    expect(toParagraphs(" 첫 문단\n\n둘째 문단 \n\n")).toEqual([
      "첫 문단",
      "둘째 문단",
    ]);
  });
});

describe("groupHistoryByYear", () => {
  test("groups by year in date order, then id", () => {
    const years = groupHistoryByYear([
      { id: 3, date: "2017-04-10", content: "c" },
      { id: 2, date: "2016-05-31", content: "b" },
      { id: 5, date: "2016-04-11", content: "e" },
      { id: 1, date: "2016-04-11", content: "a" },
    ]);
    expect(years.map((y) => y.year)).toEqual(["2016", "2017"]);
    expect(years[0].entries.map((e) => e.id)).toEqual([1, 5, 2]);
  });

  test("returns nothing for an empty history", () => {
    expect(groupHistoryByYear([])).toEqual([]);
  });
});

describe("dates", () => {
  test("keep the calendar day", () => {
    expect(formatDay("2016-04-11")).toBe("2016.04.11");
    expect(formatMonthDay("2016-04-11")).toBe("04.11");
  });
});

describe("links", () => {
  test("only http(s) is linked", () => {
    expect(toSafeUrl("https://www.gistnews.co.kr")).toBe(
      "https://www.gistnews.co.kr",
    );
    expect(toSafeUrl("javascript:alert(1)")).toBeUndefined();
    expect(toSafeUrl("not a url")).toBeUndefined();
  });

  test("labels drop the scheme, www and trailing slash", () => {
    expect(toLinkLabel("https://www.gistnews.co.kr/")).toBe("gistnews.co.kr");
    expect(
      toInstagramHandle("https://www.instagram.com/gistnews._.official/"),
    ).toBe("@gistnews._.official");
  });
});

test("toAboutPage keeps the facts and splits the rest", () => {
  const page = toAboutPage(MOCK_ABOUT);
  expect(page.publisher).toBe(MOCK_ABOUT.publisher);
  expect(page.paragraphs).toHaveLength(3);
  expect(page.timeline[0].year).toBe("2015");
  expect("histories" in page).toBe(false);
});
