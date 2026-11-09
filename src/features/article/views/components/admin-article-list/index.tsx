import { type MouseEvent, useState } from "react";

import { createColumnHelper } from "@tanstack/react-table";
import {
  EllipsisIcon,
  ExternalLinkIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/common/components/ui/alert-dialog";
import { Badge } from "@/common/components/ui/badge";
import { Button, buttonVariants } from "@/common/components/ui/button";
import {
  DataTable,
  type dataTableFeatures,
} from "@/common/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import { ErrorState } from "@/common/components/ui/error-state";
import { Input } from "@/common/components/ui/input";
import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "@/common/components/ui/native-select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/common/components/ui/pagination";
import { Skeleton } from "@/common/components/ui/skeleton";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/common/components/ui/toggle-group";
import { cn } from "@/common/lib/cn";
import { useDayjs } from "@/common/lib/dayjs";
import { localizePath } from "@/common/lib/languages";
import { AdminGuard, AdminPageHeader } from "@/features/admin";
import {
  CATEGORY_GROUPS,
  type Category,
  getCategoryLabels,
} from "@/features/category";

import { type AdminArticle } from "../../../models/admin";
import {
  type AdminArticleFilters,
  type AdminArticleSort,
  getAuthorNames,
  getPageWindow,
  isEdited,
  writeAdminArticleFilters,
} from "../../../viewmodels/admin-article-list";
import { useAdminArticles } from "../../../viewmodels/use-admin-articles";

// The `/admin` island.
export function AdminArticles() {
  return (
    <AdminGuard section="articles">
      <AdminArticleList />
    </AdminGuard>
  );
}

const col = createColumnHelper<typeof dataTableFeatures, AdminArticle>();

export function AdminArticleList() {
  const { t, i18n } = useTranslation();
  const dayjs = useDayjs();
  const list = useAdminArticles();
  const [target, setTarget] = useState<AdminArticle>();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const lng = i18n.language;
  const labels = getCategoryLabels(t);
  const path = (to: string) => localizePath(lng, to);
  const editHref = (a: AdminArticle) => path(`/admin/articles/edit?id=${a.id}`);
  const siteHref = (a: AdminArticle) => path(`/article/${a.id}`);
  const date = (d: Date) => dayjs(d).format("YYYY.MM.DD");
  const views = (n: number) => n.toLocaleString(lng);
  const actionLabels = {
    view: t("admin.articles.view", "사이트에서 보기"),
    edit: t("admin.articles.edit", "수정"),
    delete: t("admin.articles.delete", "삭제"),
  };

  const askDelete = (article: AdminArticle) => {
    setTarget(article);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!target) return;
    try {
      await list.deleteArticle(target.id);
      setConfirmOpen(false);
      toast.success(t("admin.articles.deleted", "기사를 삭제했습니다"), {
        description: t(
          "admin.articles.deletedDescription",
          "사이트에서는 1~2분 뒤 사라집니다.",
        ),
      });
    } catch {
      toast.error(
        t("admin.articles.deleteFailed", "기사를 삭제하지 못했습니다"),
        {
          description: t(
            "admin.articles.deleteFailedDescription",
            "잠시 뒤 다시 시도해 주세요.",
          ),
        },
      );
    }
  };

  const categories = (a: AdminArticle) => (
    <span className="flex flex-wrap gap-1">
      {a.categories.map((c) => (
        <Badge key={c}>{labels[c]}</Badge>
      ))}
    </span>
  );

  const columns = col.columns([
    col.accessor("title", {
      header: t("admin.articles.column.title", "제목"),
      meta: { className: "min-w-64 max-w-90" },
      cell: ({ row: { original: a } }) => (
        <a href={editHref(a)} className="flex flex-col gap-1 hover:underline">
          <span className="font-bold">{a.title}</span>
          {a.subtitle && (
            <span className="text-2xs text-subtle-foreground">
              {a.subtitle}
            </span>
          )}
        </a>
      ),
    }),
    col.accessor("categories", {
      header: t("admin.articles.column.category", "카테고리"),
      cell: ({ row }) => categories(row.original),
    }),
    col.display({
      id: "authors",
      header: t("admin.articles.column.authors", "작성자"),
      meta: { className: "whitespace-nowrap text-muted-foreground" },
      cell: ({ row }) => getAuthorNames(row.original),
    }),
    col.accessor("views", {
      header: t("admin.articles.column.views", "조회수"),
      meta: { className: "text-right tabular-nums" },
      cell: ({ getValue }) => views(getValue()),
    }),
    col.accessor("createdAt", {
      header: t("admin.articles.column.createdAt", "작성일"),
      meta: {
        className: "whitespace-nowrap text-muted-foreground tabular-nums",
      },
      cell: ({ getValue }) => date(getValue()),
    }),
    col.accessor("updatedAt", {
      header: t("admin.articles.column.updatedAt", "수정일"),
      meta: {
        className: "whitespace-nowrap text-muted-foreground tabular-nums",
      },
      cell: ({ row: { original: a } }) =>
        isEdited(a) ? date(a.updatedAt) : "—",
    }),
    col.display({
      id: "actions",
      header: () => (
        <span className="sr-only">
          {t("admin.articles.column.actions", "작업")}
        </span>
      ),
      cell: ({ row: { original: a } }) => (
        <span className="flex justify-end gap-1">
          <a
            href={siteHref(a)}
            aria-label={actionLabels.view}
            title={actionLabels.view}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-sm" }),
            )}
          >
            <ExternalLinkIcon />
          </a>
          <a
            href={editHref(a)}
            aria-label={actionLabels.edit}
            title={actionLabels.edit}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-sm" }),
            )}
          >
            <PencilIcon />
          </a>
          <Button
            variant="destructive-ghost"
            size="icon-sm"
            aria-label={actionLabels.delete}
            title={actionLabels.delete}
            onClick={() => askDelete(a)}
          >
            <Trash2Icon />
          </Button>
        </span>
      ),
    }),
  ]);

  const searchLabel = t("admin.articles.search", "제목과 본문 검색");

  return (
    <>
      <AdminPageHeader
        title={t("admin.articles.title", "기사")}
        description={
          list.status === "success" &&
          t("admin.articles.count", "전체 {{count}}건", {
            count: list.count,
          })
        }
        actions={
          <a
            href={path("/admin/articles/new")}
            className={cn(buttonVariants())}
          >
            <PlusIcon />
            {t("admin.articles.new", "새 기사 작성")}
          </a>
        }
      />

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="max-w-[360px] min-w-0 flex-[1_1_260px] mobile:max-w-none">
          <Input
            type="search"
            icon={<SearchIcon />}
            value={list.searchInput}
            onChange={(e) => list.setSearchInput(e.target.value)}
            placeholder={searchLabel}
            aria-label={searchLabel}
            clearLabel={t("admin.articles.clearSearch", "검색어 지우기")}
            className="h-[38px]"
          />
        </div>
        <NativeSelect
          value={list.filters.category ?? ""}
          onChange={(e) =>
            list.setCategory((e.target.value || undefined) as Category)
          }
          aria-label={t("admin.articles.categoryFilter", "카테고리 필터")}
          className="w-[168px] [&_select]:h-[38px]"
        >
          <NativeSelectOption value="">
            {t("admin.articles.allCategories", "전체 카테고리")}
          </NativeSelectOption>
          {CATEGORY_GROUPS.map(({ category, children }) =>
            children.length ? (
              <NativeSelectOptGroup key={category} label={labels[category]}>
                <NativeSelectOption value={category}>
                  {t("admin.articles.groupAll", "{{category}} 전체", {
                    category: labels[category],
                  })}
                </NativeSelectOption>
                {children.map((child) => (
                  <NativeSelectOption key={child} value={child}>
                    {labels[child]}
                  </NativeSelectOption>
                ))}
              </NativeSelectOptGroup>
            ) : (
              <NativeSelectOption key={category} value={category}>
                {labels[category]}
              </NativeSelectOption>
            ),
          )}
          <NativeSelectOption value="NOTICE">
            {labels.NOTICE}
          </NativeSelectOption>
        </NativeSelect>
        <ToggleGroup
          size="lg"
          value={[list.filters.sort]}
          onValueChange={([sort]) =>
            sort && list.setSort(sort as AdminArticleSort)
          }
          aria-label={t("admin.articles.sort", "정렬")}
        >
          <ToggleGroupItem value="LATEST">
            {t("admin.articles.sortLatest", "최신순")}
          </ToggleGroupItem>
          <ToggleGroupItem value="MOST_POPULAR">
            {t("admin.articles.sortViews", "조회순")}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {list.status === "pending" ? (
        <ListSkeleton />
      ) : list.status === "error" ? (
        <ErrorState
          title={t(
            "admin.articles.loadFailed",
            "기사 목록을 불러오지 못했습니다",
          )}
          description={t("error.description", "잠시 후 다시 시도해 주세요.")}
          retryLabel={t("error.retry", "다시 시도")}
          onRetry={list.retry}
        />
      ) : (
        <div
          aria-busy={list.isFetching}
          className={cn(
            "flex flex-col gap-6 transition-opacity",
            list.isFetching && "opacity-60",
          )}
        >
          <DataTable
            caption={t("admin.articles.caption", "기사 목록")}
            columns={columns}
            data={list.articles}
            getRowId={(a) => String(a.id)}
            empty={t("admin.articles.empty", "조건에 맞는 기사가 없습니다")}
            renderMobileItem={({ original: a }) => (
              <>
                {categories(a)}
                <a href={editHref(a)} className="leading-[1.45] font-bold">
                  {a.title}
                </a>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex flex-wrap items-center gap-x-2 text-2xs text-subtle-foreground tabular-nums">
                    <span>{getAuthorNames(a)}</span>
                    <span>{date(a.createdAt)}</span>
                    <span>
                      {t("admin.articles.viewsShort", "조회 {{views}}", {
                        views: views(a.views),
                      })}
                    </span>
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="ghost" size="icon-sm" />}
                      aria-label={t("admin.articles.actions", "작업 메뉴")}
                    >
                      <EllipsisIcon />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem render={<a href={editHref(a)} />}>
                        <PencilIcon />
                        {actionLabels.edit}
                      </DropdownMenuItem>
                      <DropdownMenuItem render={<a href={siteHref(a)} />}>
                        <ExternalLinkIcon />
                        {actionLabels.view}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => askDelete(a)}
                      >
                        <Trash2Icon />
                        {actionLabels.delete}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            )}
          />
          {list.pageCount > 1 && (
            <PageNav
              filters={list.filters}
              pageCount={list.pageCount}
              onChange={list.setPage}
            />
          )}
        </div>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("admin.articles.confirm.title", "이 기사를 삭제할까요?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "admin.articles.confirm.description",
                "‘{{title}}’ 기사를 삭제하면 되돌릴 수 없습니다. 사이트에서는 1~2분 뒤 사라집니다.",
                { title: target?.title },
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={list.isDeleting}>
              {t("admin.articles.confirm.cancel", "취소")}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={list.isDeleting}
              onClick={confirmDelete}
            >
              {t("admin.articles.confirm.action", "삭제")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function PageNav({
  filters,
  pageCount,
  onChange,
}: {
  filters: AdminArticleFilters;
  pageCount: number;
  onChange: (page: number) => void;
}) {
  const { t } = useTranslation();
  // Real links so a page opens in a new tab too; a plain click stays in place.
  const { page } = filters;
  const link = (to: number) => ({
    href:
      writeAdminArticleFilters(window.location.search, {
        ...filters,
        page: to,
      }) || window.location.pathname,
    onClick: (e: MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      onChange(to);
      window.scrollTo({ top: 0 });
    },
  });
  return (
    <Pagination aria-label={t("admin.articles.pages", "페이지")}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            aria-label={t("admin.articles.previous", "이전 페이지")}
            aria-disabled={page <= 1 || undefined}
            {...link(page - 1)}
          />
        </PaginationItem>
        {getPageWindow(page, pageCount).map((n) => (
          <PaginationItem key={n}>
            <PaginationLink isActive={n === page} {...link(n)}>
              {n}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            aria-label={t("admin.articles.next", "다음 페이지")}
            aria-disabled={page >= pageCount || undefined}
            {...link(page + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-5 flex-1" />
          <Skeleton className="h-5 w-20 mobile:hidden" />
          <Skeleton className="h-5 w-16 mobile:hidden" />
        </div>
      ))}
    </div>
  );
}
