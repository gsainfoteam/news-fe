import { describe, expect, test } from "bun:test";

import { splitByQuery } from ".";

const marked = (text: string, query: string) =>
  splitByQuery(text, query)
    .filter((part) => part.match)
    .map((part) => part.text);

describe("splitByQuery", () => {
  test("marks every term, case-insensitively", () => {
    expect(marked("GIST 연구실 안전, gist 연구", "gist 연구")).toEqual([
      "GIST",
      "연구",
      "gist",
      "연구",
    ]);
  });

  test("treats regex characters literally", () => {
    expect(marked("C++ 스터디와 C 스터디", "c++")).toEqual(["C++"]);
  });

  test("keeps the whole text when the query is blank", () => {
    expect(splitByQuery("기사 제목", "  ")).toEqual([
      { text: "기사 제목", match: false },
    ]);
  });

  test("joins back to the original text", () => {
    const parts = splitByQuery("연구실 안전 점검", "안전");
    expect(parts.map((part) => part.text).join("")).toBe("연구실 안전 점검");
    expect(parts[0]).toEqual({ text: "연구실 ", match: false });
  });
});
