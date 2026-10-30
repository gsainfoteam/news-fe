import { type Meta, type StoryObj } from "@storybook/react-vite";

import { CategoryBadge } from ".";
import { CATEGORIES } from "../../../viewmodels/category";

const meta = {
  title: "Category/CategoryBadge",
  component: CategoryBadge,
  args: { category: "ACADEMIC_RESEARCH" },
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => (
          <CategoryBadge key={category} category={category} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {CATEGORIES.map((category) => (
          <CategoryBadge key={category} category={category} kicker />
        ))}
      </div>
    </div>
  ),
} satisfies Meta<typeof CategoryBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
