import { type Meta, type StoryObj } from "@storybook/react-vite";
import { UserIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from ".";

const photo =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'><rect width='1' height='1' fill='%23c9d3dc'/></svg>";

const meta = {
  title: "Common/Avatar",
  component: Avatar,
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Avatar size="sm">
          <AvatarImage src={photo} alt="" />
          <AvatarFallback>김</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage src={photo} alt="" />
          <AvatarFallback>김</AvatarFallback>
        </Avatar>
        <Avatar size="lg">
          <AvatarFallback>김</AvatarFallback>
        </Avatar>
        <Avatar aria-label="익명">
          <AvatarFallback>
            <UserIcon />
          </AvatarFallback>
        </Avatar>
        <span className="text-xs text-subtle-foreground">
          사진 있음 / 이니셜 / 닉네임 없음
        </span>
      </div>
      <AvatarGroup>
        <Avatar>
          <AvatarFallback>김</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>이</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>박</AvatarFallback>
        </Avatar>
      </AvatarGroup>
    </div>
  ),
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
