import {
  FEATURED_ARTICLES,
  TREND_ARTICLES,
  getArticlesByCategory,
  type Article,
} from "@/features/article/models";

export function getFeaturedArticles(): Article[] {
  return FEATURED_ARTICLES;
}

export function getTrendArticles(): Article[] {
  return TREND_ARTICLES;
}

export function getCategoryPreview(
  label: string,
  seed: string,
  count = 3,
): Article[] {
  return getArticlesByCategory(label, seed, count);
}
