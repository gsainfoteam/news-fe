import { type Meta, type StoryObj } from "@storybook/react-vite";

import { Footer } from "./index";

const meta = {
  title: "Common/Footer",
  component: Footer,
} satisfies Meta<typeof Footer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
