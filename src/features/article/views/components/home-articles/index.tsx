import { type ReactNode } from "react";

import { type i18n as I18n } from "i18next";
import { ChevronRight, Send } from "lucide-react";
import { I18nextProvider, useTranslation } from "react-i18next";

import { buttonVariants } from "@/common/components/ui/button";
import { EmptyState } from "@/common/components/ui/empty-state";
import { cn } from "@/common/lib/cn";
import { useDayjs } from "@/common/lib/dayjs";
import { i18n as appI18n } from "@/common/lib/i18n";
import { localizePath } from "@/common/lib/languages";
import {
  CategoryBadge,
  getCategoryLabels,
  getCategoryPath,
  type Category,
} from "@/features/category";

import { type ArticlePreview } from "../../../viewmodels/article-preview";
import {
  type HomeCategorySection,
  type HomeSections,
} from "../../../viewmodels/home";
import { ArticleCard } from "../article-card";

const titleLink =
  "font-heading font-bold tracking-[-0.02em] hover:underline hover:underline-offset-3";

// Own React root under Astro; see Header for why i18n is a prop.
export function HomeArticles({ i18n = appI18n, ...props }: HomeArticles.Props) {
  return (
    <I18nextProvider i18n={i18n}>
      <HomeArticlesContent {...props} />
    </I18nextProvider>
  );
}

export namespace HomeArticles {
  export type Props = HomeSections & { i18n?: I18n };
}

function HomeArticlesContent({
  headline,
  featured,
  latest,
  popular,
  spotlight,
  categories,
  opinion,
}: HomeSections) {
  const { t } = useTranslation();

  return (
    <>
      {headline ? (
        <Headline article={headline} />
      ) : (
        <h1 className="sr-only">{t("site.name", "지스트신문")}</h1>
      )}
      <div className="page-container">
        {!headline && (
          <EmptyState
            className="mt-16"
            title={t("article.empty.title", "아직 기사가 없습니다")}
            description={t(
              "article.empty.description",
              "기사가 올라오면 이곳에 보입니다.",
            )}
          />
        )}
        {featured.length > 0 && <Featured articles={featured} />}
        {latest.length > 0 && (
          <section aria-labelledby="home-latest" className="mt-16 mobile:mt-12">
            <SectionHead id="home-latest" className="mb-5">
              {t("home.latest", "최신 기사")}
            </SectionHead>
            <Strip>
              {latest.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  variant="stack"
                  headingLevel="h3"
                  className={cn(
                    !article.thumbnail && "h-full rounded-sm bg-surface p-5",
                  )}
                />
              ))}
            </Strip>
          </section>
        )}
      </div>
      {popular.length > 0 && <Popular articles={popular} />}
      <div className="page-container">
        {spotlight && <Spotlight section={spotlight} />}
        {categories.length > 0 && (
          <div className="mt-20 grid grid-cols-4 gap-x-8 gap-y-14 mobile:mt-14 mobile:grid-cols-1 mobile:gap-10">
            {categories.map((section) => (
              <CategoryBox key={section.category} section={section} />
            ))}
          </div>
        )}
      </div>
      <OpinionBand section={opinion} />
    </>
  );
}

