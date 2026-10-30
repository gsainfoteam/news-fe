import { type Meta, type StoryObj } from "@storybook/react-vite";

import { CategoryNav } from ".";

const meta = {
  title: "Category/CategoryNav",
  component: CategoryNav,
  args: { current: "RESEARCH" },
  // Room for the hover dropdown.
  render: (args) => (
    <div className="page-container min-h-80">
      <CategoryNav {...args} />
    </div>
  ),
} satisfies Meta<typeof CategoryNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
