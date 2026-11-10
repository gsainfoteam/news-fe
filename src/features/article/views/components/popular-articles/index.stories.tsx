import { type Meta, type StoryObj } from "@storybook/react-vite";

import { PopularArticles } from ".";
import { createMockArticles } from "../../../models/mocks";
import { toArticlePreview } from "../../../viewmodels/article-preview";

const meta = {
  title: "Article/PopularArticles",
  component: PopularArticles,
  args: {
    title: "학술·연구 많이 본 기사",
    articles: createMockArticles(5).map((a) => toArticlePreview(a)),
  },
  render: (args) => (
    <div className="max-w-[300px]">
      <PopularArticles {...args} />
    </div>
  ),
} satisfies Meta<typeof PopularArticles>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
