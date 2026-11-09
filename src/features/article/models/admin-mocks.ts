import { HttpResponse } from "msw";

import { handleDeleteArticle, handleGetArticles } from "@/@types/api/msw.gen";

import { type AdminArticle } from "./admin";

let nextId = 1;

export function mockArticle(
  overrides: Partial<AdminArticle> = {},
): AdminArticle {
  const id = overrides.id ?? nextId++;
  const createdAt = overrides.createdAt ?? new Date("2026-10-28T09:00:00Z");
  return {
    id,
    title: `기사 ${id}`,
    subtitle: null,
    content: "<p>본문</p>",
    thumbnailUrl: null,
    views: 0,
    categories: ["CAMPUS"],
    createdAt,
    updatedAt: createdAt,
    authors: [{ id: "author-1", name: "김도윤" }],
    comments: [],
    ...overrides,
  };
}

const day = (d: number, h = 9) => new Date(Date.UTC(2026, 9, d, h));

export const MOCK_ADMIN_ARTICLES: AdminArticle[] = [
  mockArticle({
    id: 42,
    title: "연구실 안전 점검 항목 개편, 현장에서는 무엇이 달라졌나",
    subtitle: "점검표가 바뀐 첫 학기, 대학원생과 담당 부서의 이야기를 들었다",
    categories: ["ACADEMIC_RESEARCH", "RESEARCH"],
    authors: [
      { id: "a1", name: "김도윤" },
      { id: "a2", name: "이서연" },
    ],
    views: 1204,
    createdAt: day(28),
    updatedAt: day(28, 15),
  }),
  mockArticle({
    id: 41,
    title: "2학기 수강 정정 기간 하루 연장된다",
    categories: ["CAMPUS"],
    authors: [{ id: "a3", name: "박지호" }],
    views: 842,
    createdAt: day(28),
  }),
  mockArticle({
    id: 40,
    title: "가을 축제 사흘간의 기록",
    subtitle: "사진으로 본 축제 현장",
    categories: ["CULTURE"],
    authors: [{ id: "a4", name: "최하은" }],
    views: 1032,
    createdAt: day(27),
    updatedAt: day(27, 18),
  }),
  mockArticle({
    id: 39,
    title: "광주 첨단지구 버스 노선 개편안, 학생 의견 수렴 시작",
    categories: ["SOCIETY"],
    views: 611,
    createdAt: day(27),
  }),
  mockArticle({
    id: 38,
    title: "마감 전날 밤, 편집실의 불은 꺼지지 않는다",
    categories: ["OPINION", "INTERNAL_COLUMN"],
    authors: [{ id: "a5", name: "정민준" }],
    views: 388,
    createdAt: day(26),
  }),
  mockArticle({
    id: 37,
    title: "기숙사 식당 저녁 운영 시간 30분 늘어난다",
    categories: ["CAMPUS"],
    authors: [{ id: "a3", name: "박지호" }],
    views: 977,
    createdAt: day(25),
    updatedAt: day(26),
  }),
  mockArticle({
    id: 36,
    title: "졸업생 다섯 명에게 첫 직장을 물었다",
    subtitle: "지스트 졸업생의 진로를 따라가 보다",
    categories: ["PLANNING_SPECIAL", "PLANNING"],
    authors: [
      { id: "a5", name: "정민준" },
      { id: "a1", name: "김도윤" },
    ],
    views: 760,
    createdAt: day(24),
  }),
  mockArticle({
    id: 35,
    title: "3분기 독자자문위원회 회의 정리",
    categories: ["OPINION", "READERS_COMMITTEE"],
    authors: [{ id: "a6", name: "편집부" }],
    views: 214,
    createdAt: day(22),
  }),
  ...Array.from({ length: 34 }, (_, i) =>
    mockArticle({
      id: 34 - i,
      title: `지난 기사 ${34 - i}`,
      categories: [(["CAMPUS", "SOCIETY", "CULTURE"] as const)[i % 3]],
      views: 100 + ((i * 37) % 400),
      createdAt: day(21 - Math.floor(i / 2)),
    }),
  ),
];

// Filters, sorts and pages like `GET /article`, and `DELETE /article/:id`
// removes from the same list, so a story can delete and see the row go.
export function handleAdminArticles(initial: AdminArticle[]) {
  let articles = [...initial];
  return [
    handleGetArticles(({ request }) => {
      const params = new URL(request.url).searchParams;
      const search = params.get("search")?.trim();
      const category = params.get("category") as
        AdminArticle["categories"][number] | null;
      const offset = Number(params.get("offset") ?? 0);
      const limit = Number(params.get("limit") ?? 10);
      let list = articles.filter(
        (a) =>
          (!category || a.categories.includes(category)) &&
          (!search || `${a.title} ${a.content}`.includes(search)),
      );
      if (params.get("sort") === "MOST_POPULAR") {
        list = [...list].sort((a, b) => b.views - a.views);
      }
      return HttpResponse.json({
        articles: list.slice(offset, offset + limit),
        // The backend sends bigint counts as strings.
        count: String(list.length),
      });
    }),
    handleDeleteArticle(({ params }) => {
      articles = articles.filter((a) => a.id !== Number(params.id));
      return new HttpResponse(null, { status: 200 });
    }),
  ];
}

export function handleAdminArticlesError() {
  return handleGetArticles(() =>
    HttpResponse.json(
      {
        message: "Internal Server Error",
        error: "Internal Server Error",
        statusCode: 500,
      },
      { status: 500 },
    ),
  );
}
