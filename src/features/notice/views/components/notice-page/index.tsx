import { type ReactNode } from "react";

import { type i18n as I18n } from "i18next";
import { ChevronDownIcon, ChevronUpIcon, ListIcon } from "lucide-react";
import { I18nextProvider, useTranslation } from "react-i18next";

import { buttonVariants } from "@/common/components/ui/button";
import { useDayjs } from "@/common/lib/dayjs";
import { i18n as appI18n } from "@/common/lib/i18n";
import { localizePath } from "@/common/lib/languages";
import { ArticleBody, type ArticleDetail } from "@/features/article";

import { type NoticeItem } from "../../../viewmodels/notice";

// Own React root under Astro; see Header for why i18n is a prop.
export function NoticePage({ i18n = appI18n, ...props }: NoticePage.Props) {
  return (
    <I18nextProvider i18n={i18n}>
      <NoticePageContent {...props} />
    </I18nextProvider>
  );
}

export namespace NoticePage {
  export type Props = {
    i18n?: I18n;
    notice: ArticleDetail;
    newer?: NoticeItem;
    older?: NoticeItem;
  };
}

function NoticePageContent({
  notice,
  newer,
  older,
}: Omit<NoticePage.Props, "i18n">) {
  const { t, i18n } = useTranslation();
  const dayjs = useDayjs();
  const path = (to: string) => localizePath(i18n.language, to);
  const format = (date: Date) => dayjs(date).format("YYYY.MM.DD");

  return (
    <article className="max-w-[760px] pt-14 pb-24 mobile:pt-7 mobile:pb-16">
      <header className="flex flex-col gap-4 border-b border-border pb-6 mobile:gap-3 mobile:pb-5">
        <p className="text-xs font-bold text-brand-text">
          <a href={path("/notice")} className="hover:underline">
            {t("notice.title", "공지사항")}
          </a>
        </p>
        <h1 className="text-[40px] leading-[1.25] font-extrabold tracking-[-0.03em] mobile:text-[28px]">
          {notice.title}
        </h1>
        {notice.subtitle && (
          <p className="text-[19px] leading-[1.5] font-medium text-muted-foreground mobile:text-[17px]">
            {notice.subtitle}
          </p>
        )}
        <p className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-subtle-foreground tabular-nums">
          {notice.authors.length > 0 && (
            <span className="font-semibold text-muted-foreground">
              {notice.authors.join(", ")}
            </span>
          )}
          <time dateTime={notice.publishedAt.toISOString()}>
            {t("notice.publishedAt", "게시 {{date}}", {
              date: format(notice.publishedAt),
            })}
          </time>
          {notice.updatedAt && (
            <time dateTime={notice.updatedAt.toISOString()}>
              {t("notice.updatedAt", "수정 {{date}}", {
                date: format(notice.updatedAt),
              })}
            </time>
          )}
        </p>
      </header>

      <ArticleBody html={notice.html} className="mt-9 mobile:mt-7" />

      {(newer || older) && (
        <nav
          aria-label={t("notice.adjacent", "다른 공지")}
          className="mt-14 border-y border-border mobile:mt-10"
        >
          {newer && (
            <AdjacentLink
              notice={newer}
              label={t("notice.newer", "다음 공지")}
              icon={<ChevronUpIcon aria-hidden="true" className="size-4" />}
            />
          )}
          {older && (
            <AdjacentLink
              notice={older}
              label={t("notice.older", "이전 공지")}
              icon={<ChevronDownIcon aria-hidden="true" className="size-4" />}
            />
          )}
        </nav>
      )}

      <div className="mt-8 flex justify-center">
        <a
          href={path("/notice")}
          className={buttonVariants({ variant: "outline" })}
        >
          <ListIcon />
          {t("notice.backToList", "목록으로")}
        </a>
      </div>
    </article>
  );
}

function AdjacentLink({
  notice,
  label,
  icon,
}: {
  notice: NoticeItem;
  label: string;
  icon: ReactNode;
}) {
  const { i18n } = useTranslation();
  return (
    <a
      href={localizePath(i18n.language, notice.path)}
      className="group flex items-center gap-4 py-4 not-last:border-b not-last:border-border mobile:gap-3"
    >
      <span className="flex w-24 shrink-0 items-center gap-1 text-sm font-semibold text-subtle-foreground mobile:w-20">
        {icon}
        {label}
      </span>
      <span className="min-w-0 truncate font-semibold group-hover:underline">
        {notice.title}
      </span>
    </a>
  );
}
