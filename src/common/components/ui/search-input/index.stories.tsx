import { type Meta, type StoryObj } from "@storybook/react-vite";

import { SearchInput } from "./index";

const meta = {
  title: "Common/SearchInput",
  component: SearchInput,
  args: { className: "w-96" },
} satisfies Meta<typeof SearchInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomPlaceholder: Story = {
  args: { placeholder: "검색어를 입력하세요" },
};
