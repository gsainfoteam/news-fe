import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import {
  type Article,
  articleQueryKey,
  articlesQueryKey,
  createArticleMutation,
  updateArticleMutation,
} from "../models";
import {
  type ArticleDraft,
  type ArticleDraftErrors,
  hasPendingImages,
  toArticleDraft,
  toArticleInput,
  toArticleUpdate,
  validateArticleDraft,
} from "./article-editor";
import { useArticleImages } from "./use-article-images";

export type ArticleSaveResult =
  | { status: "saved"; article: Article; created: boolean }
  | { status: "invalid"; errors: ArticleDraftErrors }
  | { status: "uploading" }
  | { status: "failed" };

/** `article` is the one being edited; omit it to write a new one. */
export function useArticleEditor(article?: Article) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const images = useArticleImages();
  const [saved, setSaved] = useState(article);
  const [draft, setDraft] = useState(() => toArticleDraft(article));
  const [baseline, setBaseline] = useState(draft);
  const [errors, setErrors] = useState<ArticleDraftErrors>({});
  const uploading = useSyncExternalStore(
    images.progress.subscribe,
    images.progress.count,
    images.progress.count,
  );
  const create = useMutation(createArticleMutation());
  const update = useMutation(updateArticleMutation());

  const dirty = JSON.stringify(draft) !== JSON.stringify(baseline);

  // Static pages: every way out of the editor is a full page load.
  useEffect(() => {
    if (!dirty && uploading === 0) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, uploading]);

  const change = useCallback(
    <K extends keyof ArticleDraft>(field: K, value: ArticleDraft[K]) => {
      setDraft((d) => ({ ...d, [field]: value }));
      setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e));
    },
    [],
  );

  // Tiptap rewrites stored HTML when it loads it (attribute order, empty
  // paragraphs). That rewrite is not an edit, so it moves the baseline too.
  const loadContent = useCallback((html: string) => {
    setDraft((d) => ({ ...d, content: html }));
    setBaseline((b) => ({ ...b, content: html }));
  }, []);

  const save = async (): Promise<ArticleSaveResult> => {
    const found = validateArticleDraft(draft, t);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      return { status: "invalid", errors: found };
    }
    if (uploading > 0 || hasPendingImages(draft.content)) {
      return { status: "uploading" };
    }
    const snapshot = draft;
    const keys = images.uploaded.current;
    try {
      const result = saved
        ? await update.mutateAsync({
            path: { id: saved.id },
            body: toArticleUpdate(snapshot, keys, saved),
          })
        : await create.mutateAsync({ body: toArticleInput(snapshot, keys) });
      setSaved(result);
      setBaseline(snapshot);
      void queryClient.invalidateQueries({
        queryKey: [{ _id: articlesQueryKey()[0]._id }],
      });
      // Not invalidate: that refetches the query the edit page is reading.
      queryClient.setQueriesData<Article>(
        {
          queryKey: [
            {
              _id: articleQueryKey({ path: { id: result.id } })[0]._id,
              path: { id: result.id },
            },
          ],
        },
        result,
      );
      return { status: "saved", article: result, created: !saved };
    } catch {
      return { status: "failed" };
    }
  };

  return {
    /** The article as last saved; undefined until a new one is first saved. */
    article: saved,
    draft,
    errors,
    change,
    loadContent,
    dirty,
    uploading,
    saving: create.isPending || update.isPending,
    save,
    images,
  };
}
