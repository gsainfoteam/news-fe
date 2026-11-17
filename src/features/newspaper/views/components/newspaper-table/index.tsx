import { createColumnHelper } from "@tanstack/react-table";
import {
  ArrowUpRightIcon,
  EllipsisIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/common/components/ui/button";
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
import { useDayjs } from "@/common/lib/dayjs";

import { type Newspaper } from "../../../models";

const col = createColumnHelper<typeof dataTableFeatures, Newspaper>();

export function NewspaperTable({
  newspapers,
  onEdit,
  onDelete,
}: NewspaperTable.Props) {
  const { t } = useTranslation();
  const dayjs = useDayjs();
  const date = (d: Date) => dayjs(d).format("YYYY.MM.DD");
  const labels = {
    edit: t("newspaper.table.edit", "수정"),
    delete: t("newspaper.table.delete", "삭제"),
    open: t("newspaper.table.open", "PDF 열기"),
    newTab: t("footer.newTab", "(새 탭에서 열림)"),
  };

  const title = (paper: Newspaper) => (
    <a
      href={paper.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 font-bold hover:text-brand-text hover:underline"
    >
      {paper.title}
      <span className="sr-only">
        {labels.open} {labels.newTab}
      </span>
      <ArrowUpRightIcon
        aria-hidden="true"
        className="size-3.5 shrink-0 text-subtle-foreground"
      />
    </a>
  );

  const columns = col.columns([
    col.accessor("title", {
      header: t("newspaper.table.title", "제목"),
      cell: ({ row }) => title(row.original),
    }),
    col.accessor("createdAt", {
      header: t("newspaper.table.createdAt", "등록일"),
      meta: {
        className: "whitespace-nowrap text-muted-foreground tabular-nums",
      },
      cell: ({ getValue }) => date(getValue()),
    }),
    col.accessor("updatedAt", {
      header: t("newspaper.table.updatedAt", "수정일"),
      meta: {
        className: "whitespace-nowrap text-muted-foreground tabular-nums",
      },
      cell: ({ getValue }) => date(getValue()),
    }),
    col.display({
      id: "actions",
      header: () => (
        <span className="sr-only">{t("newspaper.table.actions", "작업")}</span>
      ),
      cell: ({ row: { original: paper } }) => (
        <span className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`${paper.title} ${labels.edit}`}
            title={labels.edit}
            onClick={() => onEdit(paper)}
          >
            <PencilIcon />
          </Button>
          <Button
            variant="destructive-ghost"
            size="icon-sm"
            aria-label={`${paper.title} ${labels.delete}`}
            title={labels.delete}
            onClick={() => onDelete(paper)}
          >
            <Trash2Icon />
          </Button>
        </span>
      ),
    }),
  ]);

  return (
    <DataTable
      caption={t("newspaper.table.caption", "지면 목록")}
      columns={columns}
      data={newspapers}
      getRowId={(paper) => String(paper.id)}
      empty={t("newspaper.table.empty", "올린 지면이 없습니다")}
      renderMobileItem={({ original: paper }) => (
        <div className="flex items-center gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            {title(paper)}
            <span className="text-2xs text-subtle-foreground tabular-nums">
              {t("newspaper.table.createdOn", "{{date}} 등록", {
                date: date(paper.createdAt),
              })}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon-sm" />}
              aria-label={t("newspaper.table.menu", "{{title}} 작업 메뉴", {
                title: paper.title,
              })}
            >
              <EllipsisIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onEdit(paper)}>
                <PencilIcon />
                {labels.edit}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(paper)}
              >
                <Trash2Icon />
                {labels.delete}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    />
  );
}

export namespace NewspaperTable {
  export type Props = {
    newspapers: Newspaper[];
    onEdit: (paper: Newspaper) => void;
    onDelete: (paper: Newspaper) => void;
  };
}
