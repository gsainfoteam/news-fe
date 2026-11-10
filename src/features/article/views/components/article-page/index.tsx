import { type ReactNode } from "react";

import { type i18n as I18n } from "i18next";
import { ChevronRightIcon, LinkIcon, MessageCircleIcon } from "lucide-react";
import { I18nextProvider, useTranslation } from "react-i18next";

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
} from "@/common/components/ui/avatar";
import { Badge } from "@/common/components/ui/badge";
import { buttonVariants } from "@/common/components/ui/button";
import { cn } from "@/common/lib/cn";
import { useDayjs } from "@/common/lib/dayjs";
import { i18n as appI18n } from "@/common/lib/i18n";
import { localizePath } from "@/common/lib/languages";
import {
  getCategoryLabels,
  getCategoryPath,
  type Category,
} from "@/features/category";

import { type ArticleDetail } from "../../../viewmodels/article-detail";
import { type ArticlePreview } from "../../../viewmodels/article-preview";
import { ArticleCard } from "../article-card";
import { ArticleMiniList } from "../article-mini-list";
import { PopularArticles } from "../popular-articles";

// Page root of /article/[id]. Astro renders it as its own React root, so the
// page passes its i18n instance in.
export function ArticlePage({ i18n = appI18n, ...props }: ArticlePage.Props) {
  return (
    <I18nextProvider i18n={i18n}>
      <ArticlePageContent {...props} />
    </I18nextProvider>
  );
}

export namespace ArticlePage {
  export type Props = {
    i18n?: I18n;
    article: ArticleDetail;
    popular: ArticlePreview[];
    /** The section the aside and the band below link to. */
    section?: Category;
    latestInSection: ArticlePreview[];
    continueReading: ArticlePreview[];
    /** The comment island (NEF-19); Astro passes it as `slot="comments"`. */
    comments?: ReactNode;
  };
}

