import { useTranslation } from "react-i18next";

import { cv } from "@/common/lib";
import { type Article } from "@/features/article/models";
import { CategoryBadge } from "@/features/category";

const article = cv({
  base: "flex",
  variants: {
    orientation: {
      vertical: "flex-row gap-4",
      horizontal: "flex-col gap-3",
    },
  },
});

const contentWrapper = cv({
  base: "flex flex-col",
  variants: {
    orientation: {
      vertical: "flex-1",
      horizontal: "w-full",
    },
  },
});

const thumbnailWrapper = cv({
  base: "overflow-hidden rounded-2xl",
  variants: {
    orientation: {
      vertical: "h-20 w-20 flex-shrink-0",
      horizontal: "hidden",
    },
  },
});

const mainImgWrapper = cv({
  base: "w-full overflow-hidden rounded-2xl",
});

const imageClass =
  "h-full w-full object-cover transition-transform duration-200 ease-out will-change-transform group-hover:scale-[1.06]";

export function ArticleCard({
  orientation = "vertical",
  category,
  title,
  author,
  publishedAt,
  thumbnailImage,
  mainImage,
  href,
  className,
}: ArticleCard.Props) {
  const { t } = useTranslation();

  return (
    <a
      href={href}
      className="group block cursor-pointer rounded-xl focus-visible:ring-2 focus-visible:ring-neutral-300 focus-visible:outline-none"
    >
      <article className={article({ orientation, className })}>
        {orientation === "horizontal" && mainImage && (
          <div className={mainImgWrapper()}>
            <img src={mainImage} alt={title} className={imageClass} />
          </div>
        )}

        <div className={contentWrapper({ orientation })}>
          <div className="flex flex-col gap-2">
            <CategoryBadge category={category} />
            <h4 className="line-clamp-2 leading-tight text-neutral-900 group-hover:underline">
              {title}
            </h4>
            <p className="text-neutral-500">
              {t("article:byline", "By {{author}} · {{publishedAt}}", {
                author,
                publishedAt,
              })}
            </p>
          </div>
        </div>

        {orientation === "vertical" && thumbnailImage && (
          <div className={thumbnailWrapper({ orientation })}>
            <img src={thumbnailImage} alt={title} className={imageClass} />
          </div>
        )}
      </article>
    </a>
  );
}

export namespace ArticleCard {
  export type Props = Article & {
    orientation?: "vertical" | "horizontal";
    className?: string;
  };
}
