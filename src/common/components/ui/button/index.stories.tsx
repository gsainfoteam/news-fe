import { type Meta, type StoryObj } from "@storybook/react-vite";
import { MenuIcon, SearchIcon, Trash2Icon } from "lucide-react";

import { Button } from ".";

const meta = {
  title: "Common/Button",
  component: Button,
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button>기본 primary</Button>
        <Button variant="secondary">secondary</Button>
        <Button variant="outline">outline</Button>
        <Button variant="ghost">ghost</Button>
        <Button variant="destructive">삭제 destructive</Button>
        <Button variant="link">링크 link</Button>
        <Button disabled>비활성</Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm">sm 32</Button>
        <Button>default 40</Button>
        <Button variant="outline" size="icon" aria-label="검색">
          <SearchIcon />
        </Button>
        <Button variant="ghost" size="icon" aria-label="메뉴">
          <MenuIcon />
        </Button>
        <Button variant="destructive-ghost" size="icon-sm" aria-label="삭제">
          <Trash2Icon />
        </Button>
        <Button nativeButton={false} render={<a href="#" />}>
          링크로 렌더
        </Button>
      </div>
    </div>
  ),
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
