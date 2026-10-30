import { type Meta, type StoryObj } from "@storybook/react-vite";

import { Separator } from ".";

const meta = {
  title: "Common/Separator",
  component: Separator,
  render: () => (
    <div className="flex max-w-md flex-col gap-4 text-sm">
      <p>최신 기사</p>
      <Separator />
      <div className="flex h-5 items-center gap-4">
        <span>이용약관</span>
        <Separator orientation="vertical" />
        <span>개인정보 처리방침</span>
      </div>
    </div>
  ),
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
