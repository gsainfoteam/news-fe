import { useId, useState } from "react";

import {
  FileTextIcon,
  LoaderCircleIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { Trans, useTranslation } from "react-i18next";

import { Button } from "@/common/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/common/components/ui/field";
import { Input } from "@/common/components/ui/input";
import { formatFileSize } from "@/common/lib/file-name";

import { NEWSPAPER_TITLE_MAX, type Newspaper } from "../../../models";
import {
  MAX_NEWSPAPER_FILE_SIZE_LABEL,
  NEWSPAPER_FILE_ACCEPT,
} from "../../../viewmodels/newspaper-file";
import {
  hasFormErrors,
  type NewspaperFormErrors,
  type NewspaperFormValues,
  validateNewspaperForm,
} from "../../../viewmodels/newspaper-form";

export function NewspaperFormDialog({
  open,
  onOpenChange,
  ...props
}: NewspaperFormDialog.Props) {
  const [saving, setSaving] = useState(false);
  return (
    <Dialog open={open} onOpenChange={(next) => !saving && onOpenChange(next)}>
      <DialogContent className="w-[480px]">
        {/* Inside the popup, so closing unmounts it and the next open starts
            with an empty form. */}
        <NewspaperForm {...props} onSavingChange={setSaving} />
      </DialogContent>
    </Dialog>
  );
}

export namespace NewspaperFormDialog {
  export type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** The paper being edited; omit to upload a new one. */
    target?: Newspaper;
    /** Title filled in for a new paper. */
    suggestedTitle?: string;
    /** Upload ratio while the PDF is being sent. */
    progress?: number;
    /** Rejects to keep the form open for another try. */
    onSave: (values: NewspaperFormValues) => Promise<void>;
  };
}

