import { type ReactNode, useRef } from "react";

import { type AnyFieldApi } from "@tanstack/react-form";
import { LoaderCircleIcon, SaveIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/common/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/common/components/ui/field";
import { Input } from "@/common/components/ui/input";
import { Textarea } from "@/common/components/ui/textarea";

import { type AboutInput } from "../../../models";
import {
  ABOUT_LIMITS,
  type AboutFormValues,
  getChangedAbout,
} from "../../../viewmodels/about-form";
import { useAboutForm } from "../../../viewmodels/use-about-form";

export function AboutInfoForm({ saved, onSave }: AboutInfoForm.Props) {
  const { t, i18n } = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);
  const form = useAboutForm({
    saved,
    onSave,
    onSubmitInvalid: () =>
      requestAnimationFrame(() =>
        formRef.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus(),
      ),
  });
  const number = new Intl.NumberFormat(i18n.language);

  const text = (
    name: Exclude<keyof AboutFormValues, "introduction">,
    label: string,
    props: React.ComponentProps<typeof Input> = {},
  ) => (
    <form.Field name={name}>
      {(field) => (
        <FormField field={field} label={label}>
          {(control) => <Input {...control} autoComplete="off" {...props} />}
        </FormField>
      )}
    </form.Field>
  );

  return (
    <section
      aria-labelledby="about-info-title"
      className="rounded-lg border border-border bg-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-border px-[18px] py-3.5">
        <h2 id="about-info-title" className="text-[15px] font-extrabold">
          {t("about.admin.infoTitle", "소개와 발행 정보")}
        </h2>
        <span className="text-2xs text-subtle-foreground">
          {t(
            "about.admin.infoDescription",
            "신문 소개 페이지와 같은 순서로 보입니다",
          )}
        </span>
      </div>
      <form
        ref={formRef}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
        className="flex flex-col gap-5 p-[18px] mobile:p-4"
      >
        <form.Field name="introduction">
          {(field) => (
            <FormField
              field={field}
              label={t("about.introduction", "소개")}
              description={
                <span className="flex flex-wrap justify-between gap-x-3">
                  <span>
                    {t(
                      "about.admin.introductionHelp",
                      "줄을 바꾸면 문단이 나뉩니다.",
                    )}
                  </span>
                  <span className="tabular-nums">
                    {number.format(field.state.value.length)} /{" "}
                    {number.format(ABOUT_LIMITS.introduction)}
                  </span>
                </span>
              }
            >
              {(control) => (
                <Textarea
                  {...control}
                  maxLength={ABOUT_LIMITS.introduction}
                  className="min-h-40"
                />
              )}
            </FormField>
          )}
        </form.Field>

        <div className="grid grid-cols-4 gap-4 mobile:grid-cols-1">
          {text("foundedAt", t("about.foundedAt", "창간"), { type: "date" })}
          {text("publisher", t("about.publisher", "발행인"), {
            maxLength: ABOUT_LIMITS.name,
          })}
          {text("director", t("about.director", "주간"), {
            maxLength: ABOUT_LIMITS.name,
          })}
          {text("editorInChief", t("about.editorInChief", "편집장"), {
            maxLength: ABOUT_LIMITS.name,
          })}
        </div>
        {text("address", t("about.address", "주소"), {
          maxLength: ABOUT_LIMITS.address,
        })}
        <div className="grid grid-cols-3 gap-4 mobile:grid-cols-1">
          {text("email", t("about.email", "이메일"), {
            type: "email",
            placeholder: "editor@gist.ac.kr",
          })}
          {text("homepage", t("about.homepage", "홈페이지"), {
            type: "url",
            placeholder: "https://",
          })}
          {text("instagram", t("about.instagram", "인스타그램"), {
            type: "url",
            placeholder: "https://www.instagram.com/",
          })}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <form.Subscribe
            selector={(s) => ({
              submitting: s.isSubmitting,
              changed: Object.keys(getChangedAbout(saved, s.values)).length > 0,
            })}
          >
            {({ submitting, changed }) => (
              <>
                {!changed && (
                  <span className="text-xs text-subtle-foreground">
                    {t("about.admin.unchanged", "바뀐 내용이 없습니다")}
                  </span>
                )}
                <Button type="submit" disabled={submitting || !changed}>
                  {submitting ? (
                    <LoaderCircleIcon className="animate-spin" />
                  ) : (
                    <SaveIcon />
                  )}
                  {t("about.admin.save", "저장")}
                </Button>
              </>
            )}
          </form.Subscribe>
        </div>
      </form>
    </section>
  );
}

export namespace AboutInfoForm {
  export type Props = {
    /** What the server has; the form starts from it and saves only the difference. */
    saved: AboutFormValues;
    /** Rejects to keep the edits for another try. */
    onSave: (changes: AboutInput) => Promise<unknown>;
  };
}

// `id` defaults to the field name; set it when one page holds several forms
// with the same fields (the history rows).
export function FormField({
  field,
  id = field.name,
  label,
  description,
  children,
}: {
  field: AnyFieldApi;
  id?: string;
  label: string;
  description?: ReactNode;
  children: (control: {
    id: string;
    name: string;
    value: string;
    onBlur: () => void;
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => void;
    "aria-invalid": boolean;
    "aria-describedby"?: string;
  }) => ReactNode;
}) {
  const errors = field.state.meta.errors as { message?: string }[];
  const invalid = errors.length > 0;
  const errorId = `${id}-error`;
  const descriptionId = `${id}-description`;
  const describedBy = [description && descriptionId, invalid && errorId]
    .filter(Boolean)
    .join(" ");
  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {children({
        id,
        name: field.name,
        value: field.state.value as string,
        onBlur: field.handleBlur,
        onChange: (e) => field.handleChange(e.target.value),
        "aria-invalid": invalid,
        "aria-describedby": describedBy || undefined,
      })}
      {description && (
        <FieldDescription id={descriptionId}>{description}</FieldDescription>
      )}
      <FieldError id={errorId} errors={errors} />
    </Field>
  );
}
