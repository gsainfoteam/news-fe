import { type Meta, type StoryObj } from "@storybook/react-vite";
import { InboxIcon, SearchIcon } from "lucide-react";

import { Button } from "@/common/components/ui/button";

import { EmptyState } from ".";

const meta = {
  title: "Common/EmptyState",
  component: EmptyState,
  args: { title: "아직 제보가 없습니다" },
  render: () => (
    <div className="grid gap-4 md:grid-cols-2">
      <EmptyState icon={<InboxIcon />} title="아직 제보가 없습니다" />
      <EmptyState
        icon={<SearchIcon />}
        title="‘연구실 안전’에 맞는 기사가 없습니다"
        description="검색어를 줄이거나 다른 단어로 찾아보세요."
      >
        <Button variant="outline" size="sm">
          전체 기사 보기
        </Button>
      </EmptyState>
    </div>
  ),
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
