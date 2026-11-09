import {
  MAX_REPORT_FILE_SIZE,
  REPORT_FILE_EXTENSIONS,
  type ReportFileExtension,
} from "../models";

export type ReportFileIssue = "type" | "size" | "empty";
export type ReportFileKind =
  "image" | "video" | "audio" | "archive" | "document";

export const REPORT_FILE_ACCEPT = REPORT_FILE_EXTENSIONS.map(
  (ext) => `.${ext}`,
).join(",");

export function getFileExtension(name: string) {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : "";
}

// news-be accepts only `^[a-zA-Z0-9_.-]+$`, so Korean names would be
// rejected outright. Keep the ASCII parts and the (lowercased) extension the
// backend checks; the CMS shows this name, so a bare "file" is the fallback.
export function toSafeFileName(name: string) {
  const ext = getFileExtension(name).replace(/[^a-z0-9]/g, "");
  const dot = name.lastIndexOf(".");
  const base = (dot > 0 ? name.slice(0, dot) : name)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9_.-]+/g, "_")
    .replace(/^[_.-]+|[_.-]+$/g, "")
    .slice(0, 100);
  const safeBase = /[a-zA-Z0-9]/.test(base) ? base : "file";
  return ext ? `${safeBase}.${ext}` : safeBase;
}

export function checkReportFile(file: {
  name: string;
  size: number;
}): ReportFileIssue | undefined {
  const ext = getFileExtension(file.name);
  if (!REPORT_FILE_EXTENSIONS.includes(ext as ReportFileExtension))
    return "type";
  if (file.size > MAX_REPORT_FILE_SIZE) return "size";
  // news-be requires contentLength >= 1.
  if (file.size === 0) return "empty";
  return undefined;
}

const KIND_BY_EXTENSION: Partial<Record<string, ReportFileKind>> = {
  jpg: "image",
  jpeg: "image",
  png: "image",
  gif: "image",
  webp: "image",
  heic: "image",
  mp4: "video",
  mov: "video",
  mp3: "audio",
  m4a: "audio",
  zip: "archive",
};

export function getReportFileKind(name: string): ReportFileKind {
  return KIND_BY_EXTENSION[getFileExtension(name)] ?? "document";
}

const round1 = (value: number) => Number(value.toFixed(1));

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 ** 2) return `${round1(bytes / 1024)}KB`;
  return `${round1(bytes / 1024 ** 2)}MB`;
}

export const MAX_REPORT_FILE_SIZE_LABEL = formatFileSize(MAX_REPORT_FILE_SIZE);
