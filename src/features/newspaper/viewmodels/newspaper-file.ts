import {
  formatFileSize,
  getFileExtension,
  toSafeFileName,
} from "@/common/lib/file-name";

import { MAX_NEWSPAPER_FILE_SIZE, zNewspaperFileRequest } from "../models";

export const NEWSPAPER_FILE_ACCEPT = ".pdf,application/pdf";
export const MAX_NEWSPAPER_FILE_SIZE_LABEL = formatFileSize(
  MAX_NEWSPAPER_FILE_SIZE,
);

export type NewspaperFileIssue = "type" | "size" | "empty";

export function checkNewspaperFile(file: {
  name: string;
  size: number;
}): NewspaperFileIssue | undefined {
  if (getFileExtension(file.name) !== "pdf") return "type";
  if (file.size > MAX_NEWSPAPER_FILE_SIZE) return "size";
  // news-be requires contentLength >= 1.
  if (file.size === 0) return "empty";
  return undefined;
}

// news-be matches `^[a-zA-Z0-9_.-]+\.pdf$` case-sensitively; toSafeFileName
// lowercases the extension, so "제72호.PDF" still passes as "72.pdf".
export function toNewspaperFileRequest(file: { name: string; size: number }) {
  return zNewspaperFileRequest.parse({
    fileName: toSafeFileName(file.name),
    contentLength: file.size,
  });
}
