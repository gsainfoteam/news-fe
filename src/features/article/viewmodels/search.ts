import { CATEGORIES, type Category } from "@/features/category";

import { extractSummary, SUMMARY_LENGTH, toPlainText } from "./article-content";
import { toArticlePreview, type ArticlePreview } from "./article-preview";
import {
  type Article,
  type ArticleListResponse,
  type ArticleSort,
} from "../models";

export const SEARCH_PAGE_SIZE = 10;
// "더 보기" requests one page at a time and `?page=` restores them all, so a
// hand-edited `?page=500` would fire 500 requests without a cap.
export const MAX_SEARCH_PAGES = 20;
export const MAX_QUERY_LENGTH = 100;

export type SearchSort = Extract<ArticleSort, "LATEST" | "MOST_POPULAR">;

export type SearchState = {
  q: string;
  category?: Category;
  sort: SearchSort;
  /** How many pages of results are shown ("더 보기" adds one). */
  page: number;
};

// The URL is the source of truth: a reload or the back button returns to the
// same results, as far down the list as the reader had loaded.
export function parseSearchParams(search: string): SearchState {
  const params = new URLSearchParams(search);
  const category = params.get("category");
  const page = params.get("page") ?? "";
  return {
    q: normalizeQuery(params.get("q") ?? ""),
    category: CATEGORIES.find((c) => c === category),
    sort: params.get("sort") === "MOST_POPULAR" ? "MOST_POPULAR" : "LATEST",
    page: /^\d+$/.test(page)
      ? Math.min(Math.max(Number(page), 1), MAX_SEARCH_PAGES)
      : 1,
  };
}

export function normalizeQuery(query: string) {
  const text = query.replace(/\s+/g, " ").trim();
  // Count code points so a cut never splits a surrogate pair (emoji).
  return Array.from(text).slice(0, MAX_QUERY_LENGTH).join("").trim();
}

// Writes only the search keys and keeps the rest (utm_*, Storybook's own).
// Defaults are left out, so a plain search is just `?q=…`.
export function writeSearchParams(search: string, state: SearchState) {
  const params = new URLSearchParams(search);
  const set = (key: string, value: string | undefined) =>
    value ? params.set(key, value) : params.delete(key);
  set("q", normalizeQuery(state.q));
  set("category", state.category);
  set("sort", state.sort === "LATEST" ? undefined : state.sort);
  set("page", state.page > 1 ? String(state.page) : undefined);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function toSearchQuery(state: SearchState, page: number) {
  return {
    search: state.q,
    offset: (page - 1) * SEARCH_PAGE_SIZE,
    limit: SEARCH_PAGE_SIZE,
    sort: state.sort,
    ...(state.category && { category: state.category }),
  };
}

export function getSearchPageCount(total: number) {
  return Math.min(
    Math.max(1, Math.ceil(total / SEARCH_PAGE_SIZE)),
    MAX_SEARCH_PAGES,
  );
}

// Pages to request: only the first until the total is known, then up to
// `?page=` but never past the last page (a stale URL after articles were
// deleted).
export function getRequestedPages(state: SearchState, total?: number) {
  const count =
    total === undefined ? 1 : Math.min(state.page, getSearchPageCount(total));
  return Array.from({ length: count }, (_, i) => i + 1);
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const SNIPPET_CONTEXT = 40;

// The opening of an article rarely holds the search term. Show the text
// around the first match instead, so the reader sees why it matched.
export function extractSnippet(
  html: string,
  query: string,
  maxLength = SUMMARY_LENGTH,
) {
  const terms = query.split(" ").filter(Boolean).map(escapeRegExp);
  const text = toPlainText(html);
  const hit =
    terms.length > 0 ? new RegExp(terms.join("|"), "i").exec(text) : null;
  if (!hit) return extractSummary(html, maxLength);

  const chars = Array.from(text);
  const hitAt = Array.from(text.slice(0, hit.index)).length;
  if (hitAt <= SNIPPET_CONTEXT) return extractSummary(html, maxLength);

  let start = hitAt - SNIPPET_CONTEXT;
  // Start on a word: Korean wraps by eojeol.
  const space = chars.slice(start, hitAt).indexOf(" ");
  if (space !== -1) start += space + 1;

  const rest = chars.slice(start);
  // One char goes to the leading ellipsis.
  if (rest.length < maxLength) return `…${rest.join("")}`;
  const cut = rest.slice(0, maxLength - 1).join("");
  const end = cut.lastIndexOf(" ");
  const body = end > cut.length * 0.6 ? cut.slice(0, end) : cut;
  return `…${body.replace(/[\s.,·…]+$/, "")}…`;
}

export function toSearchPreview(
  article: Article,
  query: string,
): ArticlePreview {
  return {
    ...toArticlePreview(article),
    summary: extractSnippet(article.content, query),
  };
}

// An article published between two page requests shifts offsets by one and
// brings the previous page's last row back.
export function mergeSearchPages(
  pages: readonly Pick<ArticleListResponse, "articles">[],
  query: string,
) {
  const seen = new Set<number>();
  return pages
    .flatMap((page) => page.articles)
    .filter((article) => !seen.has(article.id) && !!seen.add(article.id))
    .map((article) => toSearchPreview(article, query));
}
