import { zCreateReportFileUrlDto } from "@/@types/api/zod.gen";

// Named by resource so the CMS inbox (NEF-21) can add `fetchReports` and
// `fetchReport` (GET /report, GET /report/{id}) beside these.
export {
  createReport as submitReport,
  getReportFileUploadUrl as requestReportFileUpload,
} from "@/@types/api/sdk.gen";
export { createReportMutation as submitReportMutation } from "@/@types/api/@tanstack/react-query.gen";
export { zCreateReportDto as zReportInput } from "@/@types/api/zod.gen";
export {
  type CreateReportDto as ReportInput,
  type ReportUploadUrlDto as ReportFileUpload,
} from "@/@types/api/types.gen";
export { putReportFile, ReportFileUploadError } from "./upload";

// news-be's REPORT_FILE_CONTENT_TYPES. The spec lists them only in the
// `fileName` description, so keep this in step with the backend by hand.
export const REPORT_FILE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "heic",
  "pdf",
  "mp4",
  "mov",
  "mp3",
  "m4a",
  "txt",
  "hwp",
  "docx",
  "xlsx",
  "pptx",
  "zip",
] as const;

export type ReportFileExtension = (typeof REPORT_FILE_EXTENSIONS)[number];

export const MAX_REPORT_FILE_SIZE =
  zCreateReportFileUrlDto.shape.contentLength.maxValue ?? 20 * 1024 * 1024;

// news-be's MAX_REPORT_FILES, stated only in the `fileKeys` description.
export const MAX_REPORT_FILES = 5;

export const zReportFileName = zCreateReportFileUrlDto.shape.fileName;
