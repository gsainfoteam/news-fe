import { type Meta, type StoryObj } from "@storybook/react-vite";

import { Label } from ".";

const meta = {
  title: "Common/Label",
  component: Label,
  render: () => <Label htmlFor="label-demo">닉네임</Label>,
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
