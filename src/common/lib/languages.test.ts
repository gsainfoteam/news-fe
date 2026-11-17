import { describe, expect, test } from "bun:test";

import { delocalizePath, getPathLanguage, switchLanguage } from "./languages";

describe("switchLanguage", () => {
  test("adds and removes the /en prefix", () => {
    expect(switchLanguage("/", "en")).toBe("/en/");
    expect(switchLanguage("/en/", "ko")).toBe("/");
    expect(switchLanguage("/en", "ko")).toBe("/");
    expect(switchLanguage("/article/12/", "en")).toBe("/en/article/12/");
    expect(switchLanguage("/en/category/campus/2", "ko")).toBe(
      "/category/campus/2",
    );
  });

  test("keeps the query string and hash", () => {
    expect(switchLanguage("/search?q=%EC%97%B0%EA%B5%AC", "en")).toBe(
      "/en/search?q=%EC%97%B0%EA%B5%AC",
    );
    expect(switchLanguage("/en/admin/articles/edit?id=42", "ko")).toBe(
      "/admin/articles/edit?id=42",
    );
    expect(switchLanguage("/article/3#comments", "en")).toBe(
      "/en/article/3#comments",
    );
  });

  test("accepts an absolute URL", () => {
    expect(
      switchLanguage("https://news.gistory.me/en/search?q=gist", "ko"),
    ).toBe("/search?q=gist");
  });

  test("is a no-op for the current language", () => {
    expect(switchLanguage("/en/report", "en")).toBe("/en/report");
    expect(switchLanguage("/report", "ko")).toBe("/report");
  });

  test("leaves paths that only start with the code alone", () => {
    expect(switchLanguage("/english", "en")).toBe("/en/english");
    expect(getPathLanguage("/english")).toBe("ko");
    expect(delocalizePath("/enroll/")).toBe("/enroll/");
  });
});
