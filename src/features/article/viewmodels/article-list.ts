import { type Category } from "@/features/category";

import { getChildCategories } from "./article-preview";
import { type Article, type ArticleListResponse } from "../models";

// news-be counts with raw `count(*)`, so Postgres' bigint arrives as a string.
export function getArticleCount(list: Pick<ArticleListResponse, "count">) {
  const count = Number(list.count);
  return Number.isFinite(count) ? count : 0;
}

// A section page lists its sub-categories too. The API matches one enum
// value exactly, so an article tagged only "연구" would be missing from
// "학술·연구" if the page asked the API by category.
export function filterByCategory(
  articles: readonly Article[],
  category: Category,
) {
  const family = new Set([category, ...getChildCategories(category)]);
  return articles.filter((article) =>
    article.categories.some((c) => family.has(c)),
  );
}

// Build-time views, so "popular" means popular as of the last build.
export function getPopularArticles(articles: readonly Article[], limit = 5) {
  return articles
    .toSorted(
      (a, b) =>
        b.views - a.views || b.createdAt.getTime() - a.createdAt.getTime(),
    )
    .slice(0, limit);
}

export const ARTICLES_PER_PAGE = 10;

export function getPagePath(basePath: string, page: number) {
  return page <= 1 ? basePath : `${basePath}/${page}`;
}

export type PageWindowItem = number | "ellipsis";

// Always the same number of slots, so the bar doesn't change width as the
// reader pages through. First and last stay reachable, and an ellipsis never
// stands in for a single page (that page is shown instead).
export function getPageWindow(
  current: number,
  last: number,
  siblings = 1,
): PageWindowItem[] {
  // first, last, current, siblings, and one gap slot on each side
  if (last <= siblings * 2 + 5) {
    return Array.from({ length: last }, (_, i) => i + 1);
  }
  const start = Math.max(
    Math.min(current - siblings, last - siblings * 2 - 2),
    3,
  );
  const end = Math.min(
    Math.max(current + siblings, siblings * 2 + 3),
    last - 2,
  );
  const items: PageWindowItem[] = [1, start > 3 ? "ellipsis" : 2];
  for (let page = start; page <= end; page++) items.push(page);
  items.push(end < last - 2 ? "ellipsis" : last - 1, last);
  return items;
}
