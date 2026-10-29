import { type Meta, type StoryObj } from "@storybook/react-vite";
import { PlusIcon } from "lucide-react";

import { Button } from "./button";

const meta = {
  title: "Common/Button",
  component: Button,
  args: { children: "버튼" },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      <Button {...args}>default</Button>
      <Button {...args} variant="secondary">
        secondary
      </Button>
      <Button {...args} variant="outline">
        outline
      </Button>
      <Button {...args} variant="ghost">
        ghost
      </Button>
      <Button {...args} variant="destructive">
        destructive
      </Button>
      <Button {...args} variant="link">
        link
      </Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <Button {...args} size="sm">
        sm
      </Button>
      <Button {...args}>default</Button>
      <Button {...args} size="icon" aria-label="추가">
        <PlusIcon />
      </Button>
      <Button {...args} disabled>
        disabled
      </Button>
    </div>
  ),
};
