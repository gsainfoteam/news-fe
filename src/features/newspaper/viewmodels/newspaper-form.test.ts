import { describe, expect, test } from "bun:test";

import { checkNewspaperFile, toNewspaperFileRequest } from "./newspaper-file";
import { hasFormErrors, validateNewspaperForm } from "./newspaper-form";

const pdf = (size = 1024, name = "issue-72.pdf") =>
  new File([new Uint8Array(size)], name);

describe("checkNewspaperFile", () => {
  test("accepts a PDF up to 100MB", () => {
    expect(checkNewspaperFile({ name: "제72호.PDF", size: 1 })).toBeUndefined();
    expect(
      checkNewspaperFile({ name: "a.pdf", size: 100 * 1024 * 1024 }),
    ).toBeUndefined();
  });

  test("rejects other types, larger files and empty files", () => {
    expect(checkNewspaperFile({ name: "a.hwp", size: 1 })).toBe("type");
    expect(checkNewspaperFile({ name: "pdf", size: 1 })).toBe("type");
    expect(
      checkNewspaperFile({ name: "a.pdf", size: 100 * 1024 * 1024 + 1 }),
    ).toBe("size");
    expect(checkNewspaperFile({ name: "a.pdf", size: 0 })).toBe("empty");
  });
});

describe("toNewspaperFileRequest", () => {
  test("sends an ASCII name the backend pattern accepts and the real size", () => {
    expect(
      toNewspaperFileRequest({ name: "제72호 최종.PDF", size: 2048 }),
    ).toEqual({
      fileName: "72.pdf",
      contentLength: 2048,
    });
    expect(toNewspaperFileRequest({ name: "issue 72.pdf", size: 1 })).toEqual({
      fileName: "issue_72.pdf",
      contentLength: 1,
    });
  });
});

describe("validateNewspaperForm", () => {
  test("a new paper needs a title and a PDF", () => {
    expect(
      validateNewspaperForm({ title: "  " }, { requireFile: true }),
    ).toEqual({ title: "required", file: "required" });
    expect(
      hasFormErrors(
        validateNewspaperForm(
          { title: "제72호", file: pdf() },
          { requireFile: true },
        ),
      ),
    ).toBe(false);
  });

  test("an edit may keep the current PDF", () => {
    expect(
      hasFormErrors(
        validateNewspaperForm({ title: "제72호" }, { requireFile: false }),
      ),
    ).toBe(false);
  });

  test("reports a long title and a bad file", () => {
    expect(
      validateNewspaperForm(
        { title: "가".repeat(201), file: pdf(1, "a.png") },
        { requireFile: false },
      ),
    ).toEqual({ title: "tooLong", file: "type" });
  });
});
