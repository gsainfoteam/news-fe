import { useTranslation } from "react-i18next";

import { cn } from "@/common/lib/cn";

import { type Category } from "../../../models";
import { getCategoryTabs } from "../../../viewmodels/category";

// Links, not the `ui/tabs` primitive: each tab is its own static page, so
// the bar works without hydration and every tab has a URL.
export function CategoryTabs({ current, className }: CategoryTabs.Props) {
  const { t, i18n } = useTranslation();
  const tabs = getCategoryTabs(t, i18n.language, current);
  if (tabs.length === 0) return null;

  return (
    <nav
      aria-label={t("category.tabsLabel", "하위 카테고리")}
      className={cn(
        "scrollbar-none flex gap-1 overflow-x-auto border-b border-border",
        className,
      )}
    >
      {tabs.map((tab) => (
        <a
          key={tab.category}
          href={tab.href}
          aria-current={tab.current ? "page" : undefined}
          className="-mb-px shrink-0 border-b-3 border-transparent px-3.5 py-3 text-[15px] leading-normal font-semibold whitespace-nowrap text-subtle-foreground transition-colors outline-none first:pl-0.5 hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring aria-[current=page]:border-primary aria-[current=page]:text-foreground"
        >
          {tab.label}
        </a>
      ))}
    </nav>
  );
}

export namespace CategoryTabs {
  export type Props = {
    current: Category;
    className?: string;
  };
}
