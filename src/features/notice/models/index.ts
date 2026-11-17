import { type ArticleDto } from "@/@types/api/types.gen";

// news-be has no notice table (NEB-15): a notice is an article under NOTICE.
export type Notice = ArticleDto;
