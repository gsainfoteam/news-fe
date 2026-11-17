import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  aboutQuery,
  aboutQueryKey,
  createHistoryMutation,
  deleteHistoryMutation,
  type AboutInput,
  type HistoryInput,
  updateAboutMutation,
  updateHistoryMutation,
} from "../models";

export function useAbout() {
  const queryClient = useQueryClient();
  const query = useQuery(aboutQuery());
  const refetch = () =>
    queryClient.invalidateQueries({ queryKey: aboutQueryKey() });

  // PATCH /about answers with the whole about, histories included.
  const update = useMutation({
    ...updateAboutMutation(),
    onSuccess: (about) => queryClient.setQueryData(aboutQueryKey(), about),
  });
  const create = useMutation({
    ...createHistoryMutation(),
    onSuccess: refetch,
  });
  const edit = useMutation({
    ...updateHistoryMutation(),
    onSuccess: refetch,
  });
  const remove = useMutation({
    ...deleteHistoryMutation(),
    onSuccess: refetch,
  });

  return {
    about: query.data,
    status: query.status,
    retry: () => void query.refetch(),
    saveAbout: (body: AboutInput) => update.mutateAsync({ body }),
    addHistory: (body: HistoryInput) => create.mutateAsync({ body }),
    updateHistory: (id: number, body: HistoryInput) =>
      edit.mutateAsync({ path: { id }, body }),
    deleteHistory: (id: number) => remove.mutateAsync({ path: { id } }),
  };
}
