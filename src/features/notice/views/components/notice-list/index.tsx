import { type i18n as I18n } from "i18next";
import { MegaphoneIcon } from "lucide-react";
import { I18nextProvider, useTranslation } from "react-i18next";

import { EmptyState } from "@/common/components/ui/empty-state";
import { useDayjs } from "@/common/lib/dayjs";
import { i18n as appI18n } from "@/common/lib/i18n";
import { localizePath } from "@/common/lib/languages";
import { ArticlePagination } from "@/features/article";

import { getNoticeListPath, type NoticeItem } from "../../../viewmodels/notice";

// Own React root under Astro; see Header for why i18n is a prop.
export function NoticeList({ i18n = appI18n, ...props }: NoticeList.Props) {
  return (
    <I18nextProvider i18n={i18n}>
      <NoticeListContent {...props} />
    </I18nextProvider>
  );
}

export namespace NoticeList {
  export type Props = {
    i18n?: I18n;
    notices: NoticeItem[];
    /** Notices in the whole list, not just this page. */
    total: number;
    page: { current: number; last: number };
  };
}

function NoticeListContent({
  notices,
  total,
  page,
}: Omit<NoticeList.Props, "i18n">) {
  const { t, i18n } = useTranslation();
  const dayjs = useDayjs();

  return (
    <div className="max-w-[860px] pt-10 pb-24 mobile:pt-6 mobile:pb-16">
      <div className="mb-5 flex items-end justify-between gap-4 pt-2">
        <h1 className="min-w-0 text-[56px] leading-none font-extrabold tracking-[-0.045em] mobile:text-[36px]">
          {t("notice.title", "공지사항")}
        </h1>
        <p className="shrink-0 text-sm text-subtle-foreground tabular-nums">
          {t("notice.count", "공지 {{count}}건", { count: total })}
        </p>
      </div>

      {notices.length === 0 ? (
        <EmptyState
          icon={<MegaphoneIcon />}
          title={t("notice.empty.title", "아직 공지가 없습니다")}
          description={t(
            "notice.empty.description",
            "공지가 올라오면 이곳에 보입니다.",
          )}
          className="mt-8"
        />
      ) : (
        <ol className="border-t-2 border-border-strong">
          {notices.map((notice) => (
            <li key={notice.id} className="border-b border-border">
              <a
                href={localizePath(i18n.language, notice.path)}
                className="group flex items-baseline justify-between gap-8 py-5 mobile:flex-col mobile:gap-1.5 mobile:py-4"
              >
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="text-[18px] leading-[1.45] font-bold tracking-[-0.015em] group-hover:underline mobile:text-base">
                    {notice.title}
                  </span>
                  {notice.subtitle && (
                    <span className="text-sm text-muted-foreground">
                      {notice.subtitle}
                    </span>
                  )}
                </span>
                <time
                  dateTime={notice.publishedAt.toISOString()}
                  className="shrink-0 text-sm text-subtle-foreground tabular-nums"
                >
                  {dayjs(notice.publishedAt).format("YYYY.MM.DD")}
                </time>
              </a>
            </li>
          ))}
        </ol>
      )}

      <ArticlePagination
        current={page.current}
        last={page.last}
        basePath="/notice"
        pagePath={getNoticeListPath}
        className="mt-9"
      />
    </div>
  );
}
