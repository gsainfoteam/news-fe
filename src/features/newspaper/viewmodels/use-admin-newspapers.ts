import { useRef, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { uploadNewspaperFile } from "./upload-newspaper-file";
import {
  allNewspapersQuery,
  allNewspapersQueryKey,
  createNewspaperMutation,
  deleteNewspaperMutation,
  type Newspaper,
  updateNewspaperMutation,
} from "../models";

const NO_NEWSPAPERS: Newspaper[] = [];

export type NewspaperSaveInput = { title: string; file?: File };

export function useAdminNewspapers() {
  const queryClient = useQueryClient();
  const query = useQuery(allNewspapersQuery());
  const [progress, setProgress] = useState<number>();
  const uploaded = useRef<{ file: File; key: string }>(undefined);
  const refetchList = () =>
    queryClient.invalidateQueries({ queryKey: allNewspapersQueryKey() });

  const create = useMutation(createNewspaperMutation());
  const update = useMutation(updateNewspaperMutation());
  const remove = useMutation({
    ...deleteNewspaperMutation(),
    onSuccess: refetchList,
  });

  // When the PUT succeeded but registering failed, a retry with the same file
  // reuses the stored object instead of sending up to 100MB again.
  const upload = async (file: File) => {
    if (uploaded.current?.file === file) return uploaded.current.key;
    setProgress(0);
    try {
      const key = await uploadNewspaperFile(file, { onProgress: setProgress });
      uploaded.current = { file, key };
      return key;
    } finally {
      setProgress(undefined);
    }
  };

  // The PUT comes first: news-be 404s on a `fileKey` with no file behind it.
  const save = async (input: NewspaperSaveInput, target?: Newspaper) => {
    const title = input.title.trim();
    const fileKey = input.file ? await upload(input.file) : undefined;
    if (target) {
      await update.mutateAsync({
        path: { id: target.id },
        body: { ...(title !== target.title && { title }), fileKey },
      });
    } else {
      await create.mutateAsync({ body: { title, fileKey: fileKey! } });
    }
    // Registered now; reusing the key again would 409.
    uploaded.current = undefined;
    await refetchList();
  };

  return {
    newspapers: query.data ?? NO_NEWSPAPERS,
    status: query.status,
    retry: () => void query.refetch(),
    save,
    /** Upload ratio of the PDF being sent, if any. */
    progress,
    deleteNewspaper: (id: number) => remove.mutateAsync({ path: { id } }),
    isDeleting: remove.isPending,
  };
}
