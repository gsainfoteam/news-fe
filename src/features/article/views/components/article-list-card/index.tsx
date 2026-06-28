import { Button } from "@/common/components/ui/button";
import { cn, cv } from "@/common/lib";
import { type Article } from "@/features/article/models";

import { ArticleCard } from "../article-card";

const container = cv({
  base: "flex flex-col gap-4 rounded-2xl bg-white p-5",
});

const list = cv({
  base: "flex flex-col",
  variants: {
    orientation: {
      vertical: "divide-y divide-neutral-100",
      horizontal: "grid grid-cols-1 gap-4 md:grid-cols-2",
    },
  },
});

export function ArticleListCard({
  title,
  buttonLabel = "Button",
  buttonHref,
  articles,
  orientation = "vertical",
  className,
}: ArticleListCard.Props) {
  return (
    <div className={container({ className })}>
      {title && (
        <div className="flex items-center justify-between">
          <h2 className="leading-tight text-neutral-900">{title}</h2>
        </div>
      )}

      {title && orientation === "vertical" && (
        <div className="h-px bg-neutral-100" />
      )}

      <div className={list({ orientation })}>
        {articles.map((item, idx) => (
          <div
            key={`${item.href}-${idx}`}
            className={cn(
              orientation === "vertical" ? "py-4 first:pt-0 last:pb-0" : "",
            )}
          >
            <ArticleCard orientation={orientation} {...item} />
          </div>
        ))}
      </div>

      {buttonLabel && (
        <div className="flex justify-center">
          <Button
            label={buttonLabel}
            variant="secondary"
            rightIcon="caret-right"
            href={buttonHref}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}

export namespace ArticleListCard {
  export type Props = {
    title?: string;
    buttonLabel?: string;
    buttonHref?: string;
    articles: Article[];
    orientation?: "vertical" | "horizontal";
    className?: string;
  };
}
