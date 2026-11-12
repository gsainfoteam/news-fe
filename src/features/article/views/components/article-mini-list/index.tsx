import { useTranslation } from "react-i18next";

import { cn } from "@/common/lib/cn";
import { useDayjs } from "@/common/lib/dayjs";
import { localizePath } from "@/common/lib/languages";

import { type ArticlePreview } from "../../../viewmodels/article-preview";

export function ArticleMiniList({
  title,
  articles,
  className,
}: ArticleMiniList.Props) {
  const { i18n } = useTranslation();
  const dayjs = useDayjs();
  if (articles.length === 0) return null;

  return (
    <section className={cn("flex flex-col", className)}>
      <h2 className="border-b-2 border-border-strong pb-2.5 text-[15px] font-extrabold">
        {title}
      </h2>
      <ul>
        {articles.map((article) => {
          const href = localizePath(i18n.language, article.path);
          return (
            <li
              key={article.id}
              className="flex items-start gap-3.5 border-b border-border py-3.5"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <a
                  href={href}
                  className="font-heading text-base leading-[1.45] font-bold tracking-[-0.02em] hover:underline hover:underline-offset-3"
                >
                  {article.title}
                </a>
                <time
                  dateTime={article.publishedAt.toISOString()}
                  className="text-xs text-subtle-foreground"
                >
                  {dayjs(article.publishedAt).format("YYYY.MM.DD")}
                </time>
              </div>
              {article.thumbnail && (
                <a
                  href={href}
                  tabIndex={-1}
                  aria-hidden="true"
                  className="block aspect-3/2 w-[72px] shrink-0 overflow-hidden rounded-sm bg-placeholder"
                >
                  <img
                    src={article.thumbnail}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover"
                  />
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export namespace ArticleMiniList {
  export type Props = {
    title: string;
    articles: ArticlePreview[];
    className?: string;
  };
}
