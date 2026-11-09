import { http, HttpResponse } from "msw";

export {
  handleCreateReport,
  handleGetReportFileUploadUrl,
} from "@/@types/api/msw.gen";

export const MOCK_REPORT_UPLOAD_URL = "https://report-files.test/upload";

// Stands in for the S3 presigned PUT, which the generated handlers don't cover.
export function handleReportFileUpload(status = 200) {
  return http.put(
    `${MOCK_REPORT_UPLOAD_URL}/*`,
    () => new HttpResponse(null, { status }),
  );
}
