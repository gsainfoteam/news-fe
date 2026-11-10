import { useCallback, useEffect, useState, type MouseEvent } from "react";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import {
  getErrorStatus,
  getFileLinkExpiresAt,
  getInboxHref,
  getPageCount,
  type InboxLocation,
  isFileLinkExpired,
  parseInboxLocation,
  REPORT_FILE_LINK_LIFETIME_MS,
  REPORT_GC_TIME_MS,
  shouldRetryReport,
  toReportsQuery,
} from "./report-inbox";
import { reportQuery, reportsQuery } from "../models";

const readLocation = () =>
  parseInboxLocation(window.location.pathname, window.location.search);

// The list and the open report share one island, so moving between
// `/admin/reports` and `/admin/reports/view` swaps state and pushes the URL
// instead of loading a new page. With `initial` (stories) the URL is left
// alone.
export function useReportInbox(lng: string, initial?: InboxLocation) {
  const [location, setLocation] = useState(() => initial ?? readLocation());
  const inMemory = initial !== undefined;

  useEffect(() => {
    if (inMemory) return;
    const onPopState = () => setLocation(readLocation());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [inMemory]);

  const go = useCallback(
    (next: InboxLocation, { replace = false } = {}) => {
      if (!inMemory) {
        const href = getInboxHref(lng, next);
        if (replace) history.replaceState(null, "", href);
        else history.pushState(null, "", href);
      }
      setLocation(next);
    },
    [lng, inMemory],
  );

  const query = useQuery({
    ...reportsQuery({ query: toReportsQuery(location.page) }),
    placeholderData: keepPreviousData,
    gcTime: REPORT_GC_TIME_MS,
    retry: shouldRetryReport,
  });
  const count = query.data?.count ?? 0;
  const pageCount = getPageCount(count);

  // A stale `?page=` past the end, e.g. from an old bookmark.
  const outOfRange =
    !query.isPlaceholderData &&
    query.data !== undefined &&
    location.page > pageCount;
  useEffect(() => {
    if (outOfRange) {
      go({ ...location, page: pageCount }, { replace: true });
    }
  }, [outOfRange, go, location, pageCount]);

  return {
    location,
    // Real links, so a report opens in a new tab too; a plain click stays.
    link: (next: InboxLocation) => ({
      href: getInboxHref(lng, next),
      onClick: (event: MouseEvent) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
          return;
        }
        event.preventDefault();
        go(next);
      },
    }),
    reports: query.data?.reports ?? [],
    count,
    pageCount,
    status: query.status,
    isFetching: query.isFetching,
    retry: () => void query.refetch(),
  };
}

export function useReportDetail(id: number | undefined) {
  const query = useQuery({
    ...reportQuery({ path: { id: id ?? 0 } }),
    enabled: id !== undefined,
    gcTime: REPORT_GC_TIME_MS,
    retry: shouldRetryReport,
    // A report is only as fresh as its download links, so focusing the tab
    // after they lapse refetches it.
    staleTime: REPORT_FILE_LINK_LIFETIME_MS,
  });
  const fetchedAt = query.dataUpdatedAt;

  // Re-read the clock when the links lapse; a refetch moves `fetchedAt` past
  // `now`, which makes them usable again.
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (!fetchedAt) return;
    const timer = setTimeout(
      () => setNow(Date.now()),
      Math.max(0, getFileLinkExpiresAt(fetchedAt) - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [fetchedAt]);

  const linksExpired = fetchedAt > 0 && isFileLinkExpired(fetchedAt, now);

  return {
    report: query.data,
    status: query.status,
    notFound: getErrorStatus(query.error) === 404,
    isFetching: query.isFetching,
    retry: () => void query.refetch(),
    linksExpired,
    linksExpireAt: fetchedAt ? getFileLinkExpiresAt(fetchedAt) : undefined,
    // Timers stall while a laptop sleeps, so check the clock again right
    // before the browser follows a download link.
    guardLink: (event: MouseEvent) => {
      if (isFileLinkExpired(fetchedAt, Date.now())) {
        event.preventDefault();
        setNow(Date.now());
      }
    },
    refreshLinks: async () => {
      const result = await query.refetch();
      return !result.isError;
    },
  };
}
