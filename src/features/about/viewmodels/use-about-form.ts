import { useMemo } from "react";

import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useTranslation } from "react-i18next";

import {
  type AboutFormValues,
  createAboutFormSchema,
  createHistoryFormSchema,
  getChangedAbout,
  type HistoryFormValues,
  toHistoryInput,
} from "./about-form";
import { type AboutInput, type HistoryInput } from "../models";

export function useAboutForm({
  saved,
  onSave,
  onSubmitInvalid,
}: {
  saved: AboutFormValues;
  /** Rejects to keep the edits for another try. */
  onSave: (changes: AboutInput) => Promise<unknown>;
  onSubmitInvalid?: () => void;
}) {
  const { t } = useTranslation();
  const schema = useMemo(() => createAboutFormSchema(t), [t]);

  return useForm({
    defaultValues: saved,
    // Quiet until the first submit, then re-check while typing.
    validationLogic: revalidateLogic(),
    validators: { onDynamic: schema },
    onSubmitInvalid,
    onSubmit: async ({ value }) => {
      const changes = getChangedAbout(saved, value);
      if (Object.keys(changes).length === 0) return;
      try {
        await onSave(changes);
      } catch {
        return;
      }
    },
  });
}

export function useHistoryForm({
  initial,
  onSave,
}: {
  initial: HistoryFormValues;
  /** Rejects to keep the entry for another try. */
  onSave: (entry: HistoryInput) => Promise<unknown>;
}) {
  const { t } = useTranslation();
  const schema = useMemo(() => createHistoryFormSchema(t), [t]);

  return useForm({
    defaultValues: initial,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: schema },
    onSubmit: async ({ value, formApi }) => {
      try {
        await onSave(toHistoryInput(value));
      } catch {
        return;
      }
      formApi.reset();
    },
  });
}
