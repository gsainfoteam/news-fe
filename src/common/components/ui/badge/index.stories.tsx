import { type Meta, type StoryObj } from "@storybook/react-vite";

import { Badge } from ".";

const meta = {
  title: "Common/Badge",
  component: Badge,
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>neutral</Badge>
      <Badge variant="brand">brand</Badge>
      <Badge variant="info">info</Badge>
      <Badge variant="success">success</Badge>
      <Badge variant="warning">warning</Badge>
      <Badge variant="outline">outline</Badge>
      <Badge variant="solid">CMS</Badge>
      <Badge variant="brand">학술·연구</Badge>
    </div>
  ),
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
