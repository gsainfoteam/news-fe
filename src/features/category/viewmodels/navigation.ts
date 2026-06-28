import { CATEGORIES } from "@/features/category/models";

export interface NavItem {
  label: string;
  href: string;
  slug: string;
  active: boolean;
}

export function buildNavItems(currentPath: string): NavItem[] {
  return CATEGORIES.map((category) => ({
    label: category.label,
    href: `/${category.slug}`,
    slug: category.slug,
    active: currentPath === `/${category.slug}`,
  }));
}
