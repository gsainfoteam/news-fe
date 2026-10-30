import { type Meta, type StoryObj } from "@storybook/react-vite";

import { Textarea } from ".";

const meta = {
  title: "Common/Textarea",
  component: Textarea,
  render: () => (
    <div className="flex max-w-2xl flex-col gap-4">
      <Textarea defaultValue="여러 줄 입력" aria-label="기본" />
      <Textarea placeholder="제보 내용을 입력하세요" aria-label="빈 입력" />
      <Textarea
        defaultValue="내용이 너무 짧습니다"
        aria-invalid
        aria-label="오류"
      />
      <Textarea defaultValue="비활성" disabled aria-label="비활성" />
    </div>
  ),
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
