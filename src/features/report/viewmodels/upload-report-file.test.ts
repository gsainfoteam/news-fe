import { afterAll, afterEach, beforeAll, expect, mock, test } from "bun:test";
import { setupServer } from "msw/node";

// The generated client reads its base URL from astro:env, which only exists
// inside Astro. Bun has no XMLHttpRequest, so the S3 PUT (putReportFile) is
// stubbed here.
mock.module("astro:env/client", () => ({
  PUBLIC_API_BASE_URL: "https://api.test",
}));
const put = mock(async (...args: unknown[]) => void args);
mock.module("../models/upload", () => ({
  putReportFile: put,
  ReportFileUploadError: class extends Error {},
}));

const { handleGetReportFileUploadUrl, MOCK_REPORT_UPLOAD_URL } =
  await import("../models/mocks");
const { uploadReportFile } = await import("./upload-report-file");

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  put.mockClear();
});
afterAll(() => server.close());

test("requests a URL with a safe name and the real size, then PUTs the file", async () => {
  let requested: unknown;
  server.use(
    handleGetReportFileUploadUrl(async ({ request }) => {
      requested = await request.json();
      return Response.json(
        {
          uploadUrl: `${MOCK_REPORT_UPLOAD_URL}/report/abc`,
          contentType: "audio/mp4",
          key: "report/abc",
        },
        { status: 201 },
      );
    }),
  );
  const file = new File([new Uint8Array(1234)], "회의 녹음 1.M4A");

  const key = await uploadReportFile(file);

  expect(key).toBe("report/abc");
  expect(requested).toEqual({ fileName: "1.m4a", contentLength: 1234 });
  expect(put).toHaveBeenCalledTimes(1);
  expect(put.mock.calls[0]?.[0]).toEqual({
    uploadUrl: `${MOCK_REPORT_UPLOAD_URL}/report/abc`,
    contentType: "audio/mp4",
    key: "report/abc",
  });
  expect(put.mock.calls[0]?.[1]).toBe(file);
});

test("fails without uploading when the backend refuses the file", async () => {
  server.use(
    handleGetReportFileUploadUrl(() =>
      Response.json(
        {
          statusCode: 400,
          message: "File extension is not allowed",
          error: "Bad Request",
        },
        { status: 400 },
      ),
    ),
  );

  await expect(
    uploadReportFile(new File(["x"], "a.pdf")),
  ).rejects.toMatchObject({ statusCode: 400 });
  expect(put).not.toHaveBeenCalled();
});
