import { useEffect, useRef, type RefObject } from "react";

import { LoaderCircleIcon, SearchIcon } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";

import { Button } from "@/common/components/ui/button";
import { EmptyState } from "@/common/components/ui/empty-state";
import { ErrorState } from "@/common/components/ui/error-state";
import { Input } from "@/common/components/ui/input";
import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "@/common/components/ui/native-select";
import { splitByQuery } from "@/common/components/ui/search-highlight";
import { Skeleton } from "@/common/components/ui/skeleton";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/common/components/ui/toggle-group";
import { useDayjs } from "@/common/lib/dayjs";
// A client:only island has no server render to inherit i18next from.
import "@/common/lib/i18n";
import { localizePath } from "@/common/lib/languages";
import { QueryProvider } from "@/common/lib/query-client";
import {
  CATEGORY_GROUPS,
  CategoryBadge,
  getCategoryLabels,
  type Category,
} from "@/features/category";

import { type ArticlePreview } from "../../../viewmodels/article-preview";
import {
  MAX_QUERY_LENGTH,
  SEARCH_PAGE_SIZE,
  type SearchSort,
  type SearchState,
} from "../../../viewmodels/search";
import {
  useLatestArticles,
  useSearchResults,
  useSearchState,
} from "../../../viewmodels/use-search";
import { ArticleList } from "../article-list";

// Island root of /search. Everything it shows comes from the URL, so the
// back button and a reload land on the same results.
export function SearchPage() {
  return (
    <QueryProvider>
      <SearchPageContent />
    </QueryProvider>
  );
}

