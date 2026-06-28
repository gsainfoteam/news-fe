import { type Meta, type StoryObj } from "@storybook/react-vite";

import { IconButton } from "./index";

const meta = {
  title: "Common/IconButton",
  component: IconButton,
  args: { icon: "gear", label: "설정" },
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const User: Story = { args: { icon: "user", label: "사용자 계정" } };

export const Link: Story = {
  args: {
    icon: "facebook-logo",
    label: "Facebook",
    href: "#",
    className: "h-10 w-10 bg-neutral-700 text-white hover:bg-neutral-600",
    iconClassName: "size-5 text-white",
  },
};
