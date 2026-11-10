import { useTranslation } from "react-i18next";

import { cv } from "@/common/lib/cn";
import { useDayjs } from "@/common/lib/dayjs";
import { localizePath } from "@/common/lib/languages";
import { CategoryBadge } from "@/features/category";

import { type ArticlePreview } from "../../../viewmodels/article-preview";

const card = cv({
  slots: {
    root: "",
    thumb:
      "block shrink-0 overflow-hidden rounded-sm bg-placeholder [&>img]:size-full [&>img]:object-cover",
    body: "flex min-w-0 flex-col",
    title:
      "font-heading font-bold tracking-[-0.02em] text-foreground hover:underline hover:underline-offset-3",
    excerpt: "line-clamp-2 text-[15px] leading-[1.65] text-muted-foreground",
  },
  variants: {
    variant: {
      // Text first, photo on the right; the list row.
      row: {
        root: "flex items-start gap-6 border-b border-border py-[22px] mobile:gap-3.5 mobile:py-[18px]",
        thumb: "order-last aspect-3/2 w-[184px] mobile:w-[108px]",
        body: "flex-1 gap-2",
        title: "text-[20px] leading-[1.4] mobile:text-[17px]",
        excerpt: "mobile:hidden",
      },
      // Photo on top; grids and sections.
      stack: {
        root: "flex flex-col gap-3",
        thumb: "aspect-3/2 w-full",
        body: "gap-2.5",
        title: "text-[19px] leading-[1.4] mobile:text-[17px]",
      },
      // First article of a list, photo beside the text.
      lead: {
        root: "grid grid-cols-[minmax(0,7fr)_minmax(0,5fr)] items-center gap-8 border-b border-border py-8 mobile:grid-cols-1 mobile:gap-5 mobile:py-6",
        thumb: "aspect-4/3 w-full",
        body: "gap-3",
        title:
          "text-[30px] leading-[1.22] font-extrabold tracking-[-0.035em] mobile:text-[24px]",
        excerpt: "line-clamp-3",
      },
    },
  },
});

export function ArticleCard({
  article,
  variant = "row",
  headingLevel: Heading = "h2",
  priority = false,
  className,
}: ArticleCard.Props) {
  const { t, i18n } = useTranslation();
  const dayjs = useDayjs();
  const href = localizePath(i18n.language, article.path);
  const styles = card({ variant });

  return (
    <article className={styles.root({ className })}>
      {article.thumbnail && (
        // The title link already names the article; skip this one for
        // keyboard and screen reader users.
        <a
          href={href}
          tabIndex={-1}
          aria-hidden="true"
          className={styles.thumb()}
        >
          <img
            src={article.thumbnail}
            alt=""
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : undefined}
            decoding="async"
          />
        </a>
      )}
      <div className={styles.body()}>
        {article.category && (
          <CategoryBadge category={article.category} kicker />
        )}
        <Heading className={styles.title()}>
          <a href={href}>{article.title}</a>
        </Heading>
        {article.summary && variant !== "stack" && (
          <p className={styles.excerpt()}>{article.summary}</p>
        )}
        <ArticleMeta
          authors={article.authors}
          date={dayjs(article.publishedAt).format("YYYY.MM.DD")}
          dateTime={article.publishedAt.toISOString()}
          views={t("article.views", "조회 {{views}}", {
            views: article.views.toLocaleString(i18n.language),
          })}
        />
      </div>
    </article>
  );
}

export namespace ArticleCard {
  export type Props = {
    article: ArticlePreview;
    variant?: "row" | "stack" | "lead";
    /** Under a page `<h1>` cards are `h2`; inside a section, `h3`. */
    headingLevel?: "h2" | "h3";
    /** Above the fold: load the photo right away. */
    priority?: boolean;
    className?: string;
  };
}

function ArticleMeta({
  authors,
  date,
  dateTime,
  views,
}: {
  authors: string[];
  date: string;
  dateTime: string;
  views: string;
}) {
  const items = [
    authors.length > 0 && <span key="authors">{authors.join(", ")}</span>,
    <time key="date" dateTime={dateTime}>
      {date}
    </time>,
    <span key="views" className="tabular-nums">
      {views}
    </span>,
  ].filter(Boolean);

  return (
    <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-subtle-foreground">
      {items.map((item, i) => (
        <span key={i} className="contents">
          {i > 0 && (
            <span
              aria-hidden="true"
              className="size-0.5 rounded-full bg-current"
            />
          )}
          {item}
        </span>
      ))}
    </p>
  );
}
