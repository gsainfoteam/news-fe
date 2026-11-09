import { useMemo } from "react";

import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { submitReportMutation } from "../models";
import {
  createReportFormSchema,
  getReportSubmitError,
  REPORT_FORM_DEFAULTS,
  toReportInput,
} from "./report-form";
import { useReportAttachments } from "./use-report-attachments";

export function useReportForm({
  onSubmitted,
  onSubmitInvalid,
}: {
  onSubmitted?: () => void;
  onSubmitInvalid?: () => void;
} = {}) {
  const { t } = useTranslation();
  const attachments = useReportAttachments();
  const submit = useMutation(submitReportMutation());
  const schema = useMemo(() => createReportFormSchema(t), [t]);

  const form = useForm({
    defaultValues: REPORT_FORM_DEFAULTS,
    // Quiet until the first submit, then re-check as the reader types.
    validationLogic: revalidateLogic(),
    validators: { onDynamic: schema },
    onSubmitInvalid,
    onSubmit: async ({ value }) => {
      if (attachments.issue) return;
      try {
        await submit.mutateAsync({
          body: toReportInput(value, attachments.keys),
        });
      } catch {
        // Shown through `submitError`; the reader can send again.
        return;
      }
      onSubmitted?.();
    },
  });

  return {
    form,
    attachments,
    submitError: submit.error ? getReportSubmitError(submit.error) : undefined,
  };
}
