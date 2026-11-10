import { type Meta, type StoryObj } from "@storybook/react-vite";

import { ReportComplete } from ".";

const meta = {
  title: "Report/ReportComplete",
  component: ReportComplete,
  args: { homeHref: "#", onReset: () => {} },
  render: (args) => (
    <div className="max-w-[760px]">
      <ReportComplete {...args} />
    </div>
  ),
} satisfies Meta<typeof ReportComplete>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
