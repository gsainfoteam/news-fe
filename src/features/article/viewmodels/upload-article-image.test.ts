import { afterAll, afterEach, beforeAll, expect, mock, test } from "bun:test";
import { setupServer } from "msw/node";

// Bun has no XMLHttpRequest, so the S3 PUT is stubbed here.
const put = mock(async (...args: unknown[]) => void args);
mock.module("@/common/lib/presigned-upload", () => ({
  putPresignedFile: put,
  PresignedUploadError: class extends Error {},
}));

const { handleGetArticleImageUploadUrl, MOCK_IMAGE_UPLOAD_URL } =
  await import("../models/editor-mocks");
const { uploadArticleImage } = await import("./upload-article-image");

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  put.mockClear();
});
afterAll(() => server.close());

const upload = {
  uploadUrl: `${MOCK_IMAGE_UPLOAD_URL}/articles/x-file.jpg`,
  contentType: "image/jpeg",
  publicUrl: "https://s3.test/bucket/articles/x-file.jpg",
  key: "articles/x-file.jpg",
};

test("requests a URL with a safe name and the real size, then PUTs the file", async () => {
  let requested: unknown;
  server.use(
    handleGetArticleImageUploadUrl(async ({ request }) => {
      requested = await request.json();
      return Response.json(upload);
    }),
  );
  const file = new File([new Uint8Array(2048)], "시약장 사진.JPG");

  const result = await uploadArticleImage(file);

  expect(result).toEqual({ key: upload.key, url: upload.publicUrl });
  expect(requested).toEqual({ fileName: "file.jpg", contentLength: 2048 });
  expect(put).toHaveBeenCalledTimes(1);
  expect(put.mock.calls[0]?.[0]).toEqual(upload);
  expect(put.mock.calls[0]?.[1]).toBe(file);
});

test("fails without uploading when the backend refuses the file", async () => {
  server.use(
    handleGetArticleImageUploadUrl(() =>
      Response.json(
        {
          statusCode: 400,
          message: "File extension .heic is not allowed",
          error: "Bad Request",
        },
        { status: 400 },
      ),
    ),
  );

  await expect(
    uploadArticleImage(new File(["x"], "a.png")),
  ).rejects.toMatchObject({ statusCode: 400 });
  expect(put).not.toHaveBeenCalled();
});
