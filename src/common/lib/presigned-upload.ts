export class PresignedUploadError extends Error {
  constructor(readonly status: number) {
    super(`Presigned upload failed with status ${status}`);
    this.name = "PresignedUploadError";
  }
}

// XMLHttpRequest, not fetch: fetch reports no upload progress. The browser
// sets Content-Length from the Blob, and the presigned URL is signed for the
// size sent as `contentLength`, so the body must be that same file.
export function putPresignedFile(
  upload: { uploadUrl: string; contentType: string },
  file: Blob,
  {
    onProgress,
    signal,
  }: { onProgress?: (ratio: number) => void; signal?: AbortSignal } = {},
) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", upload.uploadUrl);
    // S3 signs the Content-Type too; anything else is rejected.
    xhr.setRequestHeader("Content-Type", upload.contentType);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new PresignedUploadError(xhr.status));
    };
    xhr.onerror = () => reject(new PresignedUploadError(0));
    xhr.onabort = () => reject(signal?.reason);
    signal?.addEventListener("abort", () => xhr.abort(), { once: true });
    xhr.send(file);
  });
}
