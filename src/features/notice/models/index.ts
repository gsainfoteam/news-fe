import { type ArticleDto } from "@/@types/api/types.gen";

// news-be has no notice table (NEB-15 added NOTICE to the article category
// enum), so a notice is an article and every notice API is the article API.
export type Notice = ArticleDto;
