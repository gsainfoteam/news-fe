import { type TFunction } from "i18next";

import { localizePath } from "@/common/lib/languages";

import { CATEGORIES, type Category } from "../models";

export { CATEGORIES };

export type CategoryGroup = {
  category: Category;
  children: readonly Category[];
};

// Top-level navigation order. NOTICE stays out: it sits apart from the
// sections (right end of the nav bar, footer links).
export const CATEGORY_GROUPS: readonly CategoryGroup[] = [
  { category: "CAMPUS", children: [] },
  { category: "SOCIETY", children: [] },
  { category: "ACADEMIC_RESEARCH", children: ["ACADEMIC", "RESEARCH"] },
  { category: "CULTURE", children: [] },
  {
    category: "PLANNING_SPECIAL",
    children: ["PLANNING", "SPECIAL", "REPORTAGE"],
  },
  {
    category: "OPINION",
    children: [
      "INTERNAL_COLUMN",
      "EXTERNAL_COLUMN",
      "READERS_COMMITTEE",
      "CARTOON",
    ],
  },
];

export function toCategorySlug(category: Category) {
  return category.toLowerCase().replaceAll("_", "-");
}

export function fromCategorySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => toCategorySlug(c) === slug);
}

export function getCategoryPath(category: Category) {
  return `/category/${toCategorySlug(category)}`;
}

// Literal keys so gen:i18n can extract them.
export function getCategoryLabels(t: TFunction): Record<Category, string> {
  return {
    CAMPUS: t("category.CAMPUS", "대학"),
    SOCIETY: t("category.SOCIETY", "사회"),
    ACADEMIC_RESEARCH: t("category.ACADEMIC_RESEARCH", "학술·연구"),
    ACADEMIC: t("category.ACADEMIC", "학술"),
    RESEARCH: t("category.RESEARCH", "연구"),
    CULTURE: t("category.CULTURE", "문화"),
    PLANNING_SPECIAL: t("category.PLANNING_SPECIAL", "기획·특집"),
    PLANNING: t("category.PLANNING", "기획"),
    SPECIAL: t("category.SPECIAL", "특집"),
    REPORTAGE: t("category.REPORTAGE", "현장르포"),
    OPINION: t("category.OPINION", "오피니언"),
    INTERNAL_COLUMN: t("category.INTERNAL_COLUMN", "내부 칼럼"),
    EXTERNAL_COLUMN: t("category.EXTERNAL_COLUMN", "외부 칼럼"),
    READERS_COMMITTEE: t("category.READERS_COMMITTEE", "독자자문위원회"),
    CARTOON: t("category.CARTOON", "4컷 만화/만평"),
    NOTICE: t("category.NOTICE", "공지사항"),
  };
}

function getGroupDescriptions(t: TFunction): Partial<Record<Category, string>> {
  return {
    ACADEMIC_RESEARCH: t(
      "category.description.ACADEMIC_RESEARCH",
      "학술 행사와 연구 현장 소식",
    ),
    PLANNING_SPECIAL: t(
      "category.description.PLANNING_SPECIAL",
      "기획 기사와 특집, 현장르포",
    ),
    OPINION: t("category.description.OPINION", "칼럼과 독자자문위원회, 만평"),
  };
}

export type CategoryNavItem = {
  category: Category;
  label: string;
  href: string;
  current: boolean;
};

export type CategoryNavGroup = CategoryNavItem & {
  description?: string;
  children: CategoryNavItem[];
};

export type CategoryNav = {
  groups: CategoryNavGroup[];
  notice: CategoryNavItem;
};

export function getCategoryNav(
  t: TFunction,
  lng: string,
  current?: Category,
): CategoryNav {
  const labels = getCategoryLabels(t);
  const descriptions = getGroupDescriptions(t);
  const item = (category: Category): CategoryNavItem => ({
    category,
    label: labels[category],
    href: localizePath(lng, getCategoryPath(category)),
    current: category === current,
  });
  return {
    groups: CATEGORY_GROUPS.map(({ category, children }) => ({
      ...item(category),
      // A sub-category page highlights its section too.
      current:
        category === current ||
        (current !== undefined && children.includes(current)),
      description: descriptions[category],
      children: children.map(item),
    })),
    notice: item("NOTICE"),
  };
}