function SearchPageContent() {
  const { t } = useTranslation();
  const [state, navigate] = useSearchState();
  const results = useSearchResults(state);
  useDocumentTitle(state.q);

  const update = (patch: Partial<SearchState>) =>
    navigate({ ...state, page: 1, ...patch });

  return (
    <div className="flex flex-col">
      <SearchForm
        // Remount on back/forward so the box shows that entry's query.
        key={state.q}
        query={state.q}
        onSearch={(q) => update({ q })}
      />
      {results.status === "idle" ? (
        <EmptyState
          icon={<SearchIcon />}
          title={t("search.idle.title", "검색어를 입력해 주세요")}
          description={t(
            "search.idle.description",
            "기사 제목과 본문에서 찾습니다.",
          )}
          className="mt-7"
        />
      ) : results.status === "pending" ? (
        <ResultsSkeleton />
      ) : results.status === "error" ? (
        <ErrorState
          title={t("error.title", "내용을 불러오지 못했습니다")}
          description={t("error.description", "잠시 후 다시 시도해 주세요.")}
          retryLabel={t("error.retry", "다시 시도")}
          onRetry={results.retry}
          retrying={results.isRetrying}
          className="mt-7"
        />
      ) : (
        <>
          {/* Without a filter, "no results" needs no filter bar; with one,
              the reader needs it to widen the search again. */}
          {(results.total > 0 || state.category) && (
            <ResultsBar
              query={state.q}
              total={results.total}
              category={state.category}
              sort={state.sort}
              onCategoryChange={(category) => update({ category })}
              onSortChange={(sort) => update({ sort })}
            />
          )}
          {results.total === 0 ? (
            <NoResults query={state.q} />
          ) : (
            <>
              <HighlightedList query={state.q} articles={results.articles} />
              <LoadMore
                total={results.total}
                shown={results.articles.length}
                hasMore={results.hasMore}
                loading={results.isLoadingMore}
                failed={results.isMoreError}
                onLoadMore={() =>
                  navigate(
                    { ...state, page: state.page + 1 },
                    { replace: true },
                  )
                }
                onRetry={results.retryMore}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}

// The static shell can't know the query; the tab title can.
function useDocumentTitle(query: string) {
  const { t } = useTranslation();
  const initial = useRef<string | null>(null);
  useEffect(() => {
    initial.current ??= document.title;
    document.title = query
      ? `${t("search.documentTitle", "‘{{query}}’ 검색 결과", { query })} | ${t("site.name", "지스트신문")}`
      : initial.current;
  }, [query, t]);
}

function SearchForm({
  query,
  onSearch,
}: {
  query: string;
  onSearch: (query: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const label = t("search.label", "검색어");

  return (
    // `action` keeps the form working as a plain GET before hydration.
    <form
      role="search"
      action={localizePath(i18n.language, "/search")}
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(String(new FormData(event.currentTarget).get("q") ?? ""));
      }}
      className="flex gap-2"
    >
      <div className="min-w-0 flex-1">
        <Input
          type="search"
          name="q"
          defaultValue={query}
          maxLength={MAX_QUERY_LENGTH}
          // An empty page is only reached to search (the header's mobile
          // search icon links here).
          autoFocus={!query}
          enterKeyHint="search"
          icon={<SearchIcon />}
          clearLabel={t("search.clear", "검색어 지우기")}
          placeholder={t("header.search", "기사 검색")}
          aria-label={label}
          className="h-[50px] rounded-[10px] text-[17px]"
        />
      </div>
      <Button
        type="submit"
        className="h-[50px] rounded-[10px] px-[22px] mobile:hidden"
      >
        {t("search.submit", "검색")}
      </Button>
    </form>
  );
}

function ResultsBar({
  query,
  total,
  category,
  sort,
  onCategoryChange,
  onSortChange,
}: {
  query: string;
  total: number;
  category?: Category;
  sort: SearchSort;
  onCategoryChange: (category: Category | undefined) => void;
  onSortChange: (sort: SearchSort) => void;
}) {
  const { t, i18n } = useTranslation();
  const labels = getCategoryLabels(t);

  return (
    <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-b-2 border-border-strong pb-3.5">
      {/* aria-live: filters and sort change the count without a page load. */}
      <p className="text-base" aria-live="polite">
        {/* The query is a component, not an interpolated value: Trans parses
            its string for tags, and the query is the reader's text. */}
        <Trans
          i18nKey="search.summary"
          defaults="<query/> 검색 결과 <total/>건"
          count={total}
          components={{
            query: <b>‘{query}’</b>,
            total: (
              <b className="text-brand-text tabular-nums">
                {total.toLocaleString(i18n.language)}
              </b>
            ),
          }}
        />
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <NativeSelect
          value={category ?? ""}
          onChange={(event) =>
            onCategoryChange(
              (event.target.value || undefined) as Category | undefined,
            )
          }
          aria-label={t("search.category", "카테고리 필터")}
          className="w-[168px]"
        >
          <NativeSelectOption value="">
            {t("search.allCategories", "전체 카테고리")}
          </NativeSelectOption>
          {CATEGORY_GROUPS.map(({ category: group, children }) =>
            children.length ? (
              <NativeSelectOptGroup key={group} label={labels[group]}>
                <NativeSelectOption value={group}>
                  {labels[group]}
                </NativeSelectOption>
                {children.map((child) => (
                  <NativeSelectOption key={child} value={child}>
                    {labels[child]}
                  </NativeSelectOption>
                ))}
              </NativeSelectOptGroup>
            ) : (
              <NativeSelectOption key={group} value={group}>
                {labels[group]}
              </NativeSelectOption>
            ),
          )}
          <NativeSelectOption value="NOTICE">
            {labels.NOTICE}
          </NativeSelectOption>
        </NativeSelect>
        <ToggleGroup
          size="lg"
          value={[sort]}
          onValueChange={([next]) => next && onSortChange(next as SearchSort)}
          aria-label={t("search.sort", "정렬")}
        >
          <ToggleGroupItem value="LATEST">
            {t("search.sortLatest", "최신순")}
          </ToggleGroupItem>
          <ToggleGroupItem value="MOST_POPULAR">
            {t("search.sortPopular", "인기순")}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}

const HIGHLIGHT_NAME = "search-hit";

// Marks the query in the shared article cards without changing their markup:
// the CSS Custom Highlight API paints text ranges, and the cards stay the
// same component the category pages render. Browsers without it show the
// results unmarked.
function useQueryHighlight(
  ref: RefObject<HTMLElement | null>,
  query: string,
  articles: unknown,
) {
  useEffect(() => {
    const root = ref.current;
    if (!root || !query || !("highlights" in CSS)) return;
    const ranges: Range[] = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = node as Text;
      let offset = 0;
      for (const part of splitByQuery(text.data, query)) {
        if (part.match) {
          const range = new Range();
          range.setStart(text, offset);
          range.setEnd(text, offset + part.text.length);
          ranges.push(range);
        }
        offset += part.text.length;
      }
    }
    CSS.highlights.set(HIGHLIGHT_NAME, new Highlight(...ranges));
    return () => void CSS.highlights.delete(HIGHLIGHT_NAME);
  }, [ref, query, articles]);
}

function HighlightedList({
  query,
  articles,
}: {
  query: string;
  articles: ArticlePreview[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  useQueryHighlight(ref, query, articles);
  return (
    <div ref={ref} className="[&_*::highlight(search-hit)]:bg-mark">
      <ArticleList articles={articles} />
    </div>
  );
}

function LoadMore({
  total,
  shown,
  hasMore,
  loading,
  failed,
  onLoadMore,
  onRetry,
}: {
  total: number;
  shown: number;
  hasMore: boolean;
  loading: boolean;
  failed: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
}) {
  const { t, i18n } = useTranslation();
  if (total <= SEARCH_PAGE_SIZE) return null;
  const format = (n: number) => n.toLocaleString(i18n.language);

  return (
    <div className="mt-8 flex flex-col items-center gap-2">
      {failed ? (
        <Button variant="outline" className="w-[240px]" onClick={onRetry}>
          {t("search.loadMoreFailed", "더 불러오지 못했습니다. 다시 시도")}
        </Button>
      ) : (
        hasMore && (
          <Button
            variant="outline"
            className="w-[240px]"
            onClick={onLoadMore}
            disabled={loading}
          >
            {loading && <LoaderCircleIcon className="animate-spin" />}
            {t("search.loadMore", "더 보기")}
          </Button>
        )
      )}
      <p className="text-xs text-subtle-foreground tabular-nums">
        {t("search.progress", "{{total}}건 중 {{shown}}건", {
          total: format(total),
          shown: format(shown),
        })}
      </p>
    </div>
  );
}

function NoResults({ query }: { query: string }) {
  const { t } = useTranslation();
  const latest = useLatestArticles(true);

  return (
    <>
      <EmptyState
        icon={<SearchIcon />}
        title={t(
          "search.empty.title",
          "‘{{query}}’에 대한 검색 결과가 없습니다",
          {
            query,
          },
        )}
        description={t(
          "search.empty.description",
          "검색어의 철자를 확인하거나 더 짧은 단어로 검색해 보세요.",
        )}
        className="mt-7"
      />
      {latest.length > 0 && <LatestArticles articles={latest} />}
    </>
  );
}

function LatestArticles({ articles }: { articles: ArticlePreview[] }) {
  const { t, i18n } = useTranslation();
  const dayjs = useDayjs();

  return (
    <section className="mt-10 flex flex-col">
      <h2 className="border-b-2 border-border-strong pb-2.5 text-[15px] font-extrabold">
        {t("search.latest", "최신 기사")}
      </h2>
      <ul>
        {articles.map((article) => (
          <li
            key={article.id}
            className="flex flex-col gap-1.5 border-b border-border py-3.5 last:border-b-0"
          >
            {article.category && (
              <CategoryBadge category={article.category} kicker />
            )}
            <a
              href={localizePath(i18n.language, article.path)}
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
          </li>
        ))}
      </ul>
    </section>
  );
}

function ResultsSkeleton() {
  const { t } = useTranslation();
  return (
    <div
      role="status"
      aria-label={t("search.loading", "검색하는 중")}
      className="mt-7 flex flex-col"
    >
      <Skeleton className="mb-3.5 h-6 w-48" />
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          className="flex gap-6 border-t border-border py-[22px] mobile:gap-3.5"
        >
          <div className="flex flex-1 flex-col gap-2.5">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-6 w-4/5" />
            <Skeleton className="h-4 w-full mobile:hidden" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="aspect-3/2 w-[184px] shrink-0 mobile:w-[108px]" />
        </div>
      ))}
    </div>
  );
}
