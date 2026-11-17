import { delay, HttpResponse } from "msw";

import {
  handleCreateHistory,
  handleDeleteHistory,
  handleGetAbout,
  handleUpdateAbout,
  handleUpdateHistory,
} from "@/@types/api/msw.gen";

import { type About, type HistoryEntry } from ".";

// Trimmed from staging's `GET /about`.
export const MOCK_ABOUT: About = {
  introduction:
    "학내 독립언론 지스캐치는 2015년 한 해 동안 대학, 사회관련 소식을 전해왔다.\n2016년 지스캐치는 발행인 문승현 총장, 주간 이용주 교수, 부주간 장진호 교수를 두고 4월 11일 창간호 발행을 시작으로 학내 공식 언론사 '지스트신문'으로 새롭게 창간하였다.\n현재 주간 홍성민 교수를 두고 연 6회 지면발행하고 있다.",
  foundedAt: "2016-04-11",
  publisher: "임기철",
  director: "홍성민",
  editorInChief: "이다연",
  address: "광주광역시 북구 첨단과기로 123 제1학생회관 3층 GIST 신문사",
  email: "editor@gist.ac.kr",
  homepage: "https://www.gistnews.co.kr",
  instagram: "https://www.instagram.com/gistnews._.official",
  histories: [
    { id: 1, date: "2015-02-10", content: "학내독립언론 지스캐치 창간" },
    {
      id: 2,
      date: "2016-04-11",
      content:
        "지스트 공식 언론 지스트신문 창간호 발행. 발행인 문승현 총장, 주간 이용주 교수, 부주간 장진호 교수",
    },
    {
      id: 3,
      date: "2016-05-31",
      content:
        "지스트신문 3호 발행을 마지막으로 백승혁(14, 기계) 편집장 사임, 김수호(15, 물리) 책임기자가 편집장 취임",
    },
    { id: 4, date: "2017-04-10", content: "주간 최정옥 교수" },
    {
      id: 5,
      date: "2017-06-30",
      content:
        "지스트신문 11호 발행을 마지막으로 김수호(15, 물리) 편집장 사임, 박정기(16, 기초) 책임기자가 편집장 취임",
    },
    {
      id: 7,
      date: "2018-05-30",
      content:
        "지스트신문 19호 발행을 마지막으로 박정기(16, 전전컴) 편집장 사임, 박세현(17, 기초) 정기자가 편집장 취임",
    },
    { id: 9, date: "2019-12-02", content: "주간 김근영 교수" },
    {
      id: 10,
      date: "2020-03-18",
      content:
        "지스트신문 31호 발행을 마지막으로 남유성(18, 기계) 편집장 사임, 고송주(19, 기계) 정기자가 편집장 취임",
    },
  ],
};

const error = (statusCode: number, message: string) =>
  HttpResponse.json(
    { message, error: message, statusCode },
    { status: statusCode },
  );

// Sorted like news-be (date, then id) so a re-dated entry moves in the story.
const byDate = (a: HistoryEntry, b: HistoryEntry) =>
  a.date.localeCompare(b.date) || a.id - b.id;

export function handleAbout(initial: About = MOCK_ABOUT) {
  let about = { ...initial, histories: [...initial.histories].sort(byDate) };
  let nextId = Math.max(0, ...about.histories.map((h) => h.id)) + 1;
  const findIndex = (id: unknown) =>
    about.histories.findIndex((h) => h.id === Number(id));

  return [
    handleGetAbout(() => HttpResponse.json(about)),
    handleUpdateAbout(async ({ request }) => {
      // Lets a story type while the save is in flight.
      await delay(600);
      about = { ...about, ...(await request.json()) };
      return HttpResponse.json(about);
    }),
    handleCreateHistory(async ({ request }) => {
      const entry = { id: nextId++, ...(await request.json()) };
      about = {
        ...about,
        histories: [...about.histories, entry].sort(byDate),
      };
      return HttpResponse.json(entry, { status: 201 });
    }),
    handleUpdateHistory(async ({ params, request }) => {
      const index = findIndex(params.id);
      if (index < 0) return error(404, "Not Found");
      const entry = { ...about.histories[index], ...(await request.json()) };
      about = {
        ...about,
        histories: about.histories
          .map((h, i) => (i === index ? entry : h))
          .sort(byDate),
      };
      return HttpResponse.json(entry);
    }),
    handleDeleteHistory(({ params }) => {
      if (findIndex(params.id) < 0) return error(404, "Not Found");
      about = {
        ...about,
        histories: about.histories.filter((h) => h.id !== Number(params.id)),
      };
      return new HttpResponse(null, { status: 200 });
    }),
  ];
}

export function handleAboutError() {
  return handleGetAbout(() => error(500, "Internal Server Error"));
}
