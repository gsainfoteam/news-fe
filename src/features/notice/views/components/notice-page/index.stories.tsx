import { type Meta, type StoryObj } from "@storybook/react-vite";

import { type ArticleDetail } from "@/features/article";

import { NoticePage } from ".";
import { MOCK_NOTICES } from "../../../models/mocks";
import { getAdjacentNotices } from "../../../viewmodels/notice";

const [, current] = MOCK_NOTICES;

// toArticleDetail sanitizes only while building, so the story writes the
// detail by hand.
const notice: ArticleDetail = {
  id: current.id,
  path: `/notice/${current.id}`,
  title: current.title,
  subtitle: current.subtitle ?? undefined,
  html: current.content,
  breadcrumb: ["NOTICE"],
  categories: ["NOTICE"],
  authors: current.authors.map((a) => a.name),
  publishedAt: current.createdAt,
  updatedAt: new Date(current.createdAt.getTime() + 2 * 86_400_000),
  views: current.views,
};

const meta = {
  title: "Notice/NoticePage",
  component: NoticePage,
  parameters: { layout: "fullscreen" },
  args: { notice, ...getAdjacentNotices(MOCK_NOTICES, current.id) },
  render: (args) => (
    <div className="page-container">
      <NoticePage {...args} />
    </div>
  ),
} satisfies Meta<typeof NoticePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
