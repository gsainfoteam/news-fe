import { useEffect, useState } from "react";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  type AdminArticleFilters,
  getPageCount,
  parseAdminArticleFilters,
  toArticlesQuery,
  writeAdminArticleFilters,
} from "./admin-article-list";
import {
  adminArticlesQuery,
  adminArticlesQueryKey,
  deleteArticleMutation,
} from "../models/admin";

const SEARCH_DELAY_MS = 300;

export function useAdminArticles() {
  const [filters, setFilters] = useState(() =>
    parseAdminArticleFilters(window.location.search),
  );
  const [searchInput, setSearchInput] = useState(filters.search);

  useEffect(() => {
    const search = writeAdminArticleFilters(window.location.search, filters);
    if (search !== window.location.search) {
      history.replaceState(history.state, "", `${location.pathname}${search}`);
    }
  }, [filters]);

  useEffect(() => {
    if (searchInput === filters.search) return;
    const timer = setTimeout(
      () => setFilters((f) => ({ ...f, search: searchInput, page: 1 })),
      SEARCH_DELAY_MS,
    );
    return () => clearTimeout(timer);
  }, [searchInput, filters.search]);

  const query = useQuery({
    ...adminArticlesQuery({ query: toArticlesQuery(filters) }),
    // Keep the current rows on screen while the next page or filter loads.
    placeholderData: keepPreviousData,
  });
  const count = Number(query.data?.count ?? 0);
  const pageCount = getPageCount(count);

  // Deleting the last row of the last page, or a stale `?page=` in the URL,
  // leaves the page past the end.
  useEffect(() => {
    if (!query.isPlaceholderData && query.data && filters.page > pageCount) {
      setFilters((f) => ({ ...f, page: pageCount }));
    }
  }, [query.isPlaceholderData, query.data, filters.page, pageCount]);

  const queryClient = useQueryClient();
  const remove = useMutation({
    ...deleteArticleMutation(),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [{ _id: adminArticlesQueryKey()[0]._id }],
      }),
  });

  const update = (patch: Partial<AdminArticleFilters>) =>
    setFilters((f) => ({ ...f, page: 1, ...patch }));

  return {
    filters,
    searchInput,
    setSearchInput,
    setCategory: (category: AdminArticleFilters["category"]) =>
      update({ category }),
    setSort: (sort: AdminArticleFilters["sort"]) => update({ sort }),
    setPage: (page: number) => setFilters((f) => ({ ...f, page })),
    articles: query.data?.articles ?? [],
    count,
    pageCount,
    status: query.status,
    isFetching: query.isFetching,
    retry: () => void query.refetch(),
    deleteArticle: (id: number) => remove.mutateAsync({ path: { id } }),
    isDeleting: remove.isPending,
  };
}
