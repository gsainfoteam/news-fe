import { putArticleImage, requestArticleImageUpload } from "../models";
import { toArticleImageRequest } from "./article-editor";

export async function uploadArticleImage(
  file: File,
  options: { onProgress?: (ratio: number) => void; signal?: AbortSignal } = {},
) {
  const { data: upload } = await requestArticleImageUpload({
    body: toArticleImageRequest(file),
    signal: options.signal,
    throwOnError: true,
  });
  await putArticleImage(upload, file, options);
  return { key: upload.key, url: upload.publicUrl };
}
