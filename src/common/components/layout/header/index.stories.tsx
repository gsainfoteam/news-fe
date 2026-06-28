import { type Meta, type StoryObj } from "@storybook/react-vite";

import { Header } from "./index";

const meta = {
  title: "Common/Header",
  component: Header,
  args: { currentPath: "/society" },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Header>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HomeActive: Story = { args: { currentPath: "/" } };
