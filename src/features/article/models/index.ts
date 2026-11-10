import { getArticles } from "@/@types/api/sdk.gen";
import {
  type ArticleDto,
  type ArticleListDto,
  type AuthorInfoDto,
  type GetArticlesData,
} from "@/@types/api/types.gen";

export {
  getArticle as fetchArticle,
  getArticles as fetchArticles,
} from "@/@types/api/sdk.gen";
export {
  getArticleOptions as articleQuery,
  getArticlesInfiniteOptions as articlesInfiniteQuery,
  getArticlesOptions as articlesQuery,
} from "@/@types/api/@tanstack/react-query.gen";

export type Article = ArticleDto;
export type ArticleAuthor = AuthorInfoDto;
export type ArticleListResponse = ArticleListDto;

// The backend rejects a larger `limit` (class-validator @Max(50)).
export const ARTICLE_FETCH_LIMIT = 50;

let allArticles: Promise<Article[]> | undefined;

// Build only. Category and article pages all derive from this one list (it
// already carries the body), so a build walks `GET /article` once instead of
// once per route, and never calls the detail API that counts views.
export function fetchAllArticles(): Promise<Article[]> {
  allArticles ??= loadAllArticles().catch((error: unknown) => {
    allArticles = undefined;
    throw error;
  });
  return allArticles;
}

async function loadAllArticles() {
  const byId = new Map<number, Article>();
  for (let offset = 0; ; offset += ARTICLE_FETCH_LIMIT) {
    const { data } = await getArticles({
      query: { offset, limit: ARTICLE_FETCH_LIMIT, sort: "LATEST" },
      throwOnError: true,
    });
    // An article published mid-walk shifts offsets by one; the map drops the
    // duplicate that shift brings back.
    for (const article of data.articles) byId.set(article.id, article);
    if (
      data.articles.length < ARTICLE_FETCH_LIMIT ||
      offset + ARTICLE_FETCH_LIMIT >= Number(data.count)
    ) {
      break;
    }
  }
  return [...byId.values()];
}

export type ArticleSort = NonNullable<
  NonNullable<GetArticlesData["query"]>["sort"]
>;
