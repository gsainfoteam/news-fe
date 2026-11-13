import { http, HttpResponse } from "msw";

import {
  handleCreateArticle,
  handleGetArticle,
  handleGetArticleImageUploadUrl,
  handleGetMembers,
  handleUpdateArticle,
} from "@/@types/api/msw.gen";
import { type MemberDto } from "@/@types/api/types.gen";

import { type Article, type ArticleInput } from ".";

export {
  handleCreateArticle,
  handleGetArticle,
  handleGetArticleImageUploadUrl,
  handleGetMembers,
  handleUpdateArticle,
};

export const MOCK_IMAGE_BUCKET =
  "https://s3.ap-northeast-2.amazonaws.com/news-mock";
export const MOCK_IMAGE_UPLOAD_URL = "https://article-images.test/upload";

const member = (
  n: number,
  name: string,
  role: MemberDto["role"],
  permission: MemberDto["permission"] = "NONE",
): MemberDto => ({
  id: `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`,
  email: `member${n}@gm.gist.ac.kr`,
  name,
  picture: null,
  role,
  permission,
  createdAt: new Date("2025-03-02T09:00:00Z"),
  updatedAt: new Date("2025-03-02T09:00:00Z"),
});

export const MOCK_MEMBERS: MemberDto[] = [
  member(1, "김도윤", "EDITOR_IN_CHIEF", "EDITORSHIP"),
  member(2, "이서연", "REPORTING_SENIOR_REPORTER", "EDITOR"),
  member(3, "박지호", "REPORTING_REPORTER"),
  member(4, "박서윤", "CUB_REPORTER"),
  member(5, "최하은", "DESIGNER"),
  member(6, "정민준", "DIGITAL_REPORTER"),
  member(7, "한지민", "ALUMNI"),
];

function photo(from: string, to: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="1200" height="675" fill="url(#g)"/><circle cx="860" cy="240" r="130" fill="#fff" fill-opacity=".18"/></svg>`;
}

const PHOTOS = [photo("#8fa3b5", "#3c4b59"), photo("#c9b394", "#6b5a43")];

// `<bucket>/<key>` URLs like news-be's, not data: URLs (the editor drops
// those), so edits in stories can recover keys from them.
export function handleMockImages() {
  return http.get(`${MOCK_IMAGE_BUCKET}/*`, ({ request }) => {
    const index = request.url.length % PHOTOS.length;
    return new HttpResponse(PHOTOS[index], {
      headers: { "Content-Type": "image/svg+xml" },
    });
  });
}

export const MOCK_EDIT_ARTICLE: Article = {
  id: 42,
  title: "연구실 안전 점검 항목 개편, 현장에서는 무엇이 달라졌나",
  subtitle: "점검표가 바뀐 첫 학기, 대학원생과 담당 부서의 이야기를 들었다",
  content: [
    "<p>새 학기부터 연구실 안전 점검 항목이 바뀌었다. <strong>화학물질 보관과 장비 사용 기록</strong>을 중심으로 점검표가 다시 짜였고, 연구실마다 준비해야 할 서류도 늘었다.</p>",
    `<img src="${MOCK_IMAGE_BUCKET}/articles/2026-10-28/q1w2e3-lab-cabinet.png" alt="점검 기간 중 한 연구실의 시약장">`,
    "<p>현장의 대학원생들은 취지에는 공감하면서도 행정 부담이 커졌다고 말한다.</p>",
    "<h2>무엇이 바뀌었나</h2>",
    "<p>가장 큰 변화는 기록 방식이다. 이전에는 점검 당일 상태만 확인했다면, 이제는 한 학기 동안의 사용 기록을 함께 제출해야 한다.</p>",
    "<blockquote><p>서류가 늘었지만, 사고가 났을 때 무엇을 봐야 할지는 분명해졌다.</p></blockquote>",
  ].join(""),
  thumbnailUrl: null,
  views: 1204,
  categories: ["ACADEMIC_RESEARCH", "RESEARCH"],
  createdAt: new Date("2026-10-28T09:00:00Z"),
  updatedAt: new Date("2026-10-28T15:00:00Z"),
  authors: [
    { id: MOCK_MEMBERS[0].id, name: MOCK_MEMBERS[0].name },
    { id: MOCK_MEMBERS[1].id, name: MOCK_MEMBERS[1].name },
  ],
  comments: [],
};

let uploadCount = 0;

export function handleArticleImageUpload({
  putStatus = 200,
  delayMs = 1200,
}: { putStatus?: number; delayMs?: number } = {}) {
  return [
    handleGetArticleImageUploadUrl(async ({ request }) => {
      const { fileName } = (await request.json()) as { fileName: string };
      const key = `articles/2026-11-10/mock${++uploadCount}-${fileName}`;
      return HttpResponse.json({
        uploadUrl: `${MOCK_IMAGE_UPLOAD_URL}/${key}`,
        contentType: "image/png",
        publicUrl: `${MOCK_IMAGE_BUCKET}/${key}`,
        key,
      });
    }),
    http.put(`${MOCK_IMAGE_UPLOAD_URL}/*`, async () => {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return new HttpResponse(null, { status: putStatus });
    }),
    handleMockImages(),
  ];
}

export function handleArticleSave(article: Article = MOCK_EDIT_ARTICLE) {
  const toArticle = (id: number, body: Partial<ArticleInput>): Article => ({
    ...article,
    ...body,
    id,
    subtitle: body.subtitle ?? null,
    authors: (body.authorIds ?? []).map((authorId) => ({
      id: authorId,
      name: MOCK_MEMBERS.find((m) => m.id === authorId)?.name ?? authorId,
    })),
    updatedAt: new Date(),
  });
  return [
    handleCreateArticle(async ({ request }) =>
      HttpResponse.json(toArticle(101, (await request.json()) as ArticleInput)),
    ),
    handleUpdateArticle(async ({ request, params }) =>
      HttpResponse.json(
        toArticle(
          Number(params.id),
          (await request.json()) as Partial<ArticleInput>,
        ),
      ),
    ),
  ];
}

export function handleMockError(
  handler:
    | typeof handleCreateArticle
    | typeof handleUpdateArticle
    | typeof handleGetArticle
    | typeof handleGetMembers,
  status = 500,
) {
  return handler(() =>
    HttpResponse.json(
      { message: "Error", error: "Error", statusCode: status },
      { status },
    ),
  );
}
