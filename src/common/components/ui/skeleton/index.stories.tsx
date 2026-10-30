import { type Meta, type StoryObj } from "@storybook/react-vite";

import { Skeleton } from ".";

const meta = {
  title: "Common/Skeleton",
  component: Skeleton,
  render: () => (
    <div
      className="flex max-w-sm flex-col gap-3 rounded-lg border border-border p-4"
      aria-label="불러오는 중"
    >
      <Skeleton className="h-3.5 w-[30%]" />
      <Skeleton className="h-5 w-[90%]" />
      <Skeleton className="h-5 w-[70%]" />
      <Skeleton className="h-3 w-[40%]" />
    </div>
  ),
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
