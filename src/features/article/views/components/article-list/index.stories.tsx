import { type Meta, type StoryObj } from "@storybook/react-vite";

import { ArticleList } from ".";
import { createMockArticles } from "../../../models/mocks";
import { toArticlePreview } from "../../../viewmodels/article-preview";

const articles = createMockArticles(6).map((a) => toArticlePreview(a));

const meta = {
  title: "Article/ArticleList",
  component: ArticleList,
  args: { articles },
  render: () => (
    <div className="flex max-w-[860px] flex-col gap-16">
      <ArticleList articles={articles} lead />
      <ArticleList articles={[]} />
    </div>
  ),
} satisfies Meta<typeof ArticleList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
