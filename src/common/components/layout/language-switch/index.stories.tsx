import { type Meta, type StoryObj } from "@storybook/react-vite";

import { LanguageSwitch } from ".";

const meta = {
  title: "Common/LanguageSwitch",
  component: LanguageSwitch,
  args: { currentPath: "/search?q=연구" },
} satisfies Meta<typeof LanguageSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile" } } };
