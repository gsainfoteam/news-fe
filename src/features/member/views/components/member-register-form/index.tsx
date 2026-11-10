import { useRef } from "react";

import { type AnyFieldApi } from "@tanstack/react-form";
import { LoaderCircleIcon, PlusIcon, UserPlusIcon, XIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/common/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/common/components/ui/field";
import { Input } from "@/common/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/common/components/ui/native-select";
import { cn } from "@/common/lib/cn";
import { getRoleLabels } from "@/features/auth";

import { REGISTRABLE_ROLES, type MemberInput } from "../../../models";
import {
  emptyMemberRow,
  MAX_MEMBER_ROWS,
  MEMBER_NAME_MAX,
} from "../../../viewmodels/member-form";
import {
  getAccessLabels,
  getAccessLevel,
} from "../../../viewmodels/member-role";
import { useMemberForm } from "../../../viewmodels/use-member-form";

export function MemberRegisterForm({
  existingEmails,
  onRegister,
}: MemberRegisterForm.Props) {
  const { t } = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);
  const form = useMemberForm({
    existingEmails,
    onRegister,
    onSubmitInvalid: () =>
      requestAnimationFrame(() =>
        formRef.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus(),
      ),
  });
  const roleLabels = getRoleLabels(t);
  const accessLabels = getAccessLabels(t);

  return (
    <section
      aria-labelledby="member-register-title"
      className="rounded-lg border border-border bg-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-border px-[18px] py-3.5">
        <h2 id="member-register-title" className="text-[15px] font-extrabold">
          {t("member.register.title", "멤버 등록")}
        </h2>
        <span className="text-2xs text-subtle-foreground">
          {t(
            "member.register.description",
            "여러 명을 한 번에 등록할 수 있습니다",
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
        className="flex flex-col gap-4 p-[18px] mobile:p-4"
      >
        <form.Field name="members" mode="array">
          {(list) => (
            <>
              <ol className="flex flex-col gap-3 mobile:gap-0">
                {list.state.value.map((_, index) => {
                  // Labels show once above the columns; later rows keep them
                  // for screen readers, and phones stack every row in full.
                  const label = cn(index > 0 && "sr-only mobile:not-sr-only");
                  const number = t("member.register.row", "{{n}}번째 멤버", {
                    n: index + 1,
                  });
                  return (
                    <li
                      key={index}
                      aria-label={number}
                      className="flex items-start gap-3 mobile:flex-col mobile:items-stretch mobile:gap-3 mobile:border-t mobile:border-border mobile:py-4 mobile:first:border-t-0 mobile:first:pt-0"
                    >
                      <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,11fr)_minmax(0,7fr)_minmax(0,10fr)] gap-3 mobile:grid-cols-1">
                        <form.Field name={`members[${index}].email`}>
                          {(field) => (
                            <RowField
                              field={field}
                              label={t("member.register.email", "이메일")}
                              labelClassName={label}
                            >
                              {(props) => (
                                <Input
                                  {...props}
                                  type="email"
                                  autoComplete="off"
                                  placeholder="name@gm.gist.ac.kr"
                                />
                              )}
                            </RowField>
                          )}
                        </form.Field>
                        <form.Field name={`members[${index}].name`}>
                          {(field) => (
                            <RowField
                              field={field}
                              label={t("member.register.name", "이름")}
                              labelClassName={label}
                            >
                              {(props) => (
                                <Input
                                  {...props}
                                  autoComplete="off"
                                  maxLength={MEMBER_NAME_MAX}
                                  placeholder={t(
                                    "member.register.namePlaceholder",
                                    "이름",
                                  )}
                                />
                              )}
                            </RowField>
                          )}
                        </form.Field>
                        <form.Field name={`members[${index}].role`}>
                          {(field) => (
                            <Field>
                              <FieldLabel
                                htmlFor={field.name}
                                className={label}
                              >
                                {t("member.register.role", "직책")}
                              </FieldLabel>
                              <NativeSelect
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) =>
                                  field.handleChange(
                                    e.target.value as typeof field.state.value,
                                  )
                                }
                              >
                                {REGISTRABLE_ROLES.map((role) => (
                                  <NativeSelectOption key={role} value={role}>
                                    {t(
                                      "member.register.roleOption",
                                      "{{role}} ({{access}})",
                                      {
                                        role: roleLabels[role],
                                        access:
                                          accessLabels[
                                            getAccessLevel({ role })
                                          ],
                                      },
                                    )}
                                  </NativeSelectOption>
                                ))}
                              </NativeSelect>
                            </Field>
                          )}
                        </form.Field>
                      </div>
                      {list.state.value.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={t(
                            "member.register.removeRow",
                            "{{row}} 지우기",
                            { row: number },
                          )}
                          title={t("member.register.remove", "지우기")}
                          onClick={() => list.removeValue(index)}
                          className={cn(
                            index === 0 && "mt-[27px]",
                            "mobile:mt-0 mobile:w-auto mobile:self-end mobile:px-3",
                          )}
                        >
                          <XIcon />
                          <span
                            aria-hidden="true"
                            className="hidden mobile:inline"
                          >
                            {t("member.register.remove", "지우기")}
                          </span>
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ol>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={list.state.value.length >= MAX_MEMBER_ROWS}
                  onClick={() => list.pushValue(emptyMemberRow())}
                >
                  <PlusIcon />
                  {t("member.register.addRow", "한 명 더")}
                </Button>
                <form.Subscribe selector={(s) => s.isSubmitting}>
                  {(submitting) => (
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <LoaderCircleIcon className="animate-spin" />
                      ) : (
                        <UserPlusIcon />
                      )}
                      {t("member.register.submit", "{{count}}명 등록", {
                        count: list.state.value.length,
                      })}
                    </Button>
                  )}
                </form.Subscribe>
              </div>
            </>
          )}
        </form.Field>
        <p className="text-[13px] leading-[1.45] text-subtle-foreground">
          {t(
            "member.register.help",
            "편집장은 여기서 지정할 수 없습니다. 편집장을 넘기려면 아래 목록에서 다른 멤버의 직책을 편집장으로 바꾸세요.",
          )}
        </p>
      </form>
    </section>
  );
}

export namespace MemberRegisterForm {
  export type Props = {
    /** The current list, so an email already on it is caught before sending. */
    existingEmails: readonly string[];
    /** Rejects to keep the rows for another try. */
    onRegister: (members: MemberInput[]) => Promise<unknown>;
  };
}

function RowField({
  field,
  label,
  labelClassName,
  children,
}: {
  field: AnyFieldApi;
  label: string;
  labelClassName?: string;
  children: (props: {
    id: string;
    name: string;
    value: string;
    onBlur: () => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    "aria-invalid": boolean;
    "aria-describedby"?: string;
  }) => React.ReactNode;
}) {
  const errors = field.state.meta.errors as { message?: string }[];
  const invalid = errors.length > 0;
  const errorId = `${field.name}-error`;
  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={field.name} className={labelClassName}>
        {label}
      </FieldLabel>
      {children({
        id: field.name,
        name: field.name,
        value: field.state.value as string,
        onBlur: field.handleBlur,
        onChange: (e) => field.handleChange(e.target.value),
        "aria-invalid": invalid,
        "aria-describedby": invalid ? errorId : undefined,
      })}
      <FieldError id={errorId} errors={errors} />
    </Field>
  );
}
