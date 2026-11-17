import { describe, expect, test } from "bun:test";

import { getIssueNumber, suggestNextTitle, toArchiveYears } from "./archive";
import { mockNewspaper } from "../models/mocks";

describe("toArchiveYears", () => {
  test("groups by Korean calendar year, newest first", () => {
    const years = toArchiveYears([
      mockNewspaper(60, new Date("2024-10-10T00:00:00Z")),
      // 1 January 08:00 KST is still 31 December in UTC.
      mockNewspaper(62, new Date("2024-12-31T23:00:00Z")),
      mockNewspaper(61, new Date("2024-12-05T00:00:00Z")),
    ]);

    expect(years.map((y) => y.year)).toEqual([2025, 2024]);
    expect(years[0].issues.map((i) => i.title)).toEqual(["제62호"]);
    expect(years[1].issues.map((i) => i.title)).toEqual(["제61호", "제60호"]);
    expect(years[1].issues[0]).toEqual({
      id: 61,
      title: "제61호",
      url: expect.stringContaining("issue-61.pdf"),
      date: new Date("2024-12-05T00:00:00Z"),
    });
  });

  test("is empty without papers", () => {
    expect(toArchiveYears([])).toEqual([]);
  });
});

describe("getIssueNumber", () => {
  test("reads the number from a 제N호 title", () => {
    expect(getIssueNumber("제72호")).toBe(72);
    expect(getIssueNumber("제 9 호 (특별호)")).toBe(9);
    expect(getIssueNumber("창간 특별판")).toBeUndefined();
  });
});

describe("suggestNextTitle", () => {
  test("follows the highest issue number, not the latest upload", () => {
    expect(
      suggestNextTitle([
        { title: "제69호" },
        { title: "제71호" },
        { title: "특별판" },
      ]),
    ).toBe("제72호");
  });

  test("is blank when no title has a number", () => {
    expect(suggestNextTitle([])).toBe("");
    expect(suggestNextTitle([{ title: "특별판" }])).toBe("");
  });
});
