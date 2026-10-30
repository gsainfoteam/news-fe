import { type Meta, type StoryObj } from "@storybook/react-vite";

import { MobileMenu } from ".";

const meta = {
  title: "Common/MobileMenu",
  component: MobileMenu,
  args: { currentCategory: "INTERNAL_COLUMN", defaultOpen: true },
} satisfies Meta<typeof MobileMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
