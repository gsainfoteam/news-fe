import { useTranslation } from "react-i18next";

import { cn } from "@/common/lib/cn";
import { localizePath } from "@/common/lib/languages";

import { type ArticlePreview } from "../../../viewmodels/article-preview";

export function PopularArticles({
  title,
  articles,
  className,
}: PopularArticles.Props) {
  const { i18n } = useTranslation();
  if (articles.length === 0) return null;

  return (
    <section className={cn("flex flex-col", className)}>
      <h2 className="border-b-2 border-border-strong pb-2.5 text-[15px] font-extrabold">
        {title}
      </h2>
      <ol>
        {articles.map((article, i) => (
          <li
            key={article.id}
            className="flex items-start gap-3.5 border-b border-border py-3.5 last:border-b-0"
          >
            <span
              aria-hidden="true"
              className="w-5 shrink-0 font-heading text-[22px] leading-[1.15] font-bold text-brand-text tabular-nums"
            >
              {i + 1}
            </span>
            <a
              href={localizePath(i18n.language, article.path)}
              className="font-heading text-base leading-[1.45] font-bold tracking-[-0.02em] hover:underline hover:underline-offset-3"
            >
              {article.title}
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}

export namespace PopularArticles {
  export type Props = {
    title: string;
    articles: ArticlePreview[];
    className?: string;
  };
}
