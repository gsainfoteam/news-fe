import { type CategoryBadgeVariant } from "@/features/category/models";

const VARIANT_BY_LABEL: Record<string, CategoryBadgeVariant> = {
  사회: "red",
  대학: "green",
  "학술·연구": "blue",
  문화: "default",
  "기획·특집": "default",
  현장르포: "default",
  오피니언: "default",
  제보하기: "default",
  "분류 없음": "green",
  "4컷 만화/만평": "blue",
};

export function getCategoryBadgeVariant(label: string): CategoryBadgeVariant {
  return VARIANT_BY_LABEL[label] ?? "default";
}
