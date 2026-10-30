import { zArticleDto } from "@/@types/api/zod.gen";

// The spec inlines the category enum on every DTO, so hey-api emits no named
// type. Take the values from the generated zod schema to stay in sync.
export const CATEGORIES = zArticleDto.shape.categories.element.options;

export type Category = (typeof CATEGORIES)[number];
