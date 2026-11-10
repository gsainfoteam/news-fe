import { type Meta, type StoryObj } from "@storybook/react-vite";

import { CategoryTabs } from ".";

const meta = {
  title: "Category/CategoryTabs",
  component: CategoryTabs,
  args: { current: "RESEARCH" },
  render: () => (
    <div className="flex flex-col gap-8">
      <CategoryTabs current="ACADEMIC_RESEARCH" />
      <CategoryTabs current="RESEARCH" />
      <CategoryTabs current="READERS_COMMITTEE" />
    </div>
  ),
} satisfies Meta<typeof CategoryTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
