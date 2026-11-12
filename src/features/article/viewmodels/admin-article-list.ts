import { CATEGORIES, type Category } from "@/features/category";

import { type Article, type ArticleSort } from "../models";

export const ADMIN_PAGE_SIZE = 20;

export type AdminArticleSort = Extract<ArticleSort, "LATEST" | "MOST_POPULAR">;

export type AdminArticleFilters = {
  search: string;
  category?: Category;
  sort: AdminArticleSort;
  page: number;
};

export const DEFAULT_FILTERS: AdminArticleFilters = {
  search: "",
  sort: "LATEST",
  page: 1,
};

// Filters live in the query string so a reload or the back button returns to
// the same page of results. Only these keys are touched; others are kept.
const KEYS = { search: "q", category: "category", sort: "sort", page: "page" };

export function parseAdminArticleFilters(search: string): AdminArticleFilters {
  const params = new URLSearchParams(search);
  const category = params.get(KEYS.category);
  const page = Number.parseInt(params.get(KEYS.page) ?? "", 10);
  return {
    search: params.get(KEYS.search) ?? "",
    category: CATEGORIES.find((c) => c === category),
    sort: params.get(KEYS.sort) === "MOST_POPULAR" ? "MOST_POPULAR" : "LATEST",
    page: Number.isInteger(page) && page > 1 ? page : 1,
  };
}

export function writeAdminArticleFilters(
  search: string,
  filters: AdminArticleFilters,
) {
  const params = new URLSearchParams(search);
  const set = (key: string, value: string | undefined) =>
    value ? params.set(key, value) : params.delete(key);
  set(KEYS.search, filters.search.trim());
  set(KEYS.category, filters.category);
  set(KEYS.sort, filters.sort === "LATEST" ? undefined : filters.sort);
  set(KEYS.page, filters.page > 1 ? String(filters.page) : undefined);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function toArticlesQuery(filters: AdminArticleFilters) {
  const search = filters.search.trim();
  return {
    offset: (filters.page - 1) * ADMIN_PAGE_SIZE,
    limit: ADMIN_PAGE_SIZE,
    sort: filters.sort,
    ...(search && { search }),
    ...(filters.category && { category: filters.category }),
  };
}

export function getPageCount(count: number) {
  return Math.max(1, Math.ceil(count / ADMIN_PAGE_SIZE));
}

export function getPageWindow(page: number, pageCount: number, size = 5) {
  const start = Math.max(
    1,
    Math.min(page - Math.floor(size / 2), pageCount - size + 1),
  );
  const end = Math.min(pageCount, start + size - 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function getAuthorNames(article: Pick<Article, "authors">) {
  return article.authors.map((a) => a.name).join(", ");
}

// The backend sets updatedAt on create too; a save within a minute of
// creation is the same edit session, not a later revision.
export function isEdited(article: Pick<Article, "createdAt" | "updatedAt">) {
  return article.updatedAt.getTime() - article.createdAt.getTime() > 60_000;
}
