import { useState } from "react";

import { type Meta, type StoryObj } from "@storybook/react-vite";

import { type Category } from "@/features/category";

import { CategoryPicker } from ".";

function Showcase() {
  const [value, setValue] = useState<Category[]>([
    "ACADEMIC_RESEARCH",
    "RESEARCH",
  ]);
  return (
    <div className="w-80 max-w-full">
      <CategoryPicker value={value} onChange={setValue} />
    </div>
  );
}

// "학술·연구" stays checked while "연구" is.
const meta = {
  title: "Article/CategoryPicker",
  component: CategoryPicker,
  args: { value: [], onChange: () => {} },
  render: () => <Showcase />,
} satisfies Meta<typeof CategoryPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
