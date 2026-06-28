import { type Meta, type StoryObj } from "@storybook/react-vite";

import { Icon } from "./index";

const meta = {
  title: "Common/Icon",
  component: Icon,
  args: { name: "magnifying-glass", size: 32 },
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const User: Story = { args: { name: "user" } };

export const Bold: Story = { args: { name: "gear", weight: "bold" } };
