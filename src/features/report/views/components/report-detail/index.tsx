import { type MouseEvent, type ReactNode, useId } from "react";

import {
  DownloadIcon,
  FileArchiveIcon,
  FileTextIcon,
  FilmIcon,
  ImageIcon,
  MailIcon,
  MusicIcon,
  PenLineIcon,
  RotateCwIcon,
  TimerOffIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertTitle,
} from "@/common/components/ui/alert";
import { Button, buttonVariants } from "@/common/components/ui/button";
import { cn } from "@/common/lib/cn";
import { useDayjs } from "@/common/lib/dayjs";

import { type Report } from "../../../models";
import {
  getReportFileKind,
  type ReportFileKind,
} from "../../../viewmodels/report-file";
import {
  formatReporterPhone,
  getReplyHref,
  getReportTitle,
} from "../../../viewmodels/report-inbox";

const KIND_ICONS: Record<ReportFileKind, ReactNode> = {
  image: <ImageIcon />,
  video: <FilmIcon />,
  audio: <MusicIcon />,
  archive: <FileArchiveIcon />,
  document: <FileTextIcon />,
};

export function ReportDetail({
  report,
  linksExpired,
  refreshingLinks = false,
  onRefreshLinks,
  onFileClick,
  writeArticleHref,
  className,
}: ReportDetail.Props) {
  const { t } = useTranslation();
  const dayjs = useDayjs();
  const headingId = useId();
  const title = getReportTitle(report.title);
  const phone = formatReporterPhone(report.phone);
  const replySubject = title
    ? t(
        "admin.reports.replySubjectWithTitle",
        "지스트신문 제보 답변: {{title}}",
        {
          title,
        },
      )
    : t("admin.reports.replySubject", "지스트신문 제보 답변");

  return (
    <article
      aria-labelledby={headingId}
      className={cn("flex min-w-0 flex-col gap-[22px]", className)}
    >
      <div className="flex flex-col gap-2">
        <p className="text-2xs text-subtle-foreground tabular-nums">
          {t("admin.reports.received", "#{{id}}, {{date}} 접수", {
            id: report.id,
            date: dayjs(report.createdAt).format("YYYY.MM.DD HH:mm"),
          })}
        </p>
        <h2
          id={headingId}
          className={cn(
            "text-[22px] leading-[1.35] font-bold tracking-[-0.02em]",
            !title && "text-subtle-foreground",
          )}
        >
          {title ?? t("admin.reports.untitled", "(제목 없음)")}
        </h2>
      </div>

      <section className="rounded-lg border border-border bg-card">
        <h3 className="border-b border-border px-[18px] py-3.5 text-[15px] font-extrabold">
          {t("admin.reports.reporter", "제보자")}
        </h3>
        <dl className="grid grid-cols-[88px_minmax(0,1fr)] gap-x-4 gap-y-2.5 p-[18px] text-sm mobile:grid-cols-[72px_minmax(0,1fr)]">
          <dt className="font-semibold text-subtle-foreground">
            {t("admin.reports.name", "이름")}
          </dt>
          <dd>{report.name}</dd>
          <dt className="font-semibold text-subtle-foreground">
            {t("admin.reports.email", "이메일")}
          </dt>
          <dd>
            <a
              href={`mailto:${report.email}`}
              className="[overflow-wrap:anywhere] text-brand-text underline underline-offset-3"
            >
              {report.email}
            </a>
          </dd>
          <dt className="font-semibold text-subtle-foreground">
            {t("admin.reports.phone", "전화번호")}
          </dt>
          <dd>
            <a
              href={phone.href}
              className="text-brand-text tabular-nums underline underline-offset-3"
            >
              {phone.label}
            </a>
          </dd>
        </dl>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-extrabold">
          {t("admin.reports.content", "내용")}
        </h3>
        {/* Reporters paste long URLs; let them wrap instead of widening the pane. */}
        <p className="text-base [overflow-wrap:anywhere] whitespace-pre-line">
          {report.description}
        </p>
      </section>

      {report.files.length > 0 && (
        <section className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-extrabold">
              {t("admin.reports.files", "첨부 파일 {{count}}", {
                count: report.files.length,
              })}
            </h3>
            {!linksExpired && (
              <span className="text-xs text-subtle-foreground">
                {t(
                  "admin.reports.filesHelp",
                  "다운로드 링크는 10분 동안만 유효합니다",
                )}
              </span>
            )}
          </div>
          {linksExpired && (
            <Alert variant="warning">
              <TimerOffIcon aria-hidden="true" />
              <AlertContent>
                <AlertTitle>
                  {t(
                    "admin.reports.linksExpired.title",
                    "다운로드 링크가 만료되었습니다",
                  )}
                </AlertTitle>
                <AlertDescription>
                  {t(
                    "admin.reports.linksExpired.description",
                    "링크는 10분 동안만 유효합니다. 새 링크를 받은 뒤 다시 내려받아 주세요.",
                  )}
                </AlertDescription>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 self-start"
                  onClick={onRefreshLinks}
                  disabled={refreshingLinks}
                >
                  <RotateCwIcon
                    className={cn(refreshingLinks && "animate-spin")}
                  />
                  {t("admin.reports.linksExpired.action", "새 링크 받기")}
                </Button>
              </AlertContent>
            </Alert>
          )}
          <ul className="flex flex-col gap-2">
            {report.files.map((file, index) => (
              <li
                key={`${index}-${file.name}`}
                className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2.5"
              >
                <span
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground [&>svg]:size-4.5"
                >
                  {KIND_ICONS[getReportFileKind(file.name)]}
                </span>
                <span className="min-w-0 grow truncate text-sm font-semibold">
                  {file.name}
                </span>
                <a
                  // Without href the link leaves the tab order, so an expired
                  // link can't be followed by keyboard either.
                  {...(linksExpired
                    ? { "aria-disabled": true }
                    : {
                        href: file.url,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        onClick: onFileClick,
                      })}
                  aria-label={t("admin.reports.download", "{{name}} 받기", {
                    name: file.name,
                  })}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "shrink-0 aria-disabled:pointer-events-none aria-disabled:opacity-50",
                  )}
                >
                  <DownloadIcon />
                  {t("admin.reports.downloadShort", "받기")}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap gap-2">
        <a
          href={getReplyHref(report.email, replySubject)}
          className={cn(buttonVariants({ size: "sm" }))}
        >
          <MailIcon />
          {t("admin.reports.reply", "이메일로 답장")}
        </a>
        {writeArticleHref && (
          <a
            href={writeArticleHref}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <PenLineIcon />
            {t("admin.reports.writeArticle", "새 기사 쓰기")}
          </a>
        )}
      </div>
    </article>
  );
}

export namespace ReportDetail {
  export type Props = {
    report: Report;
    linksExpired: boolean;
    refreshingLinks?: boolean;
    onRefreshLinks: () => void;
    onFileClick?: (event: MouseEvent) => void;
    /** Shown only to members who can write articles. */
    writeArticleHref?: string;
    className?: string;
  };
}
