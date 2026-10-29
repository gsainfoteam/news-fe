import { type Meta, type StoryObj } from "@storybook/react-vite";

import { Badge } from "./badge";

const meta = {
  title: "Common/Badge",
  component: Badge,
  args: { children: "학술·연구" },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      <Badge {...args}>default</Badge>
      <Badge {...args} variant="secondary">
        secondary
      </Badge>
      <Badge {...args} variant="outline">
        outline
      </Badge>
      <Badge {...args} variant="ghost">
        ghost
      </Badge>
      <Badge {...args} variant="destructive">
        destructive
      </Badge>
      <Badge {...args} variant="link">
        link
      </Badge>
    </div>
  ),
};
