import { type Meta, type StoryObj } from "@storybook/react-vite";

import { NavigationBar } from "./index";

const meta = {
  title: "Common/NavigationBar",
  component: NavigationBar,
  args: {
    items: [
      { label: "대학", href: "/university", active: true },
      { label: "사회", href: "/society" },
      { label: "학술·연구", href: "/academic" },
      { label: "문화", href: "/culture" },
      { label: "기획·특집", href: "/special" },
      { label: "오피니언", href: "/opinion" },
    ],
  },
} satisfies Meta<typeof NavigationBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
