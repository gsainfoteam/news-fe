import { describe, expect, test } from "bun:test";

import { MAX_REPORT_FILE_SIZE, zReportFileName } from "../models";
import {
  checkReportFile,
  formatFileSize,
  getReportFileKind,
  toSafeFileName,
} from "./report-file";

describe("toSafeFileName", () => {
  test.each([
    ["lounge-door.jpg", "lounge-door.jpg"],
    ["회의록 2차.pdf", "2.pdf"],
    ["사진.JPG", "file.jpg"],
    ["학생회관 lounge (1).png", "lounge_1.png"],
    ["résumé final.docx", "resume_final.docx"],
    [".hidden.txt", "hidden.txt"],
    ["archive.tar.zip", "archive.tar.zip"],
    ["README", "README"],
  ])("%s -> %s", (input, expected) => {
    expect(toSafeFileName(input)).toBe(expected);
  });

  test("always passes the backend pattern", () => {
    for (const name of ["😀.png", "...", "a b/c\\d.pdf", "가".repeat(300)]) {
      expect(zReportFileName.safeParse(toSafeFileName(name)).success).toBe(
        true,
      );
    }
  });

  test("handles macOS NFD names", () => {
    expect(toSafeFileName("녹음.m4a".normalize("NFD"))).toBe("file.m4a");
  });
});

describe("checkReportFile", () => {
  test("accepts allowed types regardless of case", () => {
    expect(checkReportFile({ name: "a.PDF", size: 10 })).toBeUndefined();
    expect(checkReportFile({ name: "a.heic", size: 10 })).toBeUndefined();
  });

  test("rejects other types and names without an extension", () => {
    expect(checkReportFile({ name: "scan.bmp", size: 10 })).toBe("type");
    expect(checkReportFile({ name: "run.exe", size: 10 })).toBe("type");
    expect(checkReportFile({ name: "pdf", size: 10 })).toBe("type");
  });

  test("rejects files over the limit and empty files", () => {
    expect(
      checkReportFile({ name: "a.mp4", size: MAX_REPORT_FILE_SIZE }),
    ).toBeUndefined();
    expect(
      checkReportFile({ name: "a.mp4", size: MAX_REPORT_FILE_SIZE + 1 }),
    ).toBe("size");
    expect(checkReportFile({ name: "a.txt", size: 0 })).toBe("empty");
  });
});

test("getReportFileKind", () => {
  expect(getReportFileKind("a.jpeg")).toBe("image");
  expect(getReportFileKind("a.MOV")).toBe("video");
  expect(getReportFileKind("a.m4a")).toBe("audio");
  expect(getReportFileKind("a.zip")).toBe("archive");
  expect(getReportFileKind("a.hwp")).toBe("document");
});

test("formatFileSize", () => {
  expect(formatFileSize(900)).toBe("900B");
  expect(formatFileSize(1536)).toBe("1.5KB");
  expect(formatFileSize(2.4 * 1024 ** 2)).toBe("2.4MB");
  expect(formatFileSize(MAX_REPORT_FILE_SIZE)).toBe("20MB");
});
