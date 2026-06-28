import { type Meta, type StoryObj } from "@storybook/react-vite";

import { Badge } from "./index";

const meta = {
  title: "Common/Badge",
  component: Badge,
  args: { label: "Badge" },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { variant: "default" } };

export const Blue: Story = { args: { variant: "blue" } };

export const Red: Story = { args: { variant: "red" } };

export const Green: Story = { args: { variant: "green" } };
