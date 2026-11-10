import { describe, expect, test } from "bun:test";

import {
  formatReporterPhone,
  getFileLinkExpiresAt,
  getInboxHref,
  getPageWindow,
  getReplyHref,
  getReportTitle,
  isFileLinkExpired,
  parseInboxLocation,
  shouldRetryReport,
  toReportsQuery,
} from "./report-inbox";

const MINUTE = 60_000;

describe("file link expiry", () => {
  const fetchedAt = Date.UTC(2026, 9, 28, 12, 0);

  test("a link fetched just now is usable", () => {
    expect(isFileLinkExpired(fetchedAt, fetchedAt)).toBe(false);
    expect(isFileLinkExpired(fetchedAt, fetchedAt + 8 * MINUTE)).toBe(false);
  });

  test("expires a minute before the 10-minute presign runs out", () => {
    expect(getFileLinkExpiresAt(fetchedAt)).toBe(fetchedAt + 9 * MINUTE);
    expect(isFileLinkExpired(fetchedAt, fetchedAt + 9 * MINUTE - 1)).toBe(
      false,
    );
    expect(isFileLinkExpired(fetchedAt, fetchedAt + 9 * MINUTE)).toBe(true);
  });

  test("a link left open for longer than 10 minutes is expired", () => {
    expect(isFileLinkExpired(fetchedAt, fetchedAt + 10 * MINUTE)).toBe(true);
    expect(isFileLinkExpired(fetchedAt, fetchedAt + 3 * 60 * MINUTE)).toBe(
      true,
    );
  });
});

describe("parseInboxLocation", () => {
  test("reads the report id only on the view route", () => {
    expect(parseInboxLocation("/admin/reports/view", "?id=17&page=2")).toEqual({
      id: 17,
      page: 2,
    });
    expect(parseInboxLocation("/en/admin/reports/view/", "?id=3")).toEqual({
      id: 3,
      page: 1,
    });
    expect(parseInboxLocation("/admin/reports", "?id=17")).toEqual({
      id: undefined,
      page: 1,
    });
  });

  test("ignores ids and pages that aren't positive integers", () => {
    for (const id of [
      "",
      "0",
      "-1",
      "1.5",
      "abc",
      "1e3",
      "99999999999999999",
    ]) {
      expect(
        parseInboxLocation("/admin/reports/view", `?id=${id}`).id,
      ).toBeUndefined();
    }
    expect(parseInboxLocation("/admin/reports", "?page=0").page).toBe(1);
    expect(parseInboxLocation("/admin/reports", "?page=x").page).toBe(1);
  });
});

test("getInboxHref builds the route back from a location", () => {
  expect(getInboxHref("ko", { page: 1 })).toBe("/admin/reports");
  expect(getInboxHref("ko", { page: 3 })).toBe("/admin/reports?page=3");
  expect(getInboxHref("ko", { id: 17, page: 1 })).toBe(
    "/admin/reports/view?id=17",
  );
  expect(getInboxHref("en", { id: 17, page: 2 })).toBe(
    "/en/admin/reports/view?id=17&page=2",
  );
});

test("toReportsQuery stays within the backend's limit of 50", () => {
  expect(toReportsQuery(1)).toEqual({ offset: 0, limit: 20 });
  expect(toReportsQuery(3)).toEqual({ offset: 40, limit: 20 });
  expect(toReportsQuery(1).limit).toBeLessThanOrEqual(50);
});

test("getPageWindow keeps five pages around the current one", () => {
  expect(getPageWindow(1, 2)).toEqual([1, 2]);
  expect(getPageWindow(1, 9)).toEqual([1, 2, 3, 4, 5]);
  expect(getPageWindow(6, 9)).toEqual([4, 5, 6, 7, 8]);
  expect(getPageWindow(9, 9)).toEqual([5, 6, 7, 8, 9]);
});

test("shouldRetryReport retries server errors only", () => {
  expect(shouldRetryReport(0, { statusCode: 404 })).toBe(false);
  expect(shouldRetryReport(0, { statusCode: 403 })).toBe(false);
  expect(shouldRetryReport(0, { statusCode: 500 })).toBe(true);
  expect(shouldRetryReport(0, new TypeError("Failed to fetch"))).toBe(true);
  expect(shouldRetryReport(2, { statusCode: 500 })).toBe(false);
});

describe("formatReporterPhone", () => {
  test("formats Korean numbers however they were typed", () => {
    for (const phone of ["01012345678", "010-1234-5678", "+82 10 1234 5678"]) {
      expect(formatReporterPhone(phone)).toEqual({
        label: "010-1234-5678",
        href: "tel:+821012345678",
      });
    }
  });

  test("keeps the country code for foreign numbers", () => {
    expect(formatReporterPhone("+1 415 555 2671")).toEqual({
      label: "+1 415 555 2671",
      href: "tel:+14155552671",
    });
  });

  test("shows an unparsable number as stored", () => {
    expect(formatReporterPhone("12-34")).toEqual({
      label: "12-34",
      href: "tel:1234",
    });
  });
});

test("getReplyHref encodes the subject", () => {
  expect(getReplyHref("a@gm.gist.ac.kr", "답변: 휴게 공간 & 출입")).toBe(
    "mailto:a@gm.gist.ac.kr?subject=%EB%8B%B5%EB%B3%80%3A%20%ED%9C%B4%EA%B2%8C%20%EA%B3%B5%EA%B0%84%20%26%20%EC%B6%9C%EC%9E%85",
  );
});

test("getReportTitle treats blank titles as missing", () => {
  expect(getReportTitle("  제목 ")).toBe("제목");
  expect(getReportTitle("   ")).toBeUndefined();
  expect(getReportTitle(null)).toBeUndefined();
  expect(getReportTitle(undefined)).toBeUndefined();
});