function Headline({ article }: { article: ArticlePreview }) {
  const { t, i18n } = useTranslation();
  const href = localizePath(i18n.language, article.path);

  return (
    <section
      aria-label={t("home.headline", "머리기사")}
      className="relative flex h-[620px] items-end overflow-hidden bg-[radial-gradient(ellipse_at_72%_28%,#5a6672_0%,#2f3842_48%,#191e25_100%)] text-white mobile:h-[540px]"
    >
      {article.thumbnail && (
        <a
          href={href}
          tabIndex={-1}
          aria-hidden="true"
          className="absolute inset-0"
        >
          <img
            src={article.thumbnail}
            alt=""
            fetchPriority="high"
            decoding="async"
            className="size-full object-cover"
          />
        </a>
      )}
      {/* Keeps white text readable on any photo. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/0 from-30% to-black/78"
      />
      <div className="relative page-container flex flex-col items-start gap-[18px] pb-[52px] mobile:gap-3 mobile:pb-7">
        {article.category && <Pill category={article.category} />}
        <h1 className="max-w-[900px] font-heading text-[54px] leading-[1.16] font-extrabold tracking-[-0.04em] mobile:text-[30px] mobile:leading-[1.25]">
          <a href={href} className="hover:underline hover:underline-offset-4">
            {article.title}
          </a>
        </h1>
        {article.subtitle && (
          <p className="max-w-[720px] text-[20px] leading-normal font-medium text-white/90 mobile:text-base">
            {article.subtitle}
          </p>
        )}
        <Meta
          article={article}
          authors
          views
          className="gap-x-2.5 text-sm text-white/85 mobile:text-[13px]"
        />
      </div>
    </section>
  );
}

function Pill({ category }: { category: Category }) {
  const { t } = useTranslation();
  return (
    <span className="inline-flex h-7 items-center rounded-sm bg-primary px-2.5 text-[13px] font-bold text-white">
      {getCategoryLabels(t)[category]}
    </span>
  );
}

function Featured({ articles }: { articles: ArticlePreview[] }) {
  const { t, i18n } = useTranslation();

  return (
    <section
      aria-labelledby="home-featured"
      className="grid grid-cols-3 border-b border-border mobile:grid-cols-1"
    >
      <h2 id="home-featured" className="sr-only">
        {t("home.featured", "주요 기사")}
      </h2>
      {articles.map((article) => {
        const href = localizePath(i18n.language, article.path);
        return (
          <article
            key={article.id}
            className="flex min-w-0 gap-[18px] border-l border-border px-7 pt-6 pb-7 first-of-type:border-l-0 first-of-type:pl-0 mobile:border-t mobile:border-l-0 mobile:px-0 mobile:py-5 mobile:first-of-type:border-t-0"
          >
            {article.thumbnail && (
              <Thumb
                href={href}
                src={article.thumbnail}
                className="aspect-square w-[104px] mobile:w-[88px]"
              />
            )}
            <div className="flex min-w-0 flex-col gap-2">
              {article.category && (
                <CategoryBadge category={article.category} kicker />
              )}
              <h3
                className={cn(
                  titleLink,
                  "text-[18px] leading-[1.4] mobile:text-[17px]",
                )}
              >
                <a href={href}>{article.title}</a>
              </h3>
              <Meta article={article} authors />
            </div>
          </article>
        );
      })}
    </section>
  );
}

function Popular({ articles }: { articles: ArticlePreview[] }) {
  const { t, i18n } = useTranslation();

  return (
    <section
      aria-labelledby="home-popular"
      className="mt-20 bg-band-brand pt-12 pb-14 text-white mobile:mt-14 mobile:pt-9 mobile:pb-10"
    >
      <div className="page-container">
        <h2
          id="home-popular"
          className="mb-7 text-[30px] font-extrabold tracking-[-0.035em] mobile:text-[24px]"
        >
          {t("home.popular", "지금 많이 읽는 기사")}
        </h2>
        <ol className="grid grid-cols-5 gap-7 mobile:grid-cols-1 mobile:gap-0">
          {articles.map((article, i) => (
            <li
              key={article.id}
              className="flex flex-col gap-3 border-t-2 border-white pt-4 mobile:flex-row mobile:items-start mobile:gap-4 mobile:border-t mobile:border-white/50 mobile:py-3.5 mobile:first:border-t-2 mobile:first:border-white"
            >
              <span
                aria-hidden="true"
                className="text-[52px] leading-[0.9] font-extrabold tracking-[-0.05em] tabular-nums mobile:w-7 mobile:shrink-0 mobile:text-[32px]"
              >
                {i + 1}
              </span>
              <div className="flex min-w-0 flex-col gap-2">
                <a
                  href={localizePath(i18n.language, article.path)}
                  className={cn(titleLink, "text-[17px] leading-[1.45]")}
                >
                  {article.title}
                </a>
                <PopularMeta article={article} />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function PopularMeta({ article }: { article: ArticlePreview }) {
  const { t, i18n } = useTranslation();
  return (
    <p className="flex gap-2.5 text-[13px] font-semibold tabular-nums">
      {article.category && (
        <span>{getCategoryLabels(t)[article.category]}</span>
      )}
      <span>
        {t("article.views", "조회 {{views}}", {
          views: article.views.toLocaleString(i18n.language),
        })}
      </span>
    </p>
  );
}

function Spotlight({ section }: { section: HomeCategorySection }) {
  const { i18n } = useTranslation();
  const [lead, ...others] = section.articles;
  const href = localizePath(i18n.language, lead.path);

  return (
    <section aria-labelledby="home-spotlight" className="mt-20 mobile:mt-14">
      <SectionHead id="home-spotlight" section={section} className="mb-7" />
      <article className="grid grid-cols-[minmax(0,7fr)_minmax(0,5fr)] items-center gap-14 mobile:grid-cols-1 mobile:gap-5">
        {lead.thumbnail ? (
          <Thumb href={href} src={lead.thumbnail} className="aspect-4/3" />
        ) : (
          <div
            aria-hidden="true"
            className="aspect-4/3 rounded-sm bg-surface mobile:hidden"
          />
        )}
        <div className="flex min-w-0 flex-col gap-4">
          {lead.category && <CategoryBadge category={lead.category} kicker />}
          <h3
            className={cn(
              titleLink,
              "text-[38px] leading-[1.22] font-extrabold tracking-[-0.035em] mobile:text-[26px]",
            )}
          >
            <a href={href}>{lead.title}</a>
          </h3>
          {(lead.subtitle ?? lead.summary) && (
            <p className="line-clamp-3 text-[18px] leading-[1.55] font-medium text-muted-foreground mobile:text-base">
              {lead.subtitle ?? lead.summary}
            </p>
          )}
          <Meta article={lead} authors />
          {others.length > 0 && (
            <ul className="mt-2 flex flex-col">
              {others.map((article) => (
                <li key={article.id}>
                  <a
                    href={localizePath(i18n.language, article.path)}
                    className="flex items-center justify-between gap-3 border-t border-border py-3.5 text-[15px] font-semibold hover:underline hover:underline-offset-3"
                  >
                    {article.title}
                    <ChevronRight
                      aria-hidden="true"
                      className="size-4 shrink-0 text-subtle-foreground"
                    />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </article>
    </section>
  );
}

function CategoryBox({ section }: { section: HomeCategorySection }) {
  const { i18n } = useTranslation();
  const [lead, ...others] = section.articles;
  const href = localizePath(i18n.language, lead.path);
  const id = `home-category-${section.category}`;

  return (
    <section aria-labelledby={id} className="flex min-w-0 flex-col">
      <SectionHead id={id} section={section} iconOnly />
      <article className="flex flex-col gap-3 pt-4 pb-[18px] mobile:flex-row-reverse mobile:items-start mobile:gap-3.5">
        {lead.thumbnail && (
          <Thumb
            href={href}
            src={lead.thumbnail}
            className="aspect-3/2 w-full mobile:w-[108px]"
          />
        )}
        <div className="flex min-w-0 grow flex-col gap-2">
          <h3
            className={cn(
              titleLink,
              "text-[18px] leading-[1.4] mobile:text-[17px]",
            )}
          >
            <a href={href}>{lead.title}</a>
          </h3>
          {!lead.thumbnail && lead.summary && (
            <p className="line-clamp-3 text-[15px] leading-[1.65] text-muted-foreground mobile:hidden">
              {lead.summary}
            </p>
          )}
          <Meta article={lead} authors />
        </div>
      </article>
      {others.map((article) => (
        <a
          key={article.id}
          href={localizePath(i18n.language, article.path)}
          className="group flex flex-col gap-1 border-t border-border py-3"
        >
          <span className="text-[15px] leading-[1.45] font-semibold group-hover:underline group-hover:underline-offset-3">
            {article.title}
          </span>
          <Meta article={article} />
        </a>
      ))}
    </section>
  );
}

function OpinionBand({ section }: { section?: HomeCategorySection }) {
  const { t, i18n } = useTranslation();

  return (
    // The band runs into the footer, which shares its background; the
    // negative margin cancels the footer's top margin.
    <div className="mt-22 -mb-24 border-t border-border bg-surface pt-11 pb-14 mobile:mt-16 mobile:-mb-16 mobile:pt-9 mobile:pb-10">
      <div className="page-container">
        {section && (
          <section
            aria-labelledby="home-opinion"
            className="mb-20 mobile:mb-14"
          >
            <SectionHead id="home-opinion" section={section} className="mb-5" />
            <Strip wide>
              {section.articles.map((article) => (
                <OpinionCard key={article.id} article={article} />
              ))}
            </Strip>
          </section>
        )}
        <aside
          aria-labelledby="home-report"
          className="flex flex-wrap items-center justify-between gap-6 rounded-2xl bg-inverse px-12 py-11 text-inverse-foreground mobile:rounded-xl mobile:px-6 mobile:py-7"
        >
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold opacity-70">
              {t("home.report.kicker", "제보")}
            </p>
            <h2
              id="home-report"
              className="text-[32px] leading-[1.3] font-extrabold tracking-[-0.035em] mobile:text-[22px]"
            >
              {t("home.report.title", "취재가 필요한 소식을 알고 계신가요?")}
            </h2>
            <p className="text-sm opacity-75">
              {t(
                "home.report.description",
                "사진이나 문서를 함께 보내주시면 기자가 확인 후 연락드립니다.",
              )}
            </p>
          </div>
          <a
            href={localizePath(i18n.language, "/report")}
            className={cn(buttonVariants({ variant: "primary" }))}
          >
            <Send aria-hidden="true" />
            {t("header.report", "제보하기")}
          </a>
        </aside>
      </div>
    </div>
  );
}

function OpinionCard({ article }: { article: ArticlePreview }) {
  const { i18n } = useTranslation();
  const href = localizePath(i18n.language, article.path);
  const [author] = article.authors;

  return (
    <article className="flex h-full flex-col gap-3 rounded-lg border border-border bg-card p-6">
      {article.thumbnail ? (
        <Thumb href={href} src={article.thumbnail} className="aspect-4/3" />
      ) : (
        <span
          aria-hidden="true"
          className="h-[30px] font-[Georgia,serif] text-[64px] leading-[0.7] font-extrabold text-brand-text"
        >
          “
        </span>
      )}
      {article.category && <CategoryBadge category={article.category} kicker />}
      <h3 className={cn(titleLink, "text-[18px] leading-[1.45]")}>
        <a href={href}>{article.title}</a>
      </h3>
      {!article.thumbnail && article.summary && (
        <p className="line-clamp-3 text-[15px] leading-[1.65] text-muted-foreground">
          {article.summary}
        </p>
      )}
      {author && (
        <p className="mt-auto flex items-center gap-2.5 pt-2 text-sm font-semibold">
          <span
            aria-hidden="true"
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-2xs font-bold text-muted-foreground"
          >
            {author.slice(0, 1)}
          </span>
          {article.authors.join(", ")}
        </p>
      )}
    </article>
  );
}

function SectionHead({
  id,
  section,
  iconOnly = false,
  className,
  children,
}: {
  id: string;
  section?: HomeCategorySection;
  /** Narrow columns: the "more" link shrinks to an arrow. */
  iconOnly?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const { t, i18n } = useTranslation();
  const labels = getCategoryLabels(t);
  const path = (category: Category) =>
    localizePath(i18n.language, getCategoryPath(category));

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 border-t-2 border-border-strong pt-3.5",
        className,
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
        <h2 id={id} className="text-[19px] font-extrabold tracking-[-0.02em]">
          {section ? labels[section.category] : children}
        </h2>
        {section && section.children.length > 0 && (
          <ul className="flex flex-wrap gap-x-3.5 text-sm font-semibold text-subtle-foreground mobile:hidden">
            {section.children.map((child) => (
              <li key={child}>
                <a href={path(child)} className="hover:text-foreground">
                  {labels[child]}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
      {section && (
        <a
          href={path(section.category)}
          aria-label={
            iconOnly
              ? t("home.moreIn", "{{category}} 더 보기", {
                  category: labels[section.category],
                })
              : undefined
          }
          className="inline-flex shrink-0 items-center gap-0.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          {!iconOnly && t("home.more", "더 보기")}
          <ChevronRight aria-hidden="true" className="size-4" />
        </a>
      )}
    </div>
  );
}

function Strip({
  wide = false,
  children,
}: {
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-4 gap-7 mobile:-mx-4 mobile:scrollbar-none mobile:flex mobile:snap-x mobile:snap-mandatory mobile:scroll-px-4 mobile:gap-4 mobile:overflow-x-auto mobile:px-4 mobile:pb-1",
        wide ? "mobile:*:basis-[84%]" : "mobile:*:basis-[72%]",
        "mobile:*:shrink-0 mobile:*:grow-0 mobile:*:snap-start",
      )}
    >
      {children}
    </div>
  );
}

function Thumb({
  href,
  src,
  className,
}: {
  href: string;
  src: string;
  className?: string;
}) {
  return (
    // The title link already names the article; skip this one for keyboard
    // and screen reader users.
    <a
      href={href}
      tabIndex={-1}
      aria-hidden="true"
      className={cn(
        "block shrink-0 overflow-hidden rounded-sm bg-placeholder [&>img]:size-full [&>img]:object-cover",
        className,
      )}
    >
      <img src={src} alt="" loading="lazy" decoding="async" />
    </a>
  );
}

function Meta({
  article,
  authors = false,
  views = false,
  className,
}: {
  article: ArticlePreview;
  authors?: boolean;
  views?: boolean;
  className?: string;
}) {
  const { t, i18n } = useTranslation();
  const dayjs = useDayjs();
  const items = [
    authors && article.authors.length > 0 && (
      <span key="authors">{article.authors.join(", ")}</span>
    ),
    <time key="date" dateTime={article.publishedAt.toISOString()}>
      {dayjs(article.publishedAt).format("YYYY.MM.DD")}
    </time>,
    views && (
      <span key="views" className="tabular-nums">
        {t("article.views", "조회 {{views}}", {
          views: article.views.toLocaleString(i18n.language),
        })}
      </span>
    ),
  ].filter(Boolean);

  return (
    <p
      className={cn(
        "flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-subtle-foreground",
        className,
      )}
    >
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
