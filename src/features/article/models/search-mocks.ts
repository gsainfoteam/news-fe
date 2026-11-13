import { delay, HttpResponse } from "msw";

import { handleGetArticles } from "@/@types/api/msw.gen";

import { type Article } from ".";
import { createMockArticle, MOCK_PHOTOS } from "./mocks";

const DORM: Pick<Article, "title" | "categories" | "content">[] = [
  {
    title: "기숙사 식당 저녁 운영 시간 30분 늘어난다",
    categories: ["CAMPUS"],
    content:
      "<p>다음 달부터 기숙사 식당의 저녁 운영 시간이 30분 늘어난다. 실험이 늦게 끝나는 대학원생들의 요청이 반영됐다.</p>",
  },
  {
    title: "첨단 3지구 공사 소음 민원, 기숙사까지 닿았다",
    categories: ["SOCIETY"],
    content:
      "<p>광주 첨단 3지구 공사가 석 달째 이어지고 있다. 낮에는 덤프트럭이 오가고 밤에는 자재를 내리는 소리가 이어진다. 학생들은 시험 기간만이라도 야간 작업을 줄여 달라고 요청했다. 인근 공사 현장의 소음이 기숙사까지 들린다는 민원이 이어지고 있다.</p>",
  },
  {
    title: "기숙사 10년, 방 배정 방식은 어떻게 바뀌어 왔나",
    categories: ["PLANNING_SPECIAL", "PLANNING"],
    content:
      "<p>기숙사 방 배정 방식은 그동안 세 번 바뀌었다. 학생들의 요구와 학교의 고민을 함께 정리했다.</p>",
  },
  {
    title: "겨울방학 기숙사 잔류 신청 다음 주 시작",
    categories: ["CAMPUS"],
    content:
      "<p>겨울방학 동안 기숙사에 남으려는 학생은 다음 주부터 신청할 수 있다.</p>",
  },
  {
    title: "기숙사 복도에서 들은 이야기",
    categories: ["OPINION", "INTERNAL_COLUMN"],
    content: "<p>밤 열한 시, 기숙사 복도는 하루 중 가장 시끄럽다.</p>",
  },
];

// 23 matches for "기숙사", so the first page leaves 13 for "더 보기".
export const MOCK_SEARCH_ARTICLES: Article[] = Array.from(
  { length: 23 },
  (_, i) => {
    const sample = DORM[i % DORM.length];
    return createMockArticle(i, {
      ...sample,
      title: i < DORM.length ? sample.title : `${sample.title} (${i + 1})`,
      // Shared mocks put photos in the body as data: URIs, which the preview
      // skips; the thumbnail field is taken as is.
      thumbnailUrl: i % 3 === 2 ? null : MOCK_PHOTOS[i % MOCK_PHOTOS.length],
      views: 1488 - i * 41,
    });
  },
);

// Without `search` it answers the "latest articles" request under "no results".
export function handleSearchArticles(articles = MOCK_SEARCH_ARTICLES) {
  return handleGetArticles(({ request }) => {
    const params = new URL(request.url).searchParams;
    const terms = (params.get("search") ?? "")
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    const category = params.get("category") as
      Article["categories"][number] | null;
    const offset = Number(params.get("offset") ?? 0);
    const limit = Number(params.get("limit") ?? 10);
    let list = articles.filter(
      (a) =>
        (!category || a.categories.includes(category)) &&
        terms.some((term) =>
          `${a.title} ${a.content}`.toLowerCase().includes(term),
        ),
    );
    if (terms.length === 0) list = articles;
    if (params.get("sort") === "MOST_POPULAR") {
      list = list.toSorted((a, b) => b.views - a.views);
    }
    return HttpResponse.json({
      articles: list.slice(offset, offset + limit),
      // The backend sends bigint counts as strings.
      count: String(list.length),
    });
  });
}

export function handleSearchArticlesError() {
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

export function handleSearchArticlesLoading() {
  return handleGetArticles(async () => {
    await delay("infinite");
    return HttpResponse.json({ articles: [], count: "0" });
  });
}
