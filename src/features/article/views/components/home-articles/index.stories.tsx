import { type Meta, type StoryObj } from "@storybook/react-vite";

import { type Category } from "@/features/category";

import { HomeArticles } from ".";
import { type Article } from "../../../models";
import { createMockArticle, MOCK_PHOTOS } from "../../../models/mocks";
import { buildHomeSections } from "../../../viewmodels/home";

const NOW = new Date("2026-10-29T03:00:00Z");

let next = 0;
function article(
  title: string,
  categories: Category[],
  options: {
    daysAgo: number;
    views: number;
    photo?: boolean;
    subtitle?: string;
  },
): Article {
  const index = next++;
  return createMockArticle(index, {
    title,
    subtitle: options.subtitle ?? null,
    categories,
    views: options.views,
    createdAt: new Date(NOW.getTime() - options.daysAgo * 86_400_000),
    thumbnailUrl:
      options.photo === false ? null : MOCK_PHOTOS[index % MOCK_PHOTOS.length],
  });
}

const latest = [
  article(
    "연구실 안전 점검 항목 개편, 현장에서는 무엇이 달라졌나",
    ["RESEARCH"],
    {
      daysAgo: 1,
      views: 1204,
      subtitle: "점검표가 바뀐 첫 학기, 대학원생과 담당 부서의 이야기를 들었다",
    },
  ),
  article("2학기 수강 정정 기간 하루 연장된다", ["CAMPUS"], {
    daysAgo: 1,
    views: 842,
  }),
  article("가을 축제 사흘간의 기록", ["CULTURE"], { daysAgo: 2, views: 1032 }),
  article("광주 첨단지구 버스 노선 개편안, 학생 의견 수렴 시작", ["SOCIETY"], {
    daysAgo: 2,
    views: 401,
  }),
  article(
    "지역 청년 주거 지원 사업, 대학원생도 신청할 수 있을까",
    ["SOCIETY"],
    { daysAgo: 2, views: 611, photo: false },
  ),
  article("기숙사 식당 저녁 운영 시간 30분 늘어난다", ["CAMPUS"], {
    daysAgo: 4,
    views: 977,
  }),
  article("학부생 연구 프로그램, 올해 참여 인원 늘었다", ["ACADEMIC"], {
    daysAgo: 5,
    views: 512,
  }),
  article("학생회 선거, 후보 등록 마감 앞두고 단일 후보", ["CAMPUS"], {
    daysAgo: 5,
    views: 701,
  }),
];

const sections = buildHomeSections(
  {
    latest,
    popular: latest.toSorted((a, b) => b.views - a.views),
    categories: {
      CAMPUS: [
        latest[1],
        latest[5],
        article("캠퍼스 셔틀 시간표, 주말 배차 조정", ["CAMPUS"], {
          daysAgo: 8,
          views: 210,
        }),
      ],
      SOCIETY: [latest[3], latest[4]],
      ACADEMIC_RESEARCH: [
        article("공동 장비실 예약 시스템 바뀐다", ["RESEARCH"], {
          daysAgo: 3,
          views: 320,
          photo: false,
        }),
        latest[6],
        latest[0],
      ],
      CULTURE: [
        latest[2],
        article("캠퍼스 사진전 수상작 전시", ["CULTURE"], {
          daysAgo: 19,
          views: 150,
        }),
      ],
      PLANNING_SPECIAL: [
        article(
          "기숙사 10년, 방 배정 방식은 어떻게 바뀌어 왔나",
          ["PLANNING"],
          {
            daysAgo: 29,
            views: 640,
            subtitle:
              "추첨에서 점수제, 다시 추첨으로. 열 번의 학기를 지나온 규정집을 넘겨봤다",
          },
        ),
        article("새벽 네 시의 실험실", ["REPORTAGE"], {
          daysAgo: 35,
          views: 300,
        }),
        article("개교 기념 인터뷰 시리즈", ["SPECIAL"], {
          daysAgo: 40,
          views: 280,
        }),
        article("졸업생 다섯 명에게 첫 직장을 물었다", ["PLANNING"], {
          daysAgo: 45,
          views: 760,
        }),
      ],
      OPINION: [
        article(
          "마감 전날 밤, 편집실의 불은 꺼지지 않는다",
          ["INTERNAL_COLUMN"],
          { daysAgo: 6, views: 120, photo: false },
        ),
        article("작은 대학의 큰 실험", ["EXTERNAL_COLUMN"], {
          daysAgo: 9,
          views: 98,
          photo: false,
        }),
        article("3분기 독자자문위원회 회의 정리", ["READERS_COMMITTEE"], {
          daysAgo: 12,
          views: 64,
          photo: false,
        }),
        article("수강 정정 마지막 날", ["CARTOON"], {
          daysAgo: 14,
          views: 210,
        }),
      ],
    },
  },
  NOW,
);

const meta = {
  title: "Article/HomeArticles",
  component: HomeArticles,
  parameters: { layout: "fullscreen" },
  args: sections,
} satisfies Meta<typeof HomeArticles>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
