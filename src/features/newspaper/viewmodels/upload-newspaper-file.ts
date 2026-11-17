import { toNewspaperFileRequest } from "./newspaper-file";
import { putNewspaperFile, requestNewspaperUpload } from "../models";

export async function uploadNewspaperFile(
  file: File,
  options: { onProgress?: (ratio: number) => void; signal?: AbortSignal } = {},
) {
  const { data: upload } = await requestNewspaperUpload({
    body: toNewspaperFileRequest(file),
    signal: options.signal,
    throwOnError: true,
  });
  await putNewspaperFile(upload, file, options);
  return upload.key;
}
