import { useTranslation } from "react-i18next";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/common/components/ui/pagination";
import { localizePath } from "@/common/lib/languages";

import { getPagePath, getPageWindow } from "../../../viewmodels/article-list";

// Plain links between static pages, so it needs no hydration.
export function ArticlePagination({
  current,
  last,
  basePath,
  className,
}: ArticlePagination.Props) {
  const { t, i18n } = useTranslation();
  if (last <= 1) return null;

  const href = (page: number) =>
    localizePath(i18n.language, getPagePath(basePath, page));
  // A disabled end keeps its slot so the numbers don't shift.
  const edge = (page: number, enabled: boolean) =>
    enabled ? { href: href(page) } : { "aria-disabled": true as const };

  return (
    <Pagination
      aria-label={t("pagination.label", "페이지")}
      className={className}
    >
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            aria-label={t("pagination.previous", "이전 페이지")}
            {...edge(current - 1, current > 1)}
          />
        </PaginationItem>
        {getPageWindow(current, last).map((item, i) => (
          <PaginationItem key={item === "ellipsis" ? `gap-${i}` : item}>
            {item === "ellipsis" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink href={href(item)} isActive={item === current}>
                <span className="tabular-nums">{item}</span>
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            aria-label={t("pagination.next", "다음 페이지")}
            {...edge(current + 1, current < last)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export namespace ArticlePagination {
  export type Props = {
    current: number;
    last: number;
    /** Page 1's path, unprefixed (`/category/campus`). */
    basePath: string;
    className?: string;
  };
}
