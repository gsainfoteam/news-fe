import { type Meta, type StoryObj } from "@storybook/react-vite";

import { NotFound } from ".";

const meta = {
  title: "Common/NotFound",
  component: NotFound,
  render: () => (
    <div className="page-container pb-16">
      <NotFound />
    </div>
  ),
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof NotFound>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
