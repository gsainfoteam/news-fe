import { type Meta, type StoryObj } from "@storybook/react-vite";

import { ArticlePagination } from ".";

const meta = {
  title: "Article/ArticlePagination",
  component: ArticlePagination,
  args: { current: 1, last: 5, basePath: "/category/campus" },
  render: () => (
    <div className="flex flex-col gap-6">
      <ArticlePagination current={1} last={5} basePath="/category/campus" />
      <ArticlePagination current={10} last={20} basePath="/category/campus" />
      <ArticlePagination current={20} last={20} basePath="/category/campus" />
    </div>
  ),
} satisfies Meta<typeof ArticlePagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
