import { type Meta, type StoryObj } from "@storybook/react-vite";

import { ArticleMiniList } from ".";
import { createMockArticles, MOCK_PHOTOS } from "../../../models/mocks";
import { toArticlePreview } from "../../../viewmodels/article-preview";

// toArticlePreview keeps only http(s) photos, and the mock ones are data:
// URLs, so the photos are set here. The second item has none.
const articles = createMockArticles(3).map((article, i) => ({
  ...toArticlePreview(article),
  thumbnail: i === 1 ? undefined : MOCK_PHOTOS[i],
}));

const meta = {
  title: "Article/ArticleMiniList",
  component: ArticleMiniList,
  args: {
    title: "학술·연구 최신 기사",
    articles,
  },
  render: (args) => (
    <div className="max-w-[300px] mobile:max-w-none">
      <ArticleMiniList {...args} />
    </div>
  ),
} satisfies Meta<typeof ArticleMiniList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
