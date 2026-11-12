import { useMemo } from "react";

import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useTranslation } from "react-i18next";

import {
  createMemberFormSchema,
  MEMBER_FORM_DEFAULTS,
  toMemberInputs,
} from "./member-form";
import { type MemberInput } from "../models";

export function useMemberForm({
  existingEmails,
  onRegister,
  onSubmitInvalid,
}: {
  existingEmails: readonly string[];
  /** Rejects to keep the rows for another try. */
  onRegister: (members: MemberInput[]) => Promise<unknown>;
  onSubmitInvalid?: () => void;
}) {
  const { t } = useTranslation();
  const schema = useMemo(
    () => createMemberFormSchema(t, existingEmails),
    [t, existingEmails],
  );

  const form = useForm({
    defaultValues: MEMBER_FORM_DEFAULTS,
    // Quiet until the first submit, then re-check while typing.
    validationLogic: revalidateLogic(),
    validators: { onDynamic: schema },
    onSubmitInvalid,
    onSubmit: async ({ value, formApi }) => {
      try {
        await onRegister(toMemberInputs(value));
      } catch {
        return;
      }
      formApi.reset();
    },
  });

  return form;
}
