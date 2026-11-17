import { type i18n as I18n } from "i18next";
import { ArrowUpRightIcon, FileTextIcon } from "lucide-react";
import { I18nextProvider, useTranslation } from "react-i18next";

import { EmptyState } from "@/common/components/ui/empty-state";
import { useDayjs } from "@/common/lib/dayjs";
import { i18n as appI18n } from "@/common/lib/i18n";

import {
  type ArchiveIssue,
  type ArchiveYear,
  getIssueNumber,
} from "../../../viewmodels/archive";

// Own React root under Astro; see Header for why i18n is a prop.
export function NewspaperArchive({
  i18n = appI18n,
  ...props
}: NewspaperArchive.Props) {
  return (
    <I18nextProvider i18n={i18n}>
      <NewspaperArchiveContent {...props} />
    </I18nextProvider>
  );
}

export namespace NewspaperArchive {
  export type Props = {
    i18n?: I18n;
    years: ArchiveYear[];
  };
}

function NewspaperArchiveContent({
  years,
}: Omit<NewspaperArchive.Props, "i18n">) {
  const { t } = useTranslation();
  const total = years.reduce((sum, y) => sum + y.issues.length, 0);

  return (
    <div className="pt-10 pb-24 mobile:pt-6 mobile:pb-16">
      <div className="flex items-end justify-between gap-4 pt-2">
        <h1 className="min-w-0 text-[56px] leading-none font-extrabold tracking-[-0.045em] mobile:text-[36px]">
          {t("archive.title", "지면 보기")}
        </h1>
        {total > 0 && (
          <p className="shrink-0 text-sm text-subtle-foreground tabular-nums">
            {t("archive.count", "총 {{count}}호", { count: total })}
          </p>
        )}
      </div>
      <p className="mt-4 max-w-[640px] text-base text-muted-foreground">
        {t(
          "archive.description",
          "종이 신문으로 발행한 지면을 호마다 PDF로 볼 수 있습니다.",
        )}
      </p>

      {years.length === 0 ? (
        <EmptyState
          icon={<FileTextIcon />}
          title={t("archive.empty", "아직 올라온 지면이 없습니다")}
          className="mt-10"
        />
      ) : (
        <div className="mt-10 flex flex-col gap-14 mobile:mt-8 mobile:gap-10">
          {years.map(({ year, issues }) => (
            <section key={year} aria-labelledby={`archive-${year}`}>
              <h2
                id={`archive-${year}`}
                className="border-t-2 border-foreground pt-3 text-h2 tabular-nums"
              >
                {t("archive.year", "{{year}}년", { year })}
              </h2>
              <ul className="mt-5 grid grid-cols-4 gap-5 mobile:grid-cols-2 mobile:gap-3">
                {issues.map((issue) => (
                  <li key={issue.id}>
                    <IssueCard issue={issue} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function IssueCard({ issue }: { issue: ArchiveIssue }) {
  const { t } = useTranslation();
  const dayjs = useDayjs();
  const number = getIssueNumber(issue.title);

  return (
    <a
      href={issue.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col rounded-lg border border-border bg-card p-1.5 transition-colors outline-none hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {/* A front page in miniature: masthead, rule, issue number. Decorative;
          the link reads its title and date below. */}
      <span
        aria-hidden="true"
        className="flex aspect-[3/4] flex-col items-center rounded-md bg-surface px-4 pt-5 pb-4 mobile:px-3 mobile:pt-4"
      >
        <img
          src="/logo.png"
          alt=""
          width={450}
          height={114}
          className="h-4 w-auto opacity-80 dark:opacity-90 mobile:h-3"
        />
        <span className="mt-3 h-px w-full bg-border-strong" />
        <span className="mt-0.5 h-px w-full bg-border-strong" />
        <span className="flex flex-1 items-center text-[56px] leading-none font-extrabold tracking-[-0.04em] text-foreground/85 tabular-nums mobile:text-[40px]">
          {number ?? (
            <FileTextIcon className="size-10 text-subtle-foreground" />
          )}
        </span>
        <span className="flex w-full flex-col gap-1.5">
          {[0.9, 1, 0.75].map((w) => (
            <span
              key={w}
              className="h-1 rounded-full bg-border"
              style={{ width: `${w * 100}%` }}
            />
          ))}
        </span>
      </span>
      <span className="flex items-start justify-between gap-2 px-2 pt-3 pb-2">
        <span className="flex min-w-0 flex-col">
          <span className="text-h4 group-hover:text-brand-text">
            {issue.title}
          </span>
          <time
            dateTime={issue.date.toISOString()}
            className="text-xs text-subtle-foreground tabular-nums"
          >
            {dayjs(issue.date).format("YYYY.MM.DD")}
          </time>
        </span>
        <span className="mt-0.5 inline-flex shrink-0 items-center gap-0.5 rounded-sm bg-muted px-1.5 py-0.5 text-2xs font-bold text-muted-foreground">
          PDF
          <ArrowUpRightIcon className="size-3" />
        </span>
      </span>
      <span className="sr-only">{t("footer.newTab", "(새 탭에서 열림)")}</span>
    </a>
  );
}
