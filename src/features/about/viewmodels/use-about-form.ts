import { useEffect, useMemo, useRef, useState } from "react";

import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useTranslation } from "react-i18next";

import {
  type AboutFormValues,
  createAboutFormSchema,
  createHistoryFormSchema,
  getChangedAbout,
  hasAboutEdits,
  type HistoryFormValues,
  isSameAbout,
  toHistoryInput,
} from "./about-form";
import { type AboutInput, type HistoryInput } from "../models";

// A newer server copy replaces the form only while it holds no edits, and a
// save sends only fields edited since the baseline, so neither typing nor
// another editor's change is lost.
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
  const [baseline, setBaseline] = useState(saved);
  // onSubmit reads the ref: the form keeps the options of its first render.
  const baselineRef = useRef(baseline);
  const rebase = (next: AboutFormValues) => {
    baselineRef.current = next;
    setBaseline(next);
  };

  const form = useForm({
    defaultValues: saved,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: schema },
    onSubmitInvalid,
    onSubmit: async ({ value, formApi }) => {
      const submitted = { ...value };
      const changes = getChangedAbout(baselineRef.current, submitted);
      if (Object.keys(changes).length === 0) return;
      try {
        await onSave(changes);
      } catch {
        return;
      }
      const next = { ...baselineRef.current, ...changes } as AboutFormValues;
      rebase(next);
      // Inputs stay editable while saving; a full reset would drop newer
      // typing, so only fields untouched since the submit take the saved value.
      for (const key of Object.keys(changes) as (keyof AboutFormValues)[]) {
        if (formApi.state.values[key] === submitted[key]) {
          formApi.setFieldValue(key, next[key]);
        }
      }
    },
  });

  useEffect(() => {
    if (isSameAbout(saved, baselineRef.current)) return;
    if (hasAboutEdits(baselineRef.current, form.state.values)) return;
    rebase(saved);
    form.reset(saved);
  }, [saved, form]);

  return { form, baseline };
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
