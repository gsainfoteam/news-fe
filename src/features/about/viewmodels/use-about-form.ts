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

// The form keeps its own baseline, the server copy it started from, and
// saves only the fields edited since. A newer server copy (a refetch on
// focus, another editor's save, a history change) replaces the form only
// while it holds no edits, so typing is never thrown away and the save
// never reverts a field someone else changed meanwhile.
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
    // Quiet until the first submit, then re-check while typing.
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
      // The inputs stay editable while saving, so a whole-form reset would
      // drop what was typed meanwhile. Only fields untouched since the
      // submit take the saved (trimmed) value; later edits stay as edits.
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
