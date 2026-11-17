import { http, HttpResponse } from "msw";

import {
  handleCreateNewspaper,
  handleDeleteNewspaper,
  handleGetNewspaperFileUploadUrl,
  handleGetNewspapers,
  handleUpdateNewspaper,
} from "@/@types/api/msw.gen";

import { type Newspaper } from ".";

export { handleGetNewspaperFileUploadUrl, handleGetNewspapers };

export const MOCK_NEWSPAPER_BUCKET =
  "https://s3.ap-northeast-2.amazonaws.com/news-mock";
export const MOCK_NEWSPAPER_UPLOAD_URL = "https://newspapers.test/upload";

const date = (y: number, m: number, d: number) =>
  new Date(Date.UTC(y, m - 1, d, 0));

export function mockNewspaper(
  issue: number,
  createdAt: Date,
  overrides: Partial<Newspaper> = {},
): Newspaper {
  return {
    id: issue,
    title: `제${issue}호`,
    url: `${MOCK_NEWSPAPER_BUCKET}/newspaper/00000000-0000-4000-a000-${String(issue).padStart(12, "0")}/issue-${issue}.pdf`,
    createdAt,
    updatedAt: createdAt,
    ...overrides,
  };
}

// Six issues a year, like the real paper; newest first as news-be returns them.
export const MOCK_NEWSPAPERS: Newspaper[] = [
  mockNewspaper(72, date(2026, 11, 10)),
  mockNewspaper(71, date(2026, 9, 22)),
  mockNewspaper(70, date(2026, 7, 24)),
  mockNewspaper(69, date(2026, 5, 15)),
  mockNewspaper(68, date(2026, 3, 12)),
  mockNewspaper(67, date(2026, 1, 22)),
  mockNewspaper(66, date(2025, 11, 20)),
  mockNewspaper(65, date(2025, 9, 25)),
  mockNewspaper(64, date(2025, 7, 17)),
  mockNewspaper(63, date(2025, 5, 22)),
  mockNewspaper(62, date(2025, 3, 20)),
  mockNewspaper(61, date(2024, 12, 5)),
  mockNewspaper(60, date(2024, 10, 10)),
];

const error = (statusCode: number, message: string) =>
  HttpResponse.json(
    { message, error: message, statusCode },
    { status: statusCode },
  );

// An in-memory archive, so a story can upload, rename and delete. Keys must
// be "uploaded" (PUT) before they can be registered, as in news-be.
export function handleNewspapers(
  initial: Newspaper[],
  {
    delayMs = 1200,
    putStatus = 200,
  }: { delayMs?: number; putStatus?: number } = {},
) {
  let papers = [...initial];
  let nextId = Math.max(0, ...initial.map((p) => p.id)) + 1;
  const uploaded = new Set<string>();
  const urlOf = (key: string) => `${MOCK_NEWSPAPER_BUCKET}/${key}`;

  return [
    handleGetNewspapers(({ request }) => {
      const query = new URL(request.url).searchParams;
      const offset = Number(query.get("offset") ?? 0);
      const limit = Number(query.get("limit") ?? 10);
      const latestFirst = papers.toSorted(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );
      return HttpResponse.json({
        newspapers: latestFirst.slice(offset, offset + limit),
        count: papers.length,
      } as never);
    }),
    handleGetNewspaperFileUploadUrl(async ({ request }) => {
      const { fileName } = await request.json();
      const key = `newspaper/${crypto.randomUUID()}/${fileName}`;
      return HttpResponse.json({
        uploadUrl: `${MOCK_NEWSPAPER_UPLOAD_URL}/${key}`,
        contentType: "application/pdf",
        key,
      });
    }),
    http.put(`${MOCK_NEWSPAPER_UPLOAD_URL}/*`, async ({ request }) => {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      const key = new URL(request.url).pathname.replace(/^\/upload\//, "");
      if (putStatus < 300) uploaded.add(key);
      return new HttpResponse(null, { status: putStatus });
    }),
    handleCreateNewspaper(async ({ request }) => {
      const { title, fileKey } = await request.json();
      if (!uploaded.has(fileKey)) return error(404, "File not uploaded");
      const now = new Date();
      const paper: Newspaper = {
        id: nextId++,
        title,
        url: urlOf(fileKey),
        createdAt: now,
        updatedAt: now,
      };
      papers = [paper, ...papers];
      return HttpResponse.json(paper as never, { status: 201 });
    }),
    handleUpdateNewspaper(async ({ params, request }) => {
      const id = Number(params.id);
      const target = papers.find((p) => p.id === id);
      if (!target) return error(404, "Not found");
      const { title, fileKey } = await request.json();
      if (fileKey && !uploaded.has(fileKey)) {
        return error(404, "File not uploaded");
      }
      const updated: Newspaper = {
        ...target,
        ...(title && { title }),
        ...(fileKey && { url: urlOf(fileKey) }),
        updatedAt: new Date(),
      };
      papers = papers.map((p) => (p.id === id ? updated : p));
      return HttpResponse.json(updated as never);
    }),
    handleDeleteNewspaper(({ params }) => {
      const id = Number(params.id);
      if (!papers.some((p) => p.id === id)) return error(404, "Not found");
      papers = papers.filter((p) => p.id !== id);
      return new HttpResponse(null, { status: 200 });
    }),
  ];
}

export function handleNewspapersError() {
  return handleGetNewspapers(() => error(500, "Internal Server Error"));
}
