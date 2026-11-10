import { NewspaperIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { EmptyState } from "@/common/components/ui/empty-state";
import { cn } from "@/common/lib/cn";

import { type ArticlePreview } from "../../../viewmodels/article-preview";
import { ArticleCard } from "../article-card";

export function ArticleList({
  articles,
  lead = false,
  className,
}: ArticleList.Props) {
  const { t } = useTranslation();

  if (articles.length === 0) {
    return (
      <EmptyState
        icon={<NewspaperIcon />}
        title={t("article.empty.title", "아직 기사가 없습니다")}
        description={t(
          "article.empty.description",
          "기사가 올라오면 이곳에 보입니다.",
        )}
        className={cn("mt-8", className)}
      />
    );
  }

  const [first, ...rest] = articles;
  return (
    <div className={cn("flex flex-col", className)}>
      {lead ? (
        <ArticleCard article={first} variant="lead" priority />
      ) : (
        <ArticleCard article={first} />
      )}
      {rest.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}

export namespace ArticleList {
  export type Props = {
    articles: ArticlePreview[];
    /** Show the first article large (first page of a list). */
    lead?: boolean;
    className?: string;
  };
}
