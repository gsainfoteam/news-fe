import { type Meta, type StoryObj } from "@storybook/react-vite";
import { SearchIcon } from "lucide-react";

import { Input } from ".";

const meta = {
  title: "Common/Input",
  component: Input,
  render: () => (
    <div className="grid max-w-2xl grid-cols-2 gap-4 mobile:grid-cols-1">
      <Input placeholder="placeholder" aria-label="기본" />
      <Input defaultValue="입력 중" aria-label="입력됨" />
      <Input defaultValue="010-1234-567" aria-invalid aria-label="오류" />
      <Input placeholder="비활성" disabled aria-label="비활성" />
      <Input
        type="search"
        icon={<SearchIcon />}
        placeholder="기사 검색"
        aria-label="기사 검색"
        clearLabel="검색어 지우기"
      />
    </div>
  ),
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
