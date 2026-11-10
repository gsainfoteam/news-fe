import { useCallback, useEffect, useRef, useState } from "react";

import { uploadArticleImage } from "./upload-article-image";

/** Upload progress (0 to 1) by upload id, readable with useSyncExternalStore. */
export type UploadProgressStore = {
  subscribe: (listener: () => void) => () => void;
  get: (id: string) => number | undefined;
  count: () => number;
};

function createProgressStore() {
  const progress = new Map<string, number>();
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((listener) => listener());
  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    get: (id: string) => progress.get(id),
    count: () => progress.size,
    set(id: string, ratio: number) {
      progress.set(id, ratio);
      emit();
    },
    delete(id: string) {
      progress.delete(id);
      emit();
    },
  };
}

let nextId = 0;

// Images upload as soon as they are picked; the article only sends keys.
// `uploaded` maps each public URL to its key so a save can tell which keys
// the body still uses.
export function useArticleImages() {
  const [store] = useState(createProgressStore);
  const uploaded = useRef(new Map<string, string>());
  const controllers = useRef(new Set<AbortController>());

  useEffect(() => {
    const active = controllers.current;
    return () => active.forEach((controller) => controller.abort());
  }, []);

  const start = useCallback(
    (file: File) => {
      const id = `article-image-${++nextId}`;
      const controller = new AbortController();
      controllers.current.add(controller);
      store.set(id, 0);
      const done = uploadArticleImage(file, {
        signal: controller.signal,
        onProgress: (ratio) => store.set(id, ratio),
      })
        .then((result) => {
          uploaded.current.set(result.url, result.key);
          return result;
        })
        .finally(() => {
          controllers.current.delete(controller);
          store.delete(id);
        });
      return { id, done };
    },
    [store],
  );

  return { start, progress: store as UploadProgressStore, uploaded };
}