function NewspaperForm({
  target,
  suggestedTitle = "",
  progress,
  onSave,
  onSavingChange,
}: Omit<NewspaperFormDialog.Props, "open" | "onOpenChange"> & {
  onSavingChange: (saving: boolean) => void;
}) {
  const { t } = useTranslation();
  const id = useId();
  const [values, setValues] = useState<NewspaperFormValues>({
    title: target?.title ?? suggestedTitle,
  });
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const errors: NewspaperFormErrors = submitted
    ? validateNewspaperForm(values, { requireFile: !target })
    : {};

  const titleError =
    errors.title === "required"
      ? t("newspaper.form.titleRequired", "제목을 입력해 주세요")
      : errors.title === "tooLong"
        ? t(
            "newspaper.form.titleTooLong",
            "제목은 {{max}}자까지 쓸 수 있습니다",
            {
              max: NEWSPAPER_TITLE_MAX,
            },
          )
        : undefined;
  const fileErrors: Record<NonNullable<NewspaperFormErrors["file"]>, string> = {
    required: t("newspaper.form.fileRequired", "PDF 파일을 골라 주세요"),
    type: t("newspaper.form.fileType", "PDF 파일만 올릴 수 있습니다"),
    size: t(
      "newspaper.form.fileTooLarge",
      "{{size}}보다 큰 파일은 올릴 수 없습니다",
      { size: MAX_NEWSPAPER_FILE_SIZE_LABEL },
    ),
    empty: t("newspaper.form.fileEmpty", "빈 파일은 올릴 수 없습니다"),
  };
  const fileError = errors.file && fileErrors[errors.file];

  const submit = async () => {
    setSubmitted(true);
    if (
      hasFormErrors(validateNewspaperForm(values, { requireFile: !target }))
    ) {
      return;
    }
    setSaving(true);
    onSavingChange(true);
    try {
      await onSave(values);
    } finally {
      setSaving(false);
      onSavingChange(false);
    }
  };

  const percent = Math.round((progress ?? 0) * 100);

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
      className="flex flex-col gap-5"
    >
      <DialogHeader>
        <DialogTitle>
          {target
            ? t("newspaper.form.editTitle", "{{title}} 수정", {
                title: target.title,
              })
            : t("newspaper.form.createTitle", "지면 올리기")}
        </DialogTitle>
        <DialogDescription>
          {t(
            "newspaper.form.notice",
            "저장하면 CMS에는 바로 보이고, 사이트의 지면 보기에는 다음 배포부터 나옵니다.",
          )}
        </DialogDescription>
      </DialogHeader>

      <Field>
        <FieldLabel htmlFor={`${id}-title`} required>
          {t("newspaper.form.title", "제목")}
        </FieldLabel>
        <Input
          id={`${id}-title`}
          value={values.title}
          maxLength={NEWSPAPER_TITLE_MAX}
          placeholder={t("newspaper.form.titlePlaceholder", "제N호")}
          aria-invalid={!!titleError}
          disabled={saving}
          onChange={(event) =>
            setValues((v) => ({ ...v, title: event.target.value }))
          }
        />
        <FieldError>{titleError}</FieldError>
      </Field>

      <Field>
        <FieldLabel
          htmlFor={`${id}-file`}
          required={!target}
          optional={
            target && t("newspaper.form.fileOptional", "바꿀 때만 고르세요")
          }
        >
          {t("newspaper.form.file", "PDF 파일")}
        </FieldLabel>
        {values.file ? (
          <div className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground [&>svg]:size-4.5">
              <FileTextIcon aria-hidden="true" />
            </span>
            {saving && progress !== undefined ? (
              <span className="flex min-w-0 grow flex-col gap-1.5">
                <span className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-semibold">
                    {values.file.name}
                  </span>
                  <span className="shrink-0 text-xs text-subtle-foreground tabular-nums">
                    {percent}%
                  </span>
                </span>
                <span
                  role="progressbar"
                  aria-label={t("newspaper.form.progress", "{{name}} 업로드", {
                    name: values.file.name,
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
                <span className="truncate text-sm font-semibold">
                  {values.file.name}
                </span>
                <span className="text-xs text-subtle-foreground tabular-nums">
                  {formatFileSize(values.file.size)}
                </span>
              </span>
            )}
            {!saving && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={t("newspaper.form.removeFile", "파일 빼기")}
                onClick={() => setValues((v) => ({ ...v, file: undefined }))}
              >
                <XIcon />
              </Button>
            )}
          </div>
        ) : (
          <FileDrop
            id={`${id}-file`}
            invalid={!!fileError}
            onPick={(file) => setValues((v) => ({ ...v, file }))}
          />
        )}
        <FieldError>{fileError}</FieldError>
      </Field>

      <DialogFooter>
        <DialogClose
          render={<Button type="button" variant="outline" disabled={saving} />}
        >
          {t("newspaper.form.cancel", "취소")}
        </DialogClose>
        <Button type="submit" disabled={saving}>
          {saving && <LoaderCircleIcon className="animate-spin" />}
          {target
            ? t("newspaper.form.save", "저장")
            : t("newspaper.form.upload", "올리기")}
        </Button>
      </DialogFooter>
    </form>
  );
}

function FileDrop({
  id,
  invalid,
  onPick,
}: {
  id: string;
  invalid: boolean;
  onPick: (file: File) => void;
}) {
  const { t } = useTranslation();
  const [dragging, setDragging] = useState(false);
  return (
    <label
      data-dragging={dragging || undefined}
      data-invalid={invalid || undefined}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        const [file] = event.dataTransfer.files;
        if (file) onPick(file);
      }}
      className="flex flex-col items-center gap-2 rounded-lg border-[1.5px] border-dashed border-input bg-surface px-5 py-7 text-center outline-ring/22 transition-colors has-focus-visible:border-ring has-focus-visible:outline-3 data-dragging:border-ring data-dragging:bg-brand-soft data-invalid:border-destructive"
    >
      <span className="flex size-9 items-center justify-center rounded-md bg-background text-muted-foreground [&>svg]:size-4.5">
        <UploadIcon aria-hidden="true" />
      </span>
      <span className="text-sm font-bold">
        <Trans
          i18nKey="newspaper.form.dropzone"
          defaults="PDF를 끌어다 놓거나 <action>선택</action>하세요"
          components={{
            action: <span className="text-brand-text underline" />,
          }}
        />
      </span>
      <span className="text-xs text-subtle-foreground">
        {t("newspaper.form.limit", "{{size}}까지 올릴 수 있습니다.", {
          size: MAX_NEWSPAPER_FILE_SIZE_LABEL,
        })}
      </span>
      <input
        id={id}
        type="file"
        accept={NEWSPAPER_FILE_ACCEPT}
        aria-invalid={invalid}
        className="sr-only"
        onChange={(event) => {
          const [file] = event.target.files ?? [];
          if (file) onPick(file);
          event.target.value = "";
        }}
      />
    </label>
  );
}
