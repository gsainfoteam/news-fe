import { afterAll, afterEach, beforeAll, expect, mock, test } from "bun:test";
import { setupServer } from "msw/node";

// Bun has no XMLHttpRequest, so the S3 PUT is stubbed here.
const put = mock(async (...args: unknown[]) => void args);
mock.module("@/common/lib/presigned-upload", () => ({
  putPresignedFile: put,
  PresignedUploadError: class extends Error {},
}));

const { handleGetNewspaperFileUploadUrl, handleGetNewspapers, mockNewspaper } =
  await import("../models/mocks");
const { fetchAllNewspapers } = await import("../models");
const { uploadNewspaperFile } = await import("./upload-newspaper-file");

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  put.mockClear();
});
afterAll(() => server.close());

const upload = {
  uploadUrl: "https://s3.test/upload/newspaper/x/issue-72.pdf",
  contentType: "application/pdf",
  key: "newspaper/x/issue-72.pdf",
};

test("requests a URL for the file's size, PUTs it and returns the key", async () => {
  let requested: unknown;
  server.use(
    handleGetNewspaperFileUploadUrl(async ({ request }) => {
      requested = await request.json();
      return Response.json(upload);
    }),
  );
  const file = new File([new Uint8Array(4096)], "issue-72.pdf");

  expect(await uploadNewspaperFile(file)).toBe(upload.key);
  expect(requested).toEqual({ fileName: "issue-72.pdf", contentLength: 4096 });
  expect(put).toHaveBeenCalledTimes(1);
  expect(put.mock.calls[0]?.[0]).toEqual(upload);
  expect(put.mock.calls[0]?.[1]).toBe(file);
});

test("does not PUT when the backend refuses the file", async () => {
  server.use(
    handleGetNewspaperFileUploadUrl(() =>
      Response.json(
        { statusCode: 400, message: "Bad Request", error: "Bad Request" },
        { status: 400 },
      ),
    ),
  );

  await expect(
    uploadNewspaperFile(new File(["x"], "a.pdf")),
  ).rejects.toMatchObject({ statusCode: 400 });
  expect(put).not.toHaveBeenCalled();
});

test("fetchAllNewspapers walks every page of 50", async () => {
  const papers = Array.from({ length: 73 }, (_, i) =>
    mockNewspaper(i + 1, new Date(Date.UTC(2014, 0, 1 + i * 30))),
  ).reverse();
  const offsets: number[] = [];
  server.use(
    handleGetNewspapers(({ request }) => {
      const query = new URL(request.url).searchParams;
      const offset = Number(query.get("offset"));
      const limit = Number(query.get("limit"));
      offsets.push(offset);
      return Response.json({
        newspapers: papers.slice(offset, offset + limit),
        count: papers.length,
      });
    }),
  );

  const all = await fetchAllNewspapers();

  expect(offsets).toEqual([0, 50]);
  expect(all).toHaveLength(73);
  expect(all[0].title).toBe("제73호");
  expect(all[0].createdAt).toBeInstanceOf(Date);
});
