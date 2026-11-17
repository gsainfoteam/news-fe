import { fetchAllArticles, getArticlePath, isNotice } from "@/features/article";

import { type Notice } from "../models";

export const NOTICES_PER_PAGE = 20;

export type NoticeItem = {
  id: number;
  /** Unprefixed; views localize it with `localizePath`. */
  path: string;
  title: string;
  subtitle?: string;
  publishedAt: Date;
};

const byLatest = (a: Notice, b: Notice) =>
  b.createdAt.getTime() - a.createdAt.getTime() || b.id - a.id;

// Build only. The article pages' list already holds every notice, so the
// notice pages cost no request of their own.
export async function fetchAllNotices(): Promise<Notice[]> {
  const articles = await fetchAllArticles();
  return articles.filter(isNotice).toSorted(byLatest);
}

// Page 2 can't be /notice/2: that is the notice with id 2.
export function getNoticeListPath(page: number) {
  return page <= 1 ? "/notice" : `/notice/page/${page}`;
}

export function toNoticeItem(notice: Notice): NoticeItem {
  return {
    id: notice.id,
    path: getArticlePath(notice),
    title: notice.title,
    subtitle: notice.subtitle?.trim() || undefined,
    publishedAt: notice.createdAt,
  };
}

export type NoticePage = {
  page: { current: number; last: number };
  total: number;
  notices: NoticeItem[];
};

/** Every list page, page 1 included even when there are no notices. */
export function paginateNotices(notices: readonly Notice[]): NoticePage[] {
  const last = Math.max(1, Math.ceil(notices.length / NOTICES_PER_PAGE));
  return Array.from({ length: last }, (_, i) => ({
    page: { current: i + 1, last },
    total: notices.length,
    notices: notices
      .slice(i * NOTICES_PER_PAGE, (i + 1) * NOTICES_PER_PAGE)
      .map(toNoticeItem),
  }));
}

/** `notices` is latest first, as `fetchAllNotices` returns it. */
export function getAdjacentNotices(notices: readonly Notice[], id: number) {
  const index = notices.findIndex((notice) => notice.id === id);
  const at = (i: number) =>
    index >= 0 && notices[i] ? toNoticeItem(notices[i]) : undefined;
  return { newer: at(index - 1), older: at(index + 1) };
}
