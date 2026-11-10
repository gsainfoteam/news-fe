import { type Meta, type StoryObj } from "@storybook/react-vite";

import { QueryProvider } from "@/common/lib/query-client";

import { ReportForm } from ".";

// Storybook has no API proxy, so picked files end up in the failed state
// with a retry button; ReportAttachments shows the other states.
const meta = {
  title: "Report/ReportForm",
  component: ReportForm,
  render: () => (
    <QueryProvider>
      <div className="max-w-[760px]">
        <ReportForm />
      </div>
    </QueryProvider>
  ),
} satisfies Meta<typeof ReportForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
