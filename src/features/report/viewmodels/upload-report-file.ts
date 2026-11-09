import { putReportFile, requestReportFileUpload } from "../models";
import { toSafeFileName } from "./report-file";

export async function uploadReportFile(
  file: File,
  options: { onProgress?: (ratio: number) => void; signal?: AbortSignal } = {},
) {
  const { data: upload } = await requestReportFileUpload({
    body: { fileName: toSafeFileName(file.name), contentLength: file.size },
    signal: options.signal,
    throwOnError: true,
  });
  await putReportFile(upload, file, options);
  return upload.key;
}
