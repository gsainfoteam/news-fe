import { CATEGORY_GROUPS, type Category } from "@/features/category";

import { extractSummary, extractThumbnail } from "./article-content";
import { type Article } from "../models";

export type ArticlePreview = {
  id: number;
  /** Unprefixed; views localize it with `localizePath`. */
  path: string;
  title: string;
  subtitle?: string;
  summary: string;
  thumbnail?: string;
  /** Shown as the kicker above the title. */
  category?: Category;
  authors: string[];
  publishedAt: Date;
  views: number;
};

export function getArticlePath(id: number) {
  return `/article/${id}`;
}

const SUB_CATEGORIES = new Set<Category>(
  CATEGORY_GROUPS.flatMap((group) => group.children),
);

export function getChildCategories(category: Category): readonly Category[] {
  return CATEGORY_GROUPS.find((g) => g.category === category)?.children ?? [];
}

// The most specific label wins: "연구" says more than "학술·연구". Inside a
// category page, only that category's family is a useful label.
export function getKickerCategory(
  categories: readonly Category[],
  context?: Category,
): Category | undefined {
  const family = context
    ? new Set([context, ...getChildCategories(context)])
    : undefined;
  const candidates = family
    ? categories.filter((c) => family.has(c))
    : categories;
  const pool = candidates.length > 0 ? candidates : categories;
  return pool.find((c) => SUB_CATEGORIES.has(c)) ?? pool[0];
}

export function toArticlePreview(
  article: Article,
  options: { category?: Category } = {},
): ArticlePreview {
  return {
    id: article.id,
    path: getArticlePath(article.id),
    title: article.title,
    subtitle: article.subtitle ?? undefined,
    summary: extractSummary(article.content),
    // The backend's own thumbnail field wins; older articles only have
    // images in the body.
    thumbnail: article.thumbnailUrl ?? extractThumbnail(article.content),
    category: getKickerCategory(article.categories, options.category),
    authors: article.authors.map((author) => author.name),
    publishedAt: article.createdAt,
    views: article.views,
  };
}
