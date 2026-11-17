import { CheckIcon, CircleAlertIcon, LoaderCircleIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/common/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/common/components/ui/field";
import { Input } from "@/common/components/ui/input";

import { type User } from "../../../models";
import { NICKNAME_MAX_LENGTH } from "../../../viewmodels/nickname";
import { useNicknameForm } from "../../../viewmodels/use-nickname-form";

export function NicknameForm({ user }: NicknameForm.Props) {
  const { t, i18n } = useTranslation();
  const { form, saved, failed, resetStatus } = useNicknameForm(user);
  const number = new Intl.NumberFormat(i18n.language);

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <form.Field name="nickname" listeners={{ onChange: () => resetStatus() }}>
        {(field) => {
          const errors = field.state.meta.errors as Array<
            { message?: string } | undefined
          >;
          const invalid = errors.length > 0;
          return (
            <Field data-invalid={invalid || undefined}>
              <FieldLabel htmlFor="me-nickname">
                {t("auth.nickname.label", "닉네임")}
              </FieldLabel>
              <div className="flex gap-2">
                <Input
                  id="me-nickname"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  maxLength={NICKNAME_MAX_LENGTH}
                  autoComplete="nickname"
                  placeholder={user.name}
                  aria-invalid={invalid || undefined}
                  aria-describedby="me-nickname-description me-nickname-error me-nickname-status"
                />
                <form.Subscribe
                  selector={(state) => [state.isSubmitting, state.isDirty]}
                >
                  {([submitting, dirty]) => (
                    <Button
                      type="submit"
                      disabled={submitting || !dirty}
                      className="shrink-0"
                    >
                      {submitting && (
                        <LoaderCircleIcon
                          aria-hidden="true"
                          className="animate-spin"
                        />
                      )}
                      {submitting
                        ? t("auth.nickname.saving", "저장하는 중")
                        : t("auth.nickname.save", "저장")}
                    </Button>
                  )}
                </form.Subscribe>
              </div>
              <FieldDescription
                id="me-nickname-description"
                className="flex justify-between gap-3"
              >
                <span>
                  {t(
                    "auth.nickname.meHelp",
                    "지스트신문에서 내 이름 대신 보이는 이름입니다.",
                  )}
                </span>
                <span className="shrink-0 tabular-nums">
                  {number.format(field.state.value.length)} /{" "}
                  {number.format(NICKNAME_MAX_LENGTH)}
                </span>
              </FieldDescription>
              <FieldError id="me-nickname-error" errors={errors} />
              <p
                id="me-nickname-status"
                role="status"
                className="text-xs empty:hidden"
              >
                {saved && (
                  <span className="flex items-center gap-1 text-success">
                    <CheckIcon aria-hidden="true" className="size-3.5" />
                    {t("auth.nickname.saved", "닉네임을 바꿨습니다")}
                  </span>
                )}
                {failed && (
                  <span className="flex items-center gap-1 text-destructive-text">
                    <CircleAlertIcon aria-hidden="true" className="size-3.5" />
                    {t(
                      "auth.nickname.failed",
                      "닉네임을 바꾸지 못했습니다. 잠시 뒤 다시 시도해 주세요.",
                    )}
                  </span>
                )}
              </p>
            </Field>
          );
        }}
      </form.Field>
    </form>
  );
}

export namespace NicknameForm {
  export type Props = {
    user: User;
  };
}
