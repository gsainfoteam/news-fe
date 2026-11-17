import { type Notice } from ".";

const TITLES = [
  "지스트신문 23기 기자단 모집",
  "제3기 독자자문위원 모집",
  "2학기 지면 발행 일정 안내",
  "홈페이지 개편 안내",
  "기사 제보 창구가 바뀌었습니다",
  "추석 연휴 편집국 휴무 안내",
];

const BODY =
  "<p>지스트신문이 새 기자를 모집합니다. 취재와 사진, 편집에 관심 있는 학부생과 대학원생 누구나 지원할 수 있습니다.</p><h2>모집 일정</h2><ul><li>서류 접수: 9월 22일부터 10월 3일까지</li><li>면접: 10월 6일</li></ul><p>문의는 편집국 메일로 보내 주세요.</p>";

export function createMockNotice(
  index: number,
  overrides: Partial<Notice> = {},
): Notice {
  const createdAt = new Date(Date.UTC(2026, 9, 28 - index * 6, 1));
  return {
    id: 900 + index,
    title: TITLES[index % TITLES.length],
    subtitle: index === 1 ? "지원서는 10월 3일까지 받습니다" : null,
    content: BODY,
    thumbnailUrl: null,
    views: 320 - index * 11,
    categories: ["NOTICE"],
    createdAt,
    updatedAt: createdAt,
    authors: [{ id: "author-desk", name: "지스트신문사" }],
    comments: [],
    ...overrides,
  };
}

export const MOCK_NOTICES: Notice[] = Array.from({ length: 24 }, (_, i) =>
  createMockNotice(i),
);
