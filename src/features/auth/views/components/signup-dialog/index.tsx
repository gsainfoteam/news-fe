import { useRef } from "react";

import { type AnyFieldApi } from "@tanstack/react-form";
import {
  CircleAlertIcon,
  ExternalLinkIcon,
  LoaderCircleIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { Alert, AlertDescription } from "@/common/components/ui/alert";
import { Button } from "@/common/components/ui/button";
import { Checkbox } from "@/common/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSet,
} from "@/common/components/ui/field";
import { Input } from "@/common/components/ui/input";

import { type SignupInput } from "../../../models";
import { NICKNAME_MAX_LENGTH } from "../../../viewmodels/nickname";
import { useSignupForm } from "../../../viewmodels/use-signup-form";

const TERMS_URL = "https://terms.gistory.me/news/tos/";
const PRIVACY_URL = "https://terms.gistory.me/news/privacy/";

// Shown over /auth/callback after news-be asks for consent. Closing it
// leaves the visitor logged out; nothing is stored until the signup is sent.
export function SignupDialog({
  open,
  onOpenChange,
  onSignup,
}: SignupDialog.Props) {
  const { t } = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);
  const { form, failed } = useSignupForm({
    onSignup,
    // Errors render on the next frame; then the first one can take focus.
    onSubmitInvalid: () =>
      requestAnimationFrame(() =>
        formRef.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus(),
      ),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[440px] gap-5">
        <DialogHeader>
          <DialogTitle>{t("auth.signup.title", "지스트신문 가입")}</DialogTitle>
          <DialogDescription>
            {t(
              "auth.signup.description",
              "처음 로그인한 계정입니다. 닉네임을 정하고 약관에 동의하면 가입이 끝납니다.",
            )}
          </DialogDescription>
        </DialogHeader>
        <form
          ref={formRef}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
          className="flex flex-col gap-5"
        >
          <form.Field name="nickname">
            {(field) => {
              const errors = fieldErrors(field);
              const invalid = errors.length > 0;
              return (
                <Field data-invalid={invalid || undefined}>
                  <FieldLabel htmlFor="signup-nickname" required>
                    {t("auth.nickname.label", "닉네임")}
                  </FieldLabel>
                  <Input
                    id="signup-nickname"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    maxLength={NICKNAME_MAX_LENGTH}
                    autoComplete="nickname"
                    aria-invalid={invalid || undefined}
                    aria-required
                    aria-describedby="signup-nickname-description signup-nickname-error"
                  />
                  <FieldDescription id="signup-nickname-description">
                    {t(
                      "auth.nickname.help",
                      "지스트신문에서 내 이름 대신 보이는 이름입니다. 가입한 뒤 내 정보에서 바꿀 수 있습니다.",
                    )}
                  </FieldDescription>
                  <FieldError id="signup-nickname-error" errors={errors} />
                </Field>
              );
            }}
          </form.Field>

          <FieldSet className="gap-3 rounded-lg border border-border p-4">
            <legend className="sr-only">
              {t("auth.signup.consent", "약관 동의")}
            </legend>
            <form.Field name="terms">
              {(field) => (
                <ConsentField
                  field={field}
                  id="signup-terms"
                  label={t(
                    "auth.signup.terms",
                    "(필수) 지스트신문 이용약관에 동의합니다",
                  )}
                  href={TERMS_URL}
                  linkLabel={t("auth.signup.viewTerms", "이용약관 보기")}
                />
              )}
            </form.Field>
            <form.Field name="privacy">
              {(field) => (
                <ConsentField
                  field={field}
                  id="signup-privacy"
                  label={t(
                    "auth.signup.privacy",
                    "(필수) 개인정보 수집과 이용에 동의합니다",
                  )}
                  href={PRIVACY_URL}
                  linkLabel={t(
                    "auth.signup.viewPrivacy",
                    "개인정보 처리방침 보기",
                  )}
                />
              )}
            </form.Field>
          </FieldSet>

          {failed && (
            <Alert variant="warning" role="alert">
              <CircleAlertIcon aria-hidden="true" />
              <AlertDescription>
                {t(
                  "auth.signup.failed",
                  "가입하지 못했습니다. 잠시 뒤 다시 시도해 주세요.",
                )}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter className="mt-0">
            <DialogClose render={<Button variant="outline" />}>
              {t("auth.signup.cancel", "가입하지 않기")}
            </DialogClose>
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(submitting) => (
                <Button type="submit" disabled={submitting}>
                  {submitting && (
                    <LoaderCircleIcon
                      aria-hidden="true"
                      className="animate-spin"
                    />
                  )}
                  {submitting
                    ? t("auth.signup.submitting", "가입하는 중")
                    : t("auth.signup.submit", "동의하고 가입하기")}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export namespace SignupDialog {
  export type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Rejects to keep the dialog open and show that it failed. */
    onSignup: (input: SignupInput) => Promise<void>;
  };
}

function fieldErrors(field: AnyFieldApi) {
  return field.state.meta.errors as Array<{ message?: string } | undefined>;
}

function ConsentField({
  field,
  id,
  label,
  href,
  linkLabel,
}: {
  field: AnyFieldApi;
  id: string;
  label: string;
  href: string;
  /** Names the document for screen readers; the link itself reads "보기". */
  linkLabel: string;
}) {
  const { t } = useTranslation();
  const viewLabel = t("auth.signup.view", "보기");
  const errors = fieldErrors(field);
  const invalid = errors.length > 0;
  return (
    <Field data-invalid={invalid || undefined} className="gap-1">
      <div className="flex items-start justify-between gap-3">
        <label
          htmlFor={id}
          className="flex items-start gap-2.5 text-sm leading-5"
        >
          <Checkbox
            id={id}
            name={field.name}
            checked={field.state.value as boolean}
            onCheckedChange={(checked) => field.handleChange(checked)}
            aria-invalid={invalid || undefined}
            aria-describedby={`${id}-error`}
            className="mt-0.5"
          />
          {label}
        </label>
        {/* Outside the label: a click on it would also tick the box. */}
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={linkLabel}
          className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {viewLabel}
          <ExternalLinkIcon aria-hidden="true" className="size-3.5" />
        </a>
      </div>
      <FieldError id={`${id}-error`} errors={errors} className="pl-6.5" />
    </Field>
  );
}
