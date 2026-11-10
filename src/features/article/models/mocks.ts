import { type Article } from ".";

export { handleGetArticles } from "@/@types/api/msw.gen";

// Inline SVGs so stories render photos without the network.
function photo(from: string, to: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><circle cx="860" cy="260" r="140" fill="#fff" fill-opacity=".18"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const MOCK_PHOTOS = [
  photo("#8fa3b5", "#3c4b59"),
  photo("#c9b394", "#6b5a43"),
  photo("#9fb18e", "#46563c"),
  photo("#c8a196", "#6e4a40"),
  photo("#9aa1bf", "#454b68"),
];

const AUTHORS = ["김도윤", "이서연", "박지호", "최하은", "정민준"];

const SAMPLES: Pick<Article, "title" | "categories">[] = [
  {
    title: "연구실 안전 점검 항목 개편, 현장에서는 무엇이 달라졌나",
    categories: ["ACADEMIC_RESEARCH", "RESEARCH"],
  },
  {
    title: "학부생 연구 프로그램, 올해 참여 인원 늘었다",
    categories: ["ACADEMIC"],
  },
  { title: "공동 장비실 예약 시스템 바뀐다", categories: ["RESEARCH"] },
  { title: "교양 강의 개편 설명회 현장", categories: ["ACADEMIC"] },
  {
    title: "학회 발표를 준비하는 대학원생의 한 달",
    categories: ["ACADEMIC_RESEARCH"],
  },
  {
    title: "연구비 집행 규정 개정안, 무엇을 묻고 있나",
    categories: ["RESEARCH"],
  },
  {
    title: "영어 강의 비율, 학생들은 어떻게 느끼나",
    categories: ["ACADEMIC"],
  },
  {
    title: "학생 창업 동아리, 연구실 기술로 시제품 만들다",
    categories: ["RESEARCH"],
  },
  {
    title: "기숙사 식당 저녁 운영 시간 30분 늘어난다",
    categories: ["CAMPUS"],
  },
  { title: "가을 축제 사흘간의 기록", categories: ["CULTURE"] },
];

const BODY =
  "새 학기부터 연구실 안전 점검 항목이 바뀌었다. 화학물질 보관과 장비 사용 기록을 중심으로 점검표가 다시 짜였고, 연구실마다 준비해야 할 서류도 늘었다. 학생들은 바뀐 기준을 아직 잘 모른다고 답했다.";

export function createMockArticle(
  index: number,
  overrides: Partial<Article> = {},
): Article {
  const sample = SAMPLES[index % SAMPLES.length];
  // Every third article has no image, as many text-only pieces do.
  const image =
    index % 3 === 2
      ? ""
      : `<figure><img src="${MOCK_PHOTOS[index % MOCK_PHOTOS.length]}" alt=""></figure>`;
  const createdAt = new Date(Date.UTC(2026, 9, 28 - index * 2, 1));
  return {
    id: index + 1,
    title: sample.title,
    subtitle: null,
    content: `<p>${BODY}</p>${image}<p>점검은 다음 달까지 이어진다.</p>`,
    thumbnailUrl: null,
    views: 1204 - index * 97,
    categories: sample.categories,
    createdAt,
    updatedAt: createdAt,
    authors: AUTHORS.slice(index % 4, (index % 4) + 1 + (index % 2)).map(
      (name, i) => ({ id: `author-${index}-${i}`, name }),
    ),
    comments: [],
    ...overrides,
  };
}

export function createMockArticles(count: number) {
  return Array.from({ length: count }, (_, i) => createMockArticle(i));
}
