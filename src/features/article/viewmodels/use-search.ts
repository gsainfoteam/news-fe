import { useCallback, useMemo, useSyncExternalStore } from "react";

import { useQueries, useQuery } from "@tanstack/react-query";

import { getArticleCount } from "./article-list";
import { toArticlePreview } from "./article-preview";
import {
  getRequestedPages,
  getSearchPageCount,
  mergeSearchPages,
  parseSearchParams,
  toSearchQuery,
  writeSearchParams,
  type SearchState,
} from "./search";
import { articlesQuery } from "../models";

// pushState fires no event of its own, so navigate() announces itself.
const NAVIGATE_EVENT = "search:navigate";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(NAVIGATE_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(NAVIGATE_EVENT, onChange);
  };
}

const getLocationSearch = () => window.location.search;

export function useSearchState() {
  const search = useSyncExternalStore(subscribe, getLocationSearch);
  const state = useMemo(() => parseSearchParams(search), [search]);

  // A new search or filter is a history entry of its own; "더 보기" replaces
  // the current one so the back button leaves the page instead of unloading
  // results one page at a time.
  const navigate = useCallback(
    (next: SearchState, { replace = false }: { replace?: boolean } = {}) => {
      const query = writeSearchParams(window.location.search, next);
      if (query === window.location.search) return;
      const url = `${window.location.pathname}${query}`;
      if (replace) history.replaceState(history.state, "", url);
      else history.pushState(null, "", url);
      window.dispatchEvent(new Event(NAVIGATE_EVENT));
    },
    [],
  );

  return [state, navigate] as const;
}

export function useSearchResults(state: SearchState) {
  const enabled = state.q !== "";
  const first = useQuery({
    ...articlesQuery({ query: toSearchQuery(state, 1) }),
    enabled,
  });
  const total = first.data ? getArticleCount(first.data) : undefined;
  const more = useQueries({
    queries: getRequestedPages(state, total)
      .slice(1)
      .map((page) => ({
        ...articlesQuery({ query: toSearchQuery(state, page) }),
        enabled,
      })),
  });

  const pages = [first, ...more];
  // Stop at the first page still loading so the list never has a gap.
  const loaded = pages.findIndex((page) => !page.data);
  const shown = loaded === -1 ? pages : pages.slice(0, loaded);
  const dataKey = shown.map((page) => page.dataUpdatedAt).join();
  const articles = useMemo(
    () =>
      mergeSearchPages(
        shown.map((page) => page.data!),
        state.q,
      ),
    // `shown` is a new array every render; these change exactly when its data does.
    [dataKey, state.q, state.sort, state.category],
  );

  const failed = more.filter((page) => page.isError);
  return {
    status: !enabled
      ? ("idle" as const)
      : first.isPending
        ? ("pending" as const)
        : first.isError
          ? ("error" as const)
          : ("success" as const),
    total: total ?? 0,
    articles,
    hasMore:
      total !== undefined &&
      shown.length === pages.length &&
      shown.length < getSearchPageCount(total),
    isLoadingMore: more.some((page) => page.isPending),
    isMoreError: failed.length > 0,
    isRetrying: first.isFetching,
    retry: () => void first.refetch(),
    retryMore: () => failed.forEach((page) => void page.refetch()),
  };
}

const LATEST_COUNT = 3;

// Shown under "no results", so the page still leads somewhere.
export function useLatestArticles(enabled: boolean) {
  const query = useQuery({
    ...articlesQuery({ query: { limit: LATEST_COUNT, sort: "LATEST" } }),
    enabled,
  });
  return useMemo(
    () => (query.data?.articles ?? []).map((a) => toArticlePreview(a)),
    [query.data],
  );
}