function ArticlePageContent({
  article,
  popular,
  section,
  latestInSection,
  continueReading,
  comments,
}: Omit<ArticlePage.Props, "i18n">) {
  const { t, i18n } = useTranslation();
  const labels = getCategoryLabels(t);
  const categoryHref = (category: Category) =>
    localizePath(i18n.language, getCategoryPath(category));

  return (
    <article>
      <header className="flex max-w-[860px] flex-col gap-[18px] pt-14 pb-8 mobile:gap-3 mobile:pt-7 mobile:pb-5">
        {article.breadcrumb.length > 0 && (
          <p className="text-xs font-bold text-brand-text">
            {article.breadcrumb.map((category, i) => (
              <span key={category}>
                {i > 0 && <span aria-hidden="true"> › </span>}
                <a href={categoryHref(category)} className="hover:underline">
                  {labels[category]}
                </a>
              </span>
            ))}
          </p>
        )}
        <h1 className="text-[46px] leading-[1.22] font-extrabold tracking-[-0.035em] mobile:text-[30px] mobile:leading-[1.25]">
          {article.title}
        </h1>
        {article.subtitle && (
          <p className="text-[20px] leading-[1.5] font-medium text-muted-foreground mobile:text-[17px]">
            {article.subtitle}
          </p>
        )}
      </header>

      <Byline article={article} />

      <div className="mt-10 grid grid-cols-[minmax(0,1fr)_300px] items-start gap-[72px] mobile:mt-8 mobile:grid-cols-1 mobile:gap-12">
        <div className="min-w-0">
          <div
            className={PROSE}
            // Sanitized while building (toArticleDetail).
            dangerouslySetInnerHTML={{ __html: article.html }}
          />
          {article.categories.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {article.categories.map((category) => (
                <li key={category}>
                  <Badge
                    variant="outline"
                    render={<a href={categoryHref(category)} />}
                    className="hover:text-foreground"
                  >
                    {labels[category]}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
          <section
            id="comments"
            aria-labelledby="comments-title"
            className="mt-14 max-w-[680px] scroll-mt-6"
          >
            <h2 id="comments-title" className="pb-4 text-h4 font-extrabold">
              {t("comment.title", "댓글")}
            </h2>
            {comments}
          </section>
        </div>

        <aside
          aria-label={t("article.related", "관련 기사")}
          className="flex flex-col gap-10"
        >
          <PopularArticles
            title={t("article.popular", "많이 본 기사")}
            articles={popular}
          />
          {section && (
            <ArticleMiniList
              title={t("article.latestIn", "{{category}} 최신 기사", {
                category: labels[section],
              })}
              articles={latestInSection}
            />
          )}
        </aside>
      </div>

      {continueReading.length > 0 && (
        <section
          aria-labelledby="continue-title"
          // Full-bleed band without leaving the page column: the shadows
          // paint the surface and its top border out to the window edges.
          // The negative margin cancels the footer's top margin so the band
          // meets the footer like the design.
          className="mt-[88px] -mb-24 bg-surface pt-11 pb-14 shadow-[0_0_0_100vmax_var(--color-surface),0_-1px_0_100vmax_var(--color-border)] [clip-path:inset(-1px_-100vmax_0)] mobile:mt-16 mobile:-mb-16 mobile:pt-9 mobile:pb-10"
        >
          <div className="mb-5 flex items-center justify-between gap-4 border-t-2 border-border-strong pt-3.5">
            <h2
              id="continue-title"
              className="text-[19px] font-extrabold tracking-[-0.02em]"
            >
              {t("article.continueReading", "이어서 읽기")}
            </h2>
            {section && (
              <a
                href={categoryHref(section)}
                className="inline-flex items-center gap-0.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                {t("article.moreIn", "{{category}} 더 보기", {
                  category: labels[section],
                })}
                <ChevronRightIcon aria-hidden="true" className="size-4" />
              </a>
            )}
          </div>
          <ul className="grid grid-cols-4 gap-7 mobile:-mx-4 mobile:scrollbar-none mobile:flex mobile:snap-x mobile:snap-mandatory mobile:scroll-px-4 mobile:gap-4 mobile:overflow-x-auto mobile:px-4 mobile:pb-1">
            {continueReading.map((preview) => (
              <li
                key={preview.id}
                className="min-w-0 mobile:shrink-0 mobile:basis-[84%] mobile:snap-start"
              >
                <ArticleCard
                  article={preview}
                  variant="stack"
                  headingLevel="h3"
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

function Byline({ article }: { article: ArticleDetail }) {
  const { t, i18n } = useTranslation();
  const dayjs = useDayjs();
  const format = (date: Date) => dayjs(date).format("YYYY.MM.DD HH:mm");

  const meta = [
    <time key="published" dateTime={article.publishedAt.toISOString()}>
      {t("article.publishedAt", "입력 {{date}}", {
        date: format(article.publishedAt),
      })}
    </time>,
    article.updatedAt && (
      <time key="updated" dateTime={article.updatedAt.toISOString()}>
        {t("article.updatedAt", "수정 {{date}}", {
          date: format(article.updatedAt),
        })}
      </time>
    ),
    <span key="views" className="tabular-nums">
      {t("article.views", "조회 {{views}}", {
        views: article.views.toLocaleString(i18n.language),
      })}
    </span>,
  ].filter(Boolean);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
      <div className="flex flex-col gap-1">
        {article.authors.length > 0 && (
          <div className="flex items-center gap-3">
            <AvatarGroup aria-hidden="true">
              {article.authors.map((name) => (
                <Avatar key={name}>
                  <AvatarFallback>{Array.from(name)[0]}</AvatarFallback>
                </Avatar>
              ))}
            </AvatarGroup>
            <p className="text-[15px] font-bold">
              {t("article.byline", "{{names}} 기자", {
                names: article.authors.join(", "),
              })}
            </p>
          </div>
        )}
        <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-subtle-foreground">
          {meta.map((item, i) => (
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
      </div>
      <div className="flex gap-2">
        {/* The page script (article/[id].astro) copies the canonical URL. */}
        <button
          type="button"
          data-copy-link
          data-copied-label={t("article.linkCopied", "복사했습니다")}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <LinkIcon aria-hidden="true" />
          <span data-label aria-live="polite">
            {t("article.copyLink", "링크 복사")}
          </span>
        </button>
        <a
          href="#comments"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <MessageCircleIcon aria-hidden="true" />
          {t("comment.title", "댓글")}
        </a>
      </div>
    </div>
  );
}

// The body comes from the CMS as plain HTML, so it is styled by element.
const PROSE = cn(
  "max-w-[680px] text-body-lg tracking-[-0.005em] text-foreground mobile:text-[17px] mobile:leading-[1.8]",
  "[&>*:last-child]:mb-0 [&_p]:mb-[1.35em]",
  // The lead paragraph.
  "[&>p:first-child]:text-[21px] [&>p:first-child]:leading-[1.7] [&>p:first-child]:font-medium mobile:[&>p:first-child]:text-[19px]",
  "[&_h2]:mt-[2em] [&_h2]:mb-[0.8em] [&_h2]:font-heading [&_h2]:text-[23px] [&_h2]:leading-[1.4] [&_h2]:font-bold [&_h2]:tracking-[-0.02em] mobile:[&_h2]:text-[20px]",
  "[&_h3]:mt-[1.8em] [&_h3]:mb-[0.6em] [&_h3]:font-heading [&_h3]:text-[20px] [&_h3]:leading-[1.45] [&_h3]:font-bold mobile:[&_h3]:text-[18px]",
  "[&_h4]:mt-[1.6em] [&_h4]:mb-[0.5em] [&_h4]:font-bold",
  "[&_figure]:my-[2em] [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-sm",
  "[&_figcaption]:mt-2.5 [&_figcaption]:text-sm [&_figcaption]:text-subtle-foreground",
  "[&_blockquote]:my-[2.2em] [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:py-1 [&_blockquote]:pl-6 [&_blockquote]:font-heading [&_blockquote]:text-[26px] [&_blockquote]:leading-[1.5] [&_blockquote]:font-bold [&_blockquote]:tracking-[-0.025em] mobile:[&_blockquote]:text-[20px] [&_blockquote_p]:mb-0",
  // Only real links: the sanitizer keeps the text of one whose URL it dropped.
  "[&_a[href]]:text-brand-text [&_a[href]]:underline [&_a[href]]:underline-offset-3",
  "[&_ol]:mb-[1.35em] [&_ol]:list-decimal [&_ol]:pl-[1.3em] [&_ul]:mb-[1.35em] [&_ul]:list-disc [&_ul]:pl-[1.3em] [&_li>p]:mb-0",
  "[&_hr]:my-[2em] [&_hr]:border-border",
  "[&_code]:text-[0.9em] [&_pre]:mb-[1.35em] [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-surface [&_pre]:p-4 [&_pre]:text-sm [&_pre]:leading-relaxed",
  // A wide table scrolls by itself instead of the page.
  "[&_table]:mb-[1.35em] [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_table]:text-[15px] [&_td]:border [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:bg-surface [&_th]:px-3 [&_th]:py-2 [&_th]:text-left",
  "[&_mark]:bg-brand-soft [&_mark]:text-inherit",
);
