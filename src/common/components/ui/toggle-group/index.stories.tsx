import { type Meta, type StoryObj } from "@storybook/react-vite";

import { ToggleGroup, ToggleGroupItem } from ".";

const meta = {
  title: "Common/ToggleGroup",
  component: ToggleGroup,
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <ToggleGroup defaultValue={["ko"]} aria-label="언어 선택">
        <ToggleGroupItem value="ko">KO</ToggleGroupItem>
        <ToggleGroupItem value="en">EN</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup defaultValue={["system"]} aria-label="화면 모드">
        <ToggleGroupItem value="light">라이트</ToggleGroupItem>
        <ToggleGroupItem value="dark">다크</ToggleGroupItem>
        <ToggleGroupItem value="system">시스템</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup size="lg" defaultValue={["latest"]} aria-label="정렬">
        <ToggleGroupItem value="latest">최신순</ToggleGroupItem>
        <ToggleGroupItem value="popular">인기순</ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
