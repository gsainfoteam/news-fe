import { type Meta, type StoryObj } from "@storybook/react-vite";
import { LogOutIcon, PenSquareIcon, UserIcon } from "lucide-react";

import { Button } from "@/common/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from ".";

const meta = {
  title: "Common/DropdownMenu",
  component: DropdownMenu,
  render: () => (
    <div className="h-72">
      <DropdownMenu defaultOpen modal={false}>
        <DropdownMenuTrigger render={<Button variant="outline" />}>
          김도윤
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>doyun@gm.gist.ac.kr</DropdownMenuLabel>
            <DropdownMenuItem>
              <UserIcon />내 정보
            </DropdownMenuItem>
            <DropdownMenuItem>
              <PenSquareIcon />
              CMS 열기
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            <LogOutIcon />
            로그아웃
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
