import { type Meta, type StoryObj } from "@storybook/react-vite";

import { Input } from "./input";

const meta = {
  title: "Common/Input",
  component: Input,
  args: { placeholder: "기사 검색" },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Invalid: Story = { args: { "aria-invalid": true } };

export const Disabled: Story = { args: { disabled: true } };
