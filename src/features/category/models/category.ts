export interface Category {
  slug: string;
  label: string;
}

export type CategoryBadgeVariant = "default" | "blue" | "red" | "green";

export const CATEGORIES: Category[] = [
  { slug: "university", label: "대학" },
  { slug: "society", label: "사회" },
  { slug: "academic", label: "학술·연구" },
  { slug: "culture", label: "문화" },
  { slug: "special", label: "기획·특집" },
  { slug: "report", label: "현장르포" },
  { slug: "opinion", label: "오피니언" },
  { slug: "report-news", label: "제보하기" },
];

export const CATEGORIES_MAP: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((cat) => [cat.slug, cat.label]),
);
