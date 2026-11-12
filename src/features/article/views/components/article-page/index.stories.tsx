import { type Meta, type StoryObj } from "@storybook/react-vite";

import { ArticlePage } from ".";
import { createMockArticles, MOCK_PHOTOS } from "../../../models/mocks";
import {
  getBreadcrumb,
  getRelatedArticles,
  type ArticleDetail,
} from "../../../viewmodels/article-detail";
import { getPopularArticles } from "../../../viewmodels/article-list";
import { toArticlePreview } from "../../../viewmodels/article-preview";

const BODY = `
<p>새 학기부터 연구실 안전 점검 항목이 바뀌었다. 화학물질 보관과 장비 사용 기록을 중심으로 점검표가 다시 짜였고, 연구실마다 준비해야 할 서류도 늘었다.</p>
<figure><img src="${MOCK_PHOTOS[0]}" alt="시약장"><figcaption>점검 기간 중 한 연구실의 시약장. 사진 = 이서연 기자</figcaption></figure>
<p>현장의 대학원생들은 취지에는 공감하면서도 행정 부담이 커졌다고 말한다. 한 연구실의 안전 담당 학생은 "점검 전 일주일은 실험보다 서류를 더 많이 본다"고 했다.</p>
<h2>무엇이 바뀌었나</h2>
<p>가장 큰 변화는 기록 방식이다. 이전에는 점검 당일 상태만 확인했다면, 이제는 한 학기 동안의 사용 기록을 함께 제출해야 한다. 자세한 내용은 <a href="https://example.com">안전관리 안내 페이지</a>에 있다.</p>
<blockquote><p>“점검 날 하루만 깨끗한 연구실이 아니라, 매일 같은 상태인 연구실을 만들자는 겁니다.”</p></blockquote>
<p>점검 결과는 연구실별로 통보되고, 보완이 필요한 항목은 한 달 안에 다시 확인받아야 한다.</p>
<ul><li><p>화학물질 보관 기록: 월 1회 갱신</p></li><li><p>장비 사용 기록: 사용할 때마다 작성</p></li><li><p>안전교육 이수 현황: 학기 시작 후 2주 안에 제출</p></li></ul>
<p>학생들은 기록을 줄이는 대신 꼭 필요한 항목만 남겨 달라고 요청했다. 담당 부서는 학기 말 설문으로 의견을 모으겠다고 밝혔다.</p>`;

const articles = createMockArticles(12);
const current = articles[0];
// Built by hand: the sanitizer runs only in the build, and this body is
// already what it would output.
const detail: ArticleDetail = {
  id: current.id,
  path: `/article/${current.id}`,
  title: current.title,
  subtitle: "점검표가 바뀐 첫 학기, 대학원생과 담당 부서의 이야기를 들었다",
  html: BODY,
  breadcrumb: getBreadcrumb(current.categories),
  categories: current.categories,
  authors: ["김도윤", "이서연"],
  publishedAt: new Date("2026-10-28T05:20:00Z"),
  updatedAt: new Date("2026-10-28T09:05:00Z"),
  views: 1204,
};
const related = getRelatedArticles(articles, current);
const preview = (list: typeof articles) =>
  list.map((article) => toArticlePreview(article));

const meta = {
  title: "Article/ArticlePage",
  component: ArticlePage,
  parameters: { layout: "fullscreen" },
  args: {
    article: detail,
    popular: preview(getPopularArticles(articles)),
    section: related.section,
    latestInSection: preview(related.latestInSection),
    continueReading: preview(related.continueReading),
  },
  render: (args) => (
    // The footer's top margin, which the band cancels.
    <div className="page-container pb-24 mobile:pb-16">
      <ArticlePage {...args} />
    </div>
  ),
} satisfies Meta<typeof ArticlePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
