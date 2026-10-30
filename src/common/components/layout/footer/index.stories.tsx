import { type Meta, type StoryObj } from "@storybook/react-vite";

import { Footer } from ".";

const meta = {
  title: "Common/Footer",
  component: Footer,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
