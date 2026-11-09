import { type i18n as I18n } from "i18next";
import { I18nextProvider, useTranslation } from "react-i18next";

import { i18n as appI18n } from "@/common/lib/i18n";
import {
  CategoryTabs,
  getCategoryGroup,
  getCategoryLabels,
  getCategoryPath,
  type Category,
} from "@/features/category";

import { type ArticlePreview } from "../../../viewmodels/article-preview";
import { ArticleList } from "../article-list";
import { ArticlePagination } from "../article-pagination";
import { PopularArticles } from "../popular-articles";

// Page root of /category/[slug]/[...page]. Astro renders it as its own React
// root, so the page passes its i18n instance in.
export function CategoryArticles({
  i18n = appI18n,
  ...props
}: CategoryArticles.Props) {
  return (
    <I18nextProvider i18n={i18n}>
      <CategoryArticlesContent {...props} />
    </I18nextProvider>
  );
}

function CategoryArticlesContent({
  category,
  total,
  articles,
  popular,
  page,
}: Omit<CategoryArticles.Props, "i18n">) {
  const { t } = useTranslation();
  const labels = getCategoryLabels(t);
  // Sub-category pages keep the section's heading; the tabs show where the
  // reader is within it.
  const heading = labels[getCategoryGroup(category)?.category ?? category];

  return (
    <div className="pt-10 pb-24 mobile:pt-6 mobile:pb-16">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4 pt-2">
        <h1 className="text-[56px] leading-none font-extrabold tracking-[-0.045em] mobile:text-[36px]">
          {heading}
        </h1>
        <p className="text-sm text-subtle-foreground tabular-nums">
          {t("article.count", "기사 {{count}}건", { count: total })}
        </p>
      </div>
      <CategoryTabs current={category} />
      <div className="mt-2 grid grid-cols-[minmax(0,1fr)_300px] items-start gap-[72px] mobile:grid-cols-1">
        <div className="min-w-0">
          <ArticleList articles={articles} lead={page.current === 1} />
          <ArticlePagination
            current={page.current}
            last={page.last}
            basePath={getCategoryPath(category)}
            className="mt-9"
          />
        </div>
        <aside className="pt-8 mobile:hidden">
          <PopularArticles
            title={t("article.popularIn", "{{category}} 많이 본 기사", {
              category: labels[category],
            })}
            articles={popular}
          />
        </aside>
      </div>
    </div>
  );
}

export namespace CategoryArticles {
  export type Props = {
    i18n?: I18n;
    category: Category;
    /** Articles in the whole category, not just this page. */
    total: number;
    articles: ArticlePreview[];
    popular: ArticlePreview[];
    page: { current: number; last: number };
  };
}
