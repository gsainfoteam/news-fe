import { describe, expect, test } from "bun:test";

import {
  getAdjacentNotices,
  getNoticeListPath,
  NOTICES_PER_PAGE,
  paginateNotices,
  toNoticeItem,
} from "./notice";
import { createMockNotice } from "../models/mocks";

const notices = (count: number) =>
  Array.from({ length: count }, (_, i) => createMockNotice(i));

test("list pages after the first sit under /notice/page", () => {
  expect(getNoticeListPath(1)).toBe("/notice");
  expect(getNoticeListPath(3)).toBe("/notice/page/3");
});

test("a notice item links to its notice page", () => {
  const item = toNoticeItem(createMockNotice(0, { subtitle: "  " }));
  expect(item.path).toBe("/notice/900");
  expect(item.subtitle).toBeUndefined();
});

describe("paginateNotices", () => {
  test("splits into pages that all know the total", () => {
    const pages = paginateNotices(notices(NOTICES_PER_PAGE + 3));
    expect(pages.map((p) => p.notices.length)).toEqual([NOTICES_PER_PAGE, 3]);
    expect(pages.map((p) => [p.page.current, p.page.last, p.total])).toEqual([
      [1, 2, NOTICES_PER_PAGE + 3],
      [2, 2, NOTICES_PER_PAGE + 3],
    ]);
  });

  test("keeps an empty first page for the empty state", () => {
    expect(paginateNotices([])).toEqual([
      { page: { current: 1, last: 1 }, total: 0, notices: [] },
    ]);
  });
});

describe("getAdjacentNotices", () => {
  const list = notices(3);

  test("newer is the one before, older the one after", () => {
    const { newer, older } = getAdjacentNotices(list, list[1].id);
    expect(newer?.id).toBe(list[0].id);
    expect(older?.id).toBe(list[2].id);
  });

  test("the ends have one side only", () => {
    expect(getAdjacentNotices(list, list[0].id).newer).toBeUndefined();
    expect(getAdjacentNotices(list, list[2].id).older).toBeUndefined();
  });

  test("an unknown id has neither", () => {
    expect(getAdjacentNotices(list, 1)).toEqual({
      newer: undefined,
      older: undefined,
    });
  });
});
