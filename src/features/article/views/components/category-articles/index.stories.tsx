import { type Meta, type StoryObj } from "@storybook/react-vite";

import { CategoryArticles } from ".";
import { createMockArticles } from "../../../models/mocks";
import { getPopularArticles } from "../../../viewmodels/article-list";
import { toArticlePreview } from "../../../viewmodels/article-preview";

const all = createMockArticles(8);
const preview = (list: typeof all) =>
  list.map((a) => toArticlePreview(a, { category: "ACADEMIC_RESEARCH" }));

const meta = {
  title: "Article/CategoryArticles",
  component: CategoryArticles,
  parameters: { layout: "fullscreen" },
  args: {
    category: "ACADEMIC_RESEARCH",
    total: 42,
    articles: preview(all),
    popular: preview(getPopularArticles(all)),
    page: { current: 1, last: 5 },
  },
  render: (args) => (
    <div className="page-container">
      <CategoryArticles {...args} />
    </div>
  ),
} satisfies Meta<typeof CategoryArticles>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
