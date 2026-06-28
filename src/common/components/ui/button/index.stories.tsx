import { type Meta, type StoryObj } from "@storybook/react-vite";

import { Button } from "./index";

const meta = {
  title: "Common/Button",
  component: Button,
  args: { label: "Button" },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: "primary" } };

export const Secondary: Story = { args: { variant: "secondary" } };

export const Outline: Story = { args: { variant: "outline" } };

export const WithIcon: Story = {
  args: { variant: "secondary", label: "더 보기", rightIcon: "caret-right" },
};
