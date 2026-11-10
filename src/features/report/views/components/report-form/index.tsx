import { useRef, type ReactNode } from "react";

import { type AnyFieldApi } from "@tanstack/react-form";
import {
  CircleAlertIcon,
  InfoIcon,
  LoaderCircleIcon,
  SendIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { Alert, AlertDescription } from "@/common/components/ui/alert";
import { Button } from "@/common/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/common/components/ui/field";
import { Input } from "@/common/components/ui/input";
import { Separator } from "@/common/components/ui/separator";
import { Textarea } from "@/common/components/ui/textarea";

import { MAX_REPORT_FILES } from "../../../viewmodels/report-file";
import { REPORT_LIMITS } from "../../../viewmodels/report-form";
import { useReportForm } from "../../../viewmodels/use-report-form";
import { ReportAttachments } from "../report-attachments";

export function ReportForm({ onSubmitted }: ReportForm.Props) {
  const { t, i18n } = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);
  const { form, attachments, submitError } = useReportForm({
    onSubmitted,
    // Errors render on the next frame; then the first one can take focus.
    onSubmitInvalid: () =>
      requestAnimationFrame(() =>
        formRef.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus(),
      ),
  });
  const optional = t("report.form.optional", "(선택)");
  const number = new Intl.NumberFormat(i18n.language);

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
      className="flex flex-col gap-6"
    >
      <FieldSet>
        <FieldLegend className="mb-4 font-extrabold">
          {t("report.form.reporter", "제보자 정보")}
        </FieldLegend>
        <div className="grid grid-cols-3 gap-4 mobile:grid-cols-1">
          <form.Field name="name">
            {(field) => (
              <TextField
                field={field}
                label={t("report.form.name", "이름")}
                required
              >
                {(props) => (
                  <Input
                    {...props}
                    autoComplete="name"
                    maxLength={REPORT_LIMITS.name}
                  />
                )}
              </TextField>
            )}
          </form.Field>
          <form.Field name="email">
            {(field) => (
              <TextField
                field={field}
                label={t("report.form.email", "이메일")}
                required
              >
                {(props) => (
                  <Input {...props} type="email" autoComplete="email" />
                )}
              </TextField>
            )}
          </form.Field>
          <form.Field name="phone">
            {(field) => (
              <TextField
                field={field}
                label={t("report.form.phone", "전화번호")}
                required
              >
                {(props) => (
                  <Input
                    {...props}
                    type="tel"
                    autoComplete="tel"
                    placeholder="010-1234-5678"
                  />
                )}
              </TextField>
            )}
          </form.Field>
        </div>
      </FieldSet>

      <Separator />

      <FieldSet>
        <FieldLegend className="mb-4 font-extrabold">
          {t("report.form.content", "제보 내용")}
        </FieldLegend>
        <form.Field name="title">
          {(field) => (
            <TextField
              field={field}
              label={t("report.form.title", "제목")}
              optional={optional}
            >
              {(props) => (
                <Input
                  {...props}
                  maxLength={REPORT_LIMITS.title}
                  placeholder={t(
                    "report.form.titlePlaceholder",
                    "제보 내용을 한 줄로 요약해 주세요",
                  )}
                />
              )}
            </TextField>
          )}
        </form.Field>
        <form.Field name="description">
          {(field) => (
            <TextField
              field={field}
              label={t("report.form.description", "내용")}
              required
              description={
                <span className="flex justify-between gap-3">
                  <span>
                    {t(
                      "report.form.descriptionHelp",
                      "사실 관계를 확인할 수 있도록 날짜와 장소를 함께 적어주세요.",
                    )}
                  </span>
                  <span className="shrink-0 tabular-nums">
                    {number.format(field.state.value.length)} /{" "}
                    {number.format(REPORT_LIMITS.description)}
                  </span>
                </span>
              }
            >
              {(props) => (
                <Textarea
                  {...props}
                  maxLength={REPORT_LIMITS.description}
                  placeholder={t(
                    "report.form.descriptionPlaceholder",
                    "언제, 어디서, 무슨 일이 있었는지 적어주세요",
                  )}
                  className="min-h-[220px] text-[15px]"
                />
              )}
            </TextField>
          )}
        </form.Field>
        <form.Subscribe selector={(state) => state.submissionAttempts > 0}>
          {(attempted) => {
            const blocked = attempted ? attachments.issue : undefined;
            const message = attachments.overflow
              ? t(
                  "report.attachments.overflow",
                  "파일은 {{count}}개까지 첨부할 수 있습니다",
                  { count: MAX_REPORT_FILES },
                )
              : blocked === "pending"
                ? t(
                    "report.attachments.pending",
                    "파일 업로드가 끝난 뒤 보내 주세요",
                  )
                : blocked === "invalid"
                  ? t(
                      "report.attachments.blocked",
                      "올리지 못한 파일을 지우거나 다시 시도해 주세요",
                    )
                  : undefined;
            return (
              <Field>
                <FieldTitle>
                  <label htmlFor="report-files">
                    {t("report.form.files", "첨부파일")}
                    <span className="ml-1 font-medium text-subtle-foreground">
                      {optional}
                    </span>
                  </label>
                </FieldTitle>
                <ReportAttachments
                  id="report-files"
                  describedBy={message ? "report-files-error" : undefined}
                  attachments={attachments.attachments}
                  onAdd={attachments.add}
                  onRemove={attachments.remove}
                  onRetry={attachments.retry}
                />
                <FieldError id="report-files-error">{message}</FieldError>
              </Field>
            );
          }}
        </form.Subscribe>
      </FieldSet>

      <Alert variant="neutral" role="note">
        <InfoIcon aria-hidden="true" />
        <AlertDescription className="text-muted-foreground">
          {t(
            "report.form.privacy",
            "제보 내용을 확인하고 연락드리기 위해 이름, 이메일, 전화번호를 수집합니다. 수집한 정보는 제보 처리에만 씁니다.",
          )}
        </AlertDescription>
      </Alert>

      {/* TODO(NEF-12): swap for the shared error screen once it lands. */}
      {submitError && (
        <Alert variant="warning">
          <CircleAlertIcon aria-hidden="true" />
          <AlertDescription>
            {submitError === "rate-limit"
              ? t(
                  "report.error.rateLimit",
                  "제보를 너무 자주 보냈습니다. 잠시 뒤 다시 보내 주세요.",
                )
              : t(
                  "report.error.submit",
                  "제보를 보내지 못했습니다. 잠시 뒤 다시 보내 주세요.",
                )}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-subtle-foreground">
          <span className="text-brand-text">*</span>{" "}
          {t("report.form.requiredNote", "표시는 필수 항목입니다")}
        </p>
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(submitting) => (
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <LoaderCircleIcon aria-hidden="true" className="animate-spin" />
              ) : (
                <SendIcon aria-hidden="true" />
              )}
              {submitting
                ? t("report.form.submitting", "보내는 중")
                : t("report.form.submit", "제보 보내기")}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}

export namespace ReportForm {
  export type Props = {
    onSubmitted?: () => void;
  };
}

type ControlProps = {
  id: string;
  name: string;
  value: string;
  onBlur: () => void;
  onChange: (event: { target: { value: string } }) => void;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
  "aria-required"?: true;
};

function TextField({
  field,
  label,
  required,
  optional,
  description,
  children,
}: {
  field: AnyFieldApi;
  label: string;
  required?: boolean;
  optional?: string;
  description?: ReactNode;
  children: (props: ControlProps) => ReactNode;
}) {
  const id = `report-${field.name}`;
  const errors = field.state.meta.errors as Array<
    { message?: string } | undefined
  >;
  const invalid = errors.length > 0;
  const describedBy =
    [description && `${id}-description`, invalid && `${id}-error`]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <Field data-invalid={invalid || undefined}>
      <FieldLabel htmlFor={id} required={required} optional={optional}>
        {label}
      </FieldLabel>
      {children({
        id,
        name: field.name,
        value: field.state.value as string,
        onBlur: field.handleBlur,
        onChange: (event) => field.handleChange(event.target.value),
        "aria-invalid": invalid || undefined,
        "aria-describedby": describedBy,
        "aria-required": required || undefined,
      })}
      {description && (
        <FieldDescription id={`${id}-description`}>
          {description}
        </FieldDescription>
      )}
      <FieldError id={`${id}-error`} errors={errors} />
    </Field>
  );
}
