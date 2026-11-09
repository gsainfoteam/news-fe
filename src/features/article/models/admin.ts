// CMS side of the article model. NEF-10 owns `models/index.ts` (reader
// pages); fold these into it once both have landed.
import { type ArticleDto, type GetArticlesData } from "@/@types/api/types.gen";

export {
  deleteArticleMutation,
  getArticlesOptions as adminArticlesQuery,
  getArticlesQueryKey as adminArticlesQueryKey,
} from "@/@types/api/@tanstack/react-query.gen";

export type AdminArticle = ArticleDto;
export type ArticleSort = NonNullable<
  NonNullable<GetArticlesData["query"]>["sort"]
>;
