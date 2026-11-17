import { useEffect, useState } from "react";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { type Category } from "@/features/category";

import {
  type AdminArticleFilters,
  getPageCount,
  parseAdminArticleFilters,
  toArticlesQuery,
  writeAdminArticleFilters,
} from "./admin-article-list";
import {
  articlesQuery,
  articlesQueryKey,
  deleteArticleMutation,
} from "../models";

const SEARCH_DELAY_MS = 300;

// A pinned category (the notice list) ignores `?category=` and never writes it.
export function useAdminArticles(pinned?: Category) {
  const [filters, setFilters] = useState(() => {
    const parsed = parseAdminArticleFilters(window.location.search);
    return pinned ? { ...parsed, category: undefined } : parsed;
  });
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
    ...articlesQuery({
      query: toArticlesQuery(
        pinned ? { ...filters, category: pinned } : filters,
      ),
    }),
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
        queryKey: [{ _id: articlesQueryKey()[0]._id }],
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
