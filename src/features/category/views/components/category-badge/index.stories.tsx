import { type Meta, type StoryObj } from "@storybook/react-vite";

import { CategoryBadge } from "./index";

const meta = {
  title: "Category/CategoryBadge",
  component: CategoryBadge,
  args: { category: "사회" },
} satisfies Meta<typeof CategoryBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Society: Story = {};

export const University: Story = { args: { category: "대학" } };

export const Academic: Story = { args: { category: "학술·연구" } };
