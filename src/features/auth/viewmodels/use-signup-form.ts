import { useMemo, useState } from "react";

import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useTranslation } from "react-i18next";

import {
  createSignupFormSchema,
  SIGNUP_FORM_DEFAULTS,
  toSignupInput,
} from "./nickname";
import { type SignupInput } from "../models";

export function useSignupForm({
  onSignup,
  onSubmitInvalid,
}: {
  onSignup: (input: SignupInput) => Promise<void>;
  onSubmitInvalid?: () => void;
}) {
  const { t } = useTranslation();
  const schema = useMemo(() => createSignupFormSchema(t), [t]);
  const [failed, setFailed] = useState(false);

  const form = useForm({
    defaultValues: SIGNUP_FORM_DEFAULTS,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: schema },
    onSubmitInvalid,
    onSubmit: async ({ value }) => {
      setFailed(false);
      try {
        await onSignup(toSignupInput(value));
      } catch {
        setFailed(true);
      }
    },
  });

  return { form, failed };
}
