import { useMemo } from "react";

import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { createNicknameFormSchema } from "./nickname";
import { meQuery, updateNicknameMutation, type User } from "../models";

export function useNicknameForm(user: User) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const schema = useMemo(() => createNicknameFormSchema(t), [t]);
  const update = useMutation({
    ...updateNicknameMutation(),
    // `PATCH` answers with no body. Every island shares this cache, so
    // writing the nickname into `me` updates the header menu at once.
    onSuccess: (_, { body }) =>
      queryClient.setQueryData(meQuery().queryKey, (me) =>
        me ? { ...me, nickname: body.nickname } : me,
      ),
  });

  const form = useForm({
    defaultValues: { nickname: user.nickname ?? "" },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: schema },
    onSubmit: async ({ value, formApi }) => {
      const nickname = value.nickname.trim();
      try {
        await update.mutateAsync({ body: { nickname } });
      } catch {
        return;
      }
      // The trimmed value becomes the new baseline, so the form reads as
      // saved until the next edit.
      formApi.reset({ nickname });
    },
  });

  return {
    form,
    saved: update.isSuccess,
    failed: update.isError,
    resetStatus: update.reset,
  };
}
