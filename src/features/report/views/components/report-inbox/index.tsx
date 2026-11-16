import { useEffect, useRef } from "react";

import {
  ArrowLeftIcon,
  InboxIcon,
  PaperclipIcon,
  SearchXIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { EmptyState } from "@/common/components/ui/empty-state";
import { ErrorState } from "@/common/components/ui/error-state";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/common/components/ui/pagination";
import { Skeleton } from "@/common/components/ui/skeleton";
import { cn } from "@/common/lib/cn";
import { useDayjs } from "@/common/lib/dayjs";
import { localizePath } from "@/common/lib/languages";
import { AdminGuard, AdminPageHeader } from "@/features/admin";
import { hasPermission } from "@/features/auth";

import { type Report } from "../../../models";
import {
  getPageWindow,
  getReportTitle,
  type InboxLocation,
  toExcerpt,
} from "../../../viewmodels/report-inbox";
import {
  useReportDetail,
  useReportInbox,
} from "../../../viewmodels/use-report-inbox";
import { ReportDetail } from "../report-detail";

// Tailwind's `max-lg`.
const ONE_PANE_QUERY = "(width < 64rem)";

export function AdminReports({ initialLocation }: AdminReports.Props) {
  return (
    <AdminGuard section="reports">
      {(user) => (
        <ReportInbox
          initialLocation={initialLocation}
          canWriteArticles={hasPermission(user, "EDITOR")}
        />
      )}
    </AdminGuard>
  );
}

export namespace AdminReports {
  export type Props = {
    /** For stories: start here and leave the URL alone. */
    initialLocation?: InboxLocation;
  };
}

export function ReportInbox({
  initialLocation,
  canWriteArticles,
}: ReportInbox.Props) {
  const { t, i18n } = useTranslation();
  const inbox = useReportInbox(i18n.language, initialLocation);
  const { id, page } = inbox.location;
  const selected = id !== undefined;

  // The view swaps without a page load, so put the reader where a new page
  // would: at the top, for another page of the list or, in one-pane widths,
  // for a report opened from far down the list.
  const previous = useRef({ id, page });
  useEffect(() => {
    const before = previous.current;
    previous.current = { id, page };
    const openedReport =
      id !== undefined &&
      id !== before.id &&
      window.matchMedia(ONE_PANE_QUERY).matches;
    if (page !== before.page || openedReport) window.scrollTo({ top: 0 });
  }, [id, page]);

  const header = (
    <AdminPageHeader
      title={t("admin.reports.title", "제보함")}
      description={
        inbox.status === "success" &&
        t("admin.reports.count", "전체 {{count}}건, 최신순", {
          count: inbox.count,
        })
      }
    />
  );

  if (!selected && inbox.status === "success" && inbox.count === 0) {
    return (
      <>
        {header}
        <EmptyState
          icon={<InboxIcon />}
          title={t("admin.reports.empty.title", "아직 들어온 제보가 없습니다")}
          description={t(
            "admin.reports.empty.description",
            "독자가 제보 페이지에서 보낸 제보가 여기에 쌓입니다.",
          )}
        />
      </>
    );
  }

  return (
    <>
      {header}
      {/* Below lg there is room for one pane: the list, or the open report. */}
      <div className="grid min-h-[760px] grid-cols-[clamp(300px,34%,380px)_minmax(0,1fr)] overflow-hidden rounded-lg border border-border bg-card max-lg:min-h-0 max-lg:grid-cols-1">
        <div
          className={cn(
            "flex min-w-0 flex-col border-r border-border max-lg:border-r-0",
            selected && "max-lg:hidden",
          )}
        >
          <ReportList inbox={inbox} />
        </div>
        {/* Sticky, so a report opened from far down the list is in view. */}
        <div
          className={cn(
            "min-w-0 lg:sticky lg:top-0 lg:max-h-dvh lg:self-start lg:overflow-y-auto",
            !selected && "max-lg:hidden lg:self-stretch",
          )}
        >
          {selected ? (
            <div className="flex flex-col gap-5 px-8 py-7 max-lg:px-6 mobile:px-4 mobile:py-5">
              <a
                {...inbox.link({ page })}
                className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground lg:hidden"
              >
                <ArrowLeftIcon aria-hidden="true" className="size-4" />
                {t("admin.reports.backToList", "제보 목록")}
              </a>
              <DetailPane
                key={id}
                id={id}
                writeArticleHref={
                  canWriteArticles
                    ? localizePath(i18n.language, "/admin/articles/new")
                    : undefined
                }
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-center text-sm text-subtle-foreground">
              {t(
                "admin.reports.pick",
                "목록에서 제보를 고르면 내용이 여기에 나옵니다.",
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export namespace ReportInbox {
  export type Props = AdminReports.Props & {
    canWriteArticles: boolean;
  };
}

type Inbox = ReturnType<typeof useReportInbox>;

function ReportList({ inbox }: { inbox: Inbox }) {
  const { t } = useTranslation();

  if (inbox.status === "pending") return <ListSkeleton />;
  if (inbox.status === "error") {
    return (
      <ErrorState
        title={t("admin.reports.loadFailed", "제보 목록을 불러오지 못했습니다")}
        description={t("error.description", "잠시 후 다시 시도해 주세요.")}
        retryLabel={t("error.retry", "다시 시도")}
        onRetry={inbox.retry}
        retrying={inbox.isFetching}
        className="m-4 border-0"
      />
    );
  }
  if (inbox.reports.length === 0) {
    return (
      <p className="p-6 text-center text-sm text-subtle-foreground">
        {t("admin.reports.emptyPage", "이 페이지에는 제보가 없습니다.")}
      </p>
    );
  }

  return (
    <div
      aria-busy={inbox.isFetching}
      className={cn(
        "flex grow flex-col transition-opacity",
        inbox.isFetching && "opacity-60",
      )}
    >
      <ul aria-label={t("admin.reports.listLabel", "제보 목록")}>
        {inbox.reports.map((report) => (
          <li key={report.id}>
            <ReportListItem
              report={report}
              current={report.id === inbox.location.id}
              link={inbox.link({ id: report.id, page: inbox.location.page })}
            />
          </li>
        ))}
      </ul>
      {inbox.pageCount > 1 && <PageNav inbox={inbox} />}
    </div>
  );
}

function ReportListItem({
  report,
  current,
  link,
}: {
  report: Report;
  current: boolean;
  link: ReturnType<Inbox["link"]>;
}) {
  const { t } = useTranslation();
  const dayjs = useDayjs();
  const title = getReportTitle(report.title);
  const date = dayjs(report.createdAt);
  const sameYear = date.year() === dayjs().year();

  return (
    <a
      {...link}
      aria-current={current ? "page" : undefined}
      className="flex flex-col gap-1.5 border-b border-border px-[18px] py-3.5 outline-none hover:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring aria-[current=page]:bg-surface aria-[current=page]:shadow-[inset_3px_0_0_var(--color-primary)]"
    >
      <span className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "min-w-0 truncate text-[15px] leading-[1.4] font-bold",
            !title && "font-semibold text-subtle-foreground",
          )}
        >
          {title ?? t("admin.reports.untitled", "(제목 없음)")}
        </span>
        <time
          dateTime={report.createdAt.toISOString()}
          className="shrink-0 text-2xs text-subtle-foreground tabular-nums"
        >
          {date.format(sameYear ? "MM.DD" : "YYYY.MM.DD")}
        </time>
      </span>
      <span className="line-clamp-1 text-sm text-muted-foreground">
        {toExcerpt(report.description)}
      </span>
      <span className="flex items-center gap-2 text-2xs text-subtle-foreground">
        <span className="truncate">{report.name}</span>
        {report.files.length > 0 && (
          <span
            className="flex shrink-0 items-center gap-1 tabular-nums"
            aria-label={t("admin.reports.fileCount", "첨부 {{count}}개", {
              count: report.files.length,
            })}
          >
            <PaperclipIcon aria-hidden="true" className="size-3.25" />
            {report.files.length}
          </span>
        )}
      </span>
    </a>
  );
}

function PageNav({ inbox }: { inbox: Inbox }) {
  const { t } = useTranslation();
  const { page, id } = inbox.location;
  const link = (to: number) =>
    to < 1 || to > inbox.pageCount
      ? // Without href the anchor leaves the tab order, so Enter can't reach
        // an out-of-range page; aria-disabled alone only blocks the mouse.
        { "aria-disabled": true as const }
      : inbox.link({ id, page: to });

  return (
    <Pagination
      aria-label={t("admin.reports.pages", "페이지")}
      className="mt-auto p-3.5"
    >
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            aria-label={t("admin.reports.previous", "이전 페이지")}
            {...link(page - 1)}
          />
        </PaginationItem>
        {getPageWindow(page, inbox.pageCount).map((n) => (
          <PaginationItem key={n}>
            <PaginationLink isActive={n === page} {...link(n)}>
              {n}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            aria-label={t("admin.reports.next", "다음 페이지")}
            {...link(page + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function DetailPane({
  id,
  writeArticleHref,
}: {
  id: number;
  writeArticleHref?: string;
}) {
  const { t } = useTranslation();
  const detail = useReportDetail(id);

  if (detail.status === "pending") return <DetailSkeleton />;
  if (!detail.report) {
    return detail.notFound ? (
      <EmptyState
        icon={<SearchXIcon />}
        title={t("admin.reports.notFound.title", "제보를 찾을 수 없습니다")}
        description={t(
          "admin.reports.notFound.description",
          "주소가 잘못되었거나 지워진 제보입니다.",
        )}
      />
    ) : (
      <ErrorState
        title={t("admin.reports.detailFailed", "제보를 불러오지 못했습니다")}
        description={t("error.description", "잠시 후 다시 시도해 주세요.")}
        retryLabel={t("error.retry", "다시 시도")}
        onRetry={detail.retry}
        retrying={detail.isFetching}
      />
    );
  }

  return (
    <ReportDetail
      report={detail.report}
      linksExpired={detail.linksExpired}
      refreshingLinks={detail.isFetching}
      onRefreshLinks={async () => {
        if (!(await detail.refreshLinks())) {
          toast.error(
            t("admin.reports.refreshFailed", "새 링크를 받지 못했습니다"),
            {
              description: t(
                "error.description",
                "잠시 후 다시 시도해 주세요.",
              ),
            },
          );
        }
      }}
      onFileClick={detail.guardLink}
      writeArticleHref={writeArticleHref}
    />
  );
}

function ListSkeleton() {
  return (
    <div role="status" className="flex flex-col">
      {Array.from({ length: 7 }, (_, i) => (
        <div
          key={i}
          className="flex flex-col gap-2 border-b border-border px-[18px] py-3.5"
        >
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3.5 w-16" />
        </div>
      ))}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div role="status" className="flex flex-col gap-5">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-7 w-2/3" />
      <Skeleton className="h-32 w-full rounded-lg" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
