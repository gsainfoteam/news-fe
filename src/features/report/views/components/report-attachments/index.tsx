import { useState, type ReactNode } from "react";

import {
  CheckIcon,
  CircleAlertIcon,
  FileArchiveIcon,
  FileTextIcon,
  FilmIcon,
  ImageIcon,
  MusicIcon,
  RotateCwIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { Trans, useTranslation } from "react-i18next";

import { Button } from "@/common/components/ui/button";
import { cn } from "@/common/lib/cn";

import { MAX_REPORT_FILES } from "../../../models";
import {
  formatFileSize,
  MAX_REPORT_FILE_SIZE_LABEL,
  REPORT_FILE_ACCEPT,
  type ReportFileKind,
} from "../../../viewmodels/report-file";
import { type ReportAttachment } from "../../../viewmodels/use-report-attachments";

const KIND_ICONS: Record<ReportFileKind, ReactNode> = {
  image: <ImageIcon />,
  video: <FilmIcon />,
  audio: <MusicIcon />,
  archive: <FileArchiveIcon />,
  document: <FileTextIcon />,
};

export function ReportAttachments({
  attachments,
  onAdd,
  onRemove,
  onRetry,
  id,
  describedBy,
}: ReportAttachments.Props) {
  const { t } = useTranslation();
  const [dragging, setDragging] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <label
        data-dragging={dragging || undefined}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          onAdd([...event.dataTransfer.files]);
        }}
        className="flex flex-col items-center gap-2 rounded-lg border-[1.5px] border-dashed border-input bg-surface px-5 py-7 text-center outline-ring/22 transition-colors has-focus-visible:border-ring has-focus-visible:outline-3 data-dragging:border-ring data-dragging:bg-brand-soft"
      >
        <span className="flex size-9 items-center justify-center rounded-md bg-background text-muted-foreground [&>svg]:size-4.5">
          <UploadIcon aria-hidden="true" />
        </span>
        <span className="text-sm font-bold">
          <Trans
            i18nKey="report.attachments.dropzone"
            defaults="파일을 끌어다 놓거나 <action>선택</action>하세요"
            components={{
              action: <span className="text-brand-text underline" />,
            }}
          />
        </span>
        <span className="text-xs text-subtle-foreground">
          {t(
            "report.attachments.limits",
            "최대 {{count}}개, 파일당 {{size}}까지 올릴 수 있습니다.",
            { count: MAX_REPORT_FILES, size: MAX_REPORT_FILE_SIZE_LABEL },
          )}{" "}
          {t(
            "report.attachments.types",
            "이미지, PDF, 영상, 음성, 문서(hwp, docx, xlsx, pptx), txt, zip",
          )}
        </span>
        <input
          id={id}
          type="file"
          multiple
          accept={REPORT_FILE_ACCEPT}
          aria-describedby={describedBy}
          className="sr-only"
          onChange={(event) => {
            onAdd([...(event.target.files ?? [])]);
            // Lets the same file be picked again after removing it.
            event.target.value = "";
          }}
        />
      </label>
      {attachments.length > 0 && (
        <ul className="flex flex-col gap-2">
          {attachments.map((item) => (
            <AttachmentItem
              key={item.id}
              item={item}
              onRemove={() => onRemove(item.id)}
              onRetry={() => onRetry(item.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

export namespace ReportAttachments {
  export type Props = {
    attachments: ReportAttachment[];
    onAdd: (files: File[]) => void;
    onRemove: (id: string) => void;
    onRetry: (id: string) => void;
    /** Id of the file input, for an outside label. */
    id?: string;
    describedBy?: string;
  };
}

function AttachmentItem({
  item,
  onRemove,
  onRetry,
}: {
  item: ReportAttachment;
  onRemove: () => void;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  const percent = Math.round(item.progress * 100);
  const error =
    item.status === "failed"
      ? t("report.attachments.failed", "업로드하지 못했습니다")
      : item.issue === "type"
        ? t("report.attachments.invalidType", "지원하지 않는 파일 형식입니다")
        : item.issue === "size"
          ? t(
              "report.attachments.tooLarge",
              "{{size}}보다 큰 파일은 올릴 수 없습니다",
              { size: MAX_REPORT_FILE_SIZE_LABEL },
            )
          : item.issue === "empty"
            ? t("report.attachments.empty", "빈 파일은 올릴 수 없습니다")
            : undefined;

  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2.5",
        error && "border-destructive-text",
      )}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground [&>svg]:size-4.5">
        {KIND_ICONS[item.kind]}
      </span>
      {item.status === "uploading" ? (
        <span className="flex min-w-0 grow flex-col gap-1.5">
          <span className="flex items-center justify-between gap-3">
            <span className="truncate text-sm font-semibold">{item.name}</span>
            <span className="shrink-0 text-xs text-subtle-foreground tabular-nums">
              {percent}%
            </span>
          </span>
          <span
            role="progressbar"
            aria-label={t("report.attachments.progress", "{{name}} 업로드", {
              name: item.name,
            })}
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-1 overflow-hidden rounded-full bg-muted"
          >
            <span
              className="block h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${percent}%` }}
            />
          </span>
        </span>
      ) : (
        <span className="flex min-w-0 grow flex-col">
          <span className="truncate text-sm font-semibold">{item.name}</span>
          {error ? (
            <span className="flex items-center gap-1.5 text-xs text-destructive-text">
              <CircleAlertIcon aria-hidden="true" className="size-3.5" />
              {error}
            </span>
          ) : (
            <span className="text-xs text-subtle-foreground tabular-nums">
              {t("report.attachments.done", "{{size}}, 업로드 완료", {
                size: formatFileSize(item.size),
              })}
            </span>
          )}
        </span>
      )}
      {item.status === "done" && (
        <CheckIcon aria-hidden="true" className="size-4.5 text-success" />
      )}
      {item.status === "failed" && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRetry}
          // Icon only on phones so the error beside it keeps one line.
          className="mobile:size-8 mobile:px-0"
        >
          <RotateCwIcon aria-hidden="true" />
          <span className="mobile:sr-only">
            {t("report.attachments.retry", "다시 시도")}
          </span>
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onRemove}
        aria-label={
          item.status === "uploading"
            ? t("report.attachments.cancel", "{{name}} 업로드 취소", {
                name: item.name,
              })
            : t("report.attachments.remove", "{{name}} 삭제", {
                name: item.name,
              })
        }
      >
        <XIcon />
      </Button>
    </li>
  );
}
